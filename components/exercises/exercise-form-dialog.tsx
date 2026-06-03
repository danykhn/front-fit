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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, Flame, Video } from 'lucide-react';
import { useCreateExercise, useUpdateExercise } from '@/hooks/use-exercises';
import { EXERCISE_CATEGORIES } from '@/lib/constants';
import type { Exercise, CreateExercisePayload, UpdateExercisePayload, ExerciseCategory } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  category: z.enum(Object.keys(EXERCISE_CATEGORIES) as [ExerciseCategory, ...ExerciseCategory[]]),
  videoUrl: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  stressIndex: z
    .union([z.number().min(0).max(2), z.literal(NaN)])
    .optional()
    .transform((v) => (Number.isNaN(v) || v === undefined ? undefined : v)),
  isWarmup: z.boolean().default(false),
  warmupZone: z.string().max(60).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise | null;
}

export function ExerciseFormDialog({ open, onOpenChange, exercise }: ExerciseFormDialogProps) {
  const isEdit = !!exercise;
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'CUADRICEPS' as ExerciseCategory,
      videoUrl: '',
      stressIndex: undefined,
      isWarmup: false,
      warmupZone: '',
    },
  });

  const isWarmup = watch('isWarmup');
  const stressIndex = watch('stressIndex');
  const [stressInput, setStressInput] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (exercise) {
        reset({
          name: exercise.name ?? '',
          category: exercise.category,
          videoUrl: exercise.videoUrl ?? '',
          stressIndex: exercise.stressIndex,
          isWarmup: exercise.isWarmup ?? false,
          warmupZone: exercise.warmupZone ?? '',
        });
        setStressInput(exercise.stressIndex?.toString() ?? '');
      } else {
        reset({
          name: '',
          category: 'CUADRICEPS' as ExerciseCategory,
          videoUrl: '',
          stressIndex: undefined,
          isWarmup: false,
          warmupZone: '',
        });
        setStressInput('');
      }
    }
  }, [open, exercise, reset]);

  const onSubmit = (data: FormData) => {
    const payload: CreateExercisePayload | UpdateExercisePayload = {
      name: data.name,
      category: data.category,
      videoUrl: data.videoUrl || undefined,
      stressIndex: data.stressIndex,
      isWarmup: data.isWarmup,
      warmupZone: data.isWarmup ? data.warmupZone || undefined : undefined,
    };

    if (isEdit && exercise) {
      updateMutation.mutate(
        { id: exercise.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload as CreateExercisePayload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar ejercicio' : 'Error al crear ejercicio');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar ejercicio' : 'Nuevo ejercicio'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del ejercicio.'
              : 'Crea un nuevo ejercicio en la biblioteca.'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej. Sentadilla con Barra"
              disabled={mutation.isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select
              value={watch('category')}
              onValueChange={(v) => setValue('category', v as ExerciseCategory, { shouldValidate: true })}
              disabled={mutation.isPending}
            >
              <SelectTrigger className="bg-input/50">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EXERCISE_CATEGORIES) as ExerciseCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {EXERCISE_CATEGORIES[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">
              <span className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                URL del video
              </span>
            </Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/..."
              disabled={mutation.isPending}
              {...register('videoUrl')}
            />
            {errors.videoUrl && (
              <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
            )}
          </div>

          {/* Stress Index */}
          <div className="space-y-2">
            <Label htmlFor="stressIndex">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Índice de estrés (0 - 2)
              </span>
            </Label>
            <Input
              id="stressIndex"
              type="number"
              step="0.1"
              min={0}
              max={2}
              placeholder="0.0 - 2.0"
              disabled={mutation.isPending}
              value={stressInput}
              onChange={(e) => {
                const v = e.target.value;
                setStressInput(v);
                if (v === '') {
                  setValue('stressIndex', undefined);
                } else {
                  const num = parseFloat(v);
                  setValue('stressIndex', isNaN(num) ? undefined : num);
                }
              }}
            />
            {errors.stressIndex && (
              <p className="text-xs text-destructive">{errors.stressIndex.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Bajo: 0-0.5, Medio: 0.5-1.0, Alto: 1.0-2.0
            </p>
          </div>

          {/* Is Warmup */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
            <div className="space-y-0.5">
              <Label htmlFor="isWarmup" className="cursor-pointer">
                ¿Es ejercicio de calentamiento?
              </Label>
              <p className="text-xs text-muted-foreground">
                Activa la zona de calentamiento
              </p>
            </div>
            <Switch
              id="isWarmup"
              checked={isWarmup}
              onCheckedChange={(checked) => setValue('isWarmup', checked)}
              disabled={mutation.isPending}
            />
          </div>

          {/* Warmup Zone (solo si isWarmup) */}
          {isWarmup && (
            <div className="space-y-2">
              <Label htmlFor="warmupZone">Zona de calentamiento</Label>
              <Input
                id="warmupZone"
                placeholder="Ej. Cadera, Hombro, Muñeca..."
                disabled={mutation.isPending}
                {...register('warmupZone')}
              />
              {errors.warmupZone && (
                <p className="text-xs text-destructive">{errors.warmupZone.message}</p>
              )}
            </div>
          )}

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
              {isEdit ? 'Guardar cambios' : 'Crear ejercicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
