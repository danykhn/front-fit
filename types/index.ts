// Roles del sistema
export type Role = 'ADMIN' | 'TRAINER' | 'ATHLETE';

// Usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  trainerId?: string;
  athleteId?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// Categorias de ejercicios
export type ExerciseCategory = 
  | 'ABDOMEN' | 'ABDUCTORES' | 'ACTIVACION' | 'ADUCTORES' | 'ANTEBRAZO' 
  | 'BICEPS' | 'CADENAS' | 'CALISTENIA' | 'CROSSFIT' | 'CUADRICEPS' 
  | 'DESPLAZAMIENTOS' | 'DOMINANTE_DE_CADERA' | 'DOMINANTE_DE_RODILLA' 
  | 'EMPUJE' | 'ESPALDA' | 'GEMELOS' | 'GIMNASIA' | 'GLUTEOS' | 'HALTEROFILIA' 
  | 'HOMBROS' | 'ISOMETRICOS' | 'ISQUIOS' | 'LOCALIZADO' | 'LUMBARES' 
  | 'METABOLICOS' | 'MOVILIDAD' | 'PECTORAL' | 'PLIOMETRICOS' | 'ROMBOIDES' 
  | 'TRACCION' | 'TRAPECIO' | 'TRICEPS';

export type DayType = 
  | 'PIERNA' | 'EMPUJE' | 'TIRON' | 'FULL_BODY' | 'CADENA_POSTERIOR' 
  | 'CADENA_ANTERIOR' | 'BRAZO' | 'DESCANSO' | 'LIBRE';

export type BlockType = 'MOVILIDAD' | 'ACTIVACION' | 'BLOQUE' | 'CALENTAMIENTO' | 'VUELTA_A_LA_CALMA';

// Ejercicio
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  videoUrl?: string;
  stressIndex?: number;
  isWarmup: boolean;
  warmupZone?: string;
  createdAt: string;
  updatedAt: string;
}

// Atleta
export interface Athlete {
  id: string;
  userId: string;
  trainerId?: string;
  name: string;
  birthDate?: string;
  notes?: string;
  user?: { email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface QueryAthletesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  trainerId?: string;
}

export interface CreateAthletePayload {
  email: string;
  password: string;
  role: Role;
  name: string;
  birthDate?: string;
  notes?: string;
}

export type UpdateAthletePayload = Partial<CreateAthletePayload>;

// Trainer
export interface Trainer {
  id: string;
  userId: string;
  name: string;
  specialty?: string;
  user?: { email: string };
  createdAt: string;
  updatedAt: string;
}

// Asignación de programa a atleta
export interface ProgramAssignment {
  id: string;
  programId: string;
  athleteId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  program?: {
    id: string;
    name: string;
    totalWeeks: number;
    isTemplate: boolean;
  };
  athlete?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramAssignmentPayload {
  programId: string;
  athleteId: string;
  startDate?: string;
  isActive?: boolean;
}

export type UpdateProgramAssignmentPayload = {
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
};

export interface QueryProgramAssignmentParams extends QueryParams {
  programId?: string;
  athleteId?: string;
  isActive?: boolean;
}

// Programa
export interface Program {
  id: string;
  trainerId: string;
  name: string;
  description?: string;
  mesocycle?: string;
  totalWeeks: number;
  isTemplate: boolean;
  workouts?: Workout[];
  _count?: {
    workouts?: number;
    activeAssignments?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Sesion/Workout
export interface Workout {
  id: string;
  programId: string;
  dayNumber: number;
  dayType?: DayType;
  name?: string;
  notes?: string;
  orderIndex: number;
  workoutBlocks?: WorkoutBlock[];
  _count?: { workoutExercises?: number; workoutBlocks?: number };
  createdAt: string;
  updatedAt: string;
}

// Bloque de sesion
export interface WorkoutBlock {
  id: string;
  workoutId: string;
  type: BlockType;
  name: string;
  orderIndex: number;
  notes?: string;
  workoutExercises?: WorkoutExercise[];
  _count?: { workoutExercises?: number };
  createdAt: string;
  updatedAt: string;
}

// Ejercicio en sesion
export interface WorkoutExercise {
  id: string;
  blockId: string;
  exerciseId: string;
  muscleGroup?: string;
  orderIndex: number;
  sets?: number;
  repsOrTime?: string;
  weightKg?: number;
  rpeRir?: string;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
  exercise?: Exercise;
  createdAt: string;
  updatedAt: string;
}

// Registro de sesion
export interface WorkoutLog {
  id: string;
  athleteId: string;
  workoutId: string;
  weekNumber: number;
  date: string;
  durationMin?: number;
  stressIndex?: number;
  notes?: string;
  setLogs?: SetLog[];
  workout?: Workout;
  createdAt: string;
  updatedAt: string;
}

// Registro de serie
export interface SetLog {
  id: string;
  workoutLogId: string;
  workoutExerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rir?: number;
  rpe?: number;
  completedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Medicion
export interface Measurement {
  id: string;
  athleteId: string;
  weekNumber: number;
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
  bodyFatPct?: number;
  weightDiffPct?: number;
  notes?: string;
  athlete?: {
    id: string;
    name: string;
    trainerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

// DTOs para creacion
export interface CreateAthleteDto {
  name: string;
  birthDate?: string;
  notes?: string;
  trainerId?: string;
}

export interface CreateExerciseDto {
  name: string;
  category: ExerciseCategory;
  videoUrl?: string;
  stressIndex?: number;
  isWarmup?: boolean;
  warmupZone?: string;
}

export type CreateExercisePayload = CreateExerciseDto;
export type UpdateExercisePayload = Partial<CreateExerciseDto>;
export type QueryExercisesParams = QueryExerciseParams;

export interface SingleExerciseResponse {
  data: Exercise;
}

export interface CreateProgramPayload {
  name: string;
  description?: string;
  mesocycle?: string;
  totalWeeks: number;
  isTemplate?: boolean;
  trainerId?: string;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

export interface CreateWorkoutPayload {
  programId: string;
  dayNumber: number;
  dayType?: DayType;
  name?: string;
  notes?: string;
  orderIndex?: number;
}

export type UpdateWorkoutPayload = Partial<Omit<CreateWorkoutPayload, 'programId'>>;

export interface CreateWorkoutBlockPayload {
  workoutId: string;
  type: BlockType;
  name: string;
  orderIndex?: number;
  notes?: string;
}

export type UpdateWorkoutBlockPayload = Partial<Omit<CreateWorkoutBlockPayload, 'workoutId'>>;

export interface CreateWorkoutExercisePayload {
  blockId: string;
  exerciseId: string;
  muscleGroup?: string;
  orderIndex?: number;
  sets?: number;
  repsOrTime?: string;
  weightKg?: number;
  rpeRir?: string;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
}

export type UpdateWorkoutExercisePayload = Partial<
  Omit<CreateWorkoutExercisePayload, 'blockId' | 'exerciseId'>
>;

export interface QueryWorkoutBlockParams extends QueryParams {
  workoutId?: string;
  type?: BlockType;
}

export interface QueryWorkoutExerciseParams extends QueryParams {
  blockId?: string;
  exerciseId?: string;
}

export interface CreateWorkoutLogDto {
  workoutId: string;
  weekNumber: number;
  date: string;
  durationMin?: number;
  stressIndex?: number;
  notes?: string;
}

export type UpdateWorkoutLogDto = Partial<CreateWorkoutLogDto>;

export type CreateWorkoutLogPayload = CreateWorkoutLogDto;
export type UpdateWorkoutLogPayload = UpdateWorkoutLogDto;

export interface CreateSetLogDto {
  workoutLogId: string;
  workoutExerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rir?: number;
  rpe?: number;
  notes?: string;
}

export type UpdateSetLogDto = Partial<Omit<CreateSetLogDto, 'workoutLogId' | 'workoutExerciseId' | 'setNumber'>>;

export interface QuerySetLogParams extends QueryParams {
  workoutLogId?: string;
  workoutExerciseId?: string;
}

export interface CreateMeasurementDto {
  athleteId?: string;
  weekNumber: number;
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
  bodyFatPct?: number;
  notes?: string;
}

export type UpdateMeasurementDto = Partial<Omit<CreateMeasurementDto, 'athleteId'>>;

export type CreateMeasurementPayload = CreateMeasurementDto;
export type UpdateMeasurementPayload = UpdateMeasurementDto;

// Query params
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryAthleteParams extends QueryParams {
  trainerId?: string;
}

export interface QueryExerciseParams extends QueryParams {
  category?: ExerciseCategory;
  isWarmup?: boolean;
}

export interface QueryProgramParams extends QueryParams {
  trainerId?: string;
  isTemplate?: boolean;
}

export interface QueryWorkoutParams extends QueryParams {
  programId?: string;
  dayType?: DayType;
}

export interface QueryWorkoutLogParams extends QueryParams {
  athleteId?: string;
  workoutId?: string;
  startDate?: string;
  endDate?: string;
}

export interface QueryMeasurementParams extends QueryParams {
  athleteId?: string;
  startDate?: string;
  endDate?: string;
}
