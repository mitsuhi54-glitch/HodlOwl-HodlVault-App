import React from 'react';
import { FadeIn } from '../components/FadeIn';
import { Counter } from '../components/Counter';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { Shield, Lock, Zap, TrendingUp, ChevronRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HeroSlideshow } from '../components/HeroSlideshow';

/**
 * Protocol Version: 2.4.0
 * Security: Multi-Sig Oracle Enforcement
 * 
 * Home component serves as the primary landing page for HodlOwl.
 * Features a split hero section, animated statistics, and feature grid.
 */
const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col md:flex-row items-center px-8 md:px-16 cyber-grid overflow-hidden">
        <div className="flex-1 z-10 py-12">
          <FadeIn direction="right">
            <div className="inline-block px-3 py-1 bg-[var(--accent)]/[0.1] border border-[var(--accent)] text-[var(--accent)] text-xs font-mono mb-6">
              PROTOCOL V2.4 ACTIVATED
            </div>
            <h1 
              className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none mb-8 glitch"
              data-text="FORCE-HODL YOUR BCH"
            >
              FORCE-HODL <br />
              <span className="text-[var(--accent)] neon-text">YOUR BCH</span>
            </h1>
            <p className="max-w-md text-lg text-gray-400 mb-10 leading-relaxed font-sans">
              Lock your Bitcoin Cash in decentralized smart contracts. 
              Only unlock when your price target is met. Eliminate emotion. Secure your future.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="px-8 py-4 bg-[var(--accent)] text-black font-bold font-display uppercase tracking-wider hover:scale-105 transition-transform">
                ENTER DASHBOARD
              </Link>
              <Link to="/security" className="px-8 py-4 border border-[var(--accent)] text-[var(--accent)] font-bold font-display uppercase tracking-wider hover:bg-[var(--accent)]/[0.1] transition-colors">
                WHITE PAPER
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="flex-1 relative w-full h-full min-h-[400px] flex items-center justify-center">
          <FadeIn direction="left" delay={0.2} className="relative z-10">
            <HeroSlideshow />
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-[var(--cyber-gray)] bg-[var(--cyber-gray)]/[0.3]">
        <div className="px-8 md:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'TOTAL VALUE LOCKED', value: 854000, suffix: ' BCH' },
            { label: 'ACTIVE CONTRACTS', value: 12450, suffix: '' },
            { label: 'AVERAGE APY', value: 12.4, suffix: '%' },
            { label: 'PRICE TARGETS REACHED', value: 8900, suffix: '' },
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-[var(--accent)] mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-8 md:px-16 container mx-auto">
        <div className="mb-12">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tighter">PROTOCOLS & <span className="text-[var(--accent)]">SYSTEMS</span></h2>
            <div className="h-1 w-24 bg-[var(--accent)]" />
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Lock className="text-[var(--accent)]" />,
              title: "IMMUTABLE STORAGE",
              desc: "Smart contracts audited by the best. Once locked, not even we can unlock them until criteria are met."
            },
            {
              icon: <TrendingUp className="text-[var(--neon-pink)]" />,
              title: "ORACLE INTEGRATION",
              desc: "Real-time price feeds via decentralized oracles (Chainlink/Flux) ensure absolute accuracy."
            },
            {
              icon: <Shield className="text-[var(--neon-yellow)]" />,
              title: "ZERO COUNTERPARTY",
              desc: "True P2P finance. You interact directly with the BCH blockchain. Your keys, your locks."
            },
            {
              icon: <Zap className="text-[var(--accent)]" />,
              title: "FLASH UNLOCKS",
              desc: "Targets met? Funds are available instantly. No withdrawal queues, no delays."
            },
            {
              icon: <Lock className="text-[var(--accent)]" />,
              title: "NON-CUSTODIAL",
              desc: "We never touch your money. We only provide the cryptographic architecture."
            },
            {
              icon: <TrendingUp className="text-[var(--accent)]" />,
              title: "AUTO-COMPOUND",
              desc: "Optional yield farming on locked BCH through CashTokens protocols."
            }
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1} className="p-8 bg-[var(--cyber-gray)] neon-border relative group hover:-translate-y-2 transition-all duration-300">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-display font-bold mb-4 tracking-wider">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={20} className="text-[var(--accent)]" />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-16 px-8 border-y border-[var(--cyber-gray)] bg-black/40">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">CYBER_REVIEWS</h2>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">TRANSMISSIONS FROM THE NETWORK</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <TestimonialSlider />
        </FadeIn>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-8 md:px-16 overflow-hidden">
        <div className="bg-[var(--accent)] text-black p-8 md:p-16 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black opacity-5 -translate-y-1/2 translate-x-1/2 rotate-45" />
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4 italic">STAY ANALOG IN A DIGITAL WORLD.</h2>
              <p className="font-bold opacity-80 uppercase tracking-widest text-sm">Join the mailing list for intel on upcoming smart-lock primitives.</p>
            </div>
            <div className="flex-1 w-full">
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="USER_EMAIL@DOMAIN.SYS" 
                  className="flex-1 bg-black/10 border-2 border-black/20 p-4 font-mono text-xs placeholder:text-black/40 focus:outline-none focus:border-black"
                />
                <button type="submit" className="bg-black text-[var(--accent)] px-8 font-bold font-display uppercase hover:bg-black/90 transition-colors">
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
