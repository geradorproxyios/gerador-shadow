import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/painel");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Usuário ou senha inválidos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #EFF6FF 0%, #ECFDF5 100%)" }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-8 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <Logo size="lg" />
          <p className="text-muted-foreground text-sm mt-1">Acesse sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User size={18} />
            </span>
            <Input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
      className="pl-10 h-12 rounded-xl border-blue-200 bg-blue-50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoComplete="username"
              disabled={loginMutation.isPending}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock size={18} />
            </span>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
      className="pl-10 pr-10 h-12 rounded-xl border-blue-200 bg-blue-50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-gradient w-full h-12 rounded-xl font-semibold text-base mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loginMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>


      </div>
    </div>
  );
}
