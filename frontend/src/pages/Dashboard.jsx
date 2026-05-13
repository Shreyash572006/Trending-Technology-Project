import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Activity, DollarSign, Package, Users, TrendingUp,
  Bell, Search, LogOut, Menu, X, BarChart2, RotateCcw,
  Lightbulb, Upload, ChevronRight, Lock
} from 'lucide-react'
import { useData } from '../context/DataContext'

// Module imports
import AnalyticsHub from '../modules/AnalyticsHub'
import SalesTrends from '../modules/SalesTrends'
import MarketingFinance from '../modules/MarketingFinance'
import ReturnsAnalysis from '../modules/ReturnsAnalysis'
import DataUpload from '../modules/DataUpload'
import FloatingChatbot from '../components/FloatingChatbot'
const NAV = [
  { id: 'upload',    label: 'Data Upload',        icon: <Upload size={18} />,    module: <DataUpload /> },
  { id: 'analytics', label: 'Analytics Hub',       icon: <Activity size={18} />,  module: <AnalyticsHub /> },
  { id: 'sales',     label: 'Sales Trends',         icon: <BarChart2 size={18} />, module: <SalesTrends /> },
  { id: 'marketing', label: 'Marketing & Finance',  icon: <TrendingUp size={18} />,module: <MarketingFinance /> },
  { id: 'returns',   label: 'Returns Analysis',     icon: <RotateCcw size={18} />, module: <ReturnsAnalysis /> },
]


function Loader() {
  const [step, setStep] = useState(0)
  const steps = [
    'Reading business data...',
    'Detecting column schema...',
    'Cleaning & normalizing...',
    'Classifying into modules...',
    'Generating AI insights...',
    'Dashboard ready ✓',
  ]

  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s < steps.length - 1 ? s + 1 : s)), 400)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#030712]">
      <motion.div
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 mb-8"
      />
      <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 mb-3">
        Vendrixa IQ
      </h1>
      <div className="space-y-2 w-72">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-2 text-sm ${i < step ? 'text-green-400' : i === step ? 'text-white' : 'text-white/20'}`}>
            <span>{i < step ? '✓' : i === step ? '⟳' : '○'}</span> {s}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { appData } = useData()
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState(appData ? 'analytics' : 'upload')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifsOpen, setNotifsOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <Loader />

  const current = NAV.find(n => n.id === activeModule)
  const aiAlerts = appData?.aiAlerts || []
  const criticalAlerts = aiAlerts.filter(a => a.priority === 'critical').length

  return (
    <div className="flex bg-[#030712] min-h-screen text-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="w-64 shrink-0 bg-[#080d1a] border-r border-white/5 flex flex-col z-30"
            style={{ height: '100vh', position: 'sticky', top: 0 }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-black text-white shadow-lg shadow-violet-500/30">V</div>
                <div>
                  <div className="font-black text-base leading-tight">VENDRIXA</div>
                  <div className="text-[10px] text-violet-400 font-bold tracking-widest">IQ PLATFORM</div>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white/70 transition-colors lg:hidden">
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold px-3 mb-3">AI Modules</p>
              {NAV.map((item) => {
                const disabled = !appData && item.id !== 'upload'
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => { if (!disabled) setActiveModule(item.id) }}
                    whileHover={!disabled ? { x: 4 } : {}}
                    whileTap={!disabled ? { scale: 0.98 } : {}}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                      ${activeModule === item.id
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                        : disabled ? 'text-white/20 cursor-not-allowed' : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                      }`}
                  >
                    <span className={activeModule === item.id ? 'text-violet-400' : 'text-white/30'}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {disabled && <Lock size={12} className="text-white/20" />}
                    {activeModule === item.id && (
                      <motion.span layoutId="active-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </motion.button>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/5 space-y-1">
              <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium">
                <LogOut size={16} /> Sign Out
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => setSidebarOpen(o => !o)} className="text-white/40 hover:text-white transition-colors">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-white font-semibold">{current?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-white/25" size={15} />
              <input
                type="text"
                placeholder="Search modules..."
                className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/8 rounded-full text-white placeholder-white/25 outline-none w-52 focus:border-violet-500/40 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifsOpen(o => !o)}
                className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/8">
                <Bell size={17} />
                {criticalAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                    {criticalAlerts}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <span className="font-bold text-sm">AI Alerts</span>
                      <button onClick={() => setNotifsOpen(false)} className="text-white/30 hover:text-white/70"><X size={14} /></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {aiAlerts.map(alert => {
                        const col = alert.priority === 'critical' ? '#ef4444' : alert.priority === 'warning' ? '#f59e0b' : '#3b82f6'
                        return (
                          <div key={alert.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => { setActiveModule('analytics'); setNotifsOpen(false) }}>
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{alert.icon}</span>
                              <div className="flex-1">
                                <div className="text-sm text-white font-medium leading-tight">{alert.message}</div>
                                <div className="text-[10px] text-white/30 mt-0.5">{alert.time}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 border-2 border-violet-500/30 flex items-center justify-center font-bold text-xs">S</div>
          </div>
        </header>

        {/* Module Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {current?.module}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Module Switcher (mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080d1a] border-t border-white/5 px-2 py-2 flex overflow-x-auto gap-1">
          {NAV.map(item => {
            const disabled = !appData && item.id !== 'upload'
            return (
              <button key={item.id} onClick={() => { if (!disabled) setActiveModule(item.id) }}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] transition-all ${activeModule === item.id ? 'text-violet-400 bg-violet-500/15' : disabled ? 'text-white/20 cursor-not-allowed opacity-50' : 'text-white/40'}`}>
                {item.icon}
                <span>{item.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
      <FloatingChatbot />
    </div>
  )
}
