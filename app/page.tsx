'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen background-transparent text-white overflow-x-hidden relative">
      {/* Abstract Concentric Arcs - Top Right Corner */}
      <div className="absolute top-0 right-0 pointer-events-none hidden lg:block overflow-hidden z-10" style={{ width: '100%', height: '100vh' }}>
        <svg width="100%" height="100%" viewBox="0 0 1600 1200" fill="none" preserveAspectRatio="xMaxYMin slice">
          <defs>
            {/* Radial Gradient from corner */}
            <radialGradient id="arcGradient" cx="100%" cy="0%" r="100%" fx="100%" fy="0%">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ff7a7a" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#a04137" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6b2d28" stopOpacity="0" />
            </radialGradient>

            {/* Glow filter */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Arcs radiating from top-right corner */}
          {[
            { id: 1, r: 50, opacity: 0.9, delay: 0, pulse: 2.5, strokeWidth: 3 },
            { id: 2, r: 100, opacity: 0.85, delay: 0.04, pulse: 2.7, strokeWidth: 2.8 },
            { id: 3, r: 150, opacity: 0.8, delay: 0.08, pulse: 2.9, strokeWidth: 2.6 },
            { id: 4, r: 200, opacity: 0.75, delay: 0.12, pulse: 3.1, strokeWidth: 2.4 },
            { id: 5, r: 250, opacity: 0.7, delay: 0.16, pulse: 3.3, strokeWidth: 2.2 },
            { id: 6, r: 300, opacity: 0.65, delay: 0.2, pulse: 3.5, strokeWidth: 2 },
            { id: 7, r: 350, opacity: 0.6, delay: 0.24, pulse: 3.7, strokeWidth: 1.8 },
            { id: 8, r: 400, opacity: 0.55, delay: 0.28, pulse: 3.9, strokeWidth: 1.6 },
            { id: 9, r: 450, opacity: 0.5, delay: 0.32, pulse: 4.1, strokeWidth: 1.5 },
            { id: 10, r: 500, opacity: 0.45, delay: 0.36, pulse: 4.3, strokeWidth: 1.4 },
            { id: 11, r: 550, opacity: 0.4, delay: 0.4, pulse: 4.5, strokeWidth: 1.3 },
            { id: 12, r: 600, opacity: 0.35, delay: 0.44, pulse: 4.7, strokeWidth: 1.2 },
            { id: 13, r: 650, opacity: 0.3, delay: 0.48, pulse: 4.9, strokeWidth: 1.1 },
            { id: 14, r: 700, opacity: 0.26, delay: 0.52, pulse: 5.1, strokeWidth: 1 },
            { id: 15, r: 750, opacity: 0.22, delay: 0.56, pulse: 5.3, strokeWidth: 0.9 },
            { id: 16, r: 800, opacity: 0.18, delay: 0.6, pulse: 5.5, strokeWidth: 0.85 },
            { id: 17, r: 850, opacity: 0.15, delay: 0.64, pulse: 5.7, strokeWidth: 0.8 },
            { id: 18, r: 900, opacity: 0.12, delay: 0.68, pulse: 5.9, strokeWidth: 0.75 },
            { id: 19, r: 950, opacity: 0.1, delay: 0.72, pulse: 6.1, strokeWidth: 0.7 },
            { id: 20, r: 1000, opacity: 0.08, delay: 0.76, pulse: 6.3, strokeWidth: 0.65 },
            { id: 21, r: 1050, opacity: 0.06, delay: 0.8, pulse: 6.5, strokeWidth: 0.6 },
            { id: 22, r: 1100, opacity: 0.05, delay: 0.84, pulse: 6.7, strokeWidth: 0.55 },
            { id: 23, r: 1150, opacity: 0.04, delay: 0.88, pulse: 6.9, strokeWidth: 0.5 },
            { id: 24, r: 1200, opacity: 0.03, delay: 0.92, pulse: 7.1, strokeWidth: 0.45 },
            { id: 25, r: 1250, opacity: 0.025, delay: 0.96, pulse: 7.3, strokeWidth: 0.4 },
            { id: 26, r: 1300, opacity: 0.02, delay: 1, pulse: 7.5, strokeWidth: 0.35 },
            { id: 27, r: 1350, opacity: 0.015, delay: 1.04, pulse: 7.7, strokeWidth: 0.3 },
            { id: 28, r: 1400, opacity: 0.01, delay: 1.08, pulse: 7.9, strokeWidth: 0.25 }
          ].map((arc) => (
            <motion.path
              key={arc.id}
              d={`M 1600 ${arc.r} A ${arc.r} ${arc.r} 0 0 0 ${1600 - arc.r} 0`}
              stroke="url(#arcGradient)"
              strokeWidth={arc.strokeWidth}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: arc.opacity,
                scale: [1, 1.02, 1]
              }}
              transition={{
                pathLength: { duration: 2, delay: arc.delay, ease: "easeOut" },
                opacity: { duration: 1.5, delay: arc.delay },
                scale: {
                  duration: arc.pulse,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: arc.delay
                }
              }}
            />
          ))}

          {/* Glowing Node Points along the arcs - smaller circles */}
          {[
            { cx: 1600, cy: 50, r: 2, delay: 0 },
            { cx: 1600, cy: 100, r: 1.9, delay: 0.04 },
            { cx: 1600, cy: 150, r: 1.8, delay: 0.08 },
            { cx: 1600, cy: 200, r: 1.7, delay: 0.12 },
            { cx: 1600, cy: 250, r: 1.6, delay: 0.16 },
            { cx: 1600, cy: 300, r: 1.5, delay: 0.2 },
            { cx: 1600, cy: 350, r: 1.4, delay: 0.24 },
            { cx: 1600, cy: 400, r: 1.3, delay: 0.28 },
            { cx: 1600, cy: 450, r: 1.2, delay: 0.32 },
            { cx: 1600, cy: 500, r: 1.1, delay: 0.36 },
            { cx: 1600, cy: 550, r: 1, delay: 0.4 },
            { cx: 1600, cy: 600, r: 0.95, delay: 0.44 },
            { cx: 1600, cy: 650, r: 0.9, delay: 0.48 },
            { cx: 1600, cy: 700, r: 0.85, delay: 0.52 },
            { cx: 1600, cy: 750, r: 0.8, delay: 0.56 },
            { cx: 1600, cy: 800, r: 0.75, delay: 0.6 },
            { cx: 1600, cy: 850, r: 0.7, delay: 0.64 },
            { cx: 1600, cy: 900, r: 0.65, delay: 0.68 },
            { cx: 1600, cy: 950, r: 0.6, delay: 0.72 },
            { cx: 1600, cy: 1000, r: 0.55, delay: 0.76 },
            { cx: 1600, cy: 1050, r: 0.5, delay: 0.8 },
            { cx: 1600, cy: 1100, r: 0.45, delay: 0.84 },
            { cx: 1600, cy: 1150, r: 0.4, delay: 0.88 },
            { cx: 1600, cy: 1200, r: 0.35, delay: 0.92 }
          ].map((node, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#ff6b6b"
              filter="url(#arcGlow)"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1]
              }}
              transition={{
                duration: 3 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay
              }}
            />
          ))}

          {/* Accent dots at arc endpoints - smaller */}
          {[
            { cx: 1150, cy: 0, r: 1.5, delay: 0.03 },
            { cx: 1100, cy: 0, r: 1.4, delay: 0.08 },
            { cx: 1050, cy: 0, r: 1.3, delay: 0.13 },
            { cx: 1000, cy: 0, r: 1.2, delay: 0.18 },
            { cx: 950, cy: 0, r: 1.1, delay: 0.23 },
            { cx: 900, cy: 0, r: 1, delay: 0.28 },
            { cx: 850, cy: 0, r: 0.9, delay: 0.33 },
            { cx: 800, cy: 0, r: 0.85, delay: 0.38 },
            { cx: 750, cy: 0, r: 0.8, delay: 0.43 },
            { cx: 700, cy: 0, r: 0.75, delay: 0.48 },
            { cx: 650, cy: 0, r: 0.7, delay: 0.53 },
            { cx: 600, cy: 0, r: 0.65, delay: 0.58 },
            { cx: 550, cy: 0, r: 0.6, delay: 0.63 },
            { cx: 500, cy: 0, r: 0.55, delay: 0.68 },
            { cx: 450, cy: 0, r: 0.5, delay: 0.73 },
            { cx: 400, cy: 0, r: 0.45, delay: 0.78 },
            { cx: 350, cy: 0, r: 0.4, delay: 0.83 },
            { cx: 300, cy: 0, r: 0.35, delay: 0.88 },
            { cx: 250, cy: 0, r: 0.3, delay: 0.93 },
            { cx: 200, cy: 0, r: 0.25, delay: 0.98 },
            { cx: 150, cy: 0, r: 0.2, delay: 1.03 },
            { cx: 100, cy: 0, r: 0.15, delay: 1.08 }
          ].map((dot, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill="#ff6b6b"
              opacity="0.5"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2.5 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: dot.delay
              }}
            />
          ))}

          {/* Subtle pulsing ring effect */}
          <motion.circle
            cx="500"
            cy="0"
            r="60"
            stroke="#ff6b6b"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
            animate={{
              r: [60, 400],
              opacity: [0.3, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </svg>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center justify-between px-8 lg:px-16 py-5 max-w-[1400px] mx-auto mb-24"
      >
        {/* Left side: Logo + Nav items */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-5">
            <a href="#" className="text-[13px] text-[#999] hover:text-white transition-colors flex items-center gap-1">
              Platform
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="text-[13px] text-[#999] hover:text-white transition-colors">Enterprise</a>
            <a href="#" className="text-[13px] text-[#999] hover:text-white transition-colors">Resources</a>
            <a href="#" className="text-[13px] text-[#999] hover:text-white transition-colors">Company</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="text-[13px] text-white px-5 py-2 rounded-xl border border-[#333] hover:border-[#555] transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/demo?autostart=true')}
            className="text-[13px] text-white px-5 py-2 rounded-xl border border-[#333] hover:border-[#555] transition-colors"
          >
            Demo
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-8 lg:px-16 pt-10 pb-6 max-w-[1400px] mx-auto relative">
        {/* Hero Heading */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="flex flex-col"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-[38px] md:text-[46px] lg:text-[74px] leading-[1.15] max-w-[650px] text-white"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontStyle: 'italic' }}
          >
            Agentic Digital
          </motion.h1>
          <motion.h1
            variants={fadeInUp}
            className="text-[38px] md:text-[46px] lg:text-[74px] leading-[1.15] mb-4 max-w-[650px] text-white"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontStyle: 'italic' }}
          >
            Audio Workstation
          </motion.h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="whitespace-nowrap text-[#BAB8B8] text-[19px] mb-6 max-w-[500px]" style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Designed for autonomous music systems and structured creativity.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center gap-3 mb-20"
        >
          <button
            className="text-[14px] text-white px-5 py-2.5 rounded-xl border border-[#444] hover:border-[#666] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Learn more
          </button>
          <button
            onClick={() => router.push('/demo?autostart=true')}
            className="text-[14px] text-white px-5 py-2.5 rounded-xl border border-[#444] hover:border-[#666] transition-colors flex items-center gap-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Demo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#ff7a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="flex items-center justify-between mb-3 px-2"
        >
          {['Record', 'Analyze', 'Generate', 'Deploy'].map((step) => (
            <motion.div
              key={step}
              variants={fadeInUp}
              className="flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L19 8" stroke="#000000ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[18px] text-white font-medium tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                {step}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </section>

      {/* Demo Card Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="px-8 lg:px-16 pb-20 max-w-[1400px] mx-auto"
      >
        <div className="w-full rounded-xl overflow-hidden relative">
          {/* Base red / brown gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(160,65,55,0.65) 0%, rgba(130,55,45,0.5) 50%, rgba(110,45,38,0.6) 100%)'
            }}
          />

          {/* Pixelated blur overlay */}
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundImage: `
          linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
        `,
              backgroundSize: '48px 48px'
            }}
          />

          {/* Subtle dark vignette for depth */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Content */}
          <div className="p-12 lg:p-24 min-h-[500px] lg:min-h-[800px] relative flex items-center justify-center">
            {/* Testing Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[1100px] relative z-10"
            >
              <img
                src="/demo_img.png"
                alt="Pulse Studio Demo"
                className="w-full h-auto rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20 transform scale-110"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>


      {/* AI Support Engineer Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-8 lg:px-16 py-20 max-w-[1400px] mx-auto"
      >
        <h2 className="text-[28px] mb-2">An always-on AI music agent</h2>
        <p className="whitespace-nowrap text-[#BAB8B8] text-[14px] mb-10 max-w-[500px]">
          An AI music agent that can listen, analyze, and refine your track autonomously.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Demo image placeholder */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 min-h-[350px]">
            <div className="bg-[#2a2a2a] rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
              <span className="text-[#fbbf24]">⚠</span>
              <span className="text-[12px] text-white">Contract renewal failed with FX rounding error on checkout.</span>
            </div>
            <div className="bg-[#1f1f1f] rounded-lg p-3 mb-4 border border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                <span className="text-[11px] text-white">Triage</span>
                <span className="text-[11px] text-gray-500">› Triaged as technical issue</span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-4">
                <span>→ Approval required</span>
                <span className="text-[#4ade80]">✓ Approved</span>
                <span className="ml-auto text-gray-500">marie@acme.com</span>
              </div>
            </div>
            <div className="bg-[#1f1f1f] rounded-lg p-3 border border-[#333]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                <span className="text-[11px] text-white">Fixing</span>
                <span className="text-[11px] text-gray-500">› Patch prepared</span>
              </div>
              <div className="bg-[#0d1117] rounded p-3 font-mono text-[10px]">
                <div className="text-gray-500">1  2 lines</div>
                <div><span className="text-purple-400">export async function</span> <span className="text-yellow-300">charge</span>(total: number, rate: n...</div>
                <div><span className="text-purple-400">const</span> amount = Math.round(total * rate * 100) / 1...</div>
                <div><span className="text-purple-400">const</span> idKey = request.headers.get('Idempotency-Key...</div>
                <div><span className="text-purple-400">if</span> (idKey) <span className="text-purple-400">await</span> idempotencyCache.set(idKey, amou...</div>
                <div className="text-gray-500">7</div>
                <div><span className="text-purple-400">await</span> <span className="text-blue-300">payments</span>.<span className="text-yellow-300">charge</span>(( amount ))</div>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className="space-y-8 pt-4">
            {[
              {
                icon: '↗',
                title: 'Scale creativity without scaling effort',
                desc: 'Autonomously analyzes musical context, resolves common mix and arrangement issues, and handles complex decisions in minutes.'
              },
              {
                icon: '⊡',
                title: 'Create with intent and control',
                desc: 'Approvals, diffs, and a full change history keep every musical decision reversible and aligned with your creative vision.'
              },
              {
                icon: '✦',
                title: 'Evolving musical agents',
                desc: 'Continuously learns your taste, references, and workflow across projects to make better musical decisions over time.'
              },
              {
                icon: '⇆',
                title: 'Perfect handoffs for uninterrupted flow',
                desc: 'Delivers full musical context with proposed changes and rationale so you never lose momentum or creative intent.'
              }
            ].map((item, i) => (

              <div key={i} className="flex gap-4">
                <span className="text-[16px] text-gray-400">{item.icon}</span>
                <div>
                  <h4 className="text-[14px] font-medium mb-1">{item.title}</h4>
                  <p className="text-[13px] text-[#777] text-[#BAB8B8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            <button className="text-[13px] text-white px-5 py-2.5 rounded-xl border border-[#444] hover:border-[#666] transition-colors mt-4">
              Our product
            </button>
          </div>
        </div>
      </motion.section>

      {/* Autonomous QA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-8 lg:px-16 py-20 max-w-[1400px] mx-auto mb-4"
      >
        <h2 className="text-[28px] mb-2">Autonomous validation on every change</h2>
        <p className="whitespace-nowrap text-[#BAB8B8] text-[14px] mb-10 max-w-[600px]">
          Continuous, music-aware simulations run on each edit to verify groove, balance, and structure before render.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Demo */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 min-h-[300px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(60,70,50,0.6) 0%, rgba(80,90,60,0.4) 100%)' }}>
            <div className="bg-[#1a1a1a]/90 rounded-lg p-4">
              <div className="bg-[#222] rounded-full px-4 py-2 mb-4 inline-flex items-center gap-2">
                <span className="text-gray-400">→</span>
                <span className="text-[12px] text-white">New commit validated</span>
                <span className="text-[12px] text-gray-400">• 4 simulations passed</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                <span className="text-[11px] text-white">Testing</span>
                <span className="text-[11px] text-gray-500">› Simulations complete</span>
              </div>
              <div className="space-y-2">
                {[
                  'Entitlements: SAML group sync update...',
                  'Billing: proration + FX rounding reconci...',
                  'Idempotency: payment webhook retry i...',
                  'Approvals: high-value discount require...'
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
                      <span className="text-[11px] text-gray-300">{item}</span>
                    </div>
                    <span className="text-[10px] text-[#4ade80] font-medium">Pass</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className="space-y-8 pt-4">
            {[
              {
                icon: '□',
                title: 'Auto-generate musical tests',
                desc: 'Creates validation scenarios from your latest musical changes.'
              },
              {
                icon: '⟲',
                title: 'Catch regressions early',
                desc: 'Verifies groove, balance, and dynamics on every edit.'
              },
              {
                icon: '◎',
                title: 'Render with confidence',
                desc: 'Clear pass/fail signals before export.'
              },
              {
                icon: '→',
                title: 'Native session integration',
                desc: 'Results appear directly in your timeline.'
              }
            ].map((item, i) => (

              <div key={i} className="flex gap-4">
                <span className="text-[16px] text-gray-400">{item.icon}</span>
                <div>
                  <h4 className="text-[14px] font-medium mb-1">{item.title}</h4>
                  <p className="text-[13px] text-[#BAB8B8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            <button className="text-[14px] text-white px-5 py-2.5 rounded-xl border border-[#444] hover:border-[#666] transition-colors mt-4">
              See how it works
            </button>
          </div>
        </div>
      </motion.section>

      {/* Memory Quote Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="px-8 lg:px-16 py-16 max-w-[1400px] mx-auto text-center mb-24"
      >
        <p
          className="text-[24px] md:text-[35px] text-white leading-relaxed tracking-[0.02em]"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Pulse builds a <span className="font-semibold">memory</span> of every creative decision,<br />
          so your music <span className="font-semibold">evolves instead of repeating itself</span>.
        </p>
      </motion.section>

      {/* Trust & Privacy Section */}
      <div
        className="w-full relative border-y border-[#1a1a1a] mb-20"
        style={{
          backgroundColor: '#111111ff',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="px-8 lg:px-16 py-24 max-w-[1400px] mx-auto"
        >
          <h2 className="text-[28px] mb-2">Private and creator-first</h2>
          <p className="text-[#BAB8B8] text-[14px] mb-12 max-w-[520px]">
            Built for artists and studios who demand control, privacy, and trust by default.
          </p>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: Visual / Trust State */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0d0d0d] border border-[#222] group">
              <div
                className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute bottom-10 left-10 flex items-center gap-3 px-4 py-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                <div className="w-4 h-4 rounded-full border border-green-400/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                </div>
                <span className="text-[12px] text-white/90 font-medium tracking-tight">
                  Session protected • <span className="text-white">Local & private</span>
                </span>
              </div>
            </div>

            {/* Right: Trust Features */}
            <div className="space-y-10 py-2">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: 'Human-in-the-loop control',
                  desc: 'Set approval rules so agents only act when and how you want them to.'
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                  title: 'Professional-grade reliability',
                  desc: 'Designed for real sessions, real deadlines, and production-grade workflows.'
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M2.5 12C2.5 12 5.5 5 12 5C18.5 5 21.5 12 21.5 12C21.5 12 18.5 19 12 19C5.5 19 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                  title: 'Private by design',
                  desc: 'Your music never trains public models. You own every output, always.'
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 12H9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M15 12H20" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                  title: 'Local, cloud, or hybrid',
                  desc: 'Run agents locally, in the cloud, or both — fully under your control.'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="mt-1 transition-transform group-hover:scale-110 duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-medium mb-1.5 text-white/90">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-[#BAB8B8] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <button className="text-[14px] text-black bg-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#ff7a7a] hover:text-white transition-all">
                  Privacy & trust overview
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 lg:px-16 py-20 max-w-[1400px] mx-auto"
      >
        <div className="grid md:grid-cols-[200px_1fr] gap-12">
          <div>
            <span className="text-[13px] text-[#666]">Recent highlights</span>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Introducing Sim-1', desc: 'Our smartest models capable of simulating how code runs', subdesc: 'A new category of models built to understand and predict how large codebases behave in complex, real-world scenarios.', tag: 'Research' },
              { title: '>80% Reduction in the average time to resolution by running tickets through PlayerZero', desc: 'Cayuse achieves significant efficiency gains by automating ticket triage and resolution workflows.', tag: 'Case Study' },
              { title: 'What is Predictive Software Quality? Software Operations in the AI Era', desc: 'A new, AI-powered approach to operating software reliably that anticipates how code will behave before deployment.', tag: 'Resources' },
            ].map((item, i) => (
              <div key={i} className="border-t border-[#222] pt-6">
                <h4 className="text-[15px] font-medium mb-1">{item.title}</h4>
                <p className="text-[13px] text-[#777] mb-1">{item.desc}</p>
                {item.subdesc && <p className="text-[12px] text-[#555] mb-2">{item.subdesc}</p>}
                <span className="text-[11px] text-[#555]">{item.tag}</span>
              </div>
            ))}
            <a href="#" className="text-[13px] text-white flex items-center gap-2 mt-4">
              View more posts
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#ff7a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="px-8 lg:px-16 py-16 border-t border-[#1a1a1a] max-w-[1400px] mx-auto"
      >

        <div className="flex items-center justify-between pt-8 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[13px] text-[#666]">PULSE</span>
          </div>
          <div className="text-[12px] text-[#555]">
            © 2026 PULSE, Inc.
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
