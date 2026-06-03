'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Activity,
  Calendar,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  LineChart as ChartIcon,
  Target,
  Dumbbell,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useMeasurements } from '@/hooks/use-measurements';
import { useAthleteWorkoutLogs } from '@/hooks/use-athlete-workout-logs';
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

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  });
}

function formatNumber(n: number | undefined | null, digits = 1): string {
  if (n === undefined || n === null) return '—';
  return n.toFixed(digits);
}

interface TrendInfo {
  current: number;
  previous: number;
  diff: number;
  diffPct: number | null;
  direction: 'up' | 'down' | 'flat';
}

function buildTrend(values: Array<number | undefined | null>): TrendInfo | null {
  const filtered = values.filter(
    (v): v is number => v !== undefined && v !== null,
  );
  if (filtered.length < 2) return null;
  const current = filtered[0];
  const previous = filtered[1];
  if (current === undefined || previous === undefined) return null;
  const diff = current - previous;
  const diffPct = previous !== 0 ? (diff / previous) * 100 : null;
  const direction: TrendInfo['direction'] =
    diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'flat';
  return { current, previous, diff, diffPct, direction };
}

export default function AthleteProgressPage() {
  const user = useAuthStore((state) => state.user);
  const athleteId = user?.athleteId;

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Measurement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Measurement | null>(null);

  const { data: measurementsResp, isLoading } = useMeasurements({
    page: 1,
    pageSize: 100,
  });
  const measurements = measurementsResp?.data ?? [];
  const { logs } = useAthleteWorkoutLogs(athleteId);

  // Orden cronologico (mas antiguo -> mas reciente) para charts
  const chronological = useMemo(
    () => [...measurements].sort((a, b) => a.weekNumber - b.weekNumber),
    [measurements],
  );

  const latest = measurements[0];
  const firstEver = chronological[0];

  const trends = useMemo(() => {
    const valuesOf = (key: keyof Measurement) =>
      chronological.map((m) => m[key] as number | undefined | null).reverse();
    return {
      weight: buildTrend(valuesOf('weightKg')),
      bodyFat: buildTrend(valuesOf('bodyFatPct')),
      waist: buildTrend(valuesOf('waistCm')),
      chest: buildTrend(valuesOf('chestCm')),
      arm: buildTrend(valuesOf('armCm')),
      thigh: buildTrend(valuesOf('thighCm')),
    };
  }, [chronological]);

  const totals = useMemo(() => {
    const sessions = logs?.length ?? 0;
    const minutes = (logs ?? []).reduce(
      (acc, l) => acc + (l.durationMin ?? 0),
      0,
    );
    return { sessions, minutes };
  }, [logs]);

  const chartData = useMemo(
    () =>
      chronological.map((m) => ({
        week: m.weekNumber,
        weight: m.weightKg,
        bodyFat: m.bodyFatPct,
        waist: m.waistCm,
        date: m.date,
      })),
    [chronological],
  );

  const handleNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const handleEdit = (m: Measurement) => {
    setEditTarget(m);
    setFormOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mi Progreso
            </h1>
            <p className="text-muted-foreground mt-1">
              {measurements.length === 0
                ? 'Registra tu primera medición para empezar'
                : `${measurements.length} mediciones registradas`}
            </p>
          </div>
          <Button
            onClick={handleNew}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva medición
          </Button>
        </div>

        {measurements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Sin mediciones todavía
              </h3>
              <p className="mb-4">
                Empezá registrando tu primera medición para ver tu evolución
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-1" />
                Crear primera medición
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Latest snapshot */}
            {latest && (
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                        <Activity className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Última medición - Semana {latest.weekNumber}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {formatDate(latest.date)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 flex-1 sm:max-w-2xl">
                      <SnapshotStat
                        label="Peso"
                        value={formatNumber(latest.weightKg, 1)}
                        unit="kg"
                      />
                      <SnapshotStat
                        label="Grasa"
                        value={formatNumber(latest.bodyFatPct, 1)}
                        unit="%"
                      />
                      <SnapshotStat
                        label="Cintura"
                        value={formatNumber(latest.waistCm, 1)}
                        unit="cm"
                      />
                      <SnapshotStat
                        label="Cadera"
                        value={formatNumber(latest.hipCm, 1)}
                        unit="cm"
                        className="hidden sm:block"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trend cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <TrendCard
                icon={<Scale className="h-5 w-5 text-primary" />}
                label="Peso"
                unit="kg"
                trend={trends.weight}
                digits={1}
              />
              <TrendCard
                icon={<Activity className="h-5 w-5 text-orange-500" />}
                label="% Grasa"
                unit="%"
                trend={trends.bodyFat}
                digits={1}
                invertColor
              />
              <TrendCard
                icon={<Ruler className="h-5 w-5 text-blue-500" />}
                label="Cintura"
                unit="cm"
                trend={trends.waist}
                digits={1}
                invertColor
              />
              <TrendCard
                icon={<Dumbbell className="h-5 w-5 text-green-500" />}
                label="Brazo"
                unit="cm"
                trend={trends.arm}
                digits={1}
              />
            </div>

            {/* Charts */}
            {chronological.length >= 2 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <WeightChart data={chartData} />
                <BodyFatChart data={chartData} />
              </div>
            )}

            {/* Total progress summary */}
            {firstEver && latest && chronological.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Cambio total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <TotalChange
                      label="Peso"
                      current={latest.weightKg}
                      initial={firstEver.weightKg}
                      unit="kg"
                      digits={1}
                    />
                    <TotalChange
                      label="Grasa"
                      current={latest.bodyFatPct}
                      initial={firstEver.bodyFatPct}
                      unit="%"
                      digits={1}
                    />
                    <TotalChange
                      label="Cintura"
                      current={latest.waistCm}
                      initial={firstEver.waistCm}
                      unit="cm"
                      digits={1}
                    />
                    <TotalChange
                      label="Pecho"
                      current={latest.chestCm}
                      initial={firstEver.chestCm}
                      unit="cm"
                      digits={1}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totals.sessions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sesiones registradas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totals.minutes}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Minutos entrenados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Historial completo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {measurements.map((m) => (
                  <HistoryRow
                    key={m.id}
                    measurement={m}
                    onEdit={() => handleEdit(m)}
                    onDelete={() => setDeleteTarget(m)}
                  />
                ))}
              </CardContent>
            </Card>
          </>
        )}
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

function SnapshotStat({
  label,
  value,
  unit,
  className,
}: {
  label: string;
  value: string;
  unit: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-bold text-foreground">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function TrendCard({
  icon,
  label,
  unit,
  trend,
  digits,
  invertColor,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  trend: TrendInfo | null;
  digits: number;
  invertColor?: boolean;
}) {
  if (!trend) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">Sin historial</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const positive = invertColor ? trend.direction === 'down' : trend.direction === 'up';
  const negative = invertColor ? trend.direction === 'up' : trend.direction === 'down';
  const TrendIcon =
    trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
        ? TrendingDown
        : Activity;
  const colorClass = positive
    ? 'text-green-500'
    : negative
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">
              {formatNumber(trend.current, digits)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {unit}
              </span>
            </p>
            <div className={`flex items-center gap-0.5 text-xs ${colorClass}`}>
              <TrendIcon className="h-3 w-3" />
              <span className="font-medium">
                {trend.diff > 0 ? '+' : ''}
                {trend.diff.toFixed(digits)} {unit}
                {trend.diffPct !== null && ` (${trend.diffPct > 0 ? '+' : ''}${trend.diffPct.toFixed(1)}%)`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalChange({
  label,
  current,
  initial,
  unit,
  digits,
}: {
  label: string;
  current: number | undefined | null;
  initial: number | undefined | null;
  unit: string;
  digits: number;
}) {
  if (current === undefined || current === null || initial === undefined || initial === null) {
    return (
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">Sin datos</p>
      </div>
    );
  }
  const diff = current - initial;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Activity;
  const colorClass = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-muted-foreground';
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground">
        {formatNumber(current, digits)}
        <span className="text-xs font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      </p>
      <div className={`flex items-center gap-0.5 text-xs ${colorClass}`}>
        <TrendIcon className="h-3 w-3" />
        <span className="font-medium">
          {diff > 0 ? '+' : ''}
          {diff.toFixed(digits)} {unit}
        </span>
      </div>
    </div>
  );
}

function HistoryRow({
  measurement,
  onEdit,
  onDelete,
}: {
  measurement: Measurement;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <span className="text-xs font-bold text-primary">S{measurement.weekNumber}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-foreground text-sm">
            {formatDate(measurement.date)}
          </p>
          {measurement.weightKg !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {formatNumber(measurement.weightKg, 1)} kg
            </Badge>
          )}
          {measurement.bodyFatPct !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {formatNumber(measurement.bodyFatPct, 1)}% grasa
            </Badge>
          )}
          {measurement.weightDiffPct !== undefined &&
            measurement.weightDiffPct !== null && (
              <Badge
                variant="secondary"
                className={`text-xs ${
                  measurement.weightDiffPct < 0
                    ? 'text-green-500'
                    : measurement.weightDiffPct > 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}
              >
                {measurement.weightDiffPct > 0 ? '+' : ''}
                {measurement.weightDiffPct}%
              </Badge>
            )}
        </div>
        {measurement.notes && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {measurement.notes}
          </p>
        )}
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
  );
}

const weightChartConfig: ChartConfig = {
  weight: {
    label: 'Peso (kg)',
    color: 'hsl(var(--primary))',
  },
};

function WeightChart({ data }: { data: Array<{ week: number; weight?: number; date: string }> }) {
  const filtered = data.filter((d) => d.weight !== undefined && d.weight !== null);
  if (filtered.length < 2) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-primary" />
          Evolución de peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={weightChartConfig} className="h-56 w-full">
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickFormatter={(w) => `S${w}`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 11 }}
              width={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => `Semana ${v}`}
                  formatter={(value) => [`${value} kg`, 'Peso']}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const bodyFatChartConfig: ChartConfig = {
  bodyFat: {
    label: '% Grasa',
    color: 'hsl(20 90% 55%)',
  },
};

function BodyFatChart({ data }: { data: Array<{ week: number; bodyFat?: number; date: string }> }) {
  const filtered = data.filter((d) => d.bodyFat !== undefined && d.bodyFat !== null);
  if (filtered.length < 2) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-orange-500" />
          % Grasa corporal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={bodyFatChartConfig} className="h-56 w-full">
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickFormatter={(w) => `S${w}`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 11 }}
              width={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => `Semana ${v}`}
                  formatter={(value) => [`${value}%`, 'Grasa']}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="bodyFat"
              stroke="var(--color-bodyFat)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
