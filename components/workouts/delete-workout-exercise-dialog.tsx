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
import { useDeleteWorkoutExercise } from '@/hooks/use-workout-exercises';
import type { WorkoutExercise } from '@/types';

interface DeleteWorkoutExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutExercise: WorkoutExercise | null;
}

export function DeleteWorkoutExerciseDialog({
  open,
  onOpenChange,
  workoutExercise,
}: DeleteWorkoutExerciseDialogProps) {
  const deleteMutation = useDeleteWorkoutExercise();

  const handleDelete = () => {
    if (!workoutExercise) return;
    deleteMutation.mutate(workoutExercise.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quitar ejercicio?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a quitar{' '}
            <span className="font-semibold text-foreground">
              {workoutExercise?.exercise?.name ?? 'este ejercicio'}
            </span>{' '}
            del bloque. Esta acción no se puede deshacer.
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
            Quitar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
