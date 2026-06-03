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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  ChevronDown,
  Dumbbell,
  ArrowUpDown,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Moon,
  History,
} from 'lucide-react';
import { DAY_TYPES, BLOCK_TYPES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import type { Workout, WorkoutBlock, BlockType } from '@/types';
import { useAthleteDashboard, useInvalidateAthleteDashboard } from '@/hooks/use-athlete-dashboard';
import {
  useAthleteWorkoutLogs,
  useCreateWorkoutLog,
  useUpdateWorkoutLog,
  useDeleteWorkoutLog,
} from '@/hooks/use-athlete-workout-logs';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'pending' | 'completed';
type SortMode = 'dayNumber' | 'name';

const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
  7: 'Domingo',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function countExercises(workout: Workout): number {
  return (
    workout.workoutBlocks?.reduce(
      (acc, b) => acc + (b._count?.workoutExercises ?? 0),
      0,
    ) ?? 0
  );
}

export default function AthleteWorkoutsPage() {
  const user = useAuthStore((state) => state.user);
  const athleteId = user?.athleteId;
  const { assignment, today, isLoading: isLoadingDash } =
    useAthleteDashboard(athleteId);
  const { logs, isLoading: isLoadingLogs } = useAthleteWorkoutLogs(athleteId);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortMode, setSortMode] = useState<SortMode>('dayNumber');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [startDialog, setStartDialog] = useState<Workout | null>(null);
  const [completeDialog, setCompleteDialog] = useState<{
    logId: string;
    workout: Workout;
  } | null>(null);

  const program = assignment?.program;
  const workouts = program?.workouts ?? [];

  const completedWorkoutIds = useMemo(() => {
    const today = todayIso();
    return new Set(
      (logs ?? [])
        .filter((l) => l.date.slice(0, 10) === today)
        .map((l) => l.workoutId),
    );
  }, [logs]);

  const lastLogByWorkout = useMemo(() => {
    const map = new Map<string, (typeof logs)[number]>();
    (logs ?? []).forEach((l) => {
      const existing = map.get(l.workoutId);
      if (!existing || new Date(l.date) > new Date(existing.date)) {
        map.set(l.workoutId, l);
      }
    });
    return map;
  }, [logs]);

  const stats = useMemo(() => {
    const todayIsoStr = todayIso();
    const completedToday = (logs ?? []).filter(
      (l) => l.date.slice(0, 10) === todayIsoStr,
    ).length;
    const totalMinutes = (logs ?? []).reduce(
      (acc, l) => acc + (l.durationMin ?? 0),
      0,
    );
    return { completedToday, totalLogs: (logs ?? []).length, totalMinutes };
  }, [logs]);

  const filteredWorkouts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workouts
      .filter((w) => {
        if (term) {
          const haystack = `${w.name ?? ''} ${w.dayType ?? ''}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        if (filterStatus === 'pending') {
          if (completedWorkoutIds.has(w.id)) return false;
        }
        if (filterStatus === 'completed') {
          if (!completedWorkoutIds.has(w.id)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'name') {
          return (a.name ?? '').localeCompare(b.name ?? '');
        }
        return a.dayNumber - b.dayNumber;
      });
  }, [workouts, search, filterStatus, sortMode, completedWorkoutIds]);

  const selectedWorkout = useMemo<Workout | null>(() => {
    if (!selectedWorkoutId) return null;
    return workouts.find((w) => w.id === selectedWorkoutId) ?? null;
  }, [selectedWorkoutId, workouts]);

  if (isLoadingDash) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!program) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Sin programa asignado
              </h3>
              <p>Aun no tenes sesiones para entrenar.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mis Sesiones
            </h1>
            <p className="text-muted-foreground mt-1">
              {program.name} - Semana {today?.weekNumber ?? 1} de{' '}
              {program.totalWeeks}
            </p>
          </div>
        </div>

        {/* Stats rapidas */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat
            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            value={stats.completedToday}
            label="Hoy"
            loading={isLoadingLogs}
          />
          <MiniStat
            icon={<History className="h-4 w-4 text-primary" />}
            value={stats.totalLogs}
            label="Historial"
            loading={isLoadingLogs}
          />
          <MiniStat
            icon={<Clock className="h-4 w-4 text-blue-500" />}
            value={stats.totalMinutes}
            label="Min totales"
            loading={isLoadingLogs}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sesion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completadas hoy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dayNumber">Por dia</SelectItem>
              <SelectItem value="name">Por nombre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de sesiones */}
          <div className={cn(selectedWorkout && 'hidden lg:block')}>
            {isLoadingLogs ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredWorkouts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {workouts.length === 0
                    ? 'Tu programa aun no tiene sesiones cargadas'
                    : 'Ninguna sesion coincide con los filtros'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredWorkouts.map((workout) => {
                  const isRest = workout.dayType === 'DESCANSO';
                  const isCompleted = completedWorkoutIds.has(workout.id);
                  const isSelected = selectedWorkoutId === workout.id;
                  const lastLog = lastLogByWorkout.get(workout.id);
                  return (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isRest={isRest}
                      isCompleted={isCompleted}
                      isSelected={isSelected}
                      lastLog={lastLog}
                      onSelect={() => setSelectedWorkoutId(workout.id)}
                      onStart={() => setStartDialog(workout)}
                      onComplete={
                        lastLog
                          ? () =>
                              setCompleteDialog({ logId: lastLog.id, workout })
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Detalle de sesion */}
          <div className={cn(!selectedWorkout && 'hidden lg:block')}>
            {selectedWorkout ? (
              <WorkoutDetail
                workout={selectedWorkout}
                isCompleted={completedWorkoutIds.has(selectedWorkout.id)}
                onBack={() => setSelectedWorkoutId(null)}
                onStart={() => setStartDialog(selectedWorkout)}
                lastLog={lastLogByWorkout.get(selectedWorkout.id)}
                onComplete={
                  lastLogByWorkout.get(selectedWorkout.id)
                    ? () =>
                        setCompleteDialog({
                          logId: lastLogByWorkout.get(selectedWorkout.id)!.id,
                          workout: selectedWorkout,
                        })
                    : undefined
                }
              />
            ) : (
              <Card className="h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una sesion para ver el detalle</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <StartSessionDialog
        workout={startDialog}
        weekNumber={today?.weekNumber ?? 1}
        onClose={() => setStartDialog(null)}
      />
      <CompleteSessionDialog
        data={completeDialog}
        onClose={() => setCompleteDialog(null)}
      />
    </AppLayout>
  );
}

function WorkoutCard({
  workout,
  isRest,
  isCompleted,
  isSelected,
  lastLog,
  onSelect,
  onStart,
  onComplete,
}: {
  workout: Workout;
  isRest: boolean;
  isCompleted: boolean;
  isSelected: boolean;
  lastLog?: { id: string; date: string; durationMin?: number };
  onSelect: () => void;
  onStart: () => void;
  onComplete?: () => void;
}) {
  const exCount = countExercises(workout);
  const blockCount = workout._count?.workoutBlocks ?? 0;

  return (
    <Card
      className={cn(
        'transition-all',
        isSelected && 'border-primary border-2',
        isRest && 'opacity-70',
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSelect}
            disabled={isRest}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shrink-0',
                isRest
                  ? 'bg-muted text-muted-foreground'
                  : isCompleted
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-primary/20 text-primary',
              )}
            >
              {isRest ? <Moon className="h-5 w-5" /> : `D${workout.dayNumber}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground truncate">
                  {workout.name ?? `Dia ${workout.dayNumber}`}
                </p>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Hoy
                  </Badge>
                )}
                {isRest && (
                  <Badge variant="secondary">Descanso</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {DAY_LABELS[workout.dayNumber] ?? ''}
                {workout.dayType && workout.dayType !== 'DESCANSO'
                  ? ` - ${DAY_TYPES[workout.dayType]}`
                  : ''}
                {exCount > 0 && ` - ${exCount} ejercicios`}
                {lastLog && !isCompleted && ` - Ultima: ${formatDate(lastLog.date)}`}
              </p>
            </div>
          </button>
          {!isRest && (
            <div className="flex gap-1 shrink-0">
              {isCompleted ? (
                onComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onComplete}
                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  onClick={onStart}
                  className="bg-primary hover:bg-primary/90"
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkoutDetail({
  workout,
  isCompleted,
  onBack,
  onStart,
  lastLog,
  onComplete,
}: {
  workout: Workout;
  isCompleted: boolean;
  onBack: () => void;
  onStart: () => void;
  lastLog?: { id: string; date: string; durationMin?: number };
  onComplete?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {DAY_LABELS[workout.dayNumber]}
              </span>
              {workout.dayType && (
                <Badge variant="outline" className="text-xs">
                  {DAY_TYPES[workout.dayType]}
                </Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completada hoy
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">
              {workout.name ?? `Dia ${workout.dayNumber}`}
            </CardTitle>
            {workout.notes && (
              <p className="text-sm text-muted-foreground mt-1">{workout.notes}</p>
            )}
            {lastLog && (
              <p className="text-xs text-muted-foreground mt-2">
                Ultima sesion: {formatDate(lastLog.date)}
                {lastLog.durationMin ? ` - ${lastLog.durationMin} min` : ''}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {isCompleted ? (
              onComplete && (
                <Button size="sm" variant="outline" onClick={onComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )
            ) : (
              <Button size="sm" onClick={onStart} className="bg-primary hover:bg-primary/90">
                <PlayCircle className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
        {workout.workoutBlocks && workout.workoutBlocks.length > 0 ? (
          workout.workoutBlocks.map((block) => (
            <BlockSection key={block.id} block={block} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            Esta sesion aun no tiene bloques cargados
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BlockSection({ block }: { block: WorkoutBlock }) {
  const blockType = block.type as BlockType;
  const colorClass =
    blockType === 'CALENTAMIENTO'
      ? 'bg-yellow-500'
      : blockType === 'VUELTA_A_LA_CALMA'
        ? 'bg-blue-500'
        : blockType === 'ACTIVACION'
          ? 'bg-orange-500'
          : blockType === 'MOVILIDAD'
            ? 'bg-green-500'
            : 'bg-primary';

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('h-2 w-2 rounded-full shrink-0', colorClass)} />
          <h3 className="font-semibold text-foreground text-sm truncate">
            {BLOCK_TYPES[blockType] ?? block.name}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0">
            ({block._count?.workoutExercises ?? 0})
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=closed]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2 pl-4">
        {block.workoutExercises && block.workoutExercises.length > 0 ? (
          block.workoutExercises
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((we, idx) => (
              <div
                key={we.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {we.exercise?.name ?? 'Ejercicio'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {we.sets ?? '-'}x{we.repsOrTime ?? '-'}
                    {we.rpeRir && ` - RPE/RIR ${we.rpeRir}`}
                    {we.restSeconds ? ` - ${we.restSeconds}s` : ''}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-xs text-muted-foreground italic">Sin ejercicios</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function StartSessionDialog({
  workout,
  weekNumber,
  onClose,
}: {
  workout: Workout | null;
  weekNumber: number;
  onClose: () => void;
}) {
  const createLog = useCreateWorkoutLog();
  const invalidateDash = useInvalidateAthleteDashboard();
  const [durationMin, setDurationMin] = useState('60');
  const [notes, setNotes] = useState('');

  const handleStart = async () => {
    if (!workout) return;
    const dur = parseInt(durationMin, 10);
    try {
      await createLog.mutateAsync({
        workoutId: workout.id,
        weekNumber,
        date: new Date().toISOString(),
        durationMin: Number.isFinite(dur) && dur > 0 ? dur : undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Sesion registrada');
      invalidateDash();
      onClose();
      setNotes('');
      setDurationMin('60');
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? 'No se pudo registrar la sesion';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={!!workout} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesion</DialogTitle>
          <DialogDescription>
            {workout?.name ?? `Dia ${workout?.dayNumber}`} - Semana {weekNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="duration">Duracion estimada (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como te sentiste, observaciones..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createLog.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={createLog.isPending}>
            {createLog.isPending ? 'Registrando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteSessionDialog({
  data,
  onClose,
}: {
  data: { logId: string; workout: Workout } | null;
  onClose: () => void;
}) {
  const updateLog = useUpdateWorkoutLog();
  const deleteLog = useDeleteWorkoutLog();
  const invalidateDash = useInvalidateAthleteDashboard();
  const [durationMin, setDurationMin] = useState('');
  const [notes, setNotes] = useState('');

  // Reset when dialog opens
  useMemo(() => {
    if (data) {
      setDurationMin('');
      setNotes('');
    }
  }, [data?.logId]);

  const handleSave = async () => {
    if (!data) return;
    const dur = parseInt(durationMin, 10);
    try {
      await updateLog.mutateAsync({
        id: data.logId,
        payload: {
          durationMin: Number.isFinite(dur) && dur > 0 ? dur : undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast.success('Sesion actualizada');
      invalidateDash();
      onClose();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? 'No se pudo actualizar';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    try {
      await deleteLog.mutateAsync(data.logId);
      toast.success('Registro eliminado');
      invalidateDash();
      onClose();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? 'No se pudo eliminar';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar sesion</DialogTitle>
          <DialogDescription>
            {data?.workout.name ?? `Dia ${data?.workout.dayNumber}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-duration">Duracion (minutos)</Label>
            <Input
              id="edit-duration"
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="Dejar vacio para no cambiar"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Actualizar notas..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={updateLog.isPending || deleteLog.isPending}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateLog.isPending || deleteLog.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateLog.isPending || deleteLog.isPending}
            >
              {updateLog.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({
  icon,
  value,
  label,
  loading,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  loading: boolean;
}) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {icon}
          {loading ? (
            <Skeleton className="h-6 w-8" />
          ) : (
            <span className="text-xl font-bold text-foreground">{value}</span>
          )}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
