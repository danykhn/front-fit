'use client';

import { useEffect, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, AlertCircle, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAthletes } from '@/hooks/use-athletes';
import {
  useProgramAssignments,
  useCreateProgramAssignment,
} from '@/hooks/use-program-assignments';
import type { Athlete } from '@/types';

const schema = z.object({
  search: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface AssignAthleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programName?: string;
}

export function AssignAthleteDialog({
  open,
  onOpenChange,
  programId,
  programName,
}: AssignAthleteDialogProps) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );

  const { register, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { search: '' },
  });
  const search = watch('search') || '';

  const { data, isLoading } = useAthletes({ search: search || undefined, pageSize: 50 });
  const athletes = data?.data ?? [];

  // Atletas ya asignados activamente a este programa
  const { data: assignmentsData } = useProgramAssignments({
    programId,
    isActive: true,
    pageSize: 100,
  });
  const activeAssignments = assignmentsData?.data ?? [];
  const assignedAthleteIds = new Set(activeAssignments.map((a) => a.athleteId));

  const createMutation = useCreateProgramAssignment();

  useEffect(() => {
    if (open) {
      setPendingIds(new Set());
      setError(null);
      setStartDate(new Date().toISOString().substring(0, 10));
    }
  }, [open]);

  const toggleAthlete = (athlete: Athlete) => {
    setError(null);
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(athlete.id)) {
        next.delete(athlete.id);
      } else {
        next.add(athlete.id);
      }
      return next;
    });
  };

  const handleAssign = async () => {
    setError(null);
    if (pendingIds.size === 0) {
      setError('Seleccioná al menos un atleta');
      return;
    }
    try {
      const results = await Promise.all(
        Array.from(pendingIds).map((athleteId) =>
          createMutation.mutateAsync({ programId, athleteId, startDate }),
        ),
      );
      const failed = results.filter((r: any) => r?.isActive === false);
      if (failed.length > 0) {
        setError(`${failed.length} asignación(es) no se pudieron crear`);
      } else {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Error al asignar atletas',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Asignar atletas
          </DialogTitle>
          <DialogDescription>
            {programName ? (
              <>
                Programa: <span className="font-medium text-foreground">{programName}</span>
              </>
            ) : (
              'Seleccioná los atletas que van a realizar este programa'
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 flex-1 min-h-0 flex flex-col">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atletas..."
                className="pl-9"
                {...register('search')}
              />
            </div>
            <div className="space-y-1 sm:w-44">
              <Label htmlFor="startDate" className="text-xs">
                Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : athletes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No se encontraron atletas</p>
              </div>
            ) : (
              athletes.map((athlete) => {
                const isAssigned = assignedAthleteIds.has(athlete.id);
                const isSelected = pendingIds.has(athlete.id);
                return (
                  <button
                    key={athlete.id}
                    type="button"
                    disabled={isAssigned || createMutation.isPending}
                    onClick={() => toggleAthlete(athlete)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors',
                      isAssigned && 'opacity-50 cursor-not-allowed bg-muted/30',
                      !isAssigned && isSelected && 'bg-primary/10',
                      !isAssigned && !isSelected && 'hover:bg-muted/40',
                    )}
                  >
                    <div
                      className={cn(
                        'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                        isAssigned
                          ? 'border-muted-foreground/30 bg-muted-foreground/10'
                          : isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30',
                      )}
                    >
                      {(isAssigned || isSelected) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {athlete.name}
                      </p>
                      {athlete.user?.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {athlete.user.email}
                        </p>
                      )}
                    </div>
                    {isAssigned && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        Ya asignado
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {pendingIds.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingIds.size} atleta{pendingIds.size === 1 ? '' : 's'} seleccionado
              {pendingIds.size === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={createMutation.isPending || pendingIds.size === 0}
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar {pendingIds.size > 0 ? `(${pendingIds.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
