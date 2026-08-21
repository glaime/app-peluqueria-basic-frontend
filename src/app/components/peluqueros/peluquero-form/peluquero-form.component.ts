import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PeluqueroService } from '../../../services/peluquero.service';

@Component({
  selector: 'app-peluquero-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './peluquero-form.component.html',
  styleUrl: './peluquero-form.component.css',
})
export class PeluqueroFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PeluqueroService);
  private readonly snackBar = inject(MatSnackBar);

  readonly peluqueroId = signal<number | null>(null);
  readonly modoEdicion = computed(() => this.peluqueroId() !== null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    this.peluqueroId.set(id);
    this.cargando.set(true);
    try {
      const peluquero = await this.service.getById(id);
      this.form.patchValue({ name: peluquero.name });
    } catch {
      // El interceptor ya mostró el error
    } finally {
      this.cargando.set(false);
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const { name } = this.form.getRawValue();

    try {
      const id = this.peluqueroId();
      if (id !== null) {
        await this.service.update(id, { name });
        this.snackBar.open('Peluquero actualizado correctamente', 'Cerrar', {
          duration: 3000,
        });
      } else {
        await this.service.create({ name });
        this.snackBar.open('Peluquero creado correctamente', 'Cerrar', {
          duration: 3000,
        });
      }
      this.router.navigate(['/peluqueros']);
    } catch {
      // El interceptor mostró el error; el form queda habilitado para reintentar
    } finally {
      this.guardando.set(false);
    }
  }

  cancelar(): void {
    this.router.navigate(['/peluqueros']);
  }

  get campoName() {
    return this.form.controls.name;
  }
}
