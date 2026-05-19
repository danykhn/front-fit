'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Play,
  MoreVertical,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DAY_TYPES, BLOCK_TYPES } from '@/lib/constants';
import type { DayType, BlockType } from '@/types';

interface WorkoutBlock {
  id: string;
  name: string;
  type: BlockType;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    rest: string;
  }[];
}

interface WorkoutSession {
  id: string;
  name: string;
  dayType: DayType;
  duration: number;
  blocks: WorkoutBlock[];
}

// Mock data
const mockWorkouts: WorkoutSession[] = [
  {
    id: '1',
    name: 'Empuje A - Pecho y Hombros',
    dayType: 'EMPUJE',
    duration: 75,
    blocks: [
      {
        id: 'b1',
        name: 'Activacion',
        type: 'ACTIVACION',
        exercises: [
          { id: 'e1', name: 'Face Pulls', sets: 2, reps: '15', rest: '60s' },
          { id: 'e2', name: 'Rotacion Externa', sets: 2, reps: '12', rest: '60s' },
        ],
      },
      {
        id: 'b2',
        name: 'Bloque Principal',
        type: 'BLOQUE',
        exercises: [
          { id: 'e3', name: 'Press Banca', sets: 4, reps: '6-8', weight: '80kg', rest: '180s' },
          { id: 'e4', name: 'Press Inclinado Mancuernas', sets: 3, reps: '8-10', weight: '30kg', rest: '120s' },
          { id: 'e5', name: 'Press Militar', sets: 3, reps: '8-10', weight: '50kg', rest: '120s' },
        ],
      },
      {
        id: 'b3',
        name: 'Accesorios',
        type: 'BLOQUE',
        exercises: [
          { id: 'e6', name: 'Elevaciones Laterales', sets: 3, reps: '12-15', weight: '10kg', rest: '60s' },
          { id: 'e7', name: 'Triceps Polea', sets: 3, reps: '12-15', rest: '60s' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Tiron A - Espalda y Biceps',
    dayType: 'TIRON',
    duration: 70,
    blocks: [
      {
        id: 'b4',
        name: 'Activacion',
        type: 'ACTIVACION',
        exercises: [
          { id: 'e8', name: 'Band Pull Aparts', sets: 2, reps: '15', rest: '60s' },
        ],
      },
      {
        id: 'b5',
        name: 'Bloque Principal',
        type: 'BLOQUE',
        exercises: [
          { id: 'e9', name: 'Dominadas', sets: 4, reps: '6-8', rest: '180s' },
          { id: 'e10', name: 'Remo con Barra', sets: 4, reps: '8-10', weight: '70kg', rest: '120s' },
          { id: 'e11', name: 'Remo Cable Sentado', sets: 3, reps: '10-12', rest: '90s' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Pierna A - Cuadriceps',
    dayType: 'PIERNA',
    duration: 80,
    blocks: [
      {
        id: 'b6',
        name: 'Movilidad',
        type: 'MOVILIDAD',
        exercises: [
          { id: 'e12', name: 'Movilidad de Cadera', sets: 2, reps: '10 c/lado', rest: '0s' },
          { id: 'e13', name: 'Activacion Gluteos', sets: 2, reps: '15', rest: '30s' },
        ],
      },
      {
        id: 'b7',
        name: 'Bloque Principal',
        type: 'BLOQUE',
        exercises: [
          { id: 'e14', name: 'Sentadilla con Barra', sets: 4, reps: '5-6', weight: '100kg', rest: '180s' },
          { id: 'e15', name: 'Prensa', sets: 3, reps: '10-12', rest: '120s' },
          { id: 'e16', name: 'Extension de Cuadriceps', sets: 3, reps: '12-15', rest: '90s' },
        ],
      },
    ],
  },
];

const dayTypeColors: Record<DayType, string> = {
  PIERNA: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  EMPUJE: 'bg-red-500/10 text-red-500 border-red-500/20',
  TIRON: 'bg-green-500/10 text-green-500 border-green-500/20',
  FULL_BODY: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  CADENA_POSTERIOR: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CADENA_ANTERIOR: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  BRAZO: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  DESCANSO: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  LIBRE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dayTypeFilter, setDayTypeFilter] = useState<string>('all');
  const [workouts] = useState(mockWorkouts);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDayType = dayTypeFilter === 'all' || workout.dayType === dayTypeFilter;
    return matchesSearch && matchesDayType;
  });

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input/50 h-9 sm:h-10"
              />
            </div>
            <Select value={dayTypeFilter} onValueChange={setDayTypeFilter}>
              <SelectTrigger className="w-28 sm:w-48 bg-input/50 h-9 sm:h-10">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(DAY_TYPES) as DayType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {DAY_TYPES[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm">
            <Plus className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nueva Sesion</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="border-border/50">
              <CardHeader className="p-3 sm:p-6 pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg line-clamp-1">{workout.name}</CardTitle>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] sm:text-xs ${dayTypeColors[workout.dayType]}`}
                        >
                          {DAY_TYPES[workout.dayType]}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{workout.duration}min</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>
                            {workout.blocks.reduce((acc, b) => acc + b.exercises.length, 0)} ej.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Iniciar</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {workout.blocks.map((block) => (
                    <Collapsible
                      key={block.id}
                      open={expandedBlocks[block.id] !== false}
                      onOpenChange={() => toggleBlock(block.id)}
                    >
                      <div className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center justify-between w-full p-2.5 sm:p-3 hover:bg-secondary/40 transition-colors text-left">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                                {BLOCK_TYPES[block.type]}
                              </Badge>
                              <span className="font-medium text-foreground text-sm truncate">{block.name}</span>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                ({block.exercises.length} ejercicios)
                              </span>
                            </div>
                            {expandedBlocks[block.id] !== false ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t border-border">
                            {block.exercises.map((exercise, index) => (
                              <div
                                key={exercise.id}
                                className={`p-2.5 sm:p-3 ${
                                  index !== block.exercises.length - 1 ? 'border-b border-border/50' : ''
                                } hover:bg-secondary/30 transition-colors`}
                              >
                                {/* Mobile layout */}
                                <div className="sm:hidden">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-5 h-5 flex items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                                      {index + 1}
                                    </span>
                                    <p className="font-medium text-foreground text-sm truncate">{exercise.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs pl-7">
                                    <span className="text-muted-foreground">
                                      <span className="font-semibold text-foreground">{exercise.sets}</span> series
                                    </span>
                                    <span className="text-muted-foreground">
                                      <span className="font-semibold text-foreground">{exercise.reps}</span> reps
                                    </span>
                                    {exercise.weight && (
                                      <span className="text-primary font-semibold">{exercise.weight}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Desktop layout */}
                                <div className="hidden sm:flex items-center gap-3">
                                  <span className="w-6 h-6 flex items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground">{exercise.name}</p>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="text-center">
                                      <p className="font-semibold text-foreground">{exercise.sets}</p>
                                      <p className="text-xs text-muted-foreground">series</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="font-semibold text-foreground">{exercise.reps}</p>
                                      <p className="text-xs text-muted-foreground">reps</p>
                                    </div>
                                    {exercise.weight && (
                                      <div className="text-center">
                                        <p className="font-semibold text-primary">{exercise.weight}</p>
                                        <p className="text-xs text-muted-foreground">peso</p>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <p className="font-semibold text-foreground">{exercise.rest}</p>
                                      <p className="text-xs text-muted-foreground">desc</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {filteredWorkouts.length} de {workouts.length} sesiones
        </p>
      </div>
    </AppLayout>
  );
}
