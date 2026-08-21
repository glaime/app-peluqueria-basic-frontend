import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TurnoService } from '../../../services/turno.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FechaEsPipe } from '../../../pipes/fecha-es.pipe';

@Component({
  selector: 'app-turno-lista',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    FechaEsPipe,
  ],
  templateUrl: './turno-lista.component.html',
  styleUrl: './turno-lista.component.css',
})
export class TurnoListaComponent implements OnInit {
  private readonly service = inject(TurnoService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly turnos = this.service.turnos;
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  readonly sinResultados = computed(
    () => !this.loading() && this.turnos().length === 0 && !this.error()
  );

  readonly columnas: string[] = ['id', 'fecha', 'hora', 'peluquero', 'estadoTurno', 'acciones'];

  ngOnInit(): void {
    this.service.load();
  }

  navegarNuevo(): void {
    this.router.navigate(['/turnos/nuevo']);
  }

  navegarEditar(id: number): void {
    this.router.navigate(['/turnos', id, 'editar']);
  }

  async eliminar(id: number): Promise<void> {
    const datos: ConfirmDialogData = {
      title: 'Eliminar turno',
      message: '¿Querés eliminar este turno? Esta acción no se puede deshacer.',
    };

    const confirmado = await firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, { data: datos, width: '380px' })
        .afterClosed()
    );

    if (!confirmado) return;

    try {
      await this.service.remove(id);
      this.snackBar.open('Turno eliminado correctamente', 'Cerrar', {
        duration: 3000,
      });
    } catch {
      // El interceptor ya mostró el error
    }
  }
}
