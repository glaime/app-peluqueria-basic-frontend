import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TurnoService } from '../../../services/turno.service';
import { PeluqueroService } from '../../../services/peluquero.service';

interface FilaPeluquero {
  nombre: string;
  reservados: number;
  finalizados: number;
  total: number;
}

@Component({
  selector: 'app-reporte-turnos',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './reporte-turnos.component.html',
  styleUrl: './reporte-turnos.component.css',
})
export class ReporteTurnosComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly peluqueroService = inject(PeluqueroService);

  readonly cargando = computed(
    () => this.turnoService.loading() || this.peluqueroService.loading()
  );
  readonly error = computed(
    () => this.turnoService.error() ?? this.peluqueroService.error()
  );

  readonly peluqueros = this.peluqueroService.peluqueros;

  readonly peluqueroFiltro = signal<number | null>(null);

  readonly turnosFiltrados = computed(() => {
    const filtro = this.peluqueroFiltro();
    const todos = this.turnoService.turnos();
    return filtro === null ? todos : todos.filter((t) => t.peluqueroId === filtro);
  });

  readonly totalTurnos = computed(() => this.turnosFiltrados().length);
  readonly totalReservados = computed(
    () => this.turnosFiltrados().filter((t) => t.estadoTurno === 'RESERVADO').length
  );
  readonly totalFinalizados = computed(
    () => this.turnosFiltrados().filter((t) => t.estadoTurno === 'FINALIZADO').length
  );

  readonly desglose = computed((): FilaPeluquero[] => {
    const turnos = this.turnosFiltrados();
    const peluqueros = this.peluqueroService.peluqueros();

    return peluqueros
      .map((p) => {
        const propios = turnos.filter((t) => t.peluqueroId === p.id);
        return {
          nombre: p.name,
          reservados: propios.filter((t) => t.estadoTurno === 'RESERVADO').length,
          finalizados: propios.filter((t) => t.estadoTurno === 'FINALIZADO').length,
          total: propios.length,
        };
      })
      .sort((a, b) => b.total - a.total);
  });

  readonly maxTotal = computed(() => {
    const filas = this.desglose();
    return filas.length > 0 ? Math.max(...filas.map((f) => f.total)) : 1;
  });

  readonly columnas: string[] = ['peluquero', 'reservados', 'finalizados', 'total'];

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.turnoService.turnos().length === 0
        ? this.turnoService.load()
        : Promise.resolve(),
      this.peluqueroService.peluqueros().length === 0
        ? this.peluqueroService.load()
        : Promise.resolve(),
    ]);
  }

  // Devuelve el ancho en % de la barra según el total del peluquero vs el máximo
  anchoBarraPct(total: number): string {
    const max = this.maxTotal();
    if (max === 0) return '0%';
    return `${Math.round((total / max) * 100)}%`;
  }
}
