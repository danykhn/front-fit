'use client';

import { AppLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Plus,
  Activity,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const stats = [
  { 
    name: 'Atletas Activos', 
    value: '24', 
    change: '+3', 
    changeType: 'positive',
    icon: Users,
    href: ROUTES.ATHLETES 
  },
  { 
    name: 'Ejercicios', 
    value: '156', 
    change: '+12', 
    changeType: 'positive',
    icon: Dumbbell,
    href: ROUTES.EXERCISES 
  },
  { 
    name: 'Programas Activos', 
    value: '8', 
    change: '0', 
    changeType: 'neutral',
    icon: Calendar,
    href: ROUTES.PROGRAMS 
  },
  { 
    name: 'Sesiones Esta Semana', 
    value: '45', 
    change: '+8', 
    changeType: 'positive',
    icon: Activity,
    href: ROUTES.WORKOUTS 
  },
];

const recentAthletes = [
  { id: '1', name: 'Carlos Martinez', lastWorkout: 'Hace 2 horas', progress: 85 },
  { id: '2', name: 'Maria Rodriguez', lastWorkout: 'Hace 5 horas', progress: 72 },
  { id: '3', name: 'Juan Perez', lastWorkout: 'Ayer', progress: 90 },
  { id: '4', name: 'Ana Garcia', lastWorkout: 'Hace 2 dias', progress: 65 },
];

const quickActions = [
  { name: 'Nuevo Atleta', icon: Users, href: ROUTES.ATHLETES, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Nuevo Programa', icon: Calendar, href: ROUTES.PROGRAMS, color: 'bg-green-500/10 text-green-500' },
  { name: 'Agregar Ejercicio', icon: Dumbbell, href: ROUTES.EXERCISES, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Nueva Medicion', icon: Target, href: ROUTES.MEASUREMENTS, color: 'bg-orange-500/10 text-orange-500' },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <AppLayout title="Panel Principal" description={`Bienvenido, ${user?.email || 'Entrenador'}`}>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-500' : 
                      stat.changeType === 'negative' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xl sm:text-3xl font-bold text-foreground">{stat.value}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{stat.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Acciones Rapidas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-3 sm:py-4 flex flex-col items-center gap-1.5 sm:gap-2 hover:border-primary/50 text-xs sm:text-sm"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="font-medium text-center line-clamp-1">{action.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Recent Athletes */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Atletas Recientes
              </CardTitle>
              <Link href={ROUTES.ATHLETES}>
                <Button variant="ghost" size="sm" className="text-primary h-8 px-2 sm:px-3">
                  <span className="hidden sm:inline">Ver todos</span>
                  <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-4">
                {recentAthletes.map((athlete) => (
                  <div key={athlete.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-primary">
                          {athlete.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{athlete.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{athlete.lastWorkout}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="w-12 sm:w-24 h-2 bg-secondary rounded-full overflow-hidden hidden xs:block sm:block">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${athlete.progress}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-primary">{athlete.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Progreso Semanal
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary h-8 px-2 sm:px-3">
                <span className="hidden sm:inline">Ver detalles</span>
                <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-4">
                {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day, index) => {
                  const sessions = [8, 12, 6, 10, 9, 4, 2][index];
                  const maxSessions = 12;
                  return (
                    <div key={day} className="flex items-center gap-2 sm:gap-4">
                      <span className="w-8 sm:w-20 text-xs sm:text-sm text-muted-foreground">{day}</span>
                      <div className="flex-1 h-2 sm:h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all"
                          style={{ width: `${(sessions / maxSessions) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-foreground text-right">{sessions}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
