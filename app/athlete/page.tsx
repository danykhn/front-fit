'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useAthleteDashboard } from '@/hooks/use-athlete-dashboard';
import { useAthleteWorkoutLogs, useCreateWorkoutLog } from '@/hooks/use-athlete-workout-logs';
import { useSetLogsByWorkoutLog } from '@/hooks/use-set-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout';
import { ATHLETE_ROUTES, DAY_TYPES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  TrendingUp,
  Target,
  Flame,
  Clock,
  ChevronRight,
  Dumbbell,
  CheckCircle2,
  Moon,
  Sparkles,
  PlayCircle,
} from 'lucide-react';

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

function countExercises(workout: { workoutBlocks?: { _count?: { workoutExercises?: number } }[] } | null | undefined): number {
  if (!workout?.workoutBlocks) return 0;
  return workout.workoutBlocks.reduce(
    (acc, b) => acc + (b._count?.workoutExercises ?? 0),
    0,
  );
}

function totalExpectedSets(workout: { workoutBlocks?: { _count?: { workoutExercises?: number } }[] } | null | undefined): number {
  if (!workout) return 0;
  // El `_count.workoutExercises` es 1 por exercise pero cada exercise tiene N sets.
  // No tenemos los sets aca, asi que usamos una aproximacion: 3 sets por exercise.
  // Para exactitud, la sesion usa los datos reales.
  return (
    workout.workoutBlocks?.reduce(
      (acc, b) => acc + (b._count?.workoutExercises ?? 0),
      0,
    ) ?? 0
  );
}

export default function AthleteDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const athleteId = user?.athleteId;
  const firstName = user?.email?.split('@')[0] ?? 'Atleta';

  const { assignment, today, stats, isLoading, error } =
    useAthleteDashboard(athleteId);
  const { logs } = useAthleteWorkoutLogs(athleteId);
  const createLog = useCreateWorkoutLog();

  const [startDialog, setStartDialog] = useState(false);
  const [startDuration, setStartDuration] = useState('60');
  const [startNotes, setStartNotes] = useState('');

  const todayWorkoutExercises = useMemo(
    () => countExercises(today?.workout),
    [today?.workout],
  );

  const recentLogs = useMemo(() => (logs ?? []).slice(0, 5), [logs]);

  const todayWorkoutId = today?.workout?.id;

  const todayLog = useMemo(() => {
    if (!todayWorkoutId) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    return (
      (logs ?? []).find(
        (l) => l.workoutId === todayWorkoutId && l.date.slice(0, 10) === todayStr,
      ) ?? null
    );
  }, [logs, todayWorkoutId]);

  const { data: setLogsResp } = useSetLogsByWorkoutLog(todayLog?.id);
  const setLogs = setLogsResp?.data ?? [];

  const todayCompletion = useMemo(() => {
    if (!today?.workout) return { done: 0, total: 0, isComplete: false };
    const total = (today.workout.workoutBlocks ?? []).reduce(
      (acc, b) =>
        acc +
        (b.workoutExercises ?? []).reduce(
          (sum, we) => sum + (we.sets ?? 1),
          0,
        ),
      0,
    );
    const done = setLogs.length;
    return { done, total, isComplete: total > 0 && done >= total };
  }, [today?.workout, setLogs]);

  const totalWeeks = assignment?.program.totalWeeks ?? 0;
  const currentWeek = today?.weekNumber ?? 1;

  const handleStartSession = async () => {
    if (!today?.workout) return;
    const dur = parseInt(startDuration, 10);
    try {
      const log = await createLog.mutateAsync({
        workoutId: today.workout.id,
        weekNumber: today.weekNumber,
        date: new Date().toISOString(),
        durationMin: Number.isFinite(dur) && dur > 0 ? dur : undefined,
        notes: startNotes.trim() || undefined,
      });
      toast.success('Sesion iniciada');
      setStartDialog(false);
      setStartDuration('60');
      setStartNotes('');
      router.push(`/athlete/workouts/${today.workout.id}/session?logId=${log.id}`);
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? 'No se pudo iniciar la sesion';
      toast.error(msg);
    }
  };

  const handleContinueSession = () => {
    if (!today?.workout) return;
    router.push(`/athlete/workouts/${today.workout.id}/session`);
  };

  const renderTodayButton = () => {
    if (!today?.workout || today.isRestDay) return null;
    if (todayCompletion.isComplete) {
      return (
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto border-green-500 text-green-500"
          onClick={handleContinueSession}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Sesion completada
        </Button>
      );
    }
    if (todayLog) {
      return (
        <Button
          size="lg"
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          onClick={handleContinueSession}
        >
          <PlayCircle className="h-5 w-5 mr-2" />
          Continuar ({todayCompletion.done}/{todayCompletion.total})
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        onClick={() => setStartDialog(true)}
      >
        <PlayCircle className="h-5 w-5 mr-2" />
        Iniciar sesion
      </Button>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header de bienvenida */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Hola, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {assignment
                ? today?.workout
                  ? todayCompletion.isComplete
                    ? 'Sesion de hoy completada'
                    : todayLog
                      ? `Sesion en curso - ${todayCompletion.done}/${todayCompletion.total} series`
                      : 'Tienes una sesion programada para hoy'
                  : today?.isRestDay
                    ? 'Hoy es tu dia de descanso'
                    : 'Sin sesion programada para hoy'
                : 'Aun no tenes un programa asignado'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{stats?.currentStreak ?? 0} dias</span>
              <span className="text-sm opacity-80">racha</span>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              No se pudo cargar el dashboard. Intenta recargar la pagina.
            </CardContent>
          </Card>
        )}

        {/* Card de sesion de hoy */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : !assignment ? (
              <EmptyTodayState />
            ) : today?.workout && !today.isRestDay ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                    <Dumbbell className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Sesion de hoy - Semana {today.weekNumber}/{assignment.program.totalWeeks}
                    </p>
                    <h2 className="text-xl font-bold text-foreground">
                      {today.workout.name ?? `Dia ${today.workout.dayNumber}`}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {todayWorkoutExercises} ejercicios
                      </span>
                      {today.workout.dayType && (
                        <span>{DAY_TYPES[today.workout.dayType]}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                  {renderTodayButton()}
                  <Link href={ATHLETE_ROUTES.MY_PROGRAM}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <ClipboardList className="h-5 w-5 mr-2" />
                      Ver detalle
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Moon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sesion de hoy</p>
                    <h2 className="text-xl font-bold text-foreground">Dia de descanso</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Semana {today?.weekNumber ?? 1} - Recuperate y volve manana
                    </p>
                  </div>
                </div>
                <Link href={ATHLETE_ROUTES.MY_PROGRAM}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Ver programa
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats rapidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ClipboardList className="h-5 w-5 text-primary" />}
            value={stats?.totalWorkouts ?? 0}
            label="Sesiones totales"
            loading={isLoading}
            accent="bg-primary/10"
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-accent" />}
            value={stats?.currentStreak ?? 0}
            label="Racha actual"
            loading={isLoading}
            accent="bg-accent/10"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-green-500" />}
            value={stats?.thisWeekMinutes ?? 0}
            label="Min esta semana"
            loading={isLoading}
            accent="bg-green-500/10"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-blue-500" />}
            value={`${stats?.thisWeekCompleted ?? 0}/${stats?.thisWeekTotal ?? 0}`}
            label="Semana actual"
            loading={isLoading}
            accent="bg-blue-500/10"
          />
        </div>

        {/* Programa actual y sesiones recientes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Programa actual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Mi Programa</CardTitle>
              <Link href={ATHLETE_ROUTES.MY_PROGRAM}>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver detalles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ) : !assignment ? (
                <EmptyProgramState />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {assignment.program.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.program.mesocycle || 'Programa activo'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium text-foreground">
                        Semana {currentWeek} de {totalWeeks}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{
                          width: `${totalWeeks > 0 ? (currentWeek / totalWeeks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sesiones recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Sesiones Recientes</CardTitle>
              <Link href={ATHLETE_ROUTES.MY_WORKOUTS}>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !recentLogs || recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aun no completaste ninguna sesion
                </p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          Sesion semana {log.weekNumber}
                          {log.durationMin ? ` - ${log.durationMin} min` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Link a progreso */}
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Revisa tu progreso</h3>
                  <p className="text-sm text-muted-foreground">
                    Ve tus mediciones y evolucion
                  </p>
                </div>
              </div>
              <Link href={ATHLETE_ROUTES.MY_PROGRESS}>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  Ver Progreso
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={startDialog} onOpenChange={setStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesion</DialogTitle>
            <DialogDescription>
              {today?.workout?.name ?? `Dia ${today?.workout?.dayNumber}`} - Semana {today?.weekNumber ?? 1}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="start-duration">Duracion estimada (minutos)</Label>
              <Input
                id="start-duration"
                type="number"
                min={1}
                value={startDuration}
                onChange={(e) => setStartDuration(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="start-notes">Notas (opcional)</Label>
              <Textarea
                id="start-notes"
                value={startNotes}
                onChange={(e) => setStartNotes(e.target.value)}
                placeholder="Como te sentiste, observaciones..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStartDialog(false)}
              disabled={createLog.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleStartSession} disabled={createLog.isPending}>
              {createLog.isPending ? 'Iniciando...' : 'Iniciar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  loading: boolean;
  accent: string;
}) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
            {icon}
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTodayState() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Sparkles className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Sin programa asignado</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pídele a tu entrenador que te asigne un programa para empezar
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyProgramState() {
  return (
    <div className="text-center py-4 text-sm text-muted-foreground">
      Tu entrenador aun no te asigno un programa
    </div>
  );
}
