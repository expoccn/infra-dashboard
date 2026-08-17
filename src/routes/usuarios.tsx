import { createFileRoute } from '@tanstack/react-router';
import {
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { PageState } from '@/components/dashboard/PageState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import {
  useAdminUsers,
  useCreateAdminUser,
  useResetAdminUserPassword,
  useUpdateAdminUser,
} from '@/hooks/useDataService';
import type { AccessRole, AdminAccessUser } from '@/types/auth';

export const Route = createFileRoute('/usuarios')({ component: UsuariosPage });

type TemporaryCredential = {
  username: string;
  password: string;
  reason: 'created' | 'reset';
};

function formatDate(value: string | null) {
  if (!value) return 'Nunca';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/D';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

function roleLabel(role: AccessRole) {
  return role === 'ADMIN' ? 'Administrador' : 'Usuário';
}

function UserRow({
  item,
  currentUserId,
  onTemporaryCredential,
}: {
  item: AdminAccessUser;
  currentUserId: string;
  onTemporaryCredential: (value: TemporaryCredential) => void;
}) {
  const updateMutation = useUpdateAdminUser();
  const resetMutation = useResetAdminUserPassword();
  const [displayName, setDisplayName] = useState(item.display_name);
  const [role, setRole] = useState<AccessRole>(item.role);
  const [error, setError] = useState('');
  const isSelf = item.id === currentUserId;

  useEffect(() => {
    setDisplayName(item.display_name);
    setRole(item.role);
  }, [item.display_name, item.role]);

  const save = async () => {
    setError('');
    try {
      await updateMutation.mutateAsync({
        user_id: item.id,
        display_name: displayName.trim(),
        role,
        active: item.active,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o usuário.');
    }
  };

  const toggleActive = async () => {
    const next = !item.active;
    if (!next && !window.confirm(`Desativar o usuário ${item.username}? As sessões existentes serão encerradas.`)) return;
    setError('');
    try {
      await updateMutation.mutateAsync({
        user_id: item.id,
        display_name: displayName.trim(),
        role,
        active: next,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o status do usuário.');
    }
  };

  const resetPassword = async () => {
    if (!window.confirm(`Gerar uma nova senha provisória para ${item.username}? As sessões atuais serão encerradas.`)) return;
    setError('');
    try {
      const result = await resetMutation.mutateAsync(item.id);
      onTemporaryCredential({
        username: result.user.username,
        password: result.temporary_password,
        reason: 'reset',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    }
  };

  const changed = displayName.trim() !== item.display_name || role !== item.role;
  const busy = updateMutation.isPending || resetMutation.isPending;

  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="px-3 py-3">
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="h-9 min-w-[190px]"
          aria-label={`Nome de ${item.username}`}
        />
        <p className="mt-1 text-xs text-muted-foreground">@{item.username}{isSelf ? ' · você' : ''}</p>
        {error ? <p className="mt-2 max-w-[260px] text-xs text-critical">{error}</p> : null}
      </td>
      <td className="px-3 py-3">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AccessRole)}
          disabled={isSelf || busy}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Perfil de ${item.username}`}
        >
          <option value="VIEWER">Usuário</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge label={item.active ? 'Ativo' : 'Inativo'} tone={item.active ? 'ok' : 'pending'} />
          {item.must_change_password ? <StatusBadge label="Troca pendente" tone="warn" /> : null}
          {item.locked_until ? <StatusBadge label="Bloqueado" tone="crit" /> : null}
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground">
        <p>{formatDate(item.last_login_at)}</p>
        <p className="mt-1">Falhas: {item.failed_login_count}</p>
      </td>
      <td className="px-3 py-3">
        <div className="flex min-w-[220px] flex-wrap gap-2">
          <Button size="sm" variant="outline" type="button" disabled={!changed || busy} onClick={() => void save()}>
            {updateMutation.isPending ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            Salvar
          </Button>
          <Button size="sm" variant="outline" type="button" disabled={isSelf || busy} onClick={() => void toggleActive()}>
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            {item.active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button size="sm" variant="outline" type="button" disabled={isSelf || !item.active || busy} onClick={() => void resetPassword()}>
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Resetar senha
          </Button>
        </div>
      </td>
    </tr>
  );
}

function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const usersQuery = useAdminUsers(isAdmin);
  const createMutation = useCreateAdminUser();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<AccessRole>('VIEWER');
  const [error, setError] = useState('');
  const [credential, setCredential] = useState<TemporaryCredential | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const users = usersQuery.data?.users ?? [];
    return {
      total: users.length,
      active: users.filter((item) => item.active).length,
      admins: users.filter((item) => item.active && item.role === 'ADMIN').length,
      pending: users.filter((item) => item.active && item.must_change_password).length,
    };
  }, [usersQuery.data?.users]);

  if (!isAdmin) {
    return <PageState title="Acesso restrito" description="A administração de usuários é exclusiva para administradores." />;
  }

  if (usersQuery.isPending) {
    return <PageState loading title="Carregando usuários" description="Consultando os acessos cadastrados." />;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return (
      <PageState
        title="Não foi possível carregar os usuários"
        description={usersQuery.error instanceof Error ? usersQuery.error.message : 'Tente novamente em instantes.'}
        onRetry={() => void usersQuery.refetch()}
      />
    );
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setCredential(null);
    if (!displayName.trim() || !username.trim()) {
      setError('Informe nome e usuário.');
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        display_name: displayName.trim(),
        username: username.trim().toLowerCase(),
        role,
      });
      setCredential({ username: result.user.username, password: result.temporary_password, reason: 'created' });
      setDisplayName('');
      setUsername('');
      setRole('VIEWER');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o usuário.');
    }
  };

  const copyPassword = async () => {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(credential.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-4 p-5 xl:p-6">
        <header className="flex flex-col gap-3 border-b border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> Administração
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight xl:text-[1.75rem]">Usuários</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Cadastre acessos, altere perfis, ative ou desative contas e gere novas senhas provisórias.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden"><ThemeToggle compact /></div>
            <Button variant="outline" type="button" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
            Atualizar
            </Button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">Usuários</p><p className="mt-2 text-3xl font-semibold">{stats.total}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">Ativos</p><p className="mt-2 text-3xl font-semibold text-success">{stats.active}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">Administradores</p><p className="mt-2 text-3xl font-semibold text-primary">{stats.admins}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">Primeiro acesso pendente</p><p className="mt-2 text-3xl font-semibold text-warning">{stats.pending}</p></div>
        </div>

        {credential ? (
          <section className="rounded-2xl border border-warning/35 bg-warning/8 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold"><KeyRound className="h-5 w-5 text-warning" /> Senha provisória</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {credential.reason === 'created' ? 'O usuário foi criado.' : 'A senha foi redefinida.'} Entregue esta senha ao usuário. Ela deve ser alterada obrigatoriamente no primeiro acesso.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-sm">
                  <span className="rounded-lg bg-background px-3 py-2">{credential.username}</span>
                  <span className="rounded-lg bg-background px-3 py-2 text-base font-semibold tracking-wider">{credential.password}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => void copyPassword()}>
                  {copied ? <Check className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? 'Copiada' : 'Copiar senha'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCredential(null)}>Ocultar</Button>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Panel title="Novo usuário" icon={Plus}>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="new-display-name">Nome</Label>
                <Input id="new-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nome do usuário" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-username">Usuário</Label>
                <Input id="new-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="nome.sobrenome" maxLength={40} autoComplete="off" />
                <p className="text-xs text-muted-foreground">3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Perfil</Label>
                <select id="new-role" value={role} onChange={(event) => setRole(event.target.value as AccessRole)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                  <option value="VIEWER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                O sistema gera uma senha provisória individual de 8 caracteres. A troca é obrigatória no primeiro acesso.
              </div>
              {error ? <div className="rounded-lg border border-critical/25 bg-critical/8 px-3 py-2 text-sm text-critical" role="alert">{error}</div> : null}
              <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UserRoundCog className="mr-2 h-4 w-4" />}
                {createMutation.isPending ? 'Criando...' : 'Criar usuário'}
              </Button>
            </form>
          </Panel>

          <Panel title="Acessos cadastrados" icon={UsersRound}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Usuário</th>
                    <th className="px-3 py-2.5 font-medium">Perfil</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Último acesso</th>
                    <th className="px-3 py-2.5 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.users.map((item) => (
                    <UserRow key={item.id} item={item} currentUserId={user?.id || ''} onTemporaryCredential={setCredential} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Perfis de usuário têm acesso às telas operacionais. Somente administradores podem gerenciar contas e realizar lançamentos administrativos.
            </p>
          </Panel>
        </div>
      </main>
    </div>
  );
}
