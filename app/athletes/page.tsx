'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import type { Athlete } from '@/types';

// Mock data para demo
const mockAthletes: (Athlete & { programs: number; lastActivity: string; status: 'active' | 'inactive' })[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Carlos Martinez',
    birthDate: '1995-03-15',
    notes: 'Objetivo: Hipertrofia',
    user: { email: 'carlos@email.com' },
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
    programs: 2,
    lastActivity: 'Hace 2 horas',
    status: 'active',
  },
  {
    id: '2',
    userId: 'user-2',
    name: 'Maria Rodriguez',
    birthDate: '1998-07-22',
    notes: 'Competencia en agosto',
    user: { email: 'maria@email.com' },
    createdAt: '2024-02-20',
    updatedAt: '2024-06-09',
    programs: 1,
    lastActivity: 'Hace 5 horas',
    status: 'active',
  },
  {
    id: '3',
    userId: 'user-3',
    name: 'Juan Perez',
    birthDate: '1992-11-08',
    notes: 'Recuperacion de lesion',
    user: { email: 'juan@email.com' },
    createdAt: '2024-03-05',
    updatedAt: '2024-06-08',
    programs: 3,
    lastActivity: 'Ayer',
    status: 'active',
  },
  {
    id: '4',
    userId: 'user-4',
    name: 'Ana Garcia',
    birthDate: '2000-05-30',
    notes: 'Principiante',
    user: { email: 'ana@email.com' },
    createdAt: '2024-04-10',
    updatedAt: '2024-06-05',
    programs: 1,
    lastActivity: 'Hace 3 dias',
    status: 'inactive',
  },
  {
    id: '5',
    userId: 'user-5',
    name: 'Diego Lopez',
    birthDate: '1997-09-12',
    notes: 'Crossfit',
    user: { email: 'diego@email.com' },
    createdAt: '2024-05-01',
    updatedAt: '2024-06-10',
    programs: 2,
    lastActivity: 'Hace 1 hora',
    status: 'active',
  },
];

export default function AthletesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes] = useState(mockAthletes);

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">{athletes.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Activos</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">
                    {athletes.filter(a => a.status === 'active').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Nuevos</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">3</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 bg-input/50 h-9 sm:h-10"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <Button className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:inline">Nuevo Atleta</span>
              </Button>
            </div>

            {/* Mobile Cards / Desktop Table */}
            <div className="space-y-3 sm:hidden">
              {filteredAthletes.map((athlete) => (
                <div 
                  key={athlete.id} 
                  className="p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {getInitials(athlete.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{athlete.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{athlete.user?.email}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.ATHLETE_DETAIL(athlete.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={athlete.status === 'active' ? 'default' : 'secondary'}
                        className={`text-xs ${athlete.status === 'active' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {athlete.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {athlete.programs} prog.
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {athlete.lastActivity}
                    </div>
                  </div>
                  
                  {athlete.notes && (
                    <p className="mt-2 text-xs text-muted-foreground truncate">{athlete.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="text-left p-3 font-semibold text-sm">Atleta</th>
                      <th className="text-left p-3 font-semibold text-sm">Email</th>
                      <th className="text-left p-3 font-semibold text-sm">Edad</th>
                      <th className="text-left p-3 font-semibold text-sm">Programas</th>
                      <th className="text-left p-3 font-semibold text-sm">Actividad</th>
                      <th className="text-left p-3 font-semibold text-sm">Estado</th>
                      <th className="p-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAthletes.map((athlete) => (
                      <tr key={athlete.id} className="border-t border-border hover:bg-secondary/20">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-primary/30">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {getInitials(athlete.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{athlete.name}</p>
                              {athlete.notes && (
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{athlete.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{athlete.user?.email}</td>
                        <td className="p-3 text-sm text-muted-foreground">{calculateAge(athlete.birthDate)}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">
                            {athlete.programs} {athlete.programs === 1 ? 'programa' : 'programas'}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{athlete.lastActivity}</td>
                        <td className="p-3">
                          <Badge 
                            variant={athlete.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs ${athlete.status === 'active' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {athlete.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={ROUTES.ATHLETE_DETAIL(athlete.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredAthletes.length} de {athletes.length}
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="sm" disabled className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                  Ant.
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 bg-primary/10 border-primary/30 text-xs sm:text-sm">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                  Sig.
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
