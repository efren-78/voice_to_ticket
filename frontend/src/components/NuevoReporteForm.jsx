// src/components/NuevoReporteForm.jsx
import { useState } from "react"
//import { registrarIncidente } from "../api" // Tu conexión fetch limpia
import { registrarIncidente, registrarIncidentePorVoz } from "../api";
import { Sparkles, Send, Mic, FileText } from "lucide-react"

function NuevoReporteForm({ onIncidenteCreado }) {
  const [modalidad, setModalidad] = useState("texto") 
  const [textoReporte, setTextoReporte] = useState("")
  const [cargando, setCargando] = useState(false)

  const handleSubmitTexto = async (e) => {
    e.preventDefault()
    if (!textoReporte.trim() || cargando) return

    const textoAEnviar = textoReporte;
    setTextoReporte("")
    setCargando(true)

    try {
      // Llamamos a la API configurada con FastAPI
      const respuesta = await registrarIncidente(textoAEnviar)
      
      // Validamos si viene encapsulado en .incidente o directo
      const incidenteProcesado = respuesta.incidente || respuesta;
      
      // 2. Extraemos los campos exactos del IncidenteResponse de Pydantic
      const id = incidenteProcesado.id || "?";
      const cat = incidenteProcesado.categoria || "No detectada";
      const sev = incidenteProcesado.severidad ? incidenteProcesado.severidad.toUpperCase() : "BAJA";

      alert(`¡Ticket #${id} generado por la IA con éxito!\n\nCategoría: ${cat}\nSeveridad: ${sev}`)
      
      // Ejecutamos el refresco de datos en el Dashboard
      if (onIncidenteCreado) {
        onIncidenteCreado()
      }
    } catch (error) {
      console.error("Error en módulo de reporte:", error)
      alert("No se pudo procesar el incidente: " + error.message)
    } finally {
      setCargando(false)
    }
  }

  const [grabando, setGrabando] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [estadoAudio, setEstadoAudio] = useState('');

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const pedazosAudio = [];

      recorder.ondataavailable = (e) => pedazosAudio.push(e.data);
      
      recorder.onstop = async () => {
        const blobAudio = new Blob(pedazosAudio, { type: 'audio/wav' });
        setEstadoAudio('Transcribiendo audio grabado...');
        setCargando(true);
        try {
          const respuesta = await registrarIncidentePorVoz(blobAudio);
          const incidenteVoz = respuesta.incidente || respuesta;
          const ticketId = incidenteVoz.id || "?";
          const textoTranscribido = incidenteVoz.texto_original || "Audio procesado";

          alert(`¡Audio Transcrito con Éxito!\nTicket #${ticketId}\nTexto: "${textoTranscribido}"`);

          if (onIncidenteCreado) onIncidenteCreado();
        } catch (error) {
          alert("Error en procesamiento de voz: " + error.message);
        } finally {
          setCargando(false);
          setEstadoAudio('');
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setGrabando(true);
    } catch (err) {
      alert("No se otorgaron permisos de micrófono: " + err.message);
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      // Apaga el micrófono físicamente
      mediaRecorder.stream.getTracks().forEach(track => track.stop()); 
      setGrabando(false);
    }
  };

  const [archivoAudio, setArchivoAudio] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setArchivoAudio(e.target.files[0]);
    }
  };

  const handleAudioFileUpload = async (e) => {
    e.preventDefault();
    if (!archivoAudio) {
      alert("Selecciona un archivo de audio primero.");
      return;
    }

    setEstadoAudio('Procesando archivo de audio...');
    setCargando(true);
    try {
      const respuesta = await registrarIncidentePorVoz(archivoAudio);
      const incidenteVoz = respuesta.incidente || respuesta;
      const ticketId = incidenteVoz.id || "?";
      const textoTranscribido = incidenteVoz.texto_original || "Audio procesado";

      alert(`¡Audio procesado con éxito!\nTicket #${ticketId}\nTexto: "${textoTranscribido}"`);
      setArchivoAudio(null);
      if (onIncidenteCreado) onIncidenteCreado();
    } catch (error) {
      console.error("Error en procesamiento de archivo de audio:", error);
      alert("No se pudo procesar el archivo de audio: " + (error.message || "Error desconocido"));
    } finally {
      setCargando(false);
      setEstadoAudio('');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Reporte con IA</h3>
          <p className="text-sm text-gray-400">Selecciona el método de entrada para procesar el incidente.</p>
        </div>
      </div>

      {/* Selectores de sub-pestaña */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 mb-6">
        <button
          type="button"
          onClick={() => setModalidad("audio")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            modalidad === "audio"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mic className="w-4 h-4" />
          Reporte por Audio
        </button>

        <button
          type="button"
          onClick={() => setModalidad("texto")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            modalidad === "texto"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Reporte por Texto
        </button>
      </div>

      {/* Renderizado de bloques */}
      {modalidad === "audio" ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-4">
          <button
            type="button"
            onClick={grabando ? detenerGrabacion : iniciarGrabacion}
            disabled={cargando}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              grabando ? "bg-red-500 animate-pulse text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-700">
              {grabando ? "Grabando reporte... Presiona el botón para detener" : "Dictar Reporte por Voz"}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {estadoAudio || (cargando ? "Enviando audio al pipeline de Google Speech & GPT..." : "Usará el idioma configurado en los ajustes de tu sistema.")}
            </p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <label className="block text-sm font-semibold text-slate-600">O también puedes subir un archivo de audio</label>
            <input
              type="file"
              accept="audio/*,audio/mp4,audio/x-m4a"
              onChange={handleFileChange}
              disabled={cargando}
              className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white"
            />
            {archivoAudio && (
              <p className="text-xs text-slate-500">Archivo seleccionado: {archivoAudio.name} ({(archivoAudio.size / 1024).toFixed(1)} KB)</p>
            )}
            <button
              type="button"
              onClick={handleAudioFileUpload}
              disabled={cargando || !archivoAudio}
              className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-100 transition"
            >
              {cargando ? "Procesando audio..." : "Enviar archivo de audio"}
            </button>
            {estadoAudio && (
              <p className="text-sm text-blue-600">{estadoAudio}</p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitTexto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Descripción del Problema
            </label>
            <textarea
              value={textoReporte}
              onChange={(e) => setTextoReporte(e.target.value)}
              disabled={cargando}
              rows="5"
              placeholder="Ej: Reportan que el switch principal del laboratorio de cómputo sufrió un corto debido a la tormenta eléctrica. No hay red cableada en el edificio..."
              className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 text-sm bg-slate-50/50 transition-all placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !textoReporte.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {cargando ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {cargando ? "Analizando con GPT-4o-mini..." : "Enviar Reporte a la IA"}
          </button>
        </form>
      )}
    </div>
  )
}

export default NuevoReporteForm