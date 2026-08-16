import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/alterar-senha')({ component: ChangePasswordPage });

const validPassword = (value: string) =>
  value.length >= 12 &&
  value.length <= 72 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validPassword(newPassword)) {
      setError('A nova senha deve ter de 12 a 72 caracteres, com maiúscula, minúscula, número e caractere especial.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      window.setTimeout(() => void navigate({ to: '/login', replace: true }), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'h-12 rounded-lg border-slate-200 bg-white text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#e30613]/50 focus-visible:ring-2 focus-visible:ring-[#e30613]/20';

  return (
    <AuthShell>
      <div className="w-full max-w-[550px] rounded-[28px] border border-white/70 bg-white px-6 py-8 text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#e30613]">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#d90817]">Segurança de acesso</p>
            <h1 className="text-xl font-semibold text-slate-900">Alterar senha</h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-500">
          {user?.must_change_password
            ? 'Por segurança, defina uma nova senha antes de acessar o dashboard.'
            : 'Atualize sua senha de acesso.'}
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-semibold text-slate-800">Senha atual</Label>
            <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-semibold text-slate-800">Nova senha</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-800">Confirmar nova senha</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
            Use no mínimo 12 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.
          </div>
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</div> : null}
          {success ? <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Senha alterada. Entre novamente.</div> : null}

          <button
            className="flex h-[52px] w-full items-center justify-center rounded-lg bg-[#e30613] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(227,6,19,0.22)] transition-colors hover:bg-[#c80513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613]/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={submitting || success}
          >
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
