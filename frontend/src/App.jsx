import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import POSPage from "./pages/POSPage"
import LoginPage from "./pages/LoginPage"

function App() {
  const isAuthenticated = !!localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <POSPage /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App