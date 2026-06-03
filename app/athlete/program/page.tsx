'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DAY_TYPES, BLOCK_TYPES } from '@/lib/constants';
import type { BlockType, Workout, WorkoutBlock } from '@/types';
import { useAthleteDashboard } from '@/hooks/use-athlete-dashboard';
import { useAuthStore } from '@/store/auth-store';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Dumbbell,
  ArrowLeft,
  PlayCircle,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function getWorkoutsForWeek(workouts: Workout[], week: number): Workout[] {
  return workouts;
}

export default function AthleteProgramPage() {
  const user = useAuthStore((state) => state.user);
  const athleteId = user?.athleteId;
  const { assignment, today, isLoading, isLoadingToday, error } =
    useAthleteDashboard(athleteId);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const program = assignment?.program;
  const workouts = useMemo<Workout[]>(() => program?.workouts ?? [], [program]);

  const computedWeek = useMemo(() => {
    if (selectedWeek !== null) return selectedWeek;
    return today?.weekNumber ?? 1;
  }, [selectedWeek, today?.weekNumber]);

  const weekWorkouts = useMemo(
    () => getWorkoutsForWeek(workouts, computedWeek),
    [workouts, computedWeek],
  );

  const selectedSession = useMemo<Workout | null>(() => {
    if (!selectedSessionId) return null;
    return workouts.find((w) => w.id === selectedSessionId) ?? null;
  }, [selectedSessionId, workouts]);

  const totalWeeks = program?.totalWeeks ?? 0;
  const currentWeek = today?.weekNumber ?? 1;

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 text-center text-sm text-destructive">
              No se pudo cargar el programa. Intenta recargar la pagina.
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {selectedSession && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSessionId(null)}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Programa</h1>
              {isLoading ? (
                <Skeleton className="h-4 w-48 mt-1" />
              ) : (
                <p className="text-muted-foreground">
                  {program?.name ?? 'Sin programa asignado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info del programa */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ) : !program ? (
              <EmptyProgramState />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{program.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {program.mesocycle || 'Programa activo'}
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">
                      Semana {currentWeek}/{totalWeeks}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
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

        {/* Selector de semana */}
        {program && workouts.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedWeek(Math.max(1, computedWeek - 1))}
              disabled={computedWeek <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">Semana {computedWeek}</p>
              <p className="text-sm text-muted-foreground">
                {computedWeek === currentWeek ? 'Semana actual' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedWeek(Math.min(totalWeeks, computedWeek + 1))}
              disabled={computedWeek >= totalWeeks}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de sesiones */}
          <div className={cn(selectedSession && 'hidden lg:block')}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sesiones de la Semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading || isLoadingToday ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : weekWorkouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No hay sesiones cargadas para esta semana
                  </p>
                ) : (
                  weekWorkouts.map((session) => {
                    const isRest = session.dayType === 'DESCANSO';
                    const isSelected = selectedSessionId === session.id;
                    const exCount = session._count?.workoutExercises ?? 0;
                    return (
                      <button
                        key={session.id}
                        onClick={() => !isRest && setSelectedSessionId(session.id)}
                        disabled={isRest}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left',
                          isRest
                            ? 'bg-muted/30 cursor-default'
                            : isSelected
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-card border border-border hover:border-primary/50',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold',
                            isRest
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/20 text-primary',
                          )}
                        >
                          D{session.dayNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {session.name ?? `Dia ${session.dayNumber}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.dayType ? DAY_TYPES[session.dayType] : ''}
                            {exCount > 0 && ` • ${exCount} ejercicios`}
                          </p>
                        </div>
                        {isRest ? (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalle de sesion */}
          <div className={cn(!selectedSession && 'hidden lg:block')}>
            {selectedSession ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedSession.name ?? `Dia ${selectedSession.dayNumber}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        Semana {computedWeek}
                        {selectedSession.dayType &&
                          ` - ${DAY_TYPES[selectedSession.dayType]}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {selectedSession.workoutBlocks && selectedSession.workoutBlocks.length > 0 ? (
                    selectedSession.workoutBlocks.map((block) => (
                      <BlockSection key={block.id} block={block} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Esta sesion aun no tiene bloques cargados
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una sesion para ver los detalles</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', colorClass)} />
        <h3 className="font-semibold text-foreground text-sm">
          {BLOCK_TYPES[blockType] ?? block.name} - {block.name}
        </h3>
      </div>
      <div className="space-y-2 pl-4">
        {block.workoutExercises && block.workoutExercises.length > 0 ? (
          block.workoutExercises.map((we, idx) => (
            <div
              key={we.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {we.exercise?.name ?? 'Ejercicio'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {we.sets ?? '-'}x{we.repsOrTime ?? '-'}
                  {we.rpeRir && ` • RPE/RIR ${we.rpeRir}`}
                  {we.restSeconds ? ` • ${we.restSeconds}s descanso` : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Sin ejercicios cargados
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyProgramState() {
  return (
    <div className="text-center py-6">
      <Target className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
      <h3 className="font-semibold text-foreground">Sin programa asignado</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Pídele a tu entrenador que te asigne un programa para empezar
      </p>
    </div>
  );
}
