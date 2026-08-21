import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Peluquero } from '../models/peluquero/peluquero.model';
import type { CreatePeluqueroDto } from '../models/peluquero/create-peluquero.dto';
import type { DeletePeluqueroResponse } from '../models/peluquero/delete-peluquero-response.model';
import { OMITIR_ERROR_GLOBAL } from '../interceptors/http-context-tokens';

@Injectable({ providedIn: 'root' })
export class PeluqueroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/peluqueros`;

  readonly peluqueros = signal<Peluquero[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private deleteConOpciones(
    id: number,
    confirmar: boolean,
    omitirErrorGlobal: boolean
  ) {
    const url = confirmar
      ? `${this.baseUrl}/${id}?confirmar=true`
      : `${this.baseUrl}/${id}`;

    const context = new HttpContext().set(OMITIR_ERROR_GLOBAL, omitirErrorGlobal);

    return this.http.delete<DeletePeluqueroResponse>(url, {
      context,
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<Peluquero[]>(this.baseUrl));
      this.peluqueros.set(data);
    } catch {
      this.error.set('No se pudo cargar la lista de peluqueros');
    } finally {
      this.loading.set(false);
    }
  }

  getById(id: number): Promise<Peluquero> {
    return firstValueFrom(this.http.get<Peluquero>(`${this.baseUrl}/${id}`));
  }

  async create(dto: CreatePeluqueroDto): Promise<Peluquero> {
    const nuevo = await firstValueFrom(
      this.http.post<Peluquero>(this.baseUrl, dto)
    );
    this.peluqueros.update((lista) => [...lista, nuevo]);
    return nuevo;
  }

  async update(id: number, dto: CreatePeluqueroDto): Promise<Peluquero> {
    const actualizado = await firstValueFrom(
      this.http.put<Peluquero>(`${this.baseUrl}/${id}`, dto)
    );
    this.peluqueros.update((lista) =>
      lista.map((p) => (p.id === id ? actualizado : p))
    );
    return actualizado;
  }

  async remove(
    id: number,
    options?: { confirmar?: boolean; omitirErrorGlobal?: boolean }
  ): Promise<void> {
    const confirmar = options?.confirmar ?? false;
    const omitirErrorGlobal = options?.omitirErrorGlobal ?? false;

    await firstValueFrom(this.deleteConOpciones(id, confirmar, omitirErrorGlobal));
    this.peluqueros.update((lista) => lista.filter((p) => p.id !== id));
  }
}
