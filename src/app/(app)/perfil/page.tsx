'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/motion/page-transition'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { motion } from 'framer-motion'
import {
  MapPin,
  Building2,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  HelpCircle,
  Bell,
  BarChart3,
  Zap,
  CheckCircle2,
  Star,
} from 'lucide-react'

function Toggle({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative w-11 h-6 transition-colors duration-200 focus:outline-none',
        active ? 'bg-primary' : 'bg-muted'
      )}
      style={{ borderRadius: 0 }}
      aria-checked={active}
      role="switch"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className="absolute top-1 w-4 h-4 bg-background shadow"
        style={{
          borderRadius: 0,
          left: active ? 'calc(100% - 1.25rem)' : '0.25rem',
        }}
      />
    </button>
  )
}

export default function PerfilPage() {
  const [alertas, setAlertas] = useState(true)
  const [relatorio, setRelatorio] = useState(true)
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground pb-24">

        {/* Avatar / Header */}
        <ScrollReveal delay={0}>
          <div className="flex flex-col items-center gap-4 px-6 pt-10 pb-8 border-b border-border">
            <div
              className="w-20 h-20 bg-primary flex items-center justify-center"
              style={{ borderRadius: 0 }}
            >
              <span className="font-editorial text-4xl font-bold text-primary-foreground select-none">
                M
              </span>
            </div>

            <div className="text-center space-y-1">
              <h1 className="font-editorial font-bold text-2xl leading-tight">
                Marcelo Rodrigues
              </h1>
              <p className="text-muted-foreground text-sm">
                Pecuarista \u2014 Mato Grosso
              </p>
            </div>

            <span
              className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 font-mono font-semibold"
              style={{ borderRadius: 0 }}
            >
              PRO
            </span>
          </div>
        </ScrollReveal>

        {/* Stats Rapidos */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 border-b border-border">
            {[
              { value: '47', unit: 'dias', label: 'de uso' },
              { value: 'R$ 2.340', unit: '', label: 'economizados' },
              { value: '89.2%', unit: '', label: 'acur\u00e1cia' },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center justify-center py-6 px-2 gap-1',
                  i < 2 ? 'border-r border-border' : ''
                )}
              >
                <span className="font-mono font-bold text-lg leading-none">
                  {stat.value}
                  {stat.unit && (
                    <span className="text-[11px] font-normal ml-0.5">{stat.unit}</span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Minha Fazenda */}
        <ScrollReveal delay={0.2}>
          <section className="px-6 pt-8 pb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              Minha Fazenda
            </h2>

            <div className="border border-border divide-y divide-border">
              {[
                {
                  icon: <Building2 size={14} />,
                  label: 'Propriedade',
                  value: 'Fazenda S\u00e3o Jo\u00e3o',
                },
                {
                  icon: <MapPin size={14} />,
                  label: 'Munic\u00edpio',
                  value: 'Sorriso - MT',
                },
                {
                  icon: <Zap size={14} />,
                  label: 'Rebanho',
                  value: '1.240 cabe\u00e7as',
                },
                {
                  icon: <CheckCircle2 size={14} />,
                  label: '\u00c1rea',
                  value: '3.200 ha',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Prefer\u00eancias */}
        <ScrollReveal delay={0.3}>
          <section className="px-6 pt-6 pb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              Prefer\u00eancias
            </h2>

            <div className="border border-border divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-muted-foreground" />
                  <span className="text-sm">Alertas de pre\u00e7o</span>
                </div>
                <Toggle active={alertas} onToggle={() => setAlertas((v) => !v)} />
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <BarChart3 size={14} className="text-muted-foreground" />
                  <span className="text-sm">Relat\u00f3rio semanal</span>
                </div>
                <Toggle
                  active={relatorio}
                  onToggle={() => setRelatorio((v) => !v)}
                />
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon size={14} className="text-muted-foreground" />
                  ) : (
                    <Sun size={14} className="text-muted-foreground" />
                  )}
                  <span className="text-sm">Modo escuro</span>
                </div>
                <Toggle
                  active={isDark}
                  onToggle={() => setTheme(isDark ? 'light' : 'dark')}
                />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Menu de Suporte */}
        <ScrollReveal delay={0.4}>
          <section className="px-6 pt-6 pb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              Suporte
            </h2>

            <div className="border border-border divide-y divide-border">
              {[
                { icon: <Shield size={14} />, label: 'Seguran\u00e7a & Privacidade' },
                { icon: <HelpCircle size={14} />, label: 'Ajuda & Suporte' },
                { icon: <Star size={14} />, label: 'O que h\u00e1 de novo' },
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Bot\u00e3o Sair */}
        <ScrollReveal delay={0.5}>
          <div className="px-6 pt-4">
            <button
              className="w-full py-3 border border-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Sair
            </button>
          </div>
        </ScrollReveal>

        {/* Rodap\u00e9 / Vers\u00e3o */}
        <ScrollReveal delay={0.6}>
          <div className="px-6 pt-8 pb-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              BullCast v1.0 \u2014 Consultor de bolso do pecuarista
            </p>
          </div>
        </ScrollReveal>

      </div>
    </PageTransition>
  )
}
