'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDeleteMeasurement } from '@/hooks/use-measurements';
import type { Measurement } from '@/types';

interface DeleteMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurement: Measurement | null;
}

export function DeleteMeasurementDialog({
  open,
  onOpenChange,
  measurement,
}: DeleteMeasurementDialogProps) {
  const deleteMutation = useDeleteMeasurement();

  const handleConfirm = async () => {
    if (!measurement) return;
    try {
      await deleteMutation.mutateAsync(measurement.id);
      onOpenChange(false);
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar medición
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de eliminar la medición de la semana{' '}
            <strong>{measurement?.weekNumber}</strong>
            {measurement?.athlete?.name ? ` de ${measurement.athlete.name}` : ''}?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            )}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
