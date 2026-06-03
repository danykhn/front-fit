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
import { useDeleteWorkoutBlock } from '@/hooks/use-workout-blocks';
import type { WorkoutBlock } from '@/types';

interface DeleteWorkoutBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: WorkoutBlock | null;
}

export function DeleteWorkoutBlockDialog({
  open,
  onOpenChange,
  block,
}: DeleteWorkoutBlockDialogProps) {
  const deleteMutation = useDeleteWorkoutBlock();

  const handleDelete = () => {
    if (!block) return;
    deleteMutation.mutate(block.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const exerciseCount = block?._count?.workoutExercises ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el bloque{' '}
            <span className="font-semibold text-foreground">{block?.name}</span> junto con{' '}
            {exerciseCount} ejercicio{exerciseCount === 1 ? '' : 's'}. Esta acción no se puede
            deshacer.
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
