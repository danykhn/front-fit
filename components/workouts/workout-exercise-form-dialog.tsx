'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertCircle,
  Dumbbell,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useCreateWorkoutExercise, useUpdateWorkoutExercise } from '@/hooks/use-workout-exercises';
import { useExercises } from '@/hooks/use-exercises';
import { EXERCISE_CATEGORIES } from '@/lib/constants';
import { getYoutubeThumbnail } from '@/lib/video-utils';
import { cn } from '@/lib/utils';
import type {
  WorkoutExercise,
  CreateWorkoutExercisePayload,
  Exercise,
} from '@/types';

const schema = z.object({
  exerciseId: z.string().uuid('Seleccioná un ejercicio'),
  sets: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  repsOrTime: z.string().max(40).optional().or(z.literal('')),
  weightKg: z.coerce.number().min(0).max(999).optional().or(z.literal('')),
  rpeRir: z.string().max(20).optional().or(z.literal('')),
  restSeconds: z.coerce.number().int().min(0).max(3600).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface WorkoutExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockId: string;
  workoutExercise?: WorkoutExercise | null;
}

export function WorkoutExerciseFormDialog({
  open,
  onOpenChange,
  blockId,
  workoutExercise,
}: WorkoutExerciseFormDialogProps) {
  const isEdit = !!workoutExercise;
  const createMutation = useCreateWorkoutExercise();
  const updateMutation = useUpdateWorkoutExercise();
  const mutation = isEdit ? updateMutation : createMutation;

  const [search, setSearch] = useState('');
  const { data, isLoading: isLoadingExercises } = useExercises({
    search: search || undefined,
    pageSize: 30,
  });
  const exercises = data?.data ?? [];

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      exerciseId: '',
      sets: '',
      repsOrTime: '',
      weightKg: '',
      rpeRir: '',
      restSeconds: '',
      notes: '',
      videoUrl: '',
    },
  });

  const exerciseId = watch('exerciseId');
  const videoUrl = watch('videoUrl');

  useEffect(() => {
    if (open) {
      if (workoutExercise) {
        reset({
          exerciseId: workoutExercise.exerciseId,
          sets: workoutExercise.sets ?? ('' as any),
          repsOrTime: workoutExercise.repsOrTime ?? '',
          weightKg: workoutExercise.weightKg ?? ('' as any),
          rpeRir: workoutExercise.rpeRir ?? '',
          restSeconds: workoutExercise.restSeconds ?? ('' as any),
          notes: workoutExercise.notes ?? '',
          videoUrl: workoutExercise.videoUrl ?? '',
        });
        if (workoutExercise.exercise) {
          setSelectedExercise(workoutExercise.exercise);
        }
      } else {
        reset({
          exerciseId: '',
          sets: '',
          repsOrTime: '',
          weightKg: '',
          rpeRir: '',
          restSeconds: '',
          notes: '',
          videoUrl: '',
        });
        setSelectedExercise(null);
      }
      setSearch('');
    }
  }, [open, workoutExercise, reset]);

  // cuando se selecciona uno de la lista, setear exerciseId + videoUrl
  const handlePickExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setValue('exerciseId', ex.id, { shouldValidate: true });
    if (ex.videoUrl && !videoUrl) {
      setValue('videoUrl', ex.videoUrl, { shouldValidate: false });
    }
  };

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: workoutExercise!.id,
          payload: {
            sets: data.sets === '' ? undefined : Number(data.sets),
            repsOrTime: data.repsOrTime || undefined,
            weightKg: data.weightKg === '' ? undefined : Number(data.weightKg),
            rpeRir: data.rpeRir || undefined,
            restSeconds: data.restSeconds === '' ? undefined : Number(data.restSeconds),
            notes: data.notes || undefined,
            videoUrl: data.videoUrl || undefined,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      const payload: CreateWorkoutExercisePayload = {
        blockId,
        exerciseId: data.exerciseId,
        sets: data.sets === '' ? undefined : Number(data.sets),
        repsOrTime: data.repsOrTime || undefined,
        weightKg: data.weightKg === '' ? undefined : Number(data.weightKg),
        rpeRir: data.rpeRir || undefined,
        restSeconds: data.restSeconds === '' ? undefined : Number(data.restSeconds),
        notes: data.notes || undefined,
        videoUrl: data.videoUrl || undefined,
      };
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar ejercicio' : 'Error al agregar ejercicio');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {isEdit ? 'Editar ejercicio' : 'Agregar ejercicio'}
          </DialogTitle>
          <DialogDescription>
            Elegí un ejercicio de la biblioteca y configurá la prescripción.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col gap-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Buscar ejercicio *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {errors.exerciseId && (
                <p className="text-xs text-destructive">{errors.exerciseId.message}</p>
              )}

              <div className="border border-border rounded-lg max-h-44 overflow-y-auto divide-y divide-border">
                {isLoadingExercises ? (
                  <div className="p-2 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No se encontraron ejercicios
                  </div>
                ) : (
                  exercises.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handlePickExercise(ex)}
                      className={cn(
                        'w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-muted/40 transition-colors',
                        exerciseId === ex.id && 'bg-primary/10',
                      )}
                    >
                      <div className="h-9 w-9 rounded bg-muted overflow-hidden flex-shrink-0">
                        {ex.videoUrl ? (
                          <img
                            src={getYoutubeThumbnail(ex.videoUrl) || ''}
                            alt={ex.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {EXERCISE_CATEGORIES[ex.category] ?? ex.category}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedExercise && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium flex-1 truncate">
                    {selectedExercise.name}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sets">Series</Label>
              <Input
                id="sets"
                type="number"
                min={1}
                placeholder="4"
                disabled={mutation.isPending}
                {...register('sets')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repsOrTime">Reps/Tiempo</Label>
              <Input
                id="repsOrTime"
                placeholder="8-10"
                disabled={mutation.isPending}
                {...register('repsOrTime')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Peso (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.5"
                min={0}
                placeholder="80"
                disabled={mutation.isPending}
                {...register('weightKg')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restSeconds">Descanso (s)</Label>
              <Input
                id="restSeconds"
                type="number"
                min={0}
                placeholder="90"
                disabled={mutation.isPending}
                {...register('restSeconds')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rpeRir">RPE / RIR</Label>
            <Input
              id="rpeRir"
              placeholder="Ej. 8 RPE, 2 RIR"
              disabled={mutation.isPending}
              {...register('rpeRir')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del video (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/..."
                disabled={mutation.isPending}
                {...register('videoUrl')}
              />
              {videoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(videoUrl, '_blank')}
                  title="Abrir video"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            {errors.videoUrl && (
              <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Indicaciones de técnica, tempo, etc."
              rows={2}
              disabled={mutation.isPending}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
