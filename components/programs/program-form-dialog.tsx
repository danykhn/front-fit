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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, UserCog } from 'lucide-react';
import { useCreateProgram, useUpdateProgram } from '@/hooks/use-programs';
import { useTrainers } from '@/hooks/use-trainers';
import { useAuthStore } from '@/store/auth-store';
import { DAY_TYPES } from '@/lib/constants';
import type { Program, CreateProgramPayload } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  mesocycle: z.string().max(60, 'Máximo 60 caracteres').optional().or(z.literal('')),
  totalWeeks: z
    .coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 semana')
    .max(104, 'Máximo 104 semanas'),
  isTemplate: z.boolean(),
  trainerId: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: Program | null;
}

export function ProgramFormDialog({ open, onOpenChange, program }: ProgramFormDialogProps) {
  const isEdit = !!program;
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const mutation = isEdit ? updateMutation : createMutation;
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  const { data: trainersData, isLoading: trainersLoading } = useTrainers(
    isAdmin && !isEdit ? {} : undefined,
  );
  const trainers = trainersData?.data ?? [];

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
      name: '',
      description: '',
      mesocycle: '',
      totalWeeks: 8,
      isTemplate: false,
      trainerId: '',
    },
  });

  const isTemplate = watch('isTemplate');
  const trainerId = watch('trainerId');

  useEffect(() => {
    if (open) {
      if (program) {
        reset({
          name: program.name ?? '',
          description: program.description ?? '',
          mesocycle: program.mesocycle ?? '',
          totalWeeks: program.totalWeeks ?? 8,
          isTemplate: program.isTemplate ?? false,
          trainerId: program.trainerId ?? '',
        });
      } else {
        reset({
          name: '',
          description: '',
          mesocycle: '',
          totalWeeks: 8,
          isTemplate: false,
          trainerId: '',
        });
      }
    }
  }, [open, program, reset]);

  const onSubmit = (data: FormData) => {
    const payload: CreateProgramPayload = {
      name: data.name,
      description: data.description || undefined,
      mesocycle: data.mesocycle || undefined,
      totalWeeks: data.totalWeeks,
      isTemplate: data.isTemplate,
    };
    if (isAdmin && !isEdit && data.trainerId) {
      payload.trainerId = data.trainerId;
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: program!.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar programa' : 'Error al crear programa');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar programa' : 'Nuevo programa'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos básicos del programa. Para editar sesiones usá la sección de workouts.'
              : 'Crea un programa de entrenamiento. Luego podés agregar sesiones y ejercicios.'}
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
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej. Hipertrofia Avanzada"
              disabled={mutation.isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {isAdmin && !isEdit && (
            <div className="space-y-2">
              <Label htmlFor="trainerId" className="flex items-center gap-1.5">
                <UserCog className="h-3.5 w-3.5" />
                Entrenador *
              </Label>
              <Select
                value={trainerId || 'NONE'}
                onValueChange={(v) =>
                  setValue('trainerId', v === 'NONE' ? '' : v, { shouldValidate: true })
                }
                disabled={mutation.isPending || trainersLoading}
              >
                <SelectTrigger id="trainerId">
                  <SelectValue
                    placeholder={
                      trainersLoading ? 'Cargando entrenadores...' : 'Seleccioná un entrenador'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" disabled>
                    Seleccioná un entrenador
                  </SelectItem>
                  {trainers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.user?.email && (
                        <span className="text-muted-foreground ml-1">· {t.user.email}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trainerId && (
                <p className="text-xs text-destructive">{errors.trainerId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Como administrador, debés indicar a qué entrenador pertenece este programa.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Objetivo, observaciones, material necesario..."
              rows={3}
              disabled={mutation.isPending}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mesocycle">Mesociclo</Label>
              <Input
                id="mesocycle"
                placeholder="Ej. Acumulación"
                disabled={mutation.isPending}
                {...register('mesocycle')}
              />
              {errors.mesocycle && (
                <p className="text-xs text-destructive">{errors.mesocycle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalWeeks">Semanas totales *</Label>
              <Input
                id="totalWeeks"
                type="number"
                min={1}
                max={104}
                disabled={mutation.isPending}
                {...register('totalWeeks')}
              />
              {errors.totalWeeks && (
                <p className="text-xs text-destructive">{errors.totalWeeks.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50">
            <Checkbox
              id="isTemplate"
              checked={isTemplate}
              onCheckedChange={(checked) =>
                setValue('isTemplate', checked === true, { shouldValidate: true })
              }
              disabled={mutation.isPending}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <Label htmlFor="isTemplate" className="cursor-pointer">
                Marcar como plantilla
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Las plantillas no se asignan a atletas. Sirven como base para crear
                programas específicos.
              </p>
            </div>
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
              {isEdit ? 'Guardar cambios' : 'Crear programa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
