import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/login')({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Informe usuário e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await login(username, password);
      await navigate({ to: response.user.must_change_password ? '/alterar-senha' : '/', replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o acesso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-[535px] rounded-[28px] border border-white/70 bg-white px-6 py-8 text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:px-9 sm:py-10 lg:px-11 lg:py-11" style={{ colorScheme: 'light' }}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#d90817] sm:text-[1.85rem]">Acesso ao Sistema</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Entre com suas credenciais para acessar o dashboard.</p>
        </div>

        <form className="mt-8 space-y-5 sm:mt-10" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <Label htmlFor="username" className="text-sm font-semibold text-slate-800">Usuário</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e30613]" />
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-14 rounded-lg border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#e30613]/50 focus-visible:ring-2 focus-visible:ring-[#e30613]/20"
                placeholder="Digite seu usuário"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-800">Senha</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e30613]" />
              <Input
                id="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 rounded-lg border-slate-200 bg-white px-12 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#e30613]/50 focus-visible:ring-2 focus-visible:ring-[#e30613]/20"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613]/30"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          <button
            className="mt-1 flex h-14 w-full items-center justify-center rounded-lg bg-[#e30613] px-5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(227,6,19,0.24)] transition-colors hover:bg-[#c80513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#e30613]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Acesso restrito</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Sistema de monitoramento da infraestrutura crítica do Data Center Claro RJO-AM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
