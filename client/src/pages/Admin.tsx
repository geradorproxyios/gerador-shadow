import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import {
  Users,
  Key,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Tab = "users" | "keys" | "stats" | "audit";
type Duration = "1" | "7" | "30";

const DURATION_LABELS: Record<Duration, string> = {
  "1": "1 Dia",
  "7": "7 Dias",
  "30": "30 Dias",
};

// ─── Header ──────────────────────────────────────────────────────────────────

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <div>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">Painel do Administrador</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Usuários", icon: <Users size={15} /> },
    { id: "keys", label: "Estoque", icon: <Key size={15} /> },
    { id: "stats", label: "Estatísticas", icon: <BarChart3 size={15} /> },
  ];
  return (
    <div className="flex border-b border-gray-100 bg-white px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`tab-underline flex items-center gap-1.5 mr-6 ${active === t.id ? "active" : ""}`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Manage Users Tab ─────────────────────────────────────────────────────────

function ManageUsersTab() {
  const utils = trpc.useUtils();
  const { data: userList = [], isLoading } = trpc.adminUsers.list.useQuery();

  const [form, setForm] = useState({ username: "", password: "", fullName: "", credits: 0 });
  const [editUser, setEditUser] = useState<{ id: number; credits: number } | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const createMutation = trpc.adminUsers.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      setForm({ username: "", password: "", fullName: "", credits: 0 });
      utils.adminUsers.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateCreditsMutation = trpc.adminUsers.updateCredits.useMutation({
    onSuccess: () => {
      toast.success("Créditos atualizados!");
      setEditUser(null);
      utils.adminUsers.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.adminUsers.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído.");
      setDeleteUserId(null);
      utils.adminUsers.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Create User Form */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-purple-600" />
          Criar Usuário
        </h3>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Usuário"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
          <Input
            placeholder="Nome completo"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
          <Input
            type="number"
            placeholder="Créditos iniciais"
            value={form.credits}
            min={0}
            onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })}
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={createMutation.isPending}
            className="btn-gradient h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Criar Usuário
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Usuários Cadastrados</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{userList.length} usuário(s)</p>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : userList.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Nenhum usuário cadastrado.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {userList.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-sm text-gray-800">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                    {u.credits} créditos
                  </span>
                  <button
                    onClick={() => setEditUser({ id: u.id, credits: u.credits })}
                    className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors"
                    title="Editar créditos"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteUserId(u.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    title="Excluir usuário"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Credits Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Créditos</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            min={0}
            value={editUser?.credits ?? 0}
            onChange={(e) => setEditUser((prev) => prev ? { ...prev, credits: parseInt(e.target.value) || 0 } : null)}
            className="h-11 rounded-xl"
          />
          <DialogFooter className="gap-2">
            <button onClick={() => setEditUser(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => editUser && updateCreditsMutation.mutate({ userId: editUser.id, credits: editUser.credits })}
              disabled={updateCreditsMutation.isPending}
              className="flex-1 btn-gradient h-10 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteUserId(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => deleteUserId && deleteMutation.mutate({ userId: deleteUserId })}
              disabled={deleteMutation.isPending}
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Keys Stock Tab ───────────────────────────────────────────────────────────

function KeysStockTab() {
  const utils = trpc.useUtils();
  const [selectedDuration, setSelectedDuration] = useState<Duration>("1");
  const [keyInput, setKeyInput] = useState("");
  const [filterDuration, setFilterDuration] = useState<Duration>("1");
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);

  const { data: keyList = [], isLoading } = trpc.adminKeys.list.useQuery({ duration: filterDuration });

  const addMutation = trpc.adminKeys.add.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.added} key(s) adicionada(s)${data.skipped > 0 ? `, ${data.skipped} ignorada(s) (duplicadas)` : ""}.`);
      setKeyInput("");
      utils.adminKeys.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.adminKeys.delete.useMutation({
    onSuccess: () => {
      toast.success("Key excluída.");
      setDeleteKeyId(null);
      utils.adminKeys.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAdd = () => {
    const lines = keyInput.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error("Cole pelo menos uma key."); return; }
    addMutation.mutate({ keyValues: lines, duration: selectedDuration });
  };

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Add Keys */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-purple-600" />
          Adicionar Keys
        </h3>

        {/* Duration selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(["1", "7", "30"] as Duration[]).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                selectedDuration === d
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300"
              }`}
            >
              {DURATION_LABELS[d]}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Cole suas keys aqui… (uma por linha)"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          rows={5}
          className="rounded-xl bg-gray-50 border-gray-200 text-sm font-mono resize-none mb-3"
        />

        <button
          onClick={handleAdd}
          disabled={addMutation.isPending}
          className="btn-gradient w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {addMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Adicionar Keys
        </button>
      </div>

      {/* Key List */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Lista de Keys</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{keyList.length} key(s)</p>
          </div>
          {/* Filter by duration */}
          <div className="flex gap-1">
            {(["1", "7", "30"] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDuration(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterDuration === d
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : keyList.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma key encontrada.</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {keyList.map((k) => (
              <div key={k.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-700 truncate">{k.keyValue}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className={k.status === "available" ? "badge-available" : "badge-used"}>
                    {k.status === "available" ? "Disponível" : "Usada"}
                  </span>
                  <button
                    onClick={() => setDeleteKeyId(k.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Key Dialog */}
      <Dialog open={deleteKeyId !== null} onOpenChange={() => setDeleteKeyId(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Deseja excluir esta key permanentemente?</p>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteKeyId(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
              Cancelar
            </button>
            <button
              onClick={() => deleteKeyId && deleteMutation.mutate({ keyId: deleteKeyId })}
              disabled={deleteMutation.isPending}
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function StatsTab() {
  const { data: stats, isLoading } = trpc.adminKeys.stats.useQuery();

  const durations: Duration[] = ["1", "7", "30"];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-purple-600" />
          Estatísticas de Keys
        </h3>

        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm py-6">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {durations.map((d) => {
              const s = stats?.[d] ?? { total: 0, available: 0, used: 0 };
              const availPct = s.total > 0 ? Math.round((s.available / s.total) * 100) : 0;
              return (
                <div key={d} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800 text-sm">{DURATION_LABELS[d]}</span>
                    <span className="text-xs text-muted-foreground font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                      Total: {s.total}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-pink-50 border border-pink-100 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-pink-600">{s.available}</p>
                      <p className="text-xs text-pink-500 font-medium">Disponíveis</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-red-500">{s.used}</p>
                      <p className="text-xs text-red-400 font-medium">Usadas</p>
                    </div>
                  </div>
                  {s.total > 0 && (
                    <div className="mt-2.5">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${availPct}%`,
                            background: "linear-gradient(90deg, #2563EB, #10B981)",
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{availPct}% disponíveis</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Audit Tab ───────────────────────────────────────────────────────────────────

function AuditTab() {
  const utils = trpc.useUtils();
  const { data: logins = [], isLoading } = trpc.adminAudit.listLogins.useQuery();
  const [selectedIps, setSelectedIps] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  const filteredLogins = selectedUser ? logins.filter((l: any) => l.username === selectedUser) : logins;
  const uniqueUsers = Array.from(new Set(logins.map((l: any) => l.username))).filter(u => u !== "admin");

  const deleteByIpMutation = trpc.adminAudit.deleteByIp.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} registro(s) deletado(s)!`);
      setSelectedIps(new Set());
      utils.adminAudit.listLogins.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: blockedIpsData } = trpc.adminAudit.getBlockedIps.useQuery();
  const blockedIps = blockedIpsData?.map((b: any) => b.ipAddress) || [];

  const blockIpMutation = trpc.adminAudit.blockIp.useMutation({
    onSuccess: () => {
      toast.success("IP bloqueado com sucesso!");
      utils.adminAudit.getBlockedIps.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const unblockIpMutation = trpc.adminAudit.unblockIp.useMutation({
    onSuccess: () => {
      toast.success("IP desbloqueado com sucesso!");
      utils.adminAudit.getBlockedIps.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteByIdMutation = trpc.adminAudit.deleteById.useMutation({
    onSuccess: () => {
      toast.success("Registro deletado!");
      utils.adminAudit.listLogins.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleIp = (ip: string) => {
    const newSet = new Set(selectedIps);
    if (newSet.has(ip)) {
      newSet.delete(ip);
    } else {
      newSet.add(ip);
    }
    setSelectedIps(newSet);
  };

  const uniqueIps = Array.from(new Set(filteredLogins.map((l: any) => l.ipAddress)));
  
  const latestLoginsByIp = uniqueIps.map(ip => {
    return filteredLogins.filter((l: any) => l.ipAddress === ip).sort((a: any, b: any) => 
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    )[0];
  }).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Registros de Login</h2>
        
        <div className="mb-4 flex gap-2">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value="">Todos os usuários</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          {selectedUser && (
            <button
              onClick={() => setSelectedUser("")}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
            >
              Limpar filtro
            </button>
          )}
        </div>
        
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : logins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro de login encontrado.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-medium text-gray-600">Usuário</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600">IP</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600">Data/Hora</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {latestLoginsByIp.map((login: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3">{login.username}</td>
                      <td className="py-3 px-3 font-mono text-xs">{login.ipAddress}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">
                        {new Date(login.loginTime).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium">
                          {login.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => deleteByIdMutation.mutate({ id: login.id })}
                          disabled={deleteByIdMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          title="Deletar registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">IPs de Acesso</h3>
                {uniqueIps.length > 0 && (
                  <button
                    onClick={() => {
                      uniqueIps.forEach(ip => {
                        deleteByIpMutation.mutate({ ipAddress: ip });
                      });
                    }}
                    className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                    title="Deletar todos os IPs"
                  >
                    Limpar IPs
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {uniqueIps.map((ip) => (
                  <div key={ip} className="flex items-center justify-between gap-2 p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-mono flex-1 truncate" style={{fontSize: '0.65rem'}}>{ip}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      {!blockedIps.includes(ip) ? (
                        <button
                          onClick={() => blockIpMutation.mutate({ ipAddress: ip })}
                          disabled={blockIpMutation.isPending}
                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                          title="Bloquear este IP"
                        >
                          Bloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => unblockIpMutation.mutate({ ipAddress: ip })}
                          disabled={unblockIpMutation.isPending}
                          className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-medium transition-colors"
                          title="Desbloquear este IP"
                        >
                          Desbloquear
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/login") });

  // Auth guard
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-purple-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onLogout={() => logoutMutation.mutate()} />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="pb-8">
        {activeTab === "users" && <ManageUsersTab />}
        {activeTab === "keys" && <KeysStockTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "audit" && <AuditTab />}

      </div>
    </div>
  );
}
