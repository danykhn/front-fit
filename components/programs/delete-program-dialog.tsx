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
import { useDeleteProgram } from '@/hooks/use-programs';
import type { Program } from '@/types';

interface DeleteProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
}

export function DeleteProgramDialog({ open, onOpenChange, program }: DeleteProgramDialogProps) {
  const deleteMutation = useDeleteProgram();

  const handleDelete = () => {
    if (!program) return;
    deleteMutation.mutate(program.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const hasAssignments = (program?._count?.activeAssignments ?? 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar programa?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el programa{' '}
            <span className="font-semibold text-foreground">{program?.name}</span> junto con sus
            sesiones y ejercicios.
            {hasAssignments && (
              <span className="block mt-2 text-destructive font-medium">
                Este programa tiene atletas asignados. Primero desasigná a todos los atletas.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending || hasAssignments}
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
