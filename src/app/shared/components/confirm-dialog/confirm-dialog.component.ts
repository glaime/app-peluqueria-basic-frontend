import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  // Compatibilidad con usos existentes
  titulo?: string;
  mensaje?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  get titulo(): string {
    return this.data.title ?? this.data.titulo ?? 'Confirmar acción';
  }

  get mensaje(): string {
    return this.data.message ?? this.data.mensaje ?? '';
  }

  get textoConfirmar(): string {
    return this.data.confirmText ?? 'Confirmar';
  }

  get textoCancelar(): string {
    return this.data.cancelText ?? 'Cancelar';
  }

  cancelar(): void {
    this.data.onCancel?.();
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.data.onConfirm?.();
    this.dialogRef.close(true);
  }
}
