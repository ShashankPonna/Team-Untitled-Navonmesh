import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, TrendingUp, Package, Building2,
    Bell, FlaskConical, ChevronLeft, ChevronRight, Boxes, Home
} from 'lucide-react'

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/forecasting', label: 'Forecasting', icon: TrendingUp },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/warehouses', label: 'Warehouses', icon: Building2 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/scenarios', label: 'Scenarios', icon: FlaskConical },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()

    return (
        <motion.aside
            className="sidebar"
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                background: 'rgba(10, 10, 18, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Logo */}
            <div style={{
                padding: collapsed ? '20px 16px' : '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 72,
            }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Boxes size={20} color="white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            NavonMesh
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: '#64748b',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            Inventory Intelligence
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Nav Items */}
            <nav style={{
                flex: 1,
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: collapsed ? '12px 16px' : '10px 16px',
                                borderRadius: 10,
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? '#22d3ee' : '#94a3b8',
                                background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 150ms ease',
                                position: 'relative',
                                overflow: 'hidden',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                                    e.currentTarget.style.color = '#f1f5f9'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#94a3b8'
                                }
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 3,
                                        height: 20,
                                        borderRadius: 3,
                                        background: 'linear-gradient(180deg, #06b6d4, #3b82f6)',
                                    }}
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                />
                            )}
                            <Icon size={20} />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    margin: '12px 8px 16px',
                    padding: '10px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: '0.8rem',
                    transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
                {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
            </button>
        </motion.aside>
    )
}
