'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Grid3X3,
  List,
  Play,
  Dumbbell,
  Flame,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useExercises, useDeleteExercise } from '@/hooks/use-exercises';
import { ExerciseFormDialog } from '@/components/exercises/exercise-form-dialog';
import { DeleteExerciseDialog } from '@/components/exercises/delete-exercise-dialog';
import { ExerciseVideoThumbnail } from '@/components/exercises/exercise-video-thumbnail';
import { useAuthStore } from '@/store/auth-store';
import { EXERCISE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Exercise, ExerciseCategory } from '@/types';

const categoryColors: Partial<Record<ExerciseCategory, string>> = {
  CUADRICEPS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ISQUIOS: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  PECTORAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  ESPALDA: 'bg-green-500/10 text-green-500 border-green-500/20',
  GLUTEOS: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  HOMBROS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  BICEPS: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  TRICEPS: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  ABDOMEN: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  MOVILIDAD: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  ABDUCTORES: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  ADUCTORES: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  ANTEBRAZO: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  CADENAS: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
  CALISTENIA: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  CROSSFIT: 'bg-red-600/10 text-red-600 border-red-600/20',
  DESPLAZAMIENTOS: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  DOMINANTE_DE_CADERA: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  DOMINANTE_DE_RODILLA: 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20',
  EMPUJE: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
  GEMELOS: 'bg-stone-500/10 text-stone-500 border-stone-500/20',
  GIMNASIA: 'bg-pink-600/10 text-pink-600 border-pink-600/20',
  HALTEROFILIA: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  ISOMETRICOS: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  LOCALIZADO: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
  LUMBARES: 'bg-red-400/10 text-red-400 border-red-400/20',
  METABOLICOS: 'bg-red-700/10 text-red-700 border-red-700/20',
  PLIOMETRICOS: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
  ROMBOIDES: 'bg-green-600/10 text-green-600 border-green-600/20',
  TRACCION: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
  TRAPECIO: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
};

const getStressColor = (stress?: number) => {
  if (!stress) return 'text-muted-foreground';
  if (stress >= 1.5) return 'text-red-500';
  if (stress >= 1) return 'text-yellow-500';
  if (stress >= 0.5) return 'text-orange-500';
  return 'text-green-500';
};

const PAGE_SIZE = 12;

export default function ExercisesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'TRAINER';

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);

  // Debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page al cambiar categoría
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const { data, isLoading, isError, error, refetch, isFetching } = useExercises({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    category: selectedCategory === 'all' ? undefined : (selectedCategory as ExerciseCategory),
  });

  const exercises = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const stats = {
    total,
    categories: Object.keys(EXERCISE_CATEGORIES).length,
    withVideo: exercises.filter((e) => !!e.videoUrl).length,
    warmup: exercises.filter((e) => e.isWarmup).length,
  };

  const handleEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setFormOpen(true);
  };
  const handleDelete = (ex: Exercise) => {
    setDeletingExercise(ex);
    setDeleteOpen(true);
  };
  const handleNew = () => {
    setEditingExercise(null);
    setFormOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Ejercicios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.categories}</p>
                  <p className="text-xs text-muted-foreground">Categorías</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.withVideo}</p>
                  <p className="text-xs text-muted-foreground">Con video</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.warmup}</p>
                  <p className="text-xs text-muted-foreground">Warmup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o zona..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 bg-input/50 h-9 sm:h-10"
                    disabled={isLoading}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 bg-input/50 h-9 sm:h-10">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {(Object.keys(EXERCISE_CATEGORIES) as ExerciseCategory[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {EXERCISE_CATEGORIES[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title="Refrescar"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <div className="flex rounded-lg border border-border p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {canEdit && (
                  <Button
                    className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm"
                    onClick={handleNew}
                  >
                    <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Nuevo Ejercicio</span>
                    <span className="sm:hidden">Nuevo</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar ejercicios</AlertTitle>
            <AlertDescription>
              {(error as any)?.response?.data?.message ||
                (error as any)?.message ||
                'Intenta nuevamente.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No hay ejercicios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || selectedCategory !== 'all'
                ? 'No se encontraron ejercicios con los filtros aplicados'
                : 'Comienza creando tu primer ejercicio'}
            </p>
            {canEdit && !search && selectedCategory === 'all' && (
              <Button onClick={handleNew} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Crear ejercicio
              </Button>
            )}
          </div>
        )}

        {/* Exercise Grid/List */}
        {!isLoading && exercises.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="border-border/50 hover:border-primary/50 transition-all group overflow-hidden"
              >
                <div className="relative">
                  <ExerciseVideoThumbnail videoUrl={exercise.videoUrl} />
                  {exercise.isWarmup && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
                      <Badge className="bg-orange-500/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5">
                        Warmup
                      </Badge>
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 bg-background/80 backdrop-blur"
                          >
                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(exercise)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(exercise)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                <CardContent className="p-2.5 sm:p-4">
                  <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-1">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center justify-between gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5',
                        categoryColors[exercise.category] ||
                          'bg-muted text-muted-foreground',
                      )}
                    >
                      {EXERCISE_CATEGORIES[exercise.category]}
                    </Badge>
                    {exercise.stressIndex !== undefined && exercise.stressIndex !== null && (
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Flame
                          className={cn(
                            'h-3 w-3 sm:h-4 sm:w-4',
                            getStressColor(exercise.stressIndex),
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-medium',
                            getStressColor(exercise.stressIndex),
                          )}
                        >
                          {exercise.stressIndex}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && exercises.length > 0 && viewMode === 'list' && (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex-shrink-0 w-20 sm:w-28">
                      <ExerciseVideoThumbnail
                        videoUrl={exercise.videoUrl}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] sm:text-xs',
                            categoryColors[exercise.category] || '',
                          )}
                        >
                          {EXERCISE_CATEGORIES[exercise.category]}
                        </Badge>
                        {exercise.isWarmup && (
                          <Badge className="bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs">
                            {exercise.warmupZone || 'Warmup'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      {exercise.stressIndex !== undefined && exercise.stressIndex !== null && (
                        <div className="flex items-center gap-1">
                          <Flame
                            className={cn('h-4 w-4', getStressColor(exercise.stressIndex))}
                          />
                          <span
                            className={cn(
                              'text-xs sm:text-sm font-medium',
                              getStressColor(exercise.stressIndex),
                            )}
                          >
                            {exercise.stressIndex}
                          </span>
                        </div>
                      )}
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(exercise)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(exercise)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {exercises.length} de {total} ejercicios
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Ant.
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Sig.
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {canEdit && (
        <ExerciseFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          exercise={editingExercise}
        />
      )}

      {/* Delete Dialog */}
      {canEdit && (
        <DeleteExerciseDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          exercise={deletingExercise}
        />
      )}
    </AppLayout>
  );
}
