'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES, ATHLETE_ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import {
  Users,
  Dumbbell,
  Calendar,
  ClipboardList,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Navegacion para TRAINER
const trainerNavigation = [
  { name: 'Inicio', href: ROUTES.DASHBOARD, icon: Home },
  { name: 'Atletas', href: ROUTES.ATHLETES, icon: Users },
  { name: 'Ejercicios', href: ROUTES.EXERCISES, icon: Dumbbell },
  { name: 'Programas', href: ROUTES.PROGRAMS, icon: Calendar },
  { name: 'Sesiones', href: ROUTES.WORKOUTS, icon: ClipboardList },
  { name: 'Mediciones', href: ROUTES.MEASUREMENTS, icon: BarChart3 },
];

// Navegacion para ATHLETE
const athleteNavigation = [
  { name: 'Mi Inicio', href: ATHLETE_ROUTES.DASHBOARD, icon: Home },
  { name: 'Mi Programa', href: ATHLETE_ROUTES.MY_PROGRAM, icon: Calendar },
  { name: 'Mis Sesiones', href: ATHLETE_ROUTES.MY_WORKOUTS, icon: ClipboardList },
  { name: 'Mi Progreso', href: ATHLETE_ROUTES.MY_PROGRESS, icon: TrendingUp },
  { name: 'Mi Perfil', href: ATHLETE_ROUTES.MY_PROFILE, icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const isAthlete = user.role === 'ATHLETE';
  const navigation = isAthlete ? athleteNavigation : trainerNavigation;

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay para movil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          'hidden lg:block',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          mobileOpen && 'block w-72'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4',
            collapsed && !mobileOpen ? 'justify-center' : 'justify-between'
          )}>
            {(!collapsed || mobileOpen) && (
              <Link 
                href={isAthlete ? ATHLETE_ROUTES.DASHBOARD : ROUTES.DASHBOARD} 
                className="flex items-center gap-2" 
                onClick={handleNavClick}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Dumbbell className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  SS<span className="text-primary">ENGINE</span>
                </span>
              </Link>
            )}
            {collapsed && !mobileOpen && (
              <Link href={isAthlete ? ATHLETE_ROUTES.DASHBOARD : ROUTES.DASHBOARD}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Dumbbell className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
            )}
            {mobileOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Role Badge */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 py-3 border-b border-sidebar-border">
              <div className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
                isAthlete 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-primary/20 text-primary'
              )}>
                {isAthlete ? (
                  <>
                    <User className="h-3 w-3 mr-1.5" />
                    ATLETA
                  </>
                ) : (
                  <>
                    <Dumbbell className="h-3 w-3 mr-1.5" />
                    ENTRENADOR
                  </>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                    collapsed && !mobileOpen && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                  {(!collapsed || mobileOpen) && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse button - solo en desktop */}
          <div className="border-t border-sidebar-border p-2 hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('w-full', collapsed ? 'px-2' : 'justify-start')}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Colapsar</span>
                </>
              )}
            </Button>
          </div>

          {/* Info de usuario en movil */}
          {mobileOpen && (
            <div className="border-t border-sidebar-border p-4 lg:hidden">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isAthlete ? 'bg-accent/10' : 'bg-primary/10'
                )}>
                  <span className={cn(
                    'text-sm font-bold',
                    isAthlete ? 'text-accent' : 'text-primary'
                  )}>
                    {user.email.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  <p className={cn(
                    'text-xs',
                    isAthlete ? 'text-accent' : 'text-primary'
                  )}>
                    {isAthlete ? 'Atleta' : 'Entrenador'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
