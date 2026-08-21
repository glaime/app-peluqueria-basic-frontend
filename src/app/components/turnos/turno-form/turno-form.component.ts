import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TurnoService } from '../../../services/turno.service';
import { PeluqueroService } from '../../../services/peluquero.service';
import { ESTADOS_TURNO } from '../../../models/estado-turno';
import type { EstadoTurno } from '../../../models/estado-turno';
import type { CreateTurnoDto } from '../../../models/turno/create-turno.dto';

// Validator: RESERVADO no puede tener fecha anterior a hoy (comparación solo por fecha, sin hora)
function noFechaPasadaValidator(hoy: Date) {
  return (control: AbstractControl): ValidationErrors | null => {
    const fecha = control.value as Date | null;
    if (!fecha) return null;

    const estado = control.parent?.get('estadoTurno')?.value as EstadoTurno | null;
    if (estado !== 'RESERVADO') return null;

    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    return fechaNormalizada < hoy ? { fechaPasada: true } : null;
  };
}

function diaLaborableValidator(control: AbstractControl): ValidationErrors | null {
  const fecha = control.value as Date | null;
  if (!fecha) return null;

  const dia = fecha.getDay();
  return dia === 0 || dia === 1 ? { diaNoLaborable: true } : null;
}

function horaTurnoValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) return null;

  const [hh, mm] = valor.split(':').map(Number);

  if (mm !== 0 && mm !== 30) {
    return { minutosInvalidos: true };
  }

  const minutosTotales = hh * 60 + mm;
  if (minutosTotales < 540 || minutosTotales > 1050) {
    return { fueraDeHorario: true };
  }

  return null;
}

@Component({
  selector: 'app-turno-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './turno-form.component.html',
  styleUrl: './turno-form.component.css',
})
export class TurnoFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly turnoService = inject(TurnoService);
  private readonly peluqueroService = inject(PeluqueroService);
  private readonly snackBar = inject(MatSnackBar);

  readonly turnoId = signal<number | null>(null);
  readonly modoEdicion = computed(() => this.turnoId() !== null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly peluqueros = this.peluqueroService.peluqueros;
  readonly estadosTurno = ESTADOS_TURNO;
  readonly filtroDiasLaborables = (d: Date | null): boolean => {
    const dia = d?.getDay();
    return dia !== 0 && dia !== 1;
  };

  // Hoy a medianoche para comparaciones de fecha sin componente de hora
  readonly hoy: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  readonly form = new FormGroup({
    fecha: new FormControl<Date | null>(null, {
      validators: [
        Validators.required,
        noFechaPasadaValidator(this.hoy),
        diaLaborableValidator,
      ],
    }),
    hora: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, horaTurnoValidator],
    }),
    // Creación: inicia en RESERVADO (se deshabilita en ngOnInit para modo creación)
    estadoTurno: new FormControl<EstadoTurno | null>('RESERVADO', {
      validators: [Validators.required],
    }),
    peluqueroId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  async ngOnInit(): Promise<void> {
    if (this.peluqueroService.peluqueros().length === 0) {
      await this.peluqueroService.load();
    }

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      // Modo creación: estado fijo en RESERVADO, el usuario no puede cambiarlo
      this.form.controls.estadoTurno.disable();
      return;
    }

    // Modo edición: carga el turno y habilita el cambio de estado
    const id = Number(idParam);
    this.turnoId.set(id);
    this.cargando.set(true);
    try {
      const turno = await this.turnoService.getById(id);
      this.form.patchValue({
        fecha: this.stringToFecha(turno.fecha),
        hora: turno.hora,
        estadoTurno: turno.estadoTurno,
        peluqueroId: turno.peluqueroId,
      });
      // Al cambiar el estado en edición, revalida la fecha para aplicar/quitar la restricción
      this.form.controls.estadoTurno.valueChanges.subscribe(() => {
        this.form.controls.fecha.updateValueAndValidity();
      });
    } catch {
      // El interceptor ya mostró el error
    } finally {
      this.cargando.set(false);
    }
  }

  // [min] del datepicker: restringe fechas pasadas solo cuando el estado es RESERVADO
  get minFecha(): Date | null {
    const estado = this.form.controls.estadoTurno.value;
    return estado === 'RESERVADO' ? this.hoy : null;
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    // getRawValue() incluye los controles disabled (estadoTurno en creación)
    const { fecha, hora, estadoTurno, peluqueroId } = this.form.getRawValue();

    const dto: CreateTurnoDto = {
      fecha: this.fechaToString(fecha!),
      hora,
      estadoTurno: estadoTurno!,
      peluqueroId: peluqueroId!,
    };

    try {
      const id = this.turnoId();
      if (id !== null) {
        await this.turnoService.update(id, dto);
        this.snackBar.open('Turno actualizado correctamente', 'Cerrar', { duration: 3000 });
      } else {
        await this.turnoService.create(dto);
        this.snackBar.open('Turno creado correctamente', 'Cerrar', { duration: 3000 });
      }
      this.router.navigate(['/turnos']);
    } catch {
      // El interceptor mostró el error; el form queda habilitado para reintentar
    } finally {
      this.guardando.set(false);
    }
  }

  cancelar(): void {
    this.router.navigate(['/turnos']);
  }

  // Usa hora local (getFullYear/Month/Date) para evitar el desfase UTC de toISOString()
  private fechaToString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // new Date(y, m-1, d) crea la fecha en horario local, sin offset UTC
  private stringToFecha(fechaStr: string): Date {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  get campoFecha() { return this.form.controls.fecha; }
  get campoHora() { return this.form.controls.hora; }
  get campoEstado() { return this.form.controls.estadoTurno; }
  get campoPeluquero() { return this.form.controls.peluqueroId; }
}
