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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, CalendarRange } from 'lucide-react';
import { useUpdateProgramAssignment } from '@/hooks/use-program-assignments';
import type { ProgramAssignment, UpdateProgramAssignmentPayload } from '@/types';

const schema = z
  .object({
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().optional().or(z.literal('')),
    isActive: z.boolean(),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    { message: 'La fecha de fin debe ser posterior a la de inicio', path: ['endDate'] },
  );

type FormData = z.infer<typeof schema>;

interface EditAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ProgramAssignment | null;
}

export function EditAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: EditAssignmentDialogProps) {
  const updateMutation = useUpdateProgramAssignment();

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
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (open && assignment) {
      reset({
        startDate: assignment.startDate ? assignment.startDate.substring(0, 10) : '',
        endDate: assignment.endDate ? assignment.endDate.substring(0, 10) : '',
        isActive: assignment.isActive,
      });
    }
  }, [open, assignment, reset]);

  const onSubmit = (data: FormData) => {
    if (!assignment) return;
    const payload: UpdateProgramAssignmentPayload = {
      startDate: data.startDate,
      endDate: data.endDate || null,
      isActive: data.isActive,
    };
    updateMutation.mutate(
      { id: assignment.id, payload },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const errorMessage =
    (updateMutation.error as any)?.response?.data?.message ||
    (updateMutation.error as any)?.message ||
    'Error al actualizar asignación';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Editar asignación
          </DialogTitle>
          <DialogDescription>
            {assignment?.athlete?.name && (
              <>
                Atleta:{' '}
                <span className="font-medium text-foreground">{assignment.athlete.name}</span>
              </>
            )}
            {assignment?.program?.name && (
              <>
                {' · '}
                Programa:{' '}
                <span className="font-medium text-foreground">{assignment.program.name}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {updateMutation.isError && (
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
              <Label htmlFor="startDate">Fecha de inicio *</Label>
              <Input
                id="startDate"
                type="date"
                disabled={updateMutation.isPending}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="date"
                disabled={updateMutation.isPending}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Vacío = sin fecha de fin</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked === true, { shouldValidate: true })
              }
              disabled={updateMutation.isPending}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <Label htmlFor="isActive" className="cursor-pointer">
                Asignación activa
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Las asignaciones inactivas no se cuentan en los listados del atleta ni en las
                estadísticas, pero se conservan en el historial.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
