import type { Turno } from './turno.model';

export interface DeleteTurnoResponse {
  message: string;
  turno: Turno;
}
