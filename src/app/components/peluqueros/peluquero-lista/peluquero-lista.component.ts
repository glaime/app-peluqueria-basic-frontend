import { Component, OnInit, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { PeluqueroService } from '../../../services/peluquero.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-peluquero-lista',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './peluquero-lista.component.html',
  styleUrl: './peluquero-lista.component.css',
})
export class PeluqueroListaComponent implements OnInit {
  private readonly service = inject(PeluqueroService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly peluqueros = this.service.peluqueros;
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  readonly sinResultados = computed(
    () => !this.loading() && this.peluqueros().length === 0 && !this.error()
  );

  readonly columnas: string[] = ['id', 'name', 'acciones'];

  ngOnInit(): void {
    this.service.load();
  }

  navegarNuevo(): void {
    this.router.navigate(['/peluqueros/nuevo']);
  }

  navegarEditar(id: number): void {
    this.router.navigate(['/peluqueros', id, 'editar']);
  }

  async eliminar(id: number): Promise<void> {
    let mensajeDialogo =
      'El peluquero tiene turnos asociados. ¿Desea eliminarlo junto con sus turnos?';

    try {
      await this.service.remove(id, { omitirErrorGlobal: true });
      this.snackBar.open('Peluquero eliminado correctamente', 'Cerrar', {
        duration: 3000,
      });
      return;
    } catch (error) {
      if (!(error instanceof HttpErrorResponse) || error.status !== 409) {
        this.snackBar.open(
          error instanceof HttpErrorResponse
            ? (error.error?.error ?? 'No se pudo eliminar el peluquero')
            : 'No se pudo eliminar el peluquero',
          'Cerrar',
          { duration: 5000 }
        );
        return;
      }
      mensajeDialogo = error.error?.error ?? mensajeDialogo;
    }

    const datos: ConfirmDialogData = {
      title: 'Eliminar peluquero y turnos',
      message: mensajeDialogo,
      confirmText: 'Sí, eliminar todo',
      cancelText: 'Cancelar',
    };

    const confirmado = await firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, { data: datos, width: '420px' })
        .afterClosed()
    );

    if (!confirmado) {
      return;
    }

    try {
      await this.service.remove(id, { confirmar: true });
      this.snackBar.open('Peluquero y turnos eliminados correctamente', 'Cerrar', {
        duration: 3000,
      });
    } catch {
      // El interceptor global muestra el error
    }
  }
}
