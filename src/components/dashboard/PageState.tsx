import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';

export function PageState({
  loading = false,
  title,
  description,
  onRetry,
}: {
  loading?: boolean;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          {loading ? (
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
          ) : (
            <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
          )}
          <h1 className="mt-4 text-lg font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button className="mt-5" type="button" onClick={onRetry}>Tentar novamente</Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
