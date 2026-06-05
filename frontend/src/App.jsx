import { useState } from "react"
import Login from "./components/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false
    return Boolean(window.localStorage.getItem("token"))
  })

  // LOGIN
  const handleLogin = () => {
    // Cambia el estado de autenticación cuando el usuario inicia sesión
    setIsAuthenticated(true)
  }

  // LOGOUT
  const handleLogout = () => {
    // Elimina el token local y regresa al flujo de login
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token")
    }
    setIsAuthenticated(false)
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  )
}

export default App