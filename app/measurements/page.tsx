'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useMeasurements } from '@/hooks/use-measurements';
import { useAthletes } from '@/hooks/use-athletes';
import { MeasurementFormDialog } from '@/components/measurements/measurement-form-dialog';
import { DeleteMeasurementDialog } from '@/components/measurements/delete-measurement-dialog';
import type { Measurement } from '@/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

function formatNumber(n: number | undefined | null, digits = 1): string {
  if (n === undefined || n === null) return '-';
  return n.toFixed(digits);
}

export default function MeasurementsPage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [athleteFilter, setAthleteFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Measurement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Measurement | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 50,
      athleteId: athleteFilter !== 'all' ? athleteFilter : undefined,
    }),
    [page, athleteFilter],
  );

  const {
    data: measurementsResp,
    isLoading,
    error,
  } = useMeasurements(queryParams);
  const measurements = measurementsResp?.data ?? [];

  const { data: athletesResp, isLoading: isLoadingAthletes } = useAthletes({
    pageSize: 100,
  });
  const athletes = athletesResp?.data ?? [];

  // Filtrado local por nombre (el backend no soporta search en measurements)
  const filtered = useMemo(() => {
    if (!search.trim()) return measurements;
    const term = search.toLowerCase();
    return measurements.filter((m) => {
      const name = m.athlete?.name ?? '';
      return name.toLowerCase().includes(term);
    });
  }, [measurements, search]);

  // Resumen
  const summary = useMemo(() => {
    const total = measurements.length;
    const withWeight = measurements.filter((m) => m.weightKg !== undefined);
    const avgDiffPct =
      withWeight.length > 0
        ? withWeight.reduce(
            (acc, m) => acc + (m.weightDiffPct ?? 0),
            0,
          ) / withWeight.length
        : 0;
    const avgWaist =
      measurements.filter((m) => m.waistCm !== undefined).length > 0
        ? measurements
            .filter((m) => m.waistCm !== undefined)
            .reduce((acc, m) => acc + (m.waistCm ?? 0), 0) /
          measurements.filter((m) => m.waistCm !== undefined).length
        : 0;
    const latest = measurements[0];
    return { total, avgDiffPct, avgWaist, latest };
  }, [measurements]);

  const handleNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (m: Measurement) => {
    setEditTarget(m);
    setFormOpen(true);
  };

  const handleDelete = (m: Measurement) => {
    setDeleteTarget(m);
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {summary.total}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Mediciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${
                    summary.avgDiffPct < 0
                      ? 'bg-green-500/10'
                      : summary.avgDiffPct > 0
                        ? 'bg-red-500/10'
                        : 'bg-muted'
                  }`}
                >
                  {summary.avgDiffPct < 0 ? (
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  ) : summary.avgDiffPct > 0 ? (
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  ) : (
                    <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-14" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {summary.avgDiffPct > 0 ? '+' : ''}
                      {summary.avgDiffPct.toFixed(1)}%
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Var. peso prom.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {formatNumber(summary.avgWaist, 1)}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Cintura (cm)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-foreground truncate">
                      {summary.latest ? formatDate(summary.latest.date) : '—'}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Última
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              No se pudieron cargar las mediciones. Intenta recargar.
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar atleta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-input/50 h-9 sm:h-10"
                  />
                </div>
                <Select value={athleteFilter} onValueChange={setAthleteFilter}>
                  <SelectTrigger className="w-28 sm:w-48 bg-input/50 h-9 sm:h-10">
                    <SelectValue placeholder="Atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {athletes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleNew}
                className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm"
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nueva Medición</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Measurements List */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Sin mediciones
              </h3>
              <p className="mb-4">
                {search || athleteFilter !== 'all'
                  ? 'No hay mediciones que coincidan con los filtros'
                  : role === 'ATHLETE'
                    ? 'Aun no registraste ninguna medición'
                    : 'Aun no hay mediciones registradas'}
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-1" />
                Crear primera medición
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((m) => (
              <MeasurementCard
                key={m.id}
                measurement={m}
                onEdit={() => handleEdit(m)}
                onDelete={() => handleDelete(m)}
              />
            ))}
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {filtered.length} de {measurements.length} mediciones
        </p>
      </div>

      <MeasurementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        measurement={editTarget}
      />
      <DeleteMeasurementDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        measurement={deleteTarget}
      />
    </AppLayout>
  );
}

function MeasurementCard({
  measurement,
  onEdit,
  onDelete,
}: {
  measurement: Measurement;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = measurement.athlete?.name ?? 'Atleta';

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold text-primary">
                {getInitials(name)}
              </span>
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-base truncate">
                {name}
              </CardTitle>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(measurement.date)}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Sem {measurement.weekNumber}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Acciones"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-2 sm:pt-2">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7 sm:gap-4">
          {/* Weight */}
          {measurement.weightKg !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.weightKg, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Peso (kg)
              </p>
              {measurement.weightDiffPct !== undefined &&
                measurement.weightDiffPct !== null && (
                  <div
                    className={`flex items-center justify-center gap-0.5 mt-0.5 ${
                      measurement.weightDiffPct < 0
                        ? 'text-green-500'
                        : measurement.weightDiffPct > 0
                          ? 'text-red-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {measurement.weightDiffPct < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : measurement.weightDiffPct > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : null}
                    <span className="text-[10px] sm:text-xs font-medium">
                      {measurement.weightDiffPct > 0 ? '+' : ''}
                      {measurement.weightDiffPct}%
                    </span>
                  </div>
                )}
            </div>
          )}

          {measurement.bodyFatPct !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.bodyFatPct, 1)}%
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Grasa</p>
            </div>
          )}

          {measurement.waistCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.waistCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Cintura</p>
            </div>
          )}

          {measurement.hipCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden sm:block">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.hipCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Cadera</p>
            </div>
          )}

          {measurement.chestCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.chestCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pecho</p>
            </div>
          )}

          {measurement.armCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.armCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Brazo</p>
            </div>
          )}

          {measurement.thighCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.thighCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Muslo</p>
            </div>
          )}

          {measurement.calfCm !== undefined && (
            <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 text-center hidden lg:block">
              <p className="text-base sm:text-lg font-bold text-foreground">
                {formatNumber(measurement.calfCm, 1)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pantorrilla</p>
            </div>
          )}
        </div>

        {measurement.notes && (
          <div className="mt-2 sm:mt-4 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs sm:text-sm text-foreground">
              <span className="font-medium text-primary">Notas:</span>{' '}
              {measurement.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
