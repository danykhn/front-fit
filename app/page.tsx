'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import { Dumbbell, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push(ROUTES.DASHBOARD);
    } else {
      router.push(ROUTES.LOGIN);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-4 glow-primary">
          <Dumbbell className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          TRAINER<span className="text-primary">PRO</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    </div>
  );
}
