import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Turno } from '../models/turno/turno.model';
import type { CreateTurnoDto } from '../models/turno/create-turno.dto';
import type { DeleteTurnoResponse } from '../models/turno/delete-turno-response.model';

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/turnos`;

  readonly turnos = signal<Turno[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<Turno[]>(this.baseUrl));
      this.turnos.set(data);
    } catch {
      this.error.set('No se pudo cargar la lista de turnos');
    } finally {
      this.loading.set(false);
    }
  }

  getById(id: number): Promise<Turno> {
    return firstValueFrom(this.http.get<Turno>(`${this.baseUrl}/${id}`));
  }

  async create(dto: CreateTurnoDto): Promise<Turno> {
    const nuevo = await firstValueFrom(
      this.http.post<Turno>(this.baseUrl, dto)
    );
    this.turnos.update((lista) => [...lista, nuevo]);
    return nuevo;
  }

  async update(id: number, dto: CreateTurnoDto): Promise<Turno> {
    const actualizado = await firstValueFrom(
      this.http.put<Turno>(`${this.baseUrl}/${id}`, dto)
    );
    this.turnos.update((lista) =>
      lista.map((t) => (t.id === id ? actualizado : t))
    );
    return actualizado;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<DeleteTurnoResponse>(`${this.baseUrl}/${id}`)
    );
    this.turnos.update((lista) => lista.filter((t) => t.id !== id));
  }
}
