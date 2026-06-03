'use client';

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
import { Loader2 } from 'lucide-react';
import { useDeleteWorkout } from '@/hooks/use-workouts';
import type { Workout } from '@/types';

interface DeleteWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
}

export function DeleteWorkoutDialog({ open, onOpenChange, workout }: DeleteWorkoutDialogProps) {
  const deleteMutation = useDeleteWorkout();

  const handleDelete = () => {
    if (!workout) return;
    deleteMutation.mutate(workout.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const blockCount = workout?._count?.workoutBlocks ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la sesión{' '}
            <span className="font-semibold text-foreground">
              {workout?.name || `Día ${workout?.dayNumber}`}
            </span>{' '}
            junto con {blockCount} bloque{blockCount === 1 ? '' : 's'} y todos sus ejercicios.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
