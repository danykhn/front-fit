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
import { useDeleteAthlete } from '@/hooks/use-athletes';
import type { Athlete } from '@/types';

interface DeleteAthleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
}

export function DeleteAthleteDialog({ open, onOpenChange, athlete }: DeleteAthleteDialogProps) {
  const deleteMutation = useDeleteAthlete();

  const handleDelete = () => {
    if (!athlete) return;
    deleteMutation.mutate(athlete.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar atleta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente a{' '}
            <span className="font-semibold text-foreground">{athlete?.name}</span> y todos sus
            datos asociados (logs de entrenamiento, mediciones, asignaciones).
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
