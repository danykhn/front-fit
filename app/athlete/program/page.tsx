'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DAY_TYPES, BLOCK_TYPES } from '@/lib/constants';
import type { DayType, BlockType } from '@/types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Dumbbell,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockProgram = {
  id: '1',
  name: 'Hipertrofia - Fase 2',
  description: 'Programa de 8 semanas enfocado en hipertrofia muscular con progresion de volumen',
  mesocycle: 'Acumulacion',
  currentWeek: 3,
  totalWeeks: 8,
  weeks: [
    {
      weekNumber: 1,
      sessions: [
        { id: '1', day: 1, dayType: 'PIERNA' as DayType, name: 'Pierna A', exercises: 7, completed: true },
        { id: '2', day: 2, dayType: 'EMPUJE' as DayType, name: 'Empuje', exercises: 6, completed: true },
        { id: '3', day: 3, dayType: 'TIRON' as DayType, name: 'Tiron', exercises: 6, completed: true },
        { id: '4', day: 4, dayType: 'DESCANSO' as DayType, name: 'Descanso', exercises: 0, completed: true },
        { id: '5', day: 5, dayType: 'PIERNA' as DayType, name: 'Pierna B', exercises: 7, completed: true },
      ],
    },
    {
      weekNumber: 2,
      sessions: [
        { id: '6', day: 1, dayType: 'PIERNA' as DayType, name: 'Pierna A', exercises: 7, completed: true },
        { id: '7', day: 2, dayType: 'EMPUJE' as DayType, name: 'Empuje', exercises: 6, completed: true },
        { id: '8', day: 3, dayType: 'TIRON' as DayType, name: 'Tiron', exercises: 6, completed: true },
        { id: '9', day: 4, dayType: 'DESCANSO' as DayType, name: 'Descanso', exercises: 0, completed: true },
        { id: '10', day: 5, dayType: 'PIERNA' as DayType, name: 'Pierna B', exercises: 7, completed: true },
      ],
    },
    {
      weekNumber: 3,
      sessions: [
        { id: '11', day: 1, dayType: 'PIERNA' as DayType, name: 'Pierna A', exercises: 7, completed: true },
        { id: '12', day: 2, dayType: 'EMPUJE' as DayType, name: 'Empuje', exercises: 6, completed: true },
        { id: '13', day: 3, dayType: 'TIRON' as DayType, name: 'Tiron', exercises: 6, completed: false },
        { id: '14', day: 4, dayType: 'DESCANSO' as DayType, name: 'Descanso', exercises: 0, completed: false },
        { id: '15', day: 5, dayType: 'PIERNA' as DayType, name: 'Pierna B', exercises: 7, completed: false },
      ],
    },
  ],
};

const mockSessionDetail = {
  id: '13',
  name: 'Dia 3 - Tiron',
  dayType: 'TIRON' as DayType,
  estimatedTime: '75 min',
  blocks: [
    {
      id: '1',
      type: 'CALENTAMIENTO' as BlockType,
      name: 'Calentamiento',
      exercises: [
        { id: '1', name: 'Remo con banda', sets: 2, reps: '15', rest: 60 },
        { id: '2', name: 'Rotacion externa', sets: 2, reps: '12', rest: 60 },
      ],
    },
    {
      id: '2',
      type: 'BLOQUE' as BlockType,
      name: 'Bloque Principal',
      exercises: [
        { id: '3', name: 'Dominadas', sets: 4, reps: '8-10', rest: 120, rpe: '8' },
        { id: '4', name: 'Remo con barra', sets: 4, reps: '10-12', rest: 90, rpe: '8' },
        { id: '5', name: 'Remo unilateral', sets: 3, reps: '12', rest: 90, rpe: '7' },
        { id: '6', name: 'Face pull', sets: 3, reps: '15', rest: 60, rpe: '7' },
      ],
    },
    {
      id: '3',
      type: 'BLOQUE' as BlockType,
      name: 'Biceps',
      exercises: [
        { id: '7', name: 'Curl con barra', sets: 3, reps: '10-12', rest: 60, rpe: '8' },
        { id: '8', name: 'Curl martillo', sets: 3, reps: '12', rest: 60, rpe: '7' },
      ],
    },
  ],
};

export default function AthleteProgramPage() {
  const [selectedWeek, setSelectedWeek] = useState(mockProgram.currentWeek);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  const currentWeekData = mockProgram.weeks.find(w => w.weekNumber === selectedWeek);
  const sessionDetail = selectedSession ? mockSessionDetail : null;

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
                onClick={() => setSelectedSession(null)}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Programa</h1>
              <p className="text-muted-foreground">{mockProgram.name}</p>
            </div>
          </div>
        </div>

        {/* Info del programa */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{mockProgram.name}</h2>
                  <p className="text-sm text-muted-foreground">{mockProgram.mesocycle}</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">Semana {mockProgram.currentWeek}/{mockProgram.totalWeeks}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    style={{ width: `${(mockProgram.currentWeek / mockProgram.totalWeeks) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector de semana */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">Semana {selectedWeek}</p>
            <p className="text-sm text-muted-foreground">
              {selectedWeek === mockProgram.currentWeek ? 'Semana actual' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(Math.min(mockProgram.totalWeeks, selectedWeek + 1))}
            disabled={selectedWeek >= mockProgram.weeks.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de sesiones */}
          <div className={cn(selectedSession && 'hidden lg:block')}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sesiones de la Semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentWeekData?.sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => session.dayType !== 'DESCANSO' && setSelectedSession(session.id)}
                    disabled={session.dayType === 'DESCANSO'}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left',
                      session.dayType === 'DESCANSO' 
                        ? 'bg-muted/30 cursor-default'
                        : selectedSession === session.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-card border border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold',
                      session.completed
                        ? 'bg-green-500/20 text-green-500'
                        : session.dayType === 'DESCANSO'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/20 text-primary'
                    )}>
                      D{session.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{session.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.dayType && DAY_TYPES[session.dayType]}
                        {session.exercises > 0 && ` • ${session.exercises} ejercicios`}
                      </p>
                    </div>
                    {session.completed && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                        <Target className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detalle de sesion */}
          <div className={cn(!selectedSession && 'hidden lg:block')}>
            {sessionDetail ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{sessionDetail.name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {sessionDetail.estimatedTime}
                      </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Iniciar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {sessionDetail.blocks.map((block) => (
                    <div key={block.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          block.type === 'CALENTAMIENTO' ? 'bg-yellow-500' :
                          block.type === 'VUELTA_A_LA_CALMA' ? 'bg-blue-500' : 'bg-primary'
                        )} />
                        <h3 className="font-semibold text-foreground text-sm">
                          {BLOCK_TYPES[block.type]} - {block.name}
                        </h3>
                      </div>
                      <div className="space-y-2 pl-4">
                        {block.exercises.map((exercise, idx) => (
                          <div 
                            key={exercise.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {exercise.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.sets}x{exercise.reps}
                                {exercise.rpe && ` • RPE ${exercise.rpe}`}
                                {exercise.rest && ` • ${exercise.rest}s descanso`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
