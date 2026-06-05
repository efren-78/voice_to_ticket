// pages/Dashboard.jsx
import Sidebar from "../components/Sidebar.jsx"
import Header from "../components/Header.jsx"
import StatsCard from "../components/StatsCard.jsx"
import NuevoReporteForm from "../components/NuevoReporteForm.jsx"
import ConfiguracionForm from "../components/ConfiguracionForm.jsx";
import { useEffect, useState } from 'react';
//import { obtenerIncidentes } from '../api'; // Ajusta la ruta de importación
import { obtenerIncidentes, obtenerEstadisticas, actualizarEstadoIncidente } from '../api.js';


function Dashboard({ onLogout }) { 
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, resueltos: 0, esta_semana: 0, porcentaje_semana: 0 });
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("dashboard");
  const [filtros, setFiltros] = useState({ categoria: "", estado: "", severidad: "" });

  const categoriasDisponibles = ["Técnico", "Seguridad", "Operacional", "RR.HH.", "Infraestructura", "Otro"];
  const estadosDisponibles = ["Abierto", "En Progreso", "Resuelto", "Cerrado"];
  const severidadesDisponibles = ["baja", "media", "alta", "critica"];

  // Aplica filtros seleccionados a la lista de tickets.
  const aplicarFiltros = (lista) => {
    return lista.filter((ticket) => {
      const coincideCategoria = filtros.categoria ? ticket.categoria === filtros.categoria : true;
      const coincideEstado = filtros.estado ? ticket.estado === filtros.estado : true;
      const coincideSeveridad = filtros.severidad ? ticket.severidad === filtros.severidad : true;
      return coincideCategoria && coincideEstado && coincideSeveridad;
    });
  };

  const ticketsFiltrados = aplicarFiltros(tickets);

  // Cuenta los incidentes agrupados por el campo solicitado.
  const contarPor = (campo) => {
    return tickets.reduce((acum, ticket) => {
      const valor = ticket[campo] || "Desconocido";
      acum[valor] = (acum[valor] || 0) + 1;
      return acum;
    }, {});
  };

  const categoriaCounts = contarPor("categoria");
  const estadoCounts = contarPor("estado");
  const severidadCounts = contarPor("severidad");

  /*const getStatusColor = (status) => {
    switch(status) {
      case "Resuelto": return "bg-green-100 text-green-700"
      case "En Proceso": return "bg-yellow-100 text-yellow-700"
      case "Pendiente": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }*/

    // Carga tickets y estadísticas desde el backend cuando se monta el componente.
    const traerDatosReales = async () => {
      try {
        setCargando(true);
        
        // Hacemos ambas peticiones en paralelo para que sea súper rápido
        const [datosBackend, datosStats] = await Promise.all([
          obtenerIncidentes(),
          obtenerEstadisticas()
        ]);
        
        // Volteamos la lista para que el reporte más reciente aparezca al principio de la tabla
        if (Array.isArray(datosBackend)) {
          setTickets([...datosBackend].reverse()); 
        }else {
          setTickets([]);
        }

        if (datosStats){
          setStats(datosStats);
        } 
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
        setTickets([]); // Por si ocurre un error, asegura que no se quede colgado
      } finally {
        setCargando(false);
      }
    };

    useEffect(() => {
      traerDatosReales();
    }, []); 

    // Devuelve clases de estilo según la severidad del incidente.
    const getSeverityColor = (severity) => {
      switch(severity?.toLowerCase()) {
        case "critica": return "bg-red-100 text-red-700 font-semibold"
        case "alta": return "bg-orange-100 text-orange-700"
        case "media": return "bg-yellow-100 text-yellow-700"
        case "baja": return "bg-green-100 text-green-700"
        default: return "bg-gray-100 text-gray-700"
      }
    }

    // Devuelve clases de estilo según el estado del incidente.
    const getStatusColor = (estado) => {
      switch(estado?.toLowerCase()) {
        case "resuelto": return "bg-green-100 text-green-700"
        case "en progreso": return "bg-yellow-100 text-yellow-700"
        case "cerrado": return "bg-slate-100 text-slate-700"
        default: return "bg-blue-100 text-blue-700"
      }
    }

    // Marca un incidente como resuelto y recarga la lista.
    const marcarComoResuelto = async (ticketId) => {
      try {
        await actualizarEstadoIncidente(ticketId, "Resuelto")
        traerDatosReales()
      } catch (error) {
        console.error("No se pudo actualizar el estado del incidente:", error)
        alert("No se pudo marcar como resuelto. Intenta de nuevo.")
      }
    }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Componente de navegación lateral */}
      <Sidebar onLogout={onLogout} vistaActiva={vista} onChangeVista={setVista} />

      <main className="flex-1 p-8">
        {/* Barra superior con botón de cerrar sesión */}
        <Header onLogout={onLogout} onIncidenteCreado={traerDatosReales} />  

        {/*Renderizado Condicional de Contenido según la pestaña seleccionada */}
        {vista === "dashboard" ? (
          <>
            {/* Tarjetas de Estadísticas superiores */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <StatsCard 
                title="Total de Tickets IA" 
                value={stats.total.toString() || "0"} 
                trendValue={`${stats.esta_semana || 0} creados esta semana`}
              />
              <StatsCard 
                title="Incidentes Resueltos" 
                value={stats.resueltos.toString() || "0"}
                trendValue={`Representan el ${stats.porcentaje_semana || 0}% del total`} 
              />
              <StatsCard 
                title="Tickets Abiertos" 
                value={tickets.filter(t => t.estado?.toLowerCase() !== "resuelto").length.toString() || "0"} 
                trendValue="Lista en la tabla de abajo" 
              />
            </div>
          
              {/* Renderizado Condicional: Cargando -> Vacío -> Tabla con datos */}
              {cargando ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p>Conectando con el servidor de FastAPI...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <p className="font-medium text-base">No hay incidentes registrados en el sistema</p>
                  <p className="text-xs text-gray-400 mt-1">Los reportes que procese la IA aparecerán listados aquí automáticamente.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">ID</th>
                        <th className="py-3 px-4 font-semibold">Descripción Original</th>
                        <th className="py-3 px-4 font-semibold">Idioma</th>
                        <th className="py-3 px-4 font-semibold">Categoría</th>
                        <th className="py-3 px-4 font-semibold">Severidad</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                        <th className="py-3 px-4 font-semibold">Resumen de la IA</th>
                        <th className="py-3 px-4 font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="py-4 px-4 font-mono font-bold text-blue-600">#{ticket.id}</td>
                          <td className="py-4 px-4 max-w-xs truncate" title={ticket.texto_original}>{ticket.texto_original}</td>
                          <td className="py-4 px-4">
                            <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                              {ticket.idioma_nombre || "Desconocido"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-700">{ticket.categoria}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getSeverityColor(ticket.severidad)}`}>
                              {ticket.severidad ? ticket.severidad.toUpperCase() : "BAJA"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusColor(ticket.estado)}`}>
                              {ticket.estado || "Abierto"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-500 italic max-w-xs truncate" title={ticket.resumen}>"{ticket.resumen}"</td>
                          <td className="py-4 px-4">
                            {ticket.estado !== "Resuelto" && (
                              <button
                                onClick={() => marcarComoResuelto(ticket.id)}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Marcar resuelto
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </>
        ) : vista === "tickets" ? (
          <>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lista de Tickets</h2>
                  <p className="text-sm text-gray-500">Filtra, revisa y resuelve los incidentes procesados por IA.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, categoria: e.target.value }))}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categoriasDisponibles.map((categoria) => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm"
                >
                  <option value="">Todos los estados</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
                <select
                  value={filtros.severidad}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, severidad: e.target.value }))}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm"
                >
                  <option value="">Todas las severidades</option>
                  {severidadesDisponibles.map((sev) => (
                    <option key={sev} value={sev}>{sev}</option>
                  ))}
                </select>
              </div>
            </div>

            {cargando ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p>Cargando los tickets...</p>
              </div>
            ) : ticketsFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                <p className="font-medium text-base">No hay tickets que coincidan con los filtros.</p>
                <p className="text-xs text-gray-400 mt-1">Ajusta los filtros o crea un nuevo reporte.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">ID</th>
                      <th className="py-3 px-4 font-semibold">Descripción</th>
                      <th className="py-3 px-4 font-semibold">Categoría</th>
                      <th className="py-3 px-4 font-semibold">Severidad</th>
                      <th className="py-3 px-4 font-semibold">Estado</th>
                      <th className="py-3 px-4 font-semibold">Idioma</th>
                      <th className="py-3 px-4 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                    {ticketsFiltrados.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">#{ticket.id}</td>
                        <td className="py-4 px-4 max-w-xs truncate" title={ticket.texto_original}>{ticket.texto_original}</td>
                        <td className="py-4 px-4 font-medium text-gray-700">{ticket.categoria}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getSeverityColor(ticket.severidad)}`}>
                            {ticket.severidad?.toUpperCase() || "BAJA"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusColor(ticket.estado)}`}>
                            {ticket.estado || "Abierto"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                            {ticket.idioma_nombre || "Desconocido"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {ticket.estado !== "Resuelto" ? (
                            <button
                              onClick={() => marcarComoResuelto(ticket.id)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Marcar resuelto
                            </button>
                          ) : (
                            <span className="text-sm text-slate-400">Sin acción</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : vista === "analytics" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total de tickets"
                value={stats.total.toString() || "0"}
                trendValue={`${stats.esta_semana || 0} nuevos esta semana`}
              />
              <StatsCard
                title="Tickets resueltos"
                value={stats.resueltos.toString() || "0"}
                trendValue={`${stats.porcentaje_semana || 0}% de todos`}
              />
              <StatsCard
                title="Abiertos" 
                value={tickets.filter((t) => t.estado?.toLowerCase() !== "resuelto").length.toString() || "0"}
                trendValue="Pendientes de atención"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
                <div className="space-y-3">
                  {Object.entries(categoriaCounts).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm text-gray-700">
                      <span>{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados</h3>
                <div className="space-y-3">
                  {Object.entries(estadoCounts).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm text-gray-700">
                      <span>{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Severidades</h3>
                <div className="space-y-3">
                  {Object.entries(severidadCounts).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm text-gray-700">
                      <span>{key?.toUpperCase()}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : vista === "nuevo-reporte" ? (
          // Al presionar el botón del formulario, este mandará a llamar a traerDatosReales 
          // para que impacte de inmediato en incidents.json y se refleje al regresar al Dashboard
          <NuevoReporteForm onIncidenteCreado={traerDatosReales} />
        ) : vista === "configuracion" ? (
          <ConfiguracionForm />
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            <h2 className="text-2xl font-bold text-gray-800 capitalize mb-2">{vista.replace("-", " ")}</h2>
            <p className="text-sm text-gray-400">Sección en desarrollo.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard