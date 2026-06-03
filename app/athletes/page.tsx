'use client';

import { useEffect, useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAthletes, useDeleteAthlete } from '@/hooks/use-athletes';
import { AthleteFormDialog } from '@/components/athletes/athlete-form-dialog';
import { DeleteAthleteDialog } from '@/components/athletes/delete-athlete-dialog';
import { toast } from 'sonner';
import type { Athlete } from '@/types';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
  return `${age} años`;
};

const formatLastActivity = (dateStr?: string) => {
  if (!dateStr) return 'Sin actividad';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Hace menos de 1h';
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES');
};

const PAGE_SIZE = 10;

export default function AthletesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce: aplicar búsqueda 350ms después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAthletes({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const athletes = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormOpen(true);
  };

  const handleDelete = (athlete: Athlete) => {
    setDeletingAthlete(athlete);
    setDeleteOpen(true);
  };

  const handleNew = () => {
    setEditingAthlete(null);
    setFormOpen(true);
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
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">{total}</h3>
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
                  <p className="text-xs sm:text-sm text-muted-foreground">En página</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">{athletes.length}</h3>
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
                  <p className="text-xs sm:text-sm text-muted-foreground">Página</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">
                    {page} / {totalPages}
                  </h3>
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
                    placeholder="Buscar por nombre o email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 sm:pl-10 bg-input/50 h-9 sm:h-10"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title="Refrescar"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm"
                onClick={handleNew}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:inline">Nuevo Atleta</span>
              </Button>
            </div>

            {/* Error state */}
            {isError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al cargar atletas</AlertTitle>
                <AlertDescription>
                  {(error as any)?.response?.data?.message ||
                    (error as any)?.message ||
                    'Intenta nuevamente.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && athletes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No hay atletas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? `No se encontraron atletas para "${search}"`
                    : 'Comienza creando tu primer atleta'}
                </p>
                {!search && (
                  <Button onClick={handleNew} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear atleta
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Cards */}
            {!isLoading && athletes.length > 0 && (
              <div className="space-y-3 sm:hidden">
                {athletes.map((athlete) => (
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
                            <span className="truncate">{athlete.user?.email || '-'}</span>
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
                          <DropdownMenuItem onClick={() => handleEdit(athlete)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(athlete)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {calculateAge(athlete.birthDate)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatLastActivity(athlete.updatedAt)}
                      </div>
                    </div>

                    {athlete.notes && (
                      <p className="mt-2 text-xs text-muted-foreground truncate">{athlete.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Table */}
            {!isLoading && athletes.length > 0 && (
              <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/30">
                        <th className="text-left p-3 font-semibold text-sm">Atleta</th>
                        <th className="text-left p-3 font-semibold text-sm">Email</th>
                        <th className="text-left p-3 font-semibold text-sm">Edad</th>
                        <th className="text-left p-3 font-semibold text-sm">Actividad</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {athletes.map((athlete) => (
                        <tr key={athlete.id} className="border-t border-border hover:bg-secondary/20">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-primary/30">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                  {getInitials(athlete.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground text-sm">
                                  {athlete.name}
                                </p>
                                {athlete.notes && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {athlete.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {athlete.user?.email || '-'}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {calculateAge(athlete.birthDate)}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {formatLastActivity(athlete.updatedAt)}
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
                                <DropdownMenuItem onClick={() => handleEdit(athlete)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(athlete)}
                                >
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
            )}

            {/* Pagination */}
            {!isLoading && total > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {athletes.length} de {total} atletas
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    Ant.
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    Sig.
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <AthleteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        athlete={editingAthlete}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAthleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        athlete={deletingAthlete}
      />
    </AppLayout>
  );
}
