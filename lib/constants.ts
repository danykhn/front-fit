import type { ExerciseCategory, DayType, BlockType } from '@/types';

// Traduccion de categorias de ejercicios
export const EXERCISE_CATEGORIES: Record<ExerciseCategory, string> = {
  ABDOMEN: 'Abdomen',
  ABDUCTORES: 'Abductores',
  ACTIVACION: 'Activacion',
  ADUCTORES: 'Aductores',
  ANTEBRAZO: 'Antebrazo',
  BICEPS: 'Biceps',
  CADENAS: 'Cadenas',
  CALISTENIA: 'Calistenia',
  CROSSFIT: 'CrossFit',
  CUADRICEPS: 'Cuadriceps',
  DESPLAZAMIENTOS: 'Desplazamientos',
  DOMINANTE_DE_CADERA: 'Dominante de Cadera',
  DOMINANTE_DE_RODILLA: 'Dominante de Rodilla',
  EMPUJE: 'Empuje',
  ESPALDA: 'Espalda',
  GEMELOS: 'Gemelos',
  GIMNASIA: 'Gimnasia',
  GLUTEOS: 'Gluteos',
  HALTEROFILIA: 'Halterofilia',
  HOMBROS: 'Hombros',
  ISOMETRICOS: 'Isometricos',
  ISQUIOS: 'Isquiotibiales',
  LOCALIZADO: 'Localizado',
  LUMBARES: 'Lumbares',
  METABOLICOS: 'Metabolicos',
  MOVILIDAD: 'Movilidad',
  PECTORAL: 'Pectoral',
  PLIOMETRICOS: 'Pliometricos',
  ROMBOIDES: 'Romboides',
  TRACCION: 'Traccion',
  TRAPECIO: 'Trapecio',
  TRICEPS: 'Triceps',
};

// Traduccion de tipos de dia
export const DAY_TYPES: Record<DayType, string> = {
  PIERNA: 'Pierna',
  EMPUJE: 'Empuje',
  TIRON: 'Tiron',
  FULL_BODY: 'Full Body',
  CADENA_POSTERIOR: 'Cadena Posterior',
  CADENA_ANTERIOR: 'Cadena Anterior',
  BRAZO: 'Brazos',
  DESCANSO: 'Descanso',
  LIBRE: 'Libre',
};

// Traduccion de tipos de bloque
export const BLOCK_TYPES: Record<BlockType, string> = {
  MOVILIDAD: 'Movilidad',
  ACTIVACION: 'Activacion',
  BLOQUE: 'Bloque Principal',
  CALENTAMIENTO: 'Calentamiento',
  VUELTA_A_LA_CALMA: 'Vuelta a la Calma',
};

// Rutas de navegacion - TRAINER
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ATHLETES: '/athletes',
  ATHLETE_DETAIL: (id: string) => `/athletes/${id}`,
  EXERCISES: '/exercises',
  EXERCISE_DETAIL: (id: string) => `/exercises/${id}`,
  PROGRAMS: '/programs',
  PROGRAM_DETAIL: (id: string) => `/programs/${id}`,
  WORKOUTS: '/workouts',
  WORKOUT_DETAIL: (id: string) => `/workouts/${id}`,
  WORKOUT_LOGS: '/workout-logs',
  WORKOUT_LOG_DETAIL: (id: string) => `/workout-logs/${id}`,
  MEASUREMENTS: '/measurements',
  MEASUREMENT_DETAIL: (id: string) => `/measurements/${id}`,
} as const;

// Rutas de navegacion - ATHLETE
export const ATHLETE_ROUTES = {
  HOME: '/athlete',
  DASHBOARD: '/athlete',
  MY_PROGRAM: '/athlete/program',
  MY_WORKOUTS: '/athlete/workouts',
  MY_PROGRESS: '/athlete/progress',
  MY_PROFILE: '/athlete/profile',
} as const;

// Helper: ruta de dashboard segun el rol del usuario
import type { Role } from '@/types';
export const getDashboardRoute = (role: Role | string | undefined): string => {
  switch (role) {
    case 'ATHLETE':
      return ATHLETE_ROUTES.DASHBOARD;
    case 'ADMIN':
    case 'TRAINER':
    default:
      return ROUTES.DASHBOARD;
  }
};

// Configuracion de paginacion
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexion. Verifica tu internet.',
  UNAUTHORIZED: 'Sesion expirada. Inicia sesion nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta accion.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Datos invalidos. Revisa los campos.',
  SERVER_ERROR: 'Error del servidor. Intenta mas tarde.',
  UNKNOWN_ERROR: 'Ocurrio un error inesperado.',
} as const;

// Mensajes de exito
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente.',
  UPDATED: 'Actualizado exitosamente.',
  DELETED: 'Eliminado exitosamente.',
  SAVED: 'Guardado exitosamente.',
} as const;
