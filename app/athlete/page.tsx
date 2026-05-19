'use client';

import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout';
import { ATHLETE_ROUTES } from '@/lib/constants';
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
} from 'lucide-react';

// Mock data para demo
const mockAthleteData = {
  name: 'Carlos Martinez',
  currentProgram: {
    name: 'Hipertrofia - Fase 2',
    week: 3,
    totalWeeks: 8,
    mesocycle: 'Acumulacion',
  },
  todayWorkout: {
    name: 'Dia 3 - Tiron',
    exercises: 8,
    estimatedTime: '75 min',
    completed: false,
  },
  weekProgress: {
    completed: 2,
    total: 5,
  },
  stats: {
    totalWorkouts: 24,
    currentStreak: 5,
    thisWeekMinutes: 180,
  },
  recentWorkouts: [
    { id: '1', name: 'Dia 2 - Empuje', date: '2024-01-15', completed: true },
    { id: '2', name: 'Dia 1 - Pierna', date: '2024-01-14', completed: true },
    { id: '3', name: 'Dia 5 - Full Body', date: '2024-01-12', completed: true },
  ],
};

export default function AthleteDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const data = mockAthleteData;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header de bienvenida */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Hola, {data.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Tienes una sesion programada para hoy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{data.stats.currentStreak} dias</span>
              <span className="text-sm opacity-80">racha</span>
            </div>
          </div>
        </div>

        {/* Card de sesion de hoy */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                  <Dumbbell className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sesion de hoy</p>
                  <h2 className="text-xl font-bold text-foreground">{data.todayWorkout.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {data.todayWorkout.exercises} ejercicios
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {data.todayWorkout.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              <Link href={ATHLETE_ROUTES.MY_WORKOUTS}>
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Comenzar Sesion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data.stats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Sesiones totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Flame className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data.stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Racha actual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data.stats.thisWeekMinutes}</p>
                  <p className="text-xs text-muted-foreground">Min esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {data.weekProgress.completed}/{data.weekProgress.total}
                  </p>
                  <p className="text-xs text-muted-foreground">Semana actual</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{data.currentProgram.name}</h3>
                    <p className="text-sm text-muted-foreground">{data.currentProgram.mesocycle}</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium text-foreground">
                      Semana {data.currentProgram.week} de {data.currentProgram.totalWeeks}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${(data.currentProgram.week / data.currentProgram.totalWeeks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
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
              <div className="space-y-3">
                {data.recentWorkouts.map((workout) => (
                  <div 
                    key={workout.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">{workout.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
    </AppLayout>
  );
}
