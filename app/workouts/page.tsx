'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { DAY_TYPES, BLOCK_TYPES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import type { DayType, BlockType, Workout, WorkoutBlock, WorkoutExercise } from '@/types';
import { useWorkouts, useDeleteWorkout } from '@/hooks/use-workouts';
import { usePrograms } from '@/hooks/use-programs';
import { WorkoutFormDialog } from '@/components/programs/workout-form-dialog';
import { DeleteWorkoutDialog } from '@/components/programs/delete-workout-dialog';
import { WorkoutBlockFormDialog } from '@/components/workouts/workout-block-form-dialog';
import { DeleteWorkoutBlockDialog } from '@/components/workouts/delete-workout-block-dialog';
import { WorkoutExerciseFormDialog } from '@/components/workouts/workout-exercise-form-dialog';
import { DeleteWorkoutExerciseDialog } from '@/components/workouts/delete-workout-exercise-dialog';
import { ExerciseVideoThumbnail } from '@/components/exercises/exercise-video-thumbnail';
import { VideoButton } from '@/components/workouts/video-modal';
import { getYoutubeThumbnail } from '@/lib/video-utils';

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

const blockTypeColors: Record<BlockType, string> = {
  MOVILIDAD: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  ACTIVACION: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  CALENTAMIENTO: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  BLOQUE: 'bg-primary/10 text-primary border-primary/20',
  VUELTA_A_LA_CALMA: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function WorkoutsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'TRAINER';

  const [searchQuery, setSearchQuery] = useState('');
  const [dayTypeFilter, setDayTypeFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  const [workoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  const workoutsQuery = useWorkouts({ pageSize: 50 });
  const programsQuery = usePrograms({ pageSize: 100 });
  const deleteMutation = useDeleteWorkout();
  const workouts = workoutsQuery.data?.data ?? [];
  const programs = programsQuery.data?.data ?? [];

  const programMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    programs.forEach((p) => map.set(p.id, { id: p.id, name: p.name }));
    return map;
  }, [programs]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const matchesSearch =
        !searchQuery ||
        w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        programMap.get(w.programId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDay = dayTypeFilter === 'all' || w.dayType === dayTypeFilter;
      const matchesProgram = programFilter === 'all' || w.programId === programFilter;
      return matchesSearch && matchesDay && matchesProgram;
    });
  }, [workouts, searchQuery, dayTypeFilter, programFilter, programMap]);

  const handleNew = () => {
    if (programs.length === 0) {
      toast.error('Necesitás crear al menos un programa primero');
      return;
    }
    setWorkoutToEdit(null);
    setWorkoutFormOpen(true);
  };

  const handleEdit = (w: Workout) => {
    setWorkoutToEdit(w);
    setWorkoutFormOpen(true);
  };

  const handleAskDelete = (w: Workout) => {
    setWorkoutToDelete(w);
    setDeleteWorkoutOpen(true);
  };

  // Si hay un programa filtrado y no se ha seleccionado workout, usar ese
  const newWorkoutProgramId =
    programFilter !== 'all' ? programFilter : programs[0]?.id || '';

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sesiones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input/50 h-9 sm:h-10"
              />
            </div>
            <Select value={dayTypeFilter} onValueChange={setDayTypeFilter}>
              <SelectTrigger className="w-32 sm:w-44 bg-input/50 h-9 sm:h-10">
                <SelectValue placeholder="Tipo de día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los días</SelectItem>
                {(Object.keys(DAY_TYPES) as DayType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {DAY_TYPES[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-32 sm:w-48 bg-input/50 h-9 sm:h-10">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los programas</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canEdit && (
            <Button
              className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm"
              onClick={handleNew}
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nueva Sesión</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          )}
        </div>

        {workoutsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No hay sesiones para mostrar</p>
              {canEdit && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Creá una sesión para empezar
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                programName={programMap.get(workout.programId)?.name}
                onEdit={handleEdit}
                onDelete={handleAskDelete}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {filteredWorkouts.length} de {workouts.length} sesiones
        </p>
      </div>

      {canEdit && newWorkoutProgramId && (
        <WorkoutFormDialog
          open={workoutFormOpen}
          onOpenChange={setWorkoutFormOpen}
          programId={newWorkoutProgramId}
          workout={workoutToEdit}
        />
      )}

      <DeleteWorkoutDialog
        open={deleteWorkoutOpen}
        onOpenChange={setDeleteWorkoutOpen}
        workout={workoutToDelete}
      />
    </AppLayout>
  );
}

interface WorkoutCardProps {
  workout: Workout;
  programName?: string;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  canEdit: boolean;
}

function WorkoutCard({ workout, programName, onEdit, onDelete, canEdit }: WorkoutCardProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="p-3 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <span className="text-base sm:text-lg font-bold text-primary">
                D{workout.dayNumber}
              </span>
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg line-clamp-1">
                {workout.name || `Día ${workout.dayNumber}`}
              </CardTitle>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                {workout.dayType && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] sm:text-xs ${dayTypeColors[workout.dayType]}`}
                  >
                    {DAY_TYPES[workout.dayType]}
                  </Badge>
                )}
                {programName && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="truncate max-w-[180px]">{programName}</span>
                  </div>
                )}
                {workout.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                    · {workout.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 self-end sm:self-start">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(workout)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar sesión
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(workout)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <WorkoutBlocks workout={workout} canEdit={canEdit} />
      </CardContent>
    </Card>
  );
}

function WorkoutBlocks({ workout, canEdit }: { workout: Workout; canEdit: boolean }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [blockFormOpen, setBlockFormOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<WorkoutBlock | null>(null);
  const [deleteBlockOpen, setDeleteBlockOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<WorkoutBlock | null>(null);

  const blocks = workout.workoutBlocks ?? [];

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: p[id] !== false }));

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Bloques{' '}
          <span className="text-xs font-normal text-muted-foreground">
            ({blocks.length})
          </span>
        </h4>
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setBlockToEdit(null);
              setBlockFormOpen(true);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Bloque
          </Button>
        )}
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <Layers className="h-7 w-7 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">Esta sesión no tiene bloques</p>
          {canEdit && (
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto p-0 text-xs"
              onClick={() => {
                setBlockToEdit(null);
                setBlockFormOpen(true);
              }}
            >
              Crear el primero
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <BlockSection
              key={block.id}
              block={block}
              isExpanded={expanded[block.id] !== false}
              onToggle={() => toggle(block.id)}
              onEdit={() => {
                setBlockToEdit(block);
                setBlockFormOpen(true);
              }}
              onDelete={() => {
                setBlockToDelete(block);
                setDeleteBlockOpen(true);
              }}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      <WorkoutBlockFormDialog
        open={blockFormOpen}
        onOpenChange={setBlockFormOpen}
        workoutId={workout.id}
        block={blockToEdit}
      />

      <DeleteWorkoutBlockDialog
        open={deleteBlockOpen}
        onOpenChange={setDeleteBlockOpen}
        block={blockToDelete}
      />
    </div>
  );
}

interface BlockSectionProps {
  block: WorkoutBlock;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

function BlockSection({
  block,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  canEdit,
}: BlockSectionProps) {
  const [weFormOpen, setWeFormOpen] = useState(false);
  const [weToEdit, setWeToEdit] = useState<WorkoutExercise | null>(null);
  const [deleteWeOpen, setDeleteWeOpen] = useState(false);
  const [weToDelete, setWeToDelete] = useState<WorkoutExercise | null>(null);

  const exercises = block.workoutExercises ?? [];
  const blockColor = blockTypeColors[block.type] || 'bg-secondary text-foreground border-border';

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="rounded-lg border border-border bg-secondary/10 overflow-hidden">
        <div className="flex items-center w-full">
          <CollapsibleTrigger asChild>
            <button className="flex-1 flex items-center justify-between p-2.5 sm:p-3 hover:bg-secondary/30 transition-colors text-left min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Badge variant="secondary" className={`text-[10px] sm:text-xs flex-shrink-0 ${blockColor}`}>
                  {BLOCK_TYPES[block.type] ?? block.type}
                </Badge>
                <span className="font-medium text-foreground text-sm truncate">
                  {block.name}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline flex-shrink-0">
                  ({exercises.length} ej.)
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          </CollapsibleTrigger>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mr-1 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar bloque
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar bloque
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <CollapsibleContent>
          <div className="border-t border-border">
            {exercises.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Bloque vacío</p>
                {canEdit && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs"
                    onClick={() => {
                      setWeToEdit(null);
                      setWeFormOpen(true);
                    }}
                  >
                    Agregar ejercicio
                  </Button>
                )}
              </div>
            ) : (
              <>
                {exercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    className={`p-2.5 sm:p-3 ${
                      index !== exercises.length - 1 ? 'border-b border-border/50' : ''
                    } hover:bg-secondary/20 transition-colors group`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                      
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {ex.exercise?.name ?? `Ejercicio ${ex.exerciseId.substring(0, 6)}`}
                        </p>
                        {ex.exercise?.category && (
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {String(ex.exercise.category).toLowerCase().replace(/_/g, ' ')}
                          </p>
                        )}
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                          {ex.sets != null && (
                            <span>
                              <span className="font-semibold text-foreground">{ex.sets}</span> series
                            </span>
                          )}
                          {ex.repsOrTime && (
                            <span>
                              <span className="font-semibold text-foreground">{ex.repsOrTime}</span>{' '}
                              {/^\d+$/.test(ex.repsOrTime) ? 'reps' : ''}
                            </span>
                          )}
                          {ex.weightKg != null && ex.weightKg > 0 && (
                            <span className="text-primary font-semibold">{ex.weightKg} kg</span>
                          )}
                          {ex.rpeRir && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1">
                              {ex.rpeRir}
                            </Badge>
                          )}
                          {ex.restSeconds != null && ex.restSeconds > 0 && (
                            <span>{ex.restSeconds}s desc.</span>
                          )}
                        </div>
                        {ex.notes && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            📝 {ex.notes}
                          </p>
                        )}
                        {ex.videoUrl && (
                          <VideoButton
                            videoUrl={ex.videoUrl}
                            title={ex.exercise?.name || 'Video del ejercicio'}
                            description={
                              ex.exercise?.category
                                ? String(ex.exercise.category).toLowerCase().replace(/_/g, ' ')
                                : undefined
                            }
                            variant="full"
                            className="mt-1.5 h-6 text-[10px] px-2"
                          />
                        )}
                      </div>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setWeToEdit(ex);
                                setWeFormOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setWeToDelete(ex);
                                setDeleteWeOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Quitar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
                {canEdit && (
                  <div className="p-2 border-t border-border/50 bg-secondary/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setWeToEdit(null);
                        setWeFormOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar ejercicio
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>

      <WorkoutExerciseFormDialog
        open={weFormOpen}
        onOpenChange={setWeFormOpen}
        blockId={block.id}
        workoutExercise={weToEdit}
      />

      <DeleteWorkoutExerciseDialog
        open={deleteWeOpen}
        onOpenChange={setDeleteWeOpen}
        workoutExercise={weToDelete}
      />
    </Collapsible>
  );
}
