import { useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"
import { Receipt, Lock, Mail } from "lucide-react"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e) {
    e.preventDefault()

    try {
      const res = await api.post("/login", { email, password })

      localStorage.setItem("token", res.data.token)
      toast.success("¡Bienvenido al sistema!")

      window.location.href = "/"
    } catch (error) {
      const mensaje = error.response?.data?.error || "Error al iniciar sesión"
      toast.error(mensaje)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-[420px] bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Receipt className="text-emerald-400" size={28} strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Rotisería UDA
          </h1>
          <p className="text-zinc-500 text-sm mt-1.5 text-center">
            Sistema de ventas y punto de caja
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600 transition-colors hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600 transition-colors hover:border-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}

export default LoginPage
