'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Bell, Menu } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

interface HeaderProps {
  title?: string;
  description?: string;
  onMenuClick?: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      TRAINER: 'Entrenador',
      ATHLETE: 'Atleta',
    };
    return roles[role] || role;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {/* Boton menu hamburguesa - solo movil */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>

        <div className="flex flex-col">
          {title && <h1 className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">{title}</h1>}
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute right-1.5 top-1.5 sm:right-1 sm:top-1 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 sm:h-10">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-primary">{getRoleName(user.role)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuracion
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
