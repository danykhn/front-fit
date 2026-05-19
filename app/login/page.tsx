'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, ATHLETE_ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dumbbell, Loader2, Eye, EyeOff, Mail, Lock, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('TRAINER');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulacion de login - reemplazar con llamada real al API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user segun el rol seleccionado
      const mockUser = {
        id: '1',
        email: data.email,
        role: selectedRole,
        trainerId: selectedRole === 'TRAINER' ? 'trainer-1' : undefined,
        athleteId: selectedRole === 'ATHLETE' ? 'athlete-1' : undefined,
      };
      
      setAuth(mockUser, 'mock-jwt-token');
      
      // Redirigir segun el rol
      if (selectedRole === 'ATHLETE') {
        router.push(ATHLETE_ROUTES.DASHBOARD);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch {
      setError('Credenciales invalidas. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                TRAINER<span className="text-primary">PRO</span>
              </h1>
              <p className="text-sm text-muted-foreground">Plataforma de Entrenamiento</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight text-balance">
            Transforma el potencial de tus atletas en resultados reales
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Gestiona programas, seguimiento de progreso y mediciones en una sola plataforma disenada para entrenadores profesionales.
          </p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Ejercicios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Atletas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Entrenadores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              TRAINER<span className="text-primary">PRO</span>
            </span>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Iniciar Sesion</CardTitle>
              <CardDescription>
                Selecciona tu tipo de cuenta e ingresa tus credenciales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('TRAINER')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      selectedRole === 'TRAINER'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      selectedRole === 'TRAINER' ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-sm">Entrenador</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Gestiona atletas y programas
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ATHLETE')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      selectedRole === 'ATHLETE'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card hover:border-accent/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      selectedRole === 'ATHLETE' ? 'bg-accent/20' : 'bg-muted'
                    )}>
                      <User className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-sm">Atleta</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Ve tus entrenamientos
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 bg-input/50"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Contrasena
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contrasena"
                      className="pl-10 pr-10 bg-input/50"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" className="rounded border-border" />
                    Recordarme
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Olvide mi contrasena
                  </a>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    'w-full font-semibold transition-colors',
                    selectedRole === 'ATHLETE' 
                      ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    `Ingresar como ${selectedRole === 'ATHLETE' ? 'Atleta' : 'Entrenador'}`
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                No tienes cuenta?{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Contacta al administrador
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Al continuar, aceptas nuestros Terminos de Servicio y Politica de Privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
