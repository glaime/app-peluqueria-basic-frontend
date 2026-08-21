import type { EstadoTurno } from '../estado-turno';
import type { Peluquero } from '../peluquero/peluquero.model';

export interface Turno {
  id: number;
  fecha: string;       // 'YYYY-MM-DD'
  hora: string;        // 'HH:MM'
  estadoTurno: EstadoTurno;
  peluqueroId: number;
  peluquero?: Peluquero;
}
