import { useState, useEffect } from "react";
import { obtenerConfiguracion, actualizarConfiguracion } from "../api";
import { Settings, Save } from "lucide-react";

function ConfiguracionForm() {
  const [idiomaActual, setIdiomaActual] = useState("es");
  const [nombreIdioma, setNombreIdioma] = useState("Español");
  const [cargando, setCargando] = useState(false);

  // Lista de idiomas soportados por tu config.py en el backend
  const idiomasSoportados = [
    { code: "es", name: "Español" },
    { code: "en", name: "Inglés" },
    { code: "fr", name: "Francés" },
    { code: "de", name: "Alemán" },
    { code: "pt", name: "Portugués" },
    { code: "it", name: "Italiano" },
    { code: "zh", name: "Chino" },
    { code: "ja", name: "Japonés" }
  ];

  useEffect(() => {
    async function cargarConfig() {
      try {
        const res = await obtenerConfiguracion();
        setIdiomaActual(res.idioma_iso);
        setNombreIdioma(res.idioma_nombre);
      } catch (err) {
        console.error("No se pudo cargar la configuración inicial", err);
      }
    }
    cargarConfig();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await actualizarConfiguracion(idiomaActual);
      setNombreIdioma(res.idioma_nombre);
      alert(`¡Idioma del sistema actualizado a ${res.idioma_nombre}!`);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Ajustes del Sistema</h3>
          <p className="text-sm text-gray-400">Idioma activo actual: <span className="font-semibold text-blue-600">{nombreIdioma}</span></p>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Idioma para Dictado por Voz
          </label>
          <select
            value={idiomaActual}
            onChange={(e) => setIdiomaActual(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {idiomasSoportados.map((id) => (
              <option key={id.code} value={id.code}>{id.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <Save className="w-4 h-4" />
          {cargando ? "Guardando..." : "Guardar Configuración"}
        </button>
      </form>
    </div>
  );
}

export default ConfiguracionForm;