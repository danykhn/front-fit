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
import { Loader2, AlertCircle, Layers } from 'lucide-react';
import { useCreateWorkoutBlock, useUpdateWorkoutBlock } from '@/hooks/use-workout-blocks';
import { BLOCK_TYPES } from '@/lib/constants';
import type { WorkoutBlock, BlockType, CreateWorkoutBlockPayload } from '@/types';

const blockTypeValues = Object.keys(BLOCK_TYPES) as BlockType[];

const schema = z.object({
  type: z.enum(blockTypeValues as [BlockType, ...BlockType[]]),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface WorkoutBlockFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
  block?: WorkoutBlock | null;
}

export function WorkoutBlockFormDialog({
  open,
  onOpenChange,
  workoutId,
  block,
}: WorkoutBlockFormDialogProps) {
  const isEdit = !!block;
  const createMutation = useCreateWorkoutBlock();
  const updateMutation = useUpdateWorkoutBlock();
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
      type: 'BLOQUE',
      name: '',
      notes: '',
    },
  });

  const type = watch('type');

  useEffect(() => {
    if (open) {
      if (block) {
        reset({
          type: block.type as BlockType,
          name: block.name ?? '',
          notes: block.notes ?? '',
        });
      } else {
        reset({
          type: 'BLOQUE',
          name: '',
          notes: '',
        });
      }
    }
  }, [open, block, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: block!.id,
          payload: {
            type: data.type,
            name: data.name,
            notes: data.notes || undefined,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      const payload: CreateWorkoutBlockPayload = {
        workoutId,
        type: data.type,
        name: data.name,
        notes: data.notes || undefined,
      };
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar bloque' : 'Error al crear bloque');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {isEdit ? 'Editar bloque' : 'Nuevo bloque'}
          </DialogTitle>
          <DialogDescription>
            Los bloques agrupan ejercicios (calentamiento, bloque principal, accesorios, etc.).
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
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de bloque *</Label>
            <Select
              value={type}
              onValueChange={(v) => setValue('type', v as BlockType, { shouldValidate: true })}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccioná un tipo" />
              </SelectTrigger>
              <SelectContent>
                {blockTypeValues.map((t) => (
                  <SelectItem key={t} value={t}>
                    {BLOCK_TYPES[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej. Bloque principal, Accesorios, Vuelta a la calma"
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
              placeholder="Indicaciones para el bloque..."
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
              {isEdit ? 'Guardar cambios' : 'Crear bloque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
