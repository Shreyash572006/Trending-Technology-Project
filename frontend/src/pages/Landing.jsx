import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { RevealOnScroll, NeonButton, GlassCard, AIOrb } from '../components/AnimationKit'

// ── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', s)
    return () => window.removeEventListener('scroll', s)
  }, [])
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-white/5 backdrop-blur-2xl' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/30">V</div>
          <span className="font-bold text-lg text-gradient">VENDRIXA IQ</span>
        </motion.div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          {['Features', 'How it Works', 'Pricing', 'Demo'].map(item => (
            <motion.a key={item} href={`#${item.toLowerCase().replace(' ','-')}`}
              className="hover:text-white transition-colors duration-200"
              whileHover={{ y: -1 }}
            >{item}</motion.a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <NeonButton variant="secondary" className="text-sm px-5 py-2">Login</NeonButton>
          </Link>
          <Link to="/signup">
            <NeonButton className="text-sm px-5 py-2">Get Started →</NeonButton>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  'Boost Sales with AI',
  'Predict Demand Perfectly',
  'Outprice Every Competitor',
  'Automate Your Marketing',
]

function TypewriterHero() {
  const [current, setCurrent] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const target = TYPING_TEXTS[current]
    let timeout
    if (!isDeleting && text.length < target.length) {
      timeout = setTimeout(() => setText(target.slice(0, text.length + 1)), 80)
    } else if (!isDeleting && text.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 40)
    } else {
      setIsDeleting(false)
      setCurrent(c => (c + 1) % TYPING_TEXTS.length)
    }
    return () => clearTimeout(timeout)
  }, [text, isDeleting, current])

  return (
    <span className="text-gradient">
      {text}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>|</motion.span>
    </span>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      {/* Radial vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm mb-8"
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              Powered by Vendrixa AI Engine
            </motion.span>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                Your AI <br />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
                Co-Founder to <br />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
                <TypewriterHero />
              </motion.div>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-white/60 max-w-md mb-10 leading-relaxed"
            >
              The AI brain that monitors your sales, predicts demand, adjusts pricing, and launches campaigns — all in real-time. Built for Indian sellers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link to="/signup">
                <NeonButton className="text-base px-8 py-4 rounded-2xl text-lg">
                  🚀 Start Free — No Credit Card
                </NeonButton>
              </Link>
              <NeonButton variant="secondary" className="text-base px-8 py-4 rounded-2xl text-lg" onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}>
                🎤 Watch Demo
              </NeonButton>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} className="flex gap-8">
              {[['50K+', 'Sellers'], ['₹2Cr+', 'Revenue Tracked'], ['98%', 'Accuracy']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-gradient">{val}</div>
                  <div className="text-sm text-white/40">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — AI Orb + floating cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'backOut' }}
          className="relative flex items-center justify-center"
        >
          <AIOrb size={260} />

          {/* Floating stat cards */}
          {[
            { icon: '📈', label: 'Revenue', value: '+42%', color: '#10B981', x: -160, y: -80 },
            { icon: '🤖', label: 'AI Actions', value: '128 Today', color: '#8B5CF6', x: 160, y: -60 },
            { icon: '📦', label: 'Stock Alert', value: '3 Low', color: '#F59E0B', x: -140, y: 100 },
            { icon: '🎯', label: 'CRO Score', value: '94/100', color: '#3B82F6', x: 150, y: 110 },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="absolute glass-card px-4 py-3 flex items-center gap-3 text-sm"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: 1, scale: 1,
                y: [card.y, card.y - 8, card.y],
              }}
              transition={{
                opacity: { delay: 0.8 + i * 0.15, duration: 0.5 },
                scale: { delay: 0.8 + i * 0.15, duration: 0.5 },
                y: { delay: 1, duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ left: card.x > 0 ? `calc(50% + ${card.x}px)` : `calc(50% + ${card.x}px)`, top: `calc(50% + ${card.y}px)`, transform: 'translate(-50%, -50%)' }}
              whileHover={{ scale: 1.08 }}
            >
              <span className="text-xl">{card.icon}</span>
              <div>
                <div className="text-white/50 text-xs">{card.label}</div>
                <div className="font-bold" style={{ color: card.color }}>{card.value}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <motion.div className="w-1 h-2 rounded-full bg-violet-400" animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </motion.div>
    </section>
  )
}

// ── Voice AI Demo ─────────────────────────────────────────────────────────
const AI_RESPONSES = {
  default: "My analysis: Your sales are 23% below target. Top action → Launch a WhatsApp flash sale on Basmati Rice (overstocked at 180 units). Expected impact: +₹12,000 in 48 hours. Confidence: 94%.",
  sales: "Sales drop detected. Root cause: 2 top products out of stock. Restocking Maggi (0 units) + running 10% urgency offer will recover ₹8,400 in lost sales. Action logged ✅.",
  pricing: "Price optimization complete. Raising 'Organic Ghee' from ₹240 → ₹259 (competitor: ₹275). +8% margin, zero demand loss expected. Competitor undercut maintained at ₹16.",
  marketing: "Campaign generated: '⚡ 24-Hour Flash Sale! Our bestseller at ₹199 — only 23 left. COD available.' Instagram Reel hook + WhatsApp broadcast ready. Estimated 340 impressions.",
}

function VoiceDemoSection() {
  const [isListening, setIsListening] = useState(false)
  const [response, setResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [query, setQuery] = useState('')
  const queries = ['Why are my sales dropping?', 'Optimize my pricing strategy', 'Generate a marketing campaign']
  const [qIdx, setQIdx] = useState(0)

  const simulateQuery = (q) => {
    setQuery(q)
    setIsListening(true)
    setResponse('')
    setIsTyping(false)
    setTimeout(() => {
      setIsListening(false)
      setIsTyping(true)
      const key = q.includes('sales') ? 'sales' : q.includes('pric') ? 'pricing' : q.includes('market') ? 'marketing' : 'default'
      const fullResp = AI_RESPONSES[key]
      let i = 0
      const iv = setInterval(() => {
        setResponse(fullResp.slice(0, i))
        i += 2
        if (i > fullResp.length) { clearInterval(iv); setIsTyping(false) }
      }, 18)
    }, 2000)
  }

  return (
    <section id="demo-section" className="relative py-28">
      <div className="max-w-5xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm mb-6">🎤 Voice AI Demo</div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">Ask Your AI Co-Founder</h2>
            <p className="text-white/50 max-w-xl mx-auto">Speak or type. Get actionable insights in seconds. No fluff, only decisions.</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="glass-card p-8">
            {/* Query buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {queries.map((q, i) => (
                <motion.button key={i}
                  onClick={() => simulateQuery(q)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    query === q
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-violet-500/50 hover:text-white/80'
                  }`}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Mic + Wave area */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative">
                <AnimatePresence>
                  {isListening && [1, 2, 3].map(i => (
                    <motion.div key={i}
                      className="absolute inset-0 rounded-full border border-violet-500/60"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 3 + i * 0.5, opacity: 0 }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </AnimatePresence>
                <motion.button
                  className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: isListening ? 'radial-gradient(circle, #EF4444, #DC2626)' : 'radial-gradient(circle, #8B5CF6, #3B82F6)', boxShadow: isListening ? '0 0 30px rgba(239,68,68,0.5)' : '0 0 30px rgba(139,92,246,0.4)' }}
                  onClick={() => simulateQuery(queries[qIdx % queries.length])}
                  animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isListening ? '🔴' : '🎤'}
                </motion.button>
              </div>

              {/* Wave bars */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    className="flex items-end gap-1 h-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {Array.from({ length: 16 }, (_, i) => (
                      <motion.div key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-violet-600 to-blue-400"
                        animate={{ height: [8, Math.random() * 36 + 8, 8] }}
                        transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {query && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 text-center italic">
                  "{query}"
                </motion.div>
              )}
            </div>

            {/* Response */}
            <AnimatePresence>
              {(response || isTyping) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl p-5 text-sm leading-relaxed"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
                >
                  <div className="flex items-center gap-2 mb-3 text-violet-400 text-xs font-semibold">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: isTyping ? Infinity : 0, ease: 'linear' }} className="w-4 h-4">🤖</motion.div>
                    AI CO-FOUNDER RESPONSE
                  </div>
                  <div className="text-white/85">
                    {response}
                    {isTyping && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-0.5 text-violet-400">|</motion.span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🤖', title: 'AI Analyst Chat', desc: 'Ask anything about your business. Get detailed, ChatGPT-style answers with actionable insights instantly.', color: '#8B5CF6', glow: 'rgba(139,92,246,0.3)' },
  { icon: '💰', title: 'Smart Pricing AI', desc: 'Input cost price, set target price, and instantly see how your margin changes. Find the perfect sweet spot.', color: '#3B82F6', glow: 'rgba(59,130,246,0.3)' },
  { icon: '📦', title: 'Inventory Manager', desc: 'Track stock levels, get low-stock alerts, and see margin per product. Never run out of your bestseller again.', color: '#10B981', glow: 'rgba(16,185,129,0.3)' },
  { icon: '🎤', title: 'Voice Assistant', desc: 'Ask questions in English or Hindi. Get instant, voice-spoken actionable decisions — hands-free.', color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
  { icon: '📤', title: 'Upload & Analyse', desc: 'Drag & drop CSV/Excel files. AI auto-detects columns, calculates all metrics, and renders 4 charts instantly.', color: '#EF4444', glow: 'rgba(239,68,68,0.3)' },
  { icon: '📊', title: 'Smart Reports', desc: 'One-click CSV export of all your data. Full reports with sales, expenses, and profit analysis at your fingertips.', color: '#06B6D4', glow: 'rgba(6,182,212,0.3)' },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28">
      <div className="max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-6">⚡ Core Features</div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Every Tool You Need to Win</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Core AI modules built specifically for Indian eCommerce sellers. No generic advice — only data-driven decisions.</p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <RevealOnScroll key={f.title} delay={i * 0.08} direction={i % 3 === 0 ? 'right' : i % 3 === 2 ? 'left' : 'up'}>
              <motion.div
                className="glass-card p-7 h-full group cursor-default"
                whileHover={{ y: -10, boxShadow: `0 24px 80px ${f.glow}`, borderColor: f.color + '44' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="text-4xl mb-5 inline-block"
                  whileHover={{ rotate: 12, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: f.color }}>{f.title}</h3>
                <p className="text-white/55 leading-relaxed text-sm">{f.desc}</p>

                {/* Hover bottom bar */}
                <motion.div
                  className="mt-5 h-0.5 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100"
                  style={{ color: f.color }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it Works ──────────────────────────────────────────────────────────
const STEPS = [
  { step: '01', icon: '📤', title: 'Upload Your Data', desc: 'Connect sales, inventory & pricing data. CSV, Excel or manual entry — all supported.' },
  { step: '02', icon: '🧠', title: 'AI Analyses Everything', desc: 'The AI engine processes patterns, benchmarks competitors and identifies opportunities instantly.' },
  { step: '03', icon: '⚡', title: 'Get Instant Decisions', desc: 'Receive prioritized action plans with expected revenue impact. Execute in one click.' },
]

function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,1) 0%, transparent 70%)' }} />
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <RevealOnScroll className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-sm mb-6">⚙️ How It Works</div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">From Data to Decision in 3 Steps</h2>
        </RevealOnScroll>

        <div className="flex flex-col lg:flex-row items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex flex-col lg:flex-row items-center flex-1">
              {/* Step card */}
              <motion.div
                className="glass-card p-8 text-center flex-1 w-full lg:w-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.4, duration: 0.6, ease: 'easeOut' }}
                whileHover={{ y: -6 }}
              >
                <div className="text-5xl mb-5">{s.icon}</div>
                <div className="text-6xl font-black text-gradient opacity-30 mb-3">{s.step}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="flex lg:flex-row flex-col items-center mx-4 my-4 lg:my-0">
                  <motion.div
                    className="lg:w-16 lg:h-0.5 w-0.5 h-12 bg-gradient-to-r from-violet-500 to-transparent"
                    initial={{ scaleX: 0, scaleY: 0 }}
                    animate={inView ? { scaleX: 1, scaleY: 1 } : {}}
                    transition={{ delay: 0.7 + i * 0.4, duration: 0.6 }}
                    style={{ transformOrigin: 'left center' }}
                  />
                  <motion.div
                    className="text-violet-400 text-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 + i * 0.4, duration: 0.4 }}
                  >→</motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Dashboard Preview ──────────────────────────────────────────────────────
function AnimatedChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const points = [20, 35, 28, 60, 45, 75, 68, 90, 82]
  const W = 320; const H = 120
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * W},${H - (v / 100 * H)}`)
  const polyline = pts.join(' ')

  return (
    <div ref={ref} className="glass-card p-4">
      <div className="text-xs text-white/40 mb-2 font-semibold">REVENUE — 30 DAYS</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ height: 120 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <motion.polygon
          points={`0,${H} ${polyline} ${W},${H}`}
          fill="url(#chartGrad)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.polyline
          points={polyline}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
        />
        {pts.map((p, i) => {
          const [x, y] = p.split(',')
          return (
            <motion.circle key={i} cx={x} cy={y} r="4" fill="#8B5CF6"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4, type: 'spring' }}
            />
          )
        })}
      </svg>
    </div>
  )
}

function CountUp({ end, prefix = '', suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = (end - start) / (duration * 60)
    const iv = setInterval(() => {
      start = Math.min(start + step, end)
      setVal(Math.round(start))
      if (start >= end) clearInterval(iv)
    }, 1000 / 60)
    return () => clearInterval(iv)
  }, [inView, end])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

function DashboardPreviewSection() {
  return (
    <section id="dashboard" className="relative py-28">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm mb-6">📊 Dashboard Preview</div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Everything at a Glance</h2>
          <p className="text-white/50 max-w-xl mx-auto">A command center for your business — live data, AI alerts, and one-click actions.</p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          {/* Mock dashboard */}
          <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(139,92,246,0.3)' }}>
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="flex gap-2">
                {['#EF4444', '#F59E0B', '#10B981'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
              </div>
              <div className="flex-1 h-6 rounded bg-white/5 text-xs flex items-center px-3 text-white/25">vendrixa.ai/dashboard</div>
              <div className="text-xs text-green-400 flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
                System Live
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', val: 245820, prefix: '₹', color: '#10B981' },
                { label: 'Net Profit', val: 68400, prefix: '₹', color: '#8B5CF6' },
                { label: 'Orders', val: 1284, color: '#3B82F6' },
                { label: 'Profit Margin', val: 27, suffix: '%', color: '#F59E0B' },
              ].map((kpi, i) => (
                <RevealOnScroll key={kpi.label} delay={i * 0.1}>
                  <div className="glass rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xs text-white/40 mb-1">{kpi.label}</div>
                    <div className="text-xl font-black" style={{ color: kpi.color }}>
                      <CountUp end={kpi.val} prefix={kpi.prefix || ''} suffix={kpi.suffix || ''} />
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            {/* Chart + alerts */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AnimatedChart />
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '🚨', text: 'Maggi 2-Min Noodles OUT OF STOCK', color: '#EF4444', priority: 'CRITICAL' },
                  { icon: '💡', text: 'Raise Basmati Rice price by ₹12 (competitor gap)', color: '#F59E0B', priority: 'HIGH' },
                  { icon: '📢', text: 'Run WhatsApp campaign now → est. +₹8,200', color: '#10B981', priority: 'MEDIUM' },
                ].map((alert, i) => (
                  <motion.div key={i}
                    className="rounded-xl p-3 text-xs"
                    style={{ background: alert.color + '0F', border: `1px solid ${alert.color}33` }}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: alert.color }} className="font-bold text-[10px]">{alert.priority}</span>
                    </div>
                    <div className="text-white/70">{alert.icon} {alert.text}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Rajesh Sharma', role: 'Grocery Store Owner, Delhi', avatar: 'R', quote: 'Vendrixa IQ saved my shop! It detected 3 out-of-stock items I missed and recovered ₹18,000 in sales that same week. Unbelievable AI.', stars: 5 },
  { name: 'Priya Mehta', role: 'Fashion Seller, Surat', avatar: 'P', quote: 'The pricing AI helped me beat my Meesho competitors by keeping prices competitive without hurting my margins. Revenue up 31% in a month!', stars: 5 },
  { name: 'Amit Gupta', role: 'Electronics Seller, Mumbai', avatar: 'A', quote: 'Voice AI feature is insane — I just speak "what should I do today" and it gives me a full action plan. Feels like having a real co-founder.', stars: 5 },
  { name: 'Sunita Patel', role: 'Home Decor Seller, Ahmedabad', avatar: 'S', quote: 'GST calculator + P&L dashboard saved me ₹40,000 in errors. My CA was shocked at how clean my records were!', stars: 5 },
]

function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(iv)
  }, [])

  return (
    <section id="testimonials" className="relative py-28 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="max-w-4xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm mb-6">💬 Testimonials</div>
          <h2 className="text-4xl lg:text-5xl font-black">Trusted by 50,000+ Sellers</h2>
        </RevealOnScroll>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="glass-card p-10 text-center"
            >
              <div className="text-3xl mb-6">{'★'.repeat(TESTIMONIALS[current].stars)}<span className="text-yellow-400">{'★'.repeat(TESTIMONIALS[current].stars)}</span></div>
              <p className="text-white/80 text-lg italic leading-relaxed mb-8">"{TESTIMONIALS[current].quote}"</p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold text-lg">
                  {TESTIMONIALS[current].avatar}
                </div>
                <div className="text-left">
                  <div className="font-bold">{TESTIMONIALS[current].name}</div>
                  <div className="text-sm text-white/40">{TESTIMONIALS[current].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <motion.button key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                animate={{ width: i === current ? 24 : 8, background: i === current ? '#8B5CF6' : 'rgba(255,255,255,0.2)' }}
                style={{ height: 8 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────────────────
const PLANS = [
  { name: 'Starter', price: '₹0', duration: 'Forever free', features: ['Core AI modules', 'Voice AI (5 queries/day)', '100 products', 'Basic analytics'], cta: 'Start Free', highlight: false },
  { name: 'Pro', price: '₹999', duration: '/month', features: ['All AI modules', 'Unlimited Voice AI', 'Unlimited products', 'Smart Pricing AI', 'Priority support', 'Multi-shop management'], cta: 'Start 14-day Trial', highlight: true },
  { name: 'Enterprise', price: '₹2,499', duration: '/month', features: ['Everything in Pro', 'Custom AI training', 'Dedicated AI manager', 'API access', 'White-label option', 'Custom integrations'], cta: 'Contact Sales', highlight: false },
]

function PricingSection() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-6">💰 Pricing</div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-white/50 max-w-xl mx-auto">Start free. Scale as you grow. Cancel anytime.</p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <RevealOnScroll key={plan.name} delay={i * 0.15}>
              <motion.div
                className={`glass-card p-8 h-full flex flex-col relative overflow-hidden ${plan.highlight ? '' : ''}`}
                style={plan.highlight ? {
                  border: '2px solid rgba(139,92,246,0.6)',
                  boxShadow: '0 0 50px rgba(139,92,246,0.2)',
                } : {}}
                whileHover={{
                  y: -8,
                  boxShadow: plan.highlight
                    ? '0 30px 80px rgba(139,92,246,0.4)'
                    : '0 20px 60px rgba(255,255,255,0.06)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {plan.highlight && (
                  <>
                    <motion.div className="absolute inset-0 rounded-2xl opacity-20"
                      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.1))' }}
                    />
                    <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-xs font-bold">MOST POPULAR</div>
                  </>
                )}

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black text-gradient">{plan.price}</span>
                    <span className="text-white/40">{plan.duration}</span>
                  </div>
                  <div className="h-px bg-white/5 my-6" />
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                        <span className="text-green-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <NeonButton
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      className="w-full text-center justify-center"
                    >
                      {plan.cta}
                    </NeonButton>
                  </Link>
                </div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-8"
          >🚀</motion.div>
          <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
            Your Competitors<br />
            <span className="text-gradient">Already Have AI.</span>
          </h2>
          <p className="text-xl text-white/55 max-w-2xl mx-auto mb-12">
            Every day without Vendrixa IQ is revenue lost. Join 50,000+ sellers making smarter decisions and growing 3X faster.
          </p>

          <div className="relative inline-block">
            {/* Pulse rings */}
            {[1, 2].map(i => (
              <motion.div key={i}
                className="absolute inset-0 rounded-2xl border border-violet-500/40"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
              />
            ))}
            <Link to="/signup">
              <NeonButton className="text-xl px-12 py-5 rounded-2xl">
                🚀 Start Free — It Takes 60 Seconds
              </NeonButton>
            </Link>
          </div>

          <div className="mt-6 text-white/30 text-sm">No credit card required · Free forever plan available · Cancel anytime</div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-white/35 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs">V</div>
          <span className="font-bold text-white/60">VENDRIXA IQ</span>
          <span>· AI Seller Intelligence Platform</span>
        </div>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Support', 'API Docs'].map(l => (
            <motion.a key={l} href="#" whileHover={{ color: '#8B5CF6', y: -1 }} className="hover:text-violet-400 transition-colors">{l}</motion.a>
          ))}
        </div>
        <div>© 2026 Vendrixa. Made with ❤️ for Indian sellers.</div>
      </div>
    </footer>
  )
}

// ── Main Landing Export ────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="relative z-10">
      <Navbar />
      <HeroSection />
      <VoiceDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
