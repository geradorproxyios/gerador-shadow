import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Clock, Zap, Copy, Check, LogOut, CreditCard, Key, TrendingDown, MessageCircle, Bell } from "lucide-react";

type Tab = "generator" | "dashboard";
type Duration = "1" | "7" | "30";

const DURATION_OPTIONS: { value: Duration; label: string; credits: number }[] = [
  { value: "1", label: "1 Dia", credits: 10 },
  { value: "7", label: "7 Dias", credits: 35 },
  { value: "30", label: "30 Dias", credits: 55 },
];

function UserHeader({ credits, onLogout }: { credits: number; onLogout: () => void }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <Logo size="sm" />
        <p className="text-xs text-muted-foreground leading-none mt-1 ml-0.5">Painel do Shadow</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground leading-none">Créditos Disponíveis</p>
          <p className="text-2xl font-extrabold text-emerald-500 leading-tight">{credits.toLocaleString()}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-gray-200"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </div>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-gray-100 bg-white px-4">
      <button onClick={() => onChange("generator")} className={`tab-underline flex items-center gap-1.5 mr-6 ${active === "generator" ? "active" : ""}`}>
        <Zap size={15} />
        Gerador
      </button>
      <button onClick={() => onChange("dashboard")} className={`tab-underline flex items-center gap-1.5 ${active === "dashboard" ? "active" : ""}`}>
        <CreditCard size={15} />
        Dashboard
      </button>
    </div>
  );
}

function GeneratorTab({ onGenerated }: { onGenerated: () => void }) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>("1");
  const [quantity, setQuantity] = useState(1);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const selectedOption = DURATION_OPTIONS.find((o) => o.value === selectedDuration)!;
  const totalCost = selectedOption.credits * quantity;

  const generateMutation = trpc.generator.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedKeys(data.keys);
      toast.success(`${data.keys.length} key(s) gerada(s)! ${data.creditsUsed} créditos descontados.`);
      onGenerated();
    },
    onError: (e) => toast.error(e.message),
  });

  const copyKey = async (key: string, index: number) => {
    await navigator.clipboard.writeText(key);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(generatedKeys.join("\n"));
    setCopiedAll(true);
    toast.success("Todas as keys copiadas!");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Update Channel Button */}
      <a
        href="https://whatsapp.com/channel/0029VbCjOYq1SWstb7YOtG11"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-12 rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)" }}
      >
        <Bell size={18} />
        Canal de Atualização
      </a>

      {/* Duration Selection */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base">Duração das Keys</h3>
            <p className="text-xs text-muted-foreground">Escolha o tempo de validade</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedDuration(opt.value)}
              className={`duration-card text-left ${selectedDuration === opt.value ? "selected" : ""}`}
            >
              <p className="font-bold text-gray-800 text-base">{opt.label}</p>
              <p className={`text-sm font-semibold mt-0.5 ${selectedDuration === opt.value ? "text-blue-600" : "text-muted-foreground"}`}>
                {opt.credits} créditos
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Zap size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base">Quantidade</h3>
            <p className="text-xs text-muted-foreground">Gere até 50 keys por vez</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="qty-btn">−</button>
          <div className="flex-1 h-14 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{quantity}</span>
          </div>
          <button onClick={() => setQuantity((q) => Math.min(50, q + 1))} className="qty-btn">+</button>
        </div>
        <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
          <span className="text-sm text-muted-foreground">Custo total</span>
          <span className="font-bold text-gray-800">{totalCost} créditos</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => generateMutation.mutate({ duration: selectedDuration, quantity })}
        disabled={generateMutation.isPending}
        className="btn-gradient w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)" }}
      >
        {generateMutation.isPending ? (
          <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Gerando...</>
        ) : (
          <><Key size={18} />Gerar {quantity} Key{quantity > 1 ? "s" : ""}</>
        )}
      </button>

      {/* Contact Admin Button */}
      <a
        href="https://wa.me/5532998380328?text=Olá!%20Gostaria%20de%20falar%20sobre%20minha%20conta%20no%20Gerador"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)" }}
      >
        <MessageCircle size={18} />
        Falar com Administrador
      </a>

      {/* Generated Keys */}
      {generatedKeys.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Keys Geradas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{generatedKeys.length} key(s)</p>
            </div>
            <button
              onClick={copyAll}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copiedAll ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {copiedAll ? <Check size={13} /> : <Copy size={13} />}
              {copiedAll ? "Copiado!" : "Copiar tudo"}
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {generatedKeys.map((key, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-xs font-mono text-gray-700 truncate flex-1">{key}</span>
                <button
                  onClick={() => copyKey(key, i)}
                  className={`ml-3 p-1.5 rounded-lg transition-all flex-shrink-0 ${copiedIndex === i ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardTab() {
  const { data: dash, isLoading } = trpc.generator.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const cards = [
    { label: "Créditos Disponíveis", value: (dash?.credits ?? 0).toLocaleString(), icon: <CreditCard size={22} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Keys Geradas", value: (dash?.keysGenerated ?? 0).toLocaleString(), icon: <Key size={22} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Créditos Gastos", value: (dash?.creditsSpent ?? 0).toLocaleString(), icon: <TrendingDown size={22} />, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`bg-white rounded-2xl p-5 shadow-card border ${card.border} flex items-center gap-4`}>
          <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} flex-shrink-0`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color} leading-tight`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");
  const [, navigate] = useLocation();
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery();
  const dashQuery = trpc.generator.dashboard.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/login") });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "user") {
    navigate("/login");
    return null;
  }

  const credits = dashQuery.data?.credits ?? (user as any).credits ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <UserHeader credits={credits} onLogout={() => logoutMutation.mutate()} />
      <TabBar active={activeTab} onChange={setActiveTab} />
      <div className="pb-8">
        {activeTab === "generator" && <GeneratorTab onGenerated={() => { dashQuery.refetch(); refetch(); }} />}
        {activeTab === "dashboard" && <DashboardTab />}
      </div>
    </div>
  );
}
