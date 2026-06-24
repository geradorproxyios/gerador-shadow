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
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-600" />
          Criar Usuário
        </h3>
        <div className="flex flex-col gap-3">
          <Input placeholder="Usuário" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="h-11 rounded-xl bg-gray-50 border-gray-200" />
          <Input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11 rounded-xl bg-gray-50 border-gray-200" />
          <Input placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-11 rounded-xl bg-gray-50 border-gray-200" />
          <Input type="number" placeholder="Créditos iniciais" value={form.credits} min={0} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })} className="h-11 rounded-xl bg-gray-50 border-gray-200" />
          <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-gradient h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {createMutation.isPending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            Criar Usuário
          </button>
        </div>
      </div>

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
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    {u.credits} créditos
                  </span>
                  <button onClick={() => setEditUser({ id: u.id, credits: u.credits })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Editar créditos">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteUserId(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Excluir usuário">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Editar Créditos</DialogTitle></DialogHeader>
          <Input type="number" min={0} value={editUser?.credits ?? 0} onChange={(e) => setEditUser((prev) => prev ? { ...prev, credits: parseInt(e.target.value) || 0 } : null)} className="h-11 rounded-xl" />
          <DialogFooter className="gap-2">
            <button onClick={() => setEditUser(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={() => editUser && updateCreditsMutation.mutate({ userId: editUser.id, credits: editUser.credits })} disabled={updateCreditsMutation.isPending} className="flex-1 btn-gradient h-10 rounded-xl text-sm font-semibold disabled:opacity-60">Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Excluir Usuário</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este usuário?</p>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteUserId(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={() => deleteUserId && deleteMutation.mutate({ userId: deleteUserId })} disabled={deleteMutation.isPending} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">Excluir</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KeysStockTab() {
  const utils = trpc.useUtils();
  const [selectedDuration, setSelectedDuration] = useState<Duration>("1");
  const [keyInput, setKeyInput] = useState("");
  const [filterDuration, setFilterDuration] = useState<Duration>("1");
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);
  const { data: keyList = [], isLoading } = trpc.adminKeys.list.useQuery({ duration: filterDuration });

  const addMutation = trpc.adminKeys.add.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.added} key(s) adicionada(s)${data.skipped > 0 ? `, ${data.skipped} ignorada(s)` : ""}.`);
      setKeyInput("");
      utils.adminKeys.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.adminKeys.delete.useMutation({
    onSuccess: () => { toast.success("Key excluída."); setDeleteKeyId(null); utils.adminKeys.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleAdd = () => {
    const lines = keyInput.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error("Cole pelo menos uma key."); return; }
    addMutation.mutate({ keyValues: lines, duration: selectedDuration });
  };

  return (
    <div className="p-4 flex flex-col gap-5">
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-600" />
          Adicionar Keys
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(["1", "7", "30"] as Duration[]).map((d) => (
            <button key={d} onClick={() => setSelectedDuration(d)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${selectedDuration === d ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300"}`}>
              {DURATION_LABELS[d]}
            </button>
          ))}
        </div>
        <Textarea placeholder="Cole suas keys aqui… (uma por linha)" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} rows={5} className="rounded-xl bg-gray-50 border-gray-200 text-sm font-mono resize-none mb-3" />
        <button onClick={handleAdd} disabled={addMutation.isPending} className="btn-gradient w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {addMutation.isPending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
          Adicionar Keys
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Lista de Keys</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{keyList.length} key(s)</p>
          </div>
          <div className="flex gap-1">
            {(["1", "7", "30"] as Duration[]).map((d) => (
              <button key={d} onClick={() => setFilterDuration(d)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterDuration === d ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
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
                <p className="text-xs font-mono text-gray-700 truncate flex-1">{k.keyValue}</p>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className={k.status === "available" ? "badge-available" : "badge-used"}>{k.status === "available" ? "Disponível" : "Usada"}</span>
                  <button onClick={() => setDeleteKeyId(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteKeyId !== null} onOpenChange={() => setDeleteKeyId(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Excluir Key</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Deseja excluir esta key permanentemente?</p>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteKeyId(null)} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Cancelar</button>
            <button onClick={() => deleteKeyId && deleteMutation.mutate({ keyId: deleteKeyId })} disabled={deleteMutation.isPending} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">Excluir</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsTab() {
  const { data: stats, isLoading } = trpc.adminKeys.stats.useQuery();
  const durations: Duration[] = ["1", "7", "30"];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
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
                    <span className="text-xs text-muted-foreground font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-200">Total: {s.total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-600">{s.available}</p>
                      <p className="text-xs text-emerald-500 font-medium">Disponíveis</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-red-500">{s.used}</p>
                      <p className="text-xs text-red-400 font-medium">Usadas</p>
                    </div>
                  </div>
                  {s.total > 0 && (
                    <div className="mt-2.5">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${availPct}%`, background: "linear-gradient(90deg, #2563EB, #10B981)" }} />
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
      </div>
    </div>
  );
}
