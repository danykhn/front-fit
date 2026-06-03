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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Users,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Play,
  ChevronLeft,
  Layers,
  Loader2,
  UserMinus,
  Pencil,
  CalendarPlus,
  UserPlus,
  CalendarRange,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ROUTES, DAY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Program, Workout, ProgramAssignment, DayType } from '@/types';
import {
  usePrograms,
  useProgram,
  useDeleteProgram,
  useDuplicateProgram,
} from '@/hooks/use-programs';
import { ProgramFormDialog } from '@/components/programs/program-form-dialog';
import { DeleteProgramDialog } from '@/components/programs/delete-program-dialog';
import { WorkoutFormDialog } from '@/components/programs/workout-form-dialog';
import { DeleteWorkoutDialog } from '@/components/programs/delete-workout-dialog';
import { AssignAthleteDialog } from '@/components/programs/assign-athlete-dialog';
import { EditAssignmentDialog } from '@/components/programs/edit-assignment-dialog';
import {
  useProgramAssignments,
  useDeleteProgramAssignment,
} from '@/hooks/use-program-assignments';

type StatusFilter = 'all' | 'active' | 'template' | 'unassigned';
type ProgramStatus = 'active' | 'template' | 'unassigned';

function deriveStatus(program: Program): ProgramStatus {
  if (program.isTemplate) return 'template';
  if ((program._count?.activeAssignments ?? 0) > 0) return 'active';
  return 'unassigned';
}

const statusColors: Record<ProgramStatus, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  template: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  unassigned: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

const statusLabels: Record<ProgramStatus, string> = {
  active: 'En uso',
  template: 'Plantilla',
  unassigned: 'Sin asignar',
};

const statusFilterLabels: Record<StatusFilter, string> = {
  all: 'Todos',
  active: 'En uso',
  template: 'Plantillas',
  unassigned: 'Sin asignar',
};

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [programToDuplicate, setProgramToDuplicate] = useState<Program | null>(null);

  const programsQuery = usePrograms({ search: searchQuery || undefined, pageSize: 50 });
  const programs = programsQuery.data?.data ?? [];
  const duplicateMutation = useDuplicateProgram();

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (statusFilter === 'all') return true;
      return deriveStatus(program) === statusFilter;
    });
  }, [programs, statusFilter]);

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
    setShowDetail(true);
  };

  const handleNewProgram = () => {
    setProgramToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setProgramToEdit(program);
    setFormDialogOpen(true);
  };

  const handleAskDelete = (program: Program) => {
    setProgramToDelete(program);
    setDeleteDialogOpen(true);
  };

  const handleAskDuplicate = (program: Program) => {
    setProgramToDuplicate(program);
    setDuplicateDialogOpen(true);
  };

  const handleConfirmDuplicate = () => {
    if (!programToDuplicate) return;
    const id = programToDuplicate.id;
    const name = programToDuplicate.name;
    duplicateMutation.mutate(id, {
      onSuccess: (newProgram) => {
        toast.success(`"${name}" duplicado como "${newProgram.name}"`);
        setDuplicateDialogOpen(false);
        setProgramToDuplicate(null);
        setSelectedProgramId(newProgram.id);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || err?.message || 'Error al duplicar programa',
        );
      },
    });
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
                placeholder="Buscar programas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input/50 h-9 sm:h-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-32 sm:w-44 bg-input/50 h-9 sm:h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusFilterLabels) as StatusFilter[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {statusFilterLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm"
            onClick={handleNewProgram}
          >
            <Plus className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Programa</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Mobile: Show list or detail */}
        <div className="lg:hidden">
          {!showDetail ? (
            <ProgramsList
              programs={filteredPrograms}
              isLoading={programsQuery.isLoading}
              onSelect={handleSelectProgram}
              onEdit={handleEditProgram}
              onDuplicate={handleAskDuplicate}
              onDelete={handleAskDelete}
            />
          ) : (
            <ProgramDetail
              programId={selectedProgramId}
              onBack={() => setShowDetail(false)}
            />
          )}
        </div>

        {/* Desktop: Side by side */}
        <div className="hidden lg:grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-3">
            <ProgramsList
              programs={filteredPrograms}
              isLoading={programsQuery.isLoading}
              selectedId={selectedProgramId}
              onSelect={(id) => setSelectedProgramId(id)}
              onEdit={handleEditProgram}
              onDuplicate={handleAskDuplicate}
              onDelete={handleAskDelete}
              compact
            />
          </div>
          <div className="lg:col-span-2">
            <ProgramDetail programId={selectedProgramId} />
          </div>
        </div>
      </div>

      <ProgramFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        program={programToEdit}
      />

      <DeleteProgramDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        program={programToDelete}
      />

      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Duplicar programa?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una copia de{' '}
              <span className="font-semibold text-foreground">
                {programToDuplicate?.name}
              </span>{' '}
              con todas sus sesiones, bloques y ejercicios. La copia se llamará{' '}
              <span className="font-semibold text-foreground">
                "{programToDuplicate?.name} (copia)"
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={duplicateMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDuplicate();
              }}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

interface ProgramsListProps {
  programs: Program[];
  isLoading: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onEdit: (program: Program) => void;
  onDuplicate: (program: Program) => void;
  onDelete: (program: Program) => void;
  compact?: boolean;
}

function ProgramsList({
  programs,
  isLoading,
  selectedId,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  compact = false,
}: ProgramsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={compact ? 'h-28' : 'h-24'} />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No hay programas para mostrar</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Creá tu primer programa</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => {
        const status = deriveStatus(program);
        return (
          <Card
            key={program.id}
            className={`border-border/50 cursor-pointer transition-all ${
              selectedId === program.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/30'
            }`}
            onClick={() => onSelect(program.id)}
          >
            <CardContent className={compact ? 'p-4' : 'p-3 sm:p-4'}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-foreground truncate ${
                      compact ? '' : 'text-sm sm:text-base'
                    }`}
                  >
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {program.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] sm:text-xs flex-shrink-0 ${statusColors[status]}`}
                >
                  {statusLabels[status]}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{program.totalWeeks} sem</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{program._count?.activeAssignments ?? 0}</span>
                </div>
                {program.mesocycle && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] hidden sm:inline-flex"
                  >
                    {program.mesocycle}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface ProgramDetailProps {
  programId: string | null;
  onBack?: () => void;
}

function ProgramDetail({ programId, onBack }: ProgramDetailProps) {
  const programQuery = useProgram(programId ?? '');

  const [workoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<ProgramAssignment | null>(null);
  const [assignmentToEdit, setAssignmentToEdit] = useState<ProgramAssignment | null>(null);
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);

  const { data: assignmentsData } = useProgramAssignments(
    programId ? { programId, isActive: true, pageSize: 100 } : {},
  );
  const assignments = assignmentsData?.data ?? [];
  const deleteAssignmentMutation = useDeleteProgramAssignment();

  if (!programId) {
    return (
      <Card className="border-border/50 h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Selecciona un programa para ver los detalles
          </p>
        </CardContent>
      </Card>
    );
  }

  if (programQuery.isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-32 mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (programQuery.isError || !programQuery.data) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No se pudo cargar el programa.</p>
        </CardContent>
      </Card>
    );
  }

  const program = programQuery.data;
  const status = deriveStatus(program);
  const workouts = program.workouts ?? [];
  const workoutCount = program._count?.workouts ?? workouts.length;

  const totalExercises = workouts.reduce((acc, w) => {
    const blocks = w.workoutBlocks ?? [];
    return acc + blocks.reduce((bAcc, b) => bAcc + (b._count?.workoutExercises ?? 0), 0);
  }, 0);

  const handleEditWorkout = (workout: Workout) => {
    setWorkoutToEdit(workout);
    setWorkoutFormOpen(true);
  };

  const handleAskDeleteWorkout = (workout: Workout) => {
    setWorkoutToDelete(workout);
    setDeleteWorkoutOpen(true);
  };

  const handleNewWorkout = () => {
    setWorkoutToEdit(null);
    setWorkoutFormOpen(true);
  };

  const handleRemoveAssignment = (assignment: ProgramAssignment) => {
    setAssignmentToRemove(assignment);
  };

  const confirmRemoveAssignment = () => {
    if (!assignmentToRemove) return;
    const id = assignmentToRemove.id;
    const name = assignmentToRemove.athlete?.name || '';
    deleteAssignmentMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`"${name}" desasignado del programa`);
        setAssignmentToRemove(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Error al desasignar');
      },
    });
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
      )}

      <Card className="border-border/50">
        <CardHeader className="p-4 pb-3 lg:flex lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg lg:text-xl">{program.name}</CardTitle>
            {program.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {program.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
                {statusLabels[status]}
              </Badge>
              {program.mesocycle && (
                <Badge variant="secondary" className="text-xs">
                  {program.mesocycle}
                </Badge>
              )}
            </div>
          </div>
          <ProgramActionsMenu program={program} />
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 rounded-lg bg-secondary/30 text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {program.totalWeeks}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Semanas</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-secondary/30 text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {assignments.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Atletas</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-secondary/30 text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {workoutCount}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sesiones</p>
            </div>
          </div>

          {/* Atletas asignados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Atletas asignados</h4>
                <p className="text-xs text-muted-foreground">
                  {assignments.length}{' '}
                  {assignments.length === 1 ? 'atleta' : 'atletas'} en este programa
                </p>
              </div>
              {!program.isTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignDialogOpen(true)}
                  className="h-8 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Asignar
                </Button>
              )}
            </div>
            {assignments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {program.isTemplate
                    ? 'Las plantillas no se asignan a atletas'
                    : 'Aún no hay atletas asignados a este programa'}
                </p>
                {!program.isTemplate && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setAssignDialogOpen(true)}
                    className="mt-1 h-auto p-0 text-xs"
                  >
                    Asignar el primer atleta
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {assignments.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    onEdit={() => {
                      setAssignmentToEdit(assignment);
                      setEditAssignmentOpen(true);
                    }}
                    onRemove={() => handleRemoveAssignment(assignment)}
                    disabled={deleteAssignmentMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sesiones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Sesiones</h4>
                <p className="text-xs text-muted-foreground">
                  {totalExercises} ejercicios en total
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewWorkout}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nueva sesión
              </Button>
            </div>

            {workouts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Este programa aún no tiene sesiones.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleNewWorkout}
                  className="mt-1"
                >
                  <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                  Crear la primera
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {workouts.map((workout) => {
                  const blocks = workout.workoutBlocks ?? [];
                  const blockExercises = blocks.reduce(
                    (acc, b) => acc + (b._count?.workoutExercises ?? 0),
                    0,
                  );
                  return (
                    <WorkoutRow
                      key={workout.id}
                      workout={workout}
                      blockExercises={blockExercises}
                      blockCount={blocks.length}
                      onEdit={handleEditWorkout}
                      onDelete={handleAskDeleteWorkout}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {program.isTemplate && (
            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              Esta es una plantilla. Para asignarla a atletas, primero duplicá el programa.
            </div>
          )}
        </CardContent>
      </Card>

      <WorkoutFormDialog
        open={workoutFormOpen}
        onOpenChange={setWorkoutFormOpen}
        programId={program.id}
        workout={workoutToEdit}
      />

      <DeleteWorkoutDialog
        open={deleteWorkoutOpen}
        onOpenChange={setDeleteWorkoutOpen}
        workout={workoutToDelete}
      />

      <AssignAthleteDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        programId={program.id}
        programName={program.name}
      />

      <EditAssignmentDialog
        open={editAssignmentOpen}
        onOpenChange={setEditAssignmentOpen}
        assignment={assignmentToEdit}
      />

      <AlertDialog
        open={!!assignmentToRemove}
        onOpenChange={(o) => !o && setAssignmentToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar atleta?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a desasignar a{' '}
              <span className="font-semibold text-foreground">
                {assignmentToRemove?.athlete?.name}
              </span>{' '}
              del programa. Perderá acceso a las sesiones hasta que vuelvas a asignarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAssignmentMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRemoveAssignment();
              }}
              disabled={deleteAssignmentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssignmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Desasignar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProgramActionsMenu({ program }: { program: Program }) {
  const [formOpen, setFormOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const duplicateMutation = useDuplicateProgram();

  const handleDuplicate = () => {
    const id = program.id;
    const name = program.name;
    duplicateMutation.mutate(id, {
      onSuccess: (newProgram) => {
        toast.success(`"${name}" duplicado como "${newProgram.name}"`);
        setDupOpen(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Error al duplicar');
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDupOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDelOpen(true)}
            className="text-destructive"
            disabled={(program._count?.activeAssignments ?? 0) > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProgramFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        program={program}
      />
      <DeleteProgramDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        program={program}
      />
      <AlertDialog open={dupOpen} onOpenChange={setDupOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Duplicar programa?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una copia de{' '}
              <span className="font-semibold text-foreground">{program.name}</span> con todas
              sus sesiones, bloques y ejercicios. La copia se llamará{' '}
              <span className="font-semibold text-foreground">"{program.name} (copia)"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={duplicateMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDuplicate();
              }}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface WorkoutRowProps {
  workout: Workout;
  blockCount: number;
  blockExercises: number;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}

function WorkoutRow({ workout, blockCount, blockExercises, onEdit, onDelete }: WorkoutRowProps) {
  return (
    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors group gap-2">
      <Link
        href={ROUTES.WORKOUTS}
        className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1"
      >
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
          D{workout.dayNumber}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {workout.name ||
              (workout.dayType
                ? DAY_TYPES[workout.dayType as DayType]
                : `Día ${workout.dayNumber}`)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {workout.dayType ? DAY_TYPES[workout.dayType as DayType] : 'Sin tipo'} ·{' '}
            {blockCount} bloque{blockCount === 1 ? '' : 's'} · {blockExercises} ejercicios
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 group-hover:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(workout)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(workout)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

interface AssignmentRowProps {
  assignment: ProgramAssignment;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

function AssignmentRow({ assignment, onEdit, onRemove, disabled }: AssignmentRowProps) {
  const startDate = new Date(assignment.startDate);
  const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
  const athleteName = assignment.athlete?.name || 'Atleta';
  const initials = (athleteName.match(/\b\w/g) || ['?'])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const status = assignment.isActive ? 'active' : 'inactive';
  const statusBadge = assignment.isActive
    ? 'bg-green-500/10 text-green-600 border-green-500/20'
    : 'bg-muted text-muted-foreground border-border';

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg border transition-colors',
        assignment.isActive
          ? 'bg-secondary/20 hover:bg-secondary/30 border-transparent'
          : 'bg-muted/30 border-border',
      )}
    >
      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground truncate">{athleteName}</p>
          {!assignment.isActive && (
            <Badge variant="outline" className={`text-[9px] h-4 px-1 ${statusBadge}`}>
              Inactiva
            </Badge>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {startDate.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
          {endDate ? (
            <>
              {' → '}
              {endDate.toLocaleDateString('es', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </>
          ) : (
            <span className="ml-1">· En curso</span>
          )}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <CalendarRange className="mr-2 h-4 w-4" />
            Editar fechas
          </DropdownMenuItem>
          {!assignment.isActive && (
            <DropdownMenuItem
              onClick={() => {
                // Marcar como activa vía edit
                onEdit();
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Reactivar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            Desasignar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
