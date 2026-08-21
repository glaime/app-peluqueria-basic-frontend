import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fechaEs', standalone: true, pure: true })
export class FechaEsPipe implements PipeTransform {
  // Convierte 'YYYY-MM-DD' → 'DD/MM/YYYY' manipulando el string directamente,
  // sin crear objetos Date, para evitar desfases de zona horaria.
  transform(value: string): string {
    if (!value) return value;
    const partes = value.split('-');
    if (partes.length !== 3) return value;
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
}
