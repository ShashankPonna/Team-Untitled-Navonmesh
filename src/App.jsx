import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/ui/Sidebar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Forecasting from './pages/Forecasting'
import Inventory from './pages/Inventory'
import Warehouses from './pages/Warehouses'
import Alerts from './pages/Alerts'
import Scenarios from './pages/Scenarios'
import DataSync from './pages/DataSync'

export default function App() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Application Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/*" element={
                        <div className="app-layout">
                            <Sidebar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/forecasting" element={<Forecasting />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/warehouses" element={<Warehouses />} />
                                    <Route path="/alerts" element={<Alerts />} />
                                    <Route path="/scenarios" element={<Scenarios />} />
                                    <Route path="/data-sync" element={<DataSync />} />
                                </Routes>
                            </main>
                        </div>
                    } />
                </Route>
            </Routes>
        </AnimatePresence>
    )
}
