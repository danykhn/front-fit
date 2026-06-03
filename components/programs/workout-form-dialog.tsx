'use client';

import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCreateWorkout, useUpdateWorkout } from '@/hooks/use-workouts';
import { DAY_TYPES } from '@/lib/constants';
import type { Workout, DayType, CreateWorkoutPayload } from '@/types';

const dayTypeValues = Object.keys(DAY_TYPES) as DayType[];

const schema = z.object({
  dayNumber: z.coerce
    .number()
    .int('Debe ser un entero')
    .min(1, 'Mínimo día 1')
    .max(7, 'Máximo día 7'),
  dayType: z.enum(dayTypeValues as [DayType, ...DayType[]]).optional().or(z.literal('')),
  name: z.string().max(80, 'Máximo 80 caracteres').optional().or(z.literal('')),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface WorkoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  workout?: Workout | null;
}

export function WorkoutFormDialog({
  open,
  onOpenChange,
  programId,
  workout,
}: WorkoutFormDialogProps) {
  const isEdit = !!workout;
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();
  const mutation = isEdit ? updateMutation : createMutation;

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
      dayNumber: 1,
      dayType: '' as any,
      name: '',
      notes: '',
    },
  });

  const dayType = watch('dayType');

  useEffect(() => {
    if (open) {
      if (workout) {
        reset({
          dayNumber: workout.dayNumber,
          dayType: (workout.dayType as DayType) ?? ('' as any),
          name: workout.name ?? '',
          notes: workout.notes ?? '',
        });
      } else {
        reset({
          dayNumber: 1,
          dayType: '' as any,
          name: '',
          notes: '',
        });
      }
    }
  }, [open, workout, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: workout!.id,
          payload: {
            dayNumber: data.dayNumber,
            dayType: (data.dayType || undefined) as DayType | undefined,
            name: data.name || undefined,
            notes: data.notes || undefined,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      const payload: CreateWorkoutPayload = {
        programId,
        dayNumber: data.dayNumber,
        dayType: (data.dayType || undefined) as DayType | undefined,
        name: data.name || undefined,
        notes: data.notes || undefined,
      };
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar sesión' : 'Error al crear sesión');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar sesión' : 'Nueva sesión'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modificá el día, tipo o notas de la sesión.'
              : 'Agregá una sesión al programa. Luego podés agregar bloques y ejercicios.'}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dayNumber">Día de la semana *</Label>
              <Select
                value={String(watch('dayNumber') || 1)}
                onValueChange={(v) => setValue('dayNumber', Number(v), { shouldValidate: true })}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="dayNumber">
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Día {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayNumber && (
                <p className="text-xs text-destructive">{errors.dayNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayType">Tipo de día</Label>
              <Select
                value={dayType || 'NONE'}
                onValueChange={(v) =>
                  setValue('dayType', (v === 'NONE' ? '' : v) as any, { shouldValidate: true })
                }
                disabled={mutation.isPending}
              >
                <SelectTrigger id="dayType">
                  <SelectValue placeholder="Sin tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sin tipo</SelectItem>
                  {dayTypeValues.map((t) => (
                    <SelectItem key={t} value={t}>
                      {DAY_TYPES[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayType && (
                <p className="text-xs text-destructive">{errors.dayType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la sesión</Label>
            <Input
              id="name"
              placeholder="Ej. Empuje A"
              disabled={mutation.isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Indicaciones, objetivos, materiales..."
              rows={3}
              disabled={mutation.isPending}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
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
              {isEdit ? 'Guardar cambios' : 'Crear sesión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
