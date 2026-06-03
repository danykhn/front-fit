'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  ChevronDown,
  Clock,
  Dumbbell,
  Loader2,
  Minus,
  Plus,
  Save,
  Trophy,
} from 'lucide-react';
import { BLOCK_TYPES, ATHLETE_ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import type {
  Workout,
  WorkoutBlock,
  WorkoutExercise,
  BlockType,
  SetLog,
  WorkoutLog,
} from '@/types';
import { useAthleteDashboard } from '@/hooks/use-athlete-dashboard';
import { useAthleteWorkoutLogs, useUpdateWorkoutLog } from '@/hooks/use-athlete-workout-logs';
import {
  useSetLogsByWorkoutLog,
  useCreateSetLog,
  useUpdateSetLog,
  useDeleteSetLog,
} from '@/hooks/use-set-logs';
import { cn } from '@/lib/utils';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function blockColor(type: BlockType): string {
  switch (type) {
    case 'CALENTAMIENTO':
      return 'bg-yellow-500';
    case 'VUELTA_A_LA_CALMA':
      return 'bg-blue-500';
    case 'ACTIVACION':
      return 'bg-orange-500';
    case 'MOVILIDAD':
      return 'bg-green-500';
    case 'BLOQUE':
    default:
      return 'bg-primary';
  }
}

interface SetInputState {
  reps: string;
  weight: string;
  rpe: string;
  existingId?: string;
}

export default function AthleteSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workoutId = params?.id;

  const user = useAuthStore((state) => state.user);
  const athleteId = user?.athleteId;

  const { assignment, today, isLoading: isLoadingDash } =
    useAthleteDashboard(athleteId);
  const { logs, isLoading: isLoadingLogs } = useAthleteWorkoutLogs(athleteId);
  const updateLog = useUpdateWorkoutLog();
  const createSetLog = useCreateSetLog();
  const updateSetLog = useUpdateSetLog();
  const deleteSetLog = useDeleteSetLog();

  const program = assignment?.program;
  const workout = useMemo<Workout | null>(() => {
    if (!program || !workoutId) return null;
    return program.workouts?.find((w) => w.id === workoutId) ?? null;
  }, [program, workoutId]);

  const existingLog = useMemo<WorkoutLog | null>(() => {
    if (!workout) return null;
    const todayStr = todayIso();
    return (
      (logs ?? []).find(
        (l) => l.workoutId === workout.id && l.date.slice(0, 10) === todayStr,
      ) ?? null
    );
  }, [logs, workout]);

  const { data: setLogsResp, isLoading: isLoadingSets } = useSetLogsByWorkoutLog(
    existingLog?.id,
  );
  const setLogs = setLogsResp?.data ?? [];

  // Local state for set inputs: keyed by `${workoutExerciseId}-${setNumber}`
  const [setInputs, setSetInputs] = useState<Record<string, SetInputState>>({});
  const [notes, setNotes] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [finishDialog, setFinishDialog] = useState(false);

  // Seed local state from existing set logs
  useEffect(() => {
    if (!workout || setLogs.length === 0) return;
    const next: Record<string, SetInputState> = {};
    for (const block of workout.workoutBlocks ?? []) {
      for (const we of block.workoutExercises ?? []) {
        const sets = we.sets ?? 1;
        for (let s = 1; s <= sets; s++) {
          const key = `${we.id}-${s}`;
          const existing = setLogs.find(
            (l) => l.workoutExerciseId === we.id && l.setNumber === s,
          );
          if (existing) {
            next[key] = {
              reps: existing.reps?.toString() ?? '',
              weight: existing.weightKg?.toString() ?? '',
              rpe: existing.rpe?.toString() ?? '',
              existingId: existing.id,
            };
          }
        }
      }
    }
    setSetInputs((prev) => ({ ...prev, ...next }));
  }, [workout, setLogs]);

  // Seed notes/duration from existing log
  useEffect(() => {
    if (existingLog) {
      setNotes(existingLog.notes ?? '');
      setDurationMin(existingLog.durationMin?.toString() ?? '');
    }
  }, [existingLog?.id]);

  // Compute block completion
  const blockCompletion = useMemo(() => {
    if (!workout) return new Map<string, { done: number; total: number; isComplete: boolean }>();
    const map = new Map<string, { done: number; total: number; isComplete: boolean }>();
    for (const block of workout.workoutBlocks ?? []) {
      let total = 0;
      let done = 0;
      for (const we of block.workoutExercises ?? []) {
        const sets = we.sets ?? 1;
        total += sets;
        for (let s = 1; s <= sets; s++) {
          const key = `${we.id}-${s}`;
          if (setInputs[key]?.existingId) done += 1;
        }
      }
      map.set(block.id, { done, total, isComplete: total > 0 && done >= total });
    }
    return map;
  }, [workout, setInputs]);

  const totalCompletion = useMemo(() => {
    let done = 0;
    let total = 0;
    blockCompletion.forEach((v) => {
      done += v.done;
      total += v.total;
    });
    return { done, total, isComplete: total > 0 && done >= total };
  }, [blockCompletion]);

  const handleLogSet = async (
    we: WorkoutExercise,
    setNumber: number,
    state: SetInputState,
  ) => {
    if (!existingLog) {
      toast.error('Primero inicia la sesion');
      return;
    }
    const reps = parseInt(state.reps, 10);
    const weight = parseFloat(state.weight);
    const rpe = parseFloat(state.rpe);
    const payload = {
      workoutLogId: existingLog.id,
      workoutExerciseId: we.id,
      setNumber,
      reps: Number.isFinite(reps) && reps > 0 ? reps : undefined,
      weightKg: Number.isFinite(weight) && weight >= 0 ? weight : undefined,
      rpe: Number.isFinite(rpe) && rpe > 0 && rpe <= 10 ? rpe : undefined,
    };
    try {
      if (state.existingId) {
        await updateSetLog.mutateAsync({ id: state.existingId, payload });
      } else {
        const created = await createSetLog.mutateAsync(payload);
        setSetInputs((prev) => ({
          ...prev,
          [`${we.id}-${setNumber}`]: { ...state, existingId: created.id },
        }));
      }
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'No se pudo guardar la serie';
      toast.error(msg);
    }
  };

  const handleUnlogSet = async (we: WorkoutExercise, setNumber: number) => {
    const key = `${we.id}-${setNumber}`;
    const state = setInputs[key];
    if (!state?.existingId) return;
    try {
      await deleteSetLog.mutateAsync(state.existingId);
      setSetInputs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'No se pudo eliminar la serie';
      toast.error(msg);
    }
  };

  const handleSaveProgress = async () => {
    if (!existingLog) return;
    const dur = parseInt(durationMin, 10);
    try {
      await updateLog.mutateAsync({
        id: existingLog.id,
        payload: {
          durationMin: Number.isFinite(dur) && dur > 0 ? dur : undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast.success('Progreso guardado');
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'No se pudo guardar';
      toast.error(msg);
    }
  };

  const handleFinish = async () => {
    if (!existingLog) return;
    if (!totalCompletion.isComplete) {
      toast.error('Completa todas las series antes de finalizar');
      return;
    }
    const dur = parseInt(durationMin, 10);
    try {
      await updateLog.mutateAsync({
        id: existingLog.id,
        payload: {
          durationMin: Number.isFinite(dur) && dur > 0 ? dur : existingLog.durationMin,
          notes: notes.trim() || undefined,
        },
      });
      toast.success('Sesion finalizada');
      router.push(ATHLETE_ROUTES.HOME);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'No se pudo finalizar';
      toast.error(msg);
    }
  };

  if (isLoadingDash || isLoadingLogs) {
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

  if (!workout) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Sesion no encontrada
            </h3>
            <p className="mb-4">La sesion solicitada no existe en tu programa.</p>
            <Link href={ATHLETE_ROUTES.MY_PROGRAM}>
              <Button>Volver al programa</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!existingLog) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Sesion no iniciada
            </h3>
            <p className="mb-4">Inicia la sesion desde Mis Sesiones para empezar a registrar.</p>
            <Link href={ATHLETE_ROUTES.MY_WORKOUTS}>
              <Button>Ir a Mis Sesiones</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ATHLETE_ROUTES.MY_WORKOUTS)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {workout.name ?? `Dia ${workout.dayNumber}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Semana {today?.weekNumber ?? 1} - Sesion en curso
            </p>
          </div>
          {totalCompletion.isComplete ? (
            <Badge className="bg-green-500/10 text-green-500">
              <Trophy className="h-3 w-3 mr-1" />
              Completa
            </Badge>
          ) : (
            <Badge variant="secondary">
              {totalCompletion.done}/{totalCompletion.total}
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progreso de la sesion</span>
              <span className="font-medium text-foreground">
                {totalCompletion.done} de {totalCompletion.total} series
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{
                  width: `${totalCompletion.total > 0 ? (totalCompletion.done / totalCompletion.total) * 100 : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloques */}
        <div className="space-y-3">
          {(workout.workoutBlocks ?? []).map((block) => (
            <SessionBlock
              key={block.id}
              block={block}
              completion={blockCompletion.get(block.id) ?? { done: 0, total: 0, isComplete: false }}
              setInputs={setInputs}
              onSetInputsChange={setSetInputs}
              onLogSet={handleLogSet}
              onUnlogSet={handleUnlogSet}
              isLoading={isLoadingSets}
            />
          ))}
        </div>

        {/* Notas y duración */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen de la sesion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="duration">Duracion (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="Ej: 60"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="session-notes">Notas</Label>
              <Textarea
                id="session-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como te sentiste, observaciones..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleSaveProgress}
                disabled={updateLog.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
              <Button
                onClick={() => setFinishDialog(true)}
                disabled={!totalCompletion.isComplete}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={finishDialog} onOpenChange={setFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar sesion</DialogTitle>
            <DialogDescription>
              Vas a marcar esta sesion como completada. Esta accion confirma que
              realizaste todas las series.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleFinish}
              disabled={updateLog.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateLog.isPending ? 'Finalizando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function SessionBlock({
  block,
  completion,
  setInputs,
  onSetInputsChange,
  onLogSet,
  onUnlogSet,
  isLoading,
}: {
  block: WorkoutBlock;
  completion: { done: number; total: number; isComplete: boolean };
  setInputs: Record<string, SetInputState>;
  onSetInputsChange: React.Dispatch<React.SetStateAction<Record<string, SetInputState>>>;
  onLogSet: (we: WorkoutExercise, setNumber: number, state: SetInputState) => Promise<void>;
  onUnlogSet: (we: WorkoutExercise, setNumber: number) => Promise<void>;
  isLoading: boolean;
}) {
  const blockType = block.type as BlockType;
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn(completion.isComplete && 'border-green-500/30')}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn('h-2 w-2 rounded-full shrink-0', blockColor(blockType))} />
                <CardTitle className="text-base text-left truncate">
                  {BLOCK_TYPES[blockType] ?? block.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground shrink-0">
                  {block.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {completion.isComplete ? (
                  <Badge className="bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {completion.done}/{completion.total}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    !open && 'rotate-180',
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (block.workoutExercises ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin ejercicios
              </p>
            ) : (
              [...(block.workoutExercises ?? [])]
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((we) => (
                  <ExerciseRow
                    key={we.id}
                    we={we}
                    setInputs={setInputs}
                    onSetInputsChange={onSetInputsChange}
                    onLogSet={onLogSet}
                    onUnlogSet={onUnlogSet}
                  />
                ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ExerciseRow({
  we,
  setInputs,
  onSetInputsChange,
  onLogSet,
  onUnlogSet,
}: {
  we: WorkoutExercise;
  setInputs: Record<string, SetInputState>;
  onSetInputsChange: React.Dispatch<React.SetStateAction<Record<string, SetInputState>>>;
  onLogSet: (we: WorkoutExercise, setNumber: number, state: SetInputState) => Promise<void>;
  onUnlogSet: (we: WorkoutExercise, setNumber: number) => Promise<void>;
}) {
  const sets = we.sets ?? 1;
  const reps = we.repsOrTime ?? '-';
  const exerciseDone = Array.from({ length: sets }).every((_, idx) => {
    const key = `${we.id}-${idx + 1}`;
    return !!setInputs[key]?.existingId;
  });

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        exerciseDone ? 'bg-green-500/5 border-green-500/30' : 'bg-muted/30 border-transparent',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
          {we.orderIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {we.exercise?.name ?? 'Ejercicio'}
          </p>
          <p className="text-xs text-muted-foreground">
            {sets}x{reps}
            {we.rpeRir && ` - RPE/RIR ${we.rpeRir}`}
            {we.restSeconds ? ` - ${we.restSeconds}s descanso` : ''}
          </p>
        </div>
        {exerciseDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
        )}
      </div>
      <div className="space-y-2 pl-9">
        {Array.from({ length: sets }).map((_, idx) => {
          const setNumber = idx + 1;
          const key = `${we.id}-${setNumber}`;
          const state: SetInputState = setInputs[key] ?? { reps: '', weight: '', rpe: '' };
          const isLogged = !!state.existingId;
          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-2 p-2 rounded-md border',
                isLogged ? 'bg-green-500/10 border-green-500/30' : 'bg-background border-border',
              )}
            >
              <span className="text-xs font-bold text-muted-foreground w-6 shrink-0">
                #{setNumber}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Reps"
                value={state.reps}
                onChange={(e) =>
                  onSetInputsChange((prev) => ({
                    ...prev,
                    [key]: { ...state, reps: e.target.value },
                  }))
                }
                className="h-8 text-sm w-20"
                disabled={isLogged}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Kg"
                value={state.weight}
                onChange={(e) =>
                  onSetInputsChange((prev) => ({
                    ...prev,
                    [key]: { ...state, weight: e.target.value },
                  }))
                }
                className="h-8 text-sm w-20"
                disabled={isLogged}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="RPE"
                value={state.rpe}
                onChange={(e) =>
                  onSetInputsChange((prev) => ({
                    ...prev,
                    [key]: { ...state, rpe: e.target.value },
                  }))
                }
                className="h-8 text-sm w-16"
                disabled={isLogged}
              />
              {isLogged ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUnlogSet(we, setNumber)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  title="Quitar"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onLogSet(we, setNumber, state)}
                  className="h-8 px-2 bg-green-600 hover:bg-green-700"
                  title="Marcar completo"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
