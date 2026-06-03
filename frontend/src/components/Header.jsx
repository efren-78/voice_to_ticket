import { useState } from "react"
import { registrarIncidente } from "../api" // Importamos la conexión con tu backend de Flask
import {
  ArrowLeft,
  Bell,
  User,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react"

function Header({ onLogout, onIncidenteCreado }) {
  const [textoReporte, setTextoReporte] = useState("")
  const [cargandoIA, setCargandoIA] = useState(false)

  const handleEnviarIncidente = async (e) => {
    e.preventDefault() // Evita que la página se recargue por completo de forma brusca
    if (!textoReporte.trim()) return

    setTextoReporte("")
    setCargandoIA(true)
    try {
      // Envía el texto (en cualquier idioma) al backend
      const respuesta = await registrarIncidente(textoReporte)

      const incidenteProcesado = respuesta.incidente || respuesta;

      // Validamos que existan las propiedades mapeadas por GPT antes de mostrarlas
      const id = incidenteProcesado.id || "?";
      const cat = incidenteProcesado.categoria || "No detectada";
      const sev = incidenteProcesado.severidad ? incidenteProcesado.severidad.toUpperCase() : "BAJA";
      
      alert(`¡Ticket #${id} generado por la IA con éxito!\n\nCategoría: ${cat}\nSeveridad: ${sev}`)
      
      
      if (onIncidenteCreado){
        onIncidenteCreado()
      }
      
    } catch (error) {
      console.error("Error al conectar con FastAPI:", error)
      alert("No se pudo procesar el incidente: " + (error.message || "Error desconocido"))
    } finally {
      setCargandoIA(false)
    }
  }

  return (
    <header className="flex justify-between items-center mb-8">

      {/* Left */}
      <div>

        <h2 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="text-slate-500 mt-1">
          Resumen general del sistema y actividad reciente
        </p>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Input de Inteligencia Artificial */}
        <form onSubmit={handleEnviarIncidente} className="relative hidden md:block w-80 lg:w-96">
          
          {/* Cambiamos la lupa por chispas de IA si está cargando */}
          {cargandoIA ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}

          <input
            type="text"
            value={textoReporte}
            onChange={(e) => setTextoReporte(e.target.value)}
            disabled={cargandoIA}
            placeholder={cargandoIA ? "GPT-4o-mini analizando..." : "Reportar incidente a la IA... (Presiona Enter)"}
            className={`w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              cargandoIA ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white text-slate-800"
            }`}
          />
        </form>

        {/* Notifications */}
        <button className="p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <Bell className="w-5 h-5 text-slate-600" />
        </button>

        {/* User */}
        <button className="p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <User className="w-5 h-5 text-slate-600" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">
            Cerrar sesión
          </span>
        </button>

      </div>

    </header>
  )
}


export default Header