import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Packages from './pages/Packages'
import Settings from './pages/Settings'
import Team from './pages/Team'
import Admin from './pages/Admin'
import Rooms from './pages/Rooms'
import Products from './pages/Products'
import Materials from './pages/Materials'

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/team" element={<Team />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/products" element={<Products />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
