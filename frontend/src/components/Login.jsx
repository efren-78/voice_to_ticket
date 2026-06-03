import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react"
import { iniciarSesion, registrarUsuario } from "../api" // importamos las funciones conectadas a FastAPI

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setIsLoading(true)

    try {
      // Usamos la función centralizada de api.js
      const datos = await iniciarSesion(email, password)

      onLogin(datos)

    } catch (error) {
      console.error("Error al conectar con el servidor:", error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Función rápida para registrarse directamente usando los mismos campos del formulario
  const handleDirectRegister = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Por favor, escribe un correo y contraseña primero en los campos de arriba.")
      return
    }
    
    setIsLoading(true)
    try {
      // Extraemos la parte anterior al '@' para que sirva como Nombre en el backend
      const nombreTemporal = email.split("@gmail.com")[0]

      // Enviamos los 3 parámetros obligatorios que espera registrarUsuario(nombre, email, password)
      const datos = await registrarUsuario(nombreTemporal, email, password)
      
      alert("¡Usuario registrado con éxito! Ya puedes iniciar sesión.")
    } catch (error) {
      alert(error.message || "No se pudo registrar el usuario.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Voice<span className="text-blue-600">Ticket AI</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Sistema inteligente de tickets
            </p>
          </div>

          {/* Bienvenida */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-500 mt-1">
              Inicia sesión para acceder al dashboard
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Recordarme
                </span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de inicio */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Registro Directo */}
          <p className="text-center text-gray-600 mt-8">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={handleDirectRegister} // Al dar clic aquí, llama a la API de registro de FastAPI de inmediato
              className="text-blue-600 hover:text-blue-700 font-semibold focus:outline-none underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>

      {/* Panel derecho - Decorativo */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        {/* Contenido decorativo */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6 mx-auto">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Gestión inteligente de tickets
            </h3>
            <p className="text-slate-300 text-lg max-w-md">
              Automatiza, clasifica y resuelve tickets de soporte con inteligencia artificial avanzada
            </p>
          </div>

          {/* Características */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">Clasificación automática por categoría</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">Detección de idioma en tiempo real</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">Precisión del 96% en clasificación</span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-12 flex gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">1,248+</p>
              <p className="text-slate-400 text-sm">Tickets gestionados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">7</p>
              <p className="text-slate-400 text-sm">Idiomas soportados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2.4s</p>
              <p className="text-slate-400 text-sm">Tiempo promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login