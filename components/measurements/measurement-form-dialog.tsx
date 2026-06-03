'use client';

import { useEffect, useMemo } from 'react';
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
import { useCreateMeasurement, useUpdateMeasurement } from '@/hooks/use-measurements';
import { useAthletes } from '@/hooks/use-athletes';
import { useAuthStore } from '@/store/auth-store';
import type { Measurement, CreateMeasurementPayload } from '@/types';

const optionalNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().nonnegative('Debe ser >= 0').optional());

const schema = z.object({
  athleteId: z.string().min(1, 'Atleta requerido').optional().or(z.literal('')),
  weekNumber: z.coerce
    .number()
    .int('Debe ser entero')
    .min(1, 'Mínimo 1')
    .max(520, 'Máximo 520'),
  date: z.string().min(1, 'Fecha requerida'),
  weightKg: optionalNumber,
  waistCm: optionalNumber,
  hipCm: optionalNumber,
  chestCm: optionalNumber,
  armCm: optionalNumber,
  thighCm: optionalNumber,
  calfCm: optionalNumber,
  bodyFatPct: optionalNumber,
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface MeasurementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurement?: Measurement | null;
  /** Atajo para athletes/trainers: fija el athleteId en el form. */
  defaultAthleteId?: string;
}

export function MeasurementFormDialog({
  open,
  onOpenChange,
  measurement,
  defaultAthleteId,
}: MeasurementFormDialogProps) {
  const isEdit = !!measurement;
  const user = useAuthStore((state) => state.user);
  const isAthlete = user?.role === 'ATHLETE';
  const isAdmin = user?.role === 'ADMIN';
  const isTrainer = user?.role === 'TRAINER';
  const canPickAthlete = isAdmin || isTrainer;

  const createMutation = useCreateMeasurement();
  const updateMutation = useUpdateMeasurement();

  const { data: athletesResp, isLoading: isLoadingAthletes } = useAthletes(
    canPickAthlete ? { pageSize: 100 } : { pageSize: 1 },
  );
  const athletes = athletesResp?.data ?? [];

  const defaultDate = useMemo(() => {
    if (measurement?.date) return measurement.date.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  }, [measurement?.date]);

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
      athleteId: defaultAthleteId ?? measurement?.athleteId ?? '',
      weekNumber: measurement?.weekNumber ?? 1,
      date: defaultDate,
      weightKg: measurement?.weightKg,
      waistCm: measurement?.waistCm,
      hipCm: measurement?.hipCm,
      chestCm: measurement?.chestCm,
      armCm: measurement?.armCm,
      thighCm: measurement?.thighCm,
      calfCm: measurement?.calfCm,
      bodyFatPct: measurement?.bodyFatPct,
      notes: measurement?.notes ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        athleteId: defaultAthleteId ?? measurement?.athleteId ?? '',
        weekNumber: measurement?.weekNumber ?? 1,
        date: defaultDate,
        weightKg: measurement?.weightKg,
        waistCm: measurement?.waistCm,
        hipCm: measurement?.hipCm,
        chestCm: measurement?.chestCm,
        armCm: measurement?.armCm,
        thighCm: measurement?.thighCm,
        calfCm: measurement?.calfCm,
        bodyFatPct: measurement?.bodyFatPct,
        notes: measurement?.notes ?? '',
      });
    }
  }, [open, measurement, defaultAthleteId, defaultDate, reset]);

  const selectedAthleteId = watch('athleteId');

  const onSubmit = handleSubmit(async (data) => {
    const payload: CreateMeasurementPayload = {
      weekNumber: data.weekNumber,
      date: new Date(data.date).toISOString(),
      weightKg: data.weightKg,
      waistCm: data.waistCm,
      hipCm: data.hipCm,
      chestCm: data.chestCm,
      armCm: data.armCm,
      thighCm: data.thighCm,
      calfCm: data.calfCm,
      bodyFatPct: data.bodyFatPct,
      notes: data.notes?.trim() || undefined,
    };

    if (canPickAthlete && data.athleteId) {
      payload.athleteId = data.athleteId;
    }

    try {
      if (isEdit && measurement) {
        await updateMutation.mutateAsync({ id: measurement.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // El toast lo maneja el hook mutation
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const errorMessage =
    (createMutation.error as { message?: string })?.message ??
    (updateMutation.error as { message?: string })?.message ??
    null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar medición' : 'Nueva medición'}
          </DialogTitle>
          <DialogDescription>
            Registra las medidas corporales del atleta para la semana indicada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {canPickAthlete ? (
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="athleteId">Atleta</Label>
                <Select
                  value={selectedAthleteId ?? ''}
                  onValueChange={(v) => setValue('athleteId', v, { shouldValidate: true })}
                  disabled={isLoadingAthletes}
                >
                  <SelectTrigger id="athleteId">
                    <SelectValue placeholder={isLoadingAthletes ? 'Cargando...' : 'Elegir'} />
                  </SelectTrigger>
                  <SelectContent>
                    {athletes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.athleteId && (
                  <p className="text-xs text-destructive">{errors.athleteId.message}</p>
                )}
              </div>
            ) : null}

            <div className={canPickAthlete ? 'sm:col-span-1' : 'sm:col-span-1'} >
              <Label htmlFor="weekNumber">Semana</Label>
              <Input
                id="weekNumber"
                type="number"
                min={1}
                {...register('weekNumber')}
                className="mt-1"
              />
              {errors.weekNumber && (
                <p className="text-xs text-destructive mt-1">
                  {errors.weekNumber.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className="mt-1"
              />
              {errors.date && (
                <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <NumberField id="weightKg" label="Peso (kg)" step="0.1" register={register} error={errors.weightKg} />
            <NumberField id="bodyFatPct" label="% Grasa" step="0.1" register={register} error={errors.bodyFatPct} />
            <NumberField id="waistCm" label="Cintura (cm)" step="0.1" register={register} error={errors.waistCm} />
            <NumberField id="hipCm" label="Cadera (cm)" step="0.1" register={register} error={errors.hipCm} />
            <NumberField id="chestCm" label="Pecho (cm)" step="0.1" register={register} error={errors.chestCm} />
            <NumberField id="armCm" label="Brazo (cm)" step="0.1" register={register} error={errors.armCm} />
            <NumberField id="thighCm" label="Muslo (cm)" step="0.1" register={register} error={errors.thighCm} />
            <NumberField id="calfCm" label="Pantorrilla (cm)" step="0.1" register={register} error={errors.calfCm} />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              className="mt-1"
              rows={3}
              placeholder="Observaciones, sensaciones, indicaciones..."
            />
            {errors.notes && (
              <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear medición'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NumberField({
  id,
  label,
  step,
  register,
  error,
}: {
  id: keyof FormData;
  label: string;
  step?: string;
  register: ReturnType<typeof useForm<FormData>>['register'];
  error?: { message?: string };
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        {...register(id)}
        className="mt-1"
      />
      {error?.message && (
        <p className="text-xs text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}
