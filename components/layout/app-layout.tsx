'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Panel Principal', description: 'Bienvenido de vuelta' },
  '/athletes': { title: 'Atletas', description: 'Gestiona tus atletas y su progreso' },
  '/exercises': { title: 'Ejercicios', description: 'Biblioteca de ejercicios disponibles' },
  '/programs': { title: 'Programas', description: 'Crea y administra programas de entrenamiento' },
  '/workouts': { title: 'Sesiones', description: 'Sesiones de entrenamiento' },
  '/measurements': { title: 'Mediciones', description: 'Registro de mediciones corporales' },
};

export function AppLayout({ children, title, description }: AppLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const pageInfo = pageTitles[pathname] || { title: '', description: '' };
  const displayTitle = title || pageInfo.title;
  const displayDescription = description || pageInfo.description;

  // Si no hay usuario, renderizar sin layout (para login, etc)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={cn(
        'transition-all duration-300',
        // Desktop - con margen para sidebar
        collapsed ? 'lg:ml-16' : 'lg:ml-64',
        // Mobile - sin margen
        'ml-0'
      )}>
        <Header 
          title={displayTitle} 
          description={displayDescription}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
