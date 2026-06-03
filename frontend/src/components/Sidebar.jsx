
import { 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  BarChart3, 
  Mic,
  LogOut  
} from "lucide-react"

function Sidebar({ onLogout, vistaActiva, onChangeVista }) { 
  // Función auxiliar para pintar el botón activo o inactivo
  const getBtnClass = (idVista) => {
    const baseClass = "flex items-center gap-3 w-full p-4 rounded-2xl transition-all duration-300 font-medium "
    return vistaActiva === idVista 
      ? `${baseClass} bg-blue-600 text-white shadow-md` 
      : `${baseClass} text-slate-400 hover:bg-slate-800 hover:text-white`
  }

  return (
    <aside className="w-72 bg-slate-900 min-h-screen text-white p-6 flex flex-col select-none">
      <div className="mb-12">
        <h1 className="text-3xl font-bold">
          Voice<span className="text-blue-500">Ticket AI</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Sistema inteligente de tickets
        </p>
      </div>

      <nav className="space-y-3 flex-1">
        {/* Menú principal */}
        {/* Cada botón ahora tiene su onClick y actualiza el estado en el Dashboard */}
        <button 
          onClick={() => onChangeVista("dashboard")} 
          className={getBtnClass("dashboard")}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>

        <button 
          onClick={() => onChangeVista("nuevo-reporte")} 
          className={getBtnClass("nuevo-reporte")}
        >
          <Mic className="w-5 h-5" />
          Nuevo Reporte
        </button>

        <button 
          onClick={() => onChangeVista("tickets")} 
          className={getBtnClass("tickets")}
        >
          <Ticket className="w-5 h-5" />
          Tickets
        </button>

        <button 
          onClick={() => onChangeVista("analytics")} 
          className={getBtnClass("analytics")}
        >
          <BarChart3 className="w-5 h-5" />
          Analytics
        </button>

        <button 
          onClick={() => onChangeVista("configuracion")} 
          className={getBtnClass("configuracion")}
        >
          <Settings className="w-5 h-5" />
          Configuración
        </button>
      </nav>

      {/* Botón de cerrar sesión al final */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 hover:bg-red-500/20 transition-all duration-300 w-full p-4 rounded-2xl text-red-400 hover:text-red-300 mt-4 border-t border-slate-800 pt-4"
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </button>
    </aside>
  )
}

export default Sidebar