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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  UserCog,
  Dumbbell,
} from 'lucide-react';
import { useCreateAthlete, useUpdateAthlete } from '@/hooks/use-athletes';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import type { Athlete, CreateAthletePayload, UpdateAthletePayload, Role } from '@/types';

const createSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(64, 'Máximo 64 caracteres')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Debe incluir al menos una letra y un número'),
  role: z.enum(['ADMIN', 'TRAINER', 'ATHLETE']),
  birthDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  birthDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface AthleteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete?: Athlete | null;
}

interface RoleOption {
  value: Role;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'ATHLETE',
    label: 'Atleta',
    description: 'Ve sus entrenamientos y progreso',
    icon: Dumbbell,
  },
  {
    value: 'TRAINER',
    label: 'Entrenador',
    description: 'Gestiona atletas y programas',
    icon: UserCog,
  },
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Control total del sistema',
    icon: Shield,
  },
];

export function AthleteFormDialog({ open, onOpenChange, athlete }: AthleteFormDialogProps) {
  const isEdit = !!athlete;
  const createMutation = useCreateAthlete();
  const updateMutation = useUpdateAthlete();
  const mutation = isEdit ? updateMutation : createMutation;
  const currentUser = useAuthStore((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);

  // Roles disponibles según el rol del usuario actual
  const availableRoles: RoleOption[] = ALL_ROLE_OPTIONS.filter((r) => {
    if (currentUser?.role === 'ADMIN') return true;
    // TRAINER y ATHLETE solo pueden crear atletas
    return r.value === 'ATHLETE';
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'ATHLETE',
      birthDate: '',
      notes: '',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (open) {
      if (athlete) {
        reset({
          name: athlete.name ?? '',
          birthDate: athlete.birthDate ? athlete.birthDate.substring(0, 10) : '',
          notes: athlete.notes ?? '',
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role: 'ATHLETE',
          birthDate: '',
          notes: '',
        });
      }
      setShowPassword(false);
    }
  }, [open, athlete, reset, isEdit]);

  const onSubmit = (data: CreateFormData) => {
    if (isEdit) {
      const payload: UpdateAthletePayload = {
        name: data.name,
        birthDate: data.birthDate || undefined,
        notes: data.notes || undefined,
      };
      updateMutation.mutate(
        { id: athlete!.id, payload },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      const payload: CreateAthletePayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        birthDate: data.birthDate || undefined,
        notes: data.notes || undefined,
      };
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    (isEdit ? 'Error al actualizar atleta' : 'Error al crear atleta');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar atleta' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del atleta.'
              : 'Crea un usuario con acceso al sistema y asigna su rol.'}
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
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              placeholder="Ej. Juan Pérez"
              disabled={mutation.isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {!isEdit && (
            <>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (login) *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@correo.com"
                  disabled={mutation.isPending}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mín. 8 caracteres, una letra y un número"
                    className="pr-10"
                    disabled={mutation.isPending}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={mutation.isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Comparte esta contraseña con el usuario para que pueda iniciar sesión.
                </p>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label>Rol del usuario *</Label>
                <div className="grid gap-2">
                  {availableRoles.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('role', opt.value, { shouldValidate: true })}
                        disabled={mutation.isPending}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/40',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0',
                            isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'font-semibold text-sm',
                              isSelected ? 'text-primary' : 'text-foreground',
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                        <div
                          className={cn(
                            'h-4 w-4 rounded-full border-2 flex-shrink-0',
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                          )}
                        >
                          {isSelected && (
                            <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                )}
                {currentUser?.role !== 'ADMIN' && availableRoles.length === 1 && (
                  <p className="text-xs text-muted-foreground">
                    Solo un administrador puede crear usuarios con rol Entrenador o Administrador.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Birth date (solo para atletas) */}
          {(!isEdit ? selectedRole === 'ATHLETE' : true) && (
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                disabled={mutation.isPending}
                {...register('birthDate')}
              />
              {errors.birthDate && (
                <p className="text-xs text-destructive">{errors.birthDate.message}</p>
              )}
            </div>
          )}

          {/* Notes (solo para atletas) */}
          {(!isEdit ? selectedRole === 'ATHLETE' : true) && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Objetivos, lesiones, observaciones..."
                rows={3}
                disabled={mutation.isPending}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-xs text-destructive">{errors.notes.message}</p>
              )}
            </div>
          )}

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
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
