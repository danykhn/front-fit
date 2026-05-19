'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List,
  Play,
  Dumbbell,
  Flame,
  Filter
} from 'lucide-react';
import type { Exercise, ExerciseCategory } from '@/types';
import { EXERCISE_CATEGORIES } from '@/lib/constants';

// Mock data para demo
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Sentadilla con Barra',
    category: 'CUADRICEPS',
    videoUrl: 'https://example.com/video1',
    stressIndex: 8,
    isWarmup: false,
    createdAt: '2024-01-10',
    updatedAt: '2024-06-10',
  },
  {
    id: '2',
    name: 'Peso Muerto Rumano',
    category: 'ISQUIOS',
    videoUrl: 'https://example.com/video2',
    stressIndex: 7,
    isWarmup: false,
    createdAt: '2024-01-12',
    updatedAt: '2024-06-08',
  },
  {
    id: '3',
    name: 'Press Banca',
    category: 'PECTORAL',
    videoUrl: 'https://example.com/video3',
    stressIndex: 7,
    isWarmup: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-05',
  },
  {
    id: '4',
    name: 'Dominadas',
    category: 'ESPALDA',
    videoUrl: 'https://example.com/video4',
    stressIndex: 6,
    isWarmup: false,
    createdAt: '2024-01-18',
    updatedAt: '2024-06-03',
  },
  {
    id: '5',
    name: 'Remo con Barra',
    category: 'ESPALDA',
    stressIndex: 6,
    isWarmup: false,
    createdAt: '2024-01-20',
    updatedAt: '2024-06-01',
  },
  {
    id: '6',
    name: 'Hip Thrust',
    category: 'GLUTEOS',
    videoUrl: 'https://example.com/video6',
    stressIndex: 7,
    isWarmup: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-05-28',
  },
  {
    id: '7',
    name: 'Press Militar',
    category: 'HOMBROS',
    stressIndex: 6,
    isWarmup: false,
    createdAt: '2024-02-05',
    updatedAt: '2024-05-25',
  },
  {
    id: '8',
    name: 'Curl de Biceps',
    category: 'BICEPS',
    stressIndex: 4,
    isWarmup: false,
    createdAt: '2024-02-08',
    updatedAt: '2024-05-22',
  },
  {
    id: '9',
    name: 'Movilidad de Cadera',
    category: 'MOVILIDAD',
    stressIndex: 2,
    isWarmup: true,
    warmupZone: 'Cadera',
    createdAt: '2024-02-10',
    updatedAt: '2024-05-20',
  },
  {
    id: '10',
    name: 'Plancha Frontal',
    category: 'ABDOMEN',
    stressIndex: 5,
    isWarmup: false,
    createdAt: '2024-02-12',
    updatedAt: '2024-05-18',
  },
  {
    id: '11',
    name: 'Zancadas',
    category: 'CUADRICEPS',
    stressIndex: 6,
    isWarmup: false,
    createdAt: '2024-02-15',
    updatedAt: '2024-05-15',
  },
  {
    id: '12',
    name: 'Fondos en Paralelas',
    category: 'TRICEPS',
    stressIndex: 5,
    isWarmup: false,
    createdAt: '2024-02-18',
    updatedAt: '2024-05-12',
  },
];

const categoryColors: Partial<Record<ExerciseCategory, string>> = {
  CUADRICEPS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ISQUIOS: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  PECTORAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  ESPALDA: 'bg-green-500/10 text-green-500 border-green-500/20',
  GLUTEOS: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  HOMBROS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  BICEPS: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  TRICEPS: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  ABDOMEN: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  MOVILIDAD: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exercises] = useState(mockExercises);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStressColor = (stress?: number) => {
    if (!stress) return 'text-muted-foreground';
    if (stress >= 7) return 'text-red-500';
    if (stress >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{exercises.length}</p>
                  <p className="text-xs text-muted-foreground">Ejercicios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {Object.keys(EXERCISE_CATEGORIES).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Categorias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {exercises.filter(e => e.videoUrl).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Con Video</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {exercises.filter(e => e.isWarmup).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Warmup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input/50 h-9 sm:h-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 bg-input/50 h-9 sm:h-10">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {(Object.keys(EXERCISE_CATEGORIES) as ExerciseCategory[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {EXERCISE_CATEGORIES[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <div className="flex rounded-lg border border-border p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm">
                  <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Ejercicio</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className="border-border/50 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-secondary/50 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                    <Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/30" />
                  </div>
                  {exercise.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary">
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  )}
                  {exercise.isWarmup && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                      <Badge className="bg-orange-500/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5">
                        Warmup
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-2.5 sm:p-4">
                  <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-1">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center justify-between gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5 ${categoryColors[exercise.category] || 'bg-muted text-muted-foreground'}`}
                    >
                      {EXERCISE_CATEGORIES[exercise.category]}
                    </Badge>
                    {exercise.stressIndex && (
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Flame className={`h-3 w-3 sm:h-4 sm:w-4 ${getStressColor(exercise.stressIndex)}`} />
                        <span className={`text-xs sm:text-sm font-medium ${getStressColor(exercise.stressIndex)}`}>
                          {exercise.stressIndex}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredExercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-secondary/50 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] sm:text-xs ${categoryColors[exercise.category] || ''}`}
                        >
                          {EXERCISE_CATEGORIES[exercise.category]}
                        </Badge>
                        {exercise.isWarmup && (
                          <Badge className="bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs">
                            Warmup
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      {exercise.videoUrl && (
                        <Button variant="ghost" size="sm" className="text-primary h-8 px-2 hidden sm:flex">
                          <Play className="h-4 w-4 mr-1" />
                          Video
                        </Button>
                      )}
                      {exercise.stressIndex && (
                        <div className="flex items-center gap-1">
                          <Flame className={`h-4 w-4 ${getStressColor(exercise.stressIndex)}`} />
                          <span className={`text-xs sm:text-sm font-medium ${getStressColor(exercise.stressIndex)}`}>
                            {exercise.stressIndex}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {filteredExercises.length} de {exercises.length} ejercicios
        </p>
      </div>
    </AppLayout>
  );
}
