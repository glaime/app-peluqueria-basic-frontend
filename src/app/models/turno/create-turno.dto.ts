import type { EstadoTurno } from '../estado-turno';

export interface CreateTurnoDto {
  fecha: string;
  hora: string;
  estadoTurno: EstadoTurno;
  peluqueroId: number;
}
