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
    setIsAuthenticated(true)
  }

  // LOGOUT
  const handleLogout = () => {
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