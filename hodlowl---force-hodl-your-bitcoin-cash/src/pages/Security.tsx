import React from 'react';
import { FadeIn } from '../components/FadeIn';
import { Shield, Eye, Code, Terminal, Zap, ExternalLink } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="px-8 md:px-16 py-16 container mx-auto">
      <header className="max-w-4xl mb-24">
        <FadeIn direction="right">
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 italic uppercase">
            TRUST_<span className="text-[var(--accent)]">DECENTRALIZED</span>
          </h1>
          <p className="text-xl text-gray-400 font-sans leading-relaxed">
            In a world of bank runs and centralized exchange failures, HodlOwl provides the ultimate sanctuary for your assets. Our security model is based on the immutable laws of cryptography.
          </p>
        </FadeIn>
      </header>

      <div className="grid md:grid-cols-2 gap-12 mb-24">
        <FadeIn delay={0.2} className="space-y-6">
          <div className="p-8 bg-[var(--cyber-gray)] neon-border border-l-4">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-3">
              <Shield className="text-[var(--accent)]" /> 2FA_ON_CHAIN
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Every lock is a Multi-Sig (2-of-2) contract between you and the Oracle. Only when the Oracle detects the price target can it provide the second signature.
            </p>
          </div>
          <div className="p-8 bg-[var(--cyber-gray)] neon-border border-l-4">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-3">
              <Code className="text-[var(--neon-pink)]" /> AUDITED_BYTECODE
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Our contracts have been audited by three independent firms. The bytecode is public, verified on-chain, and immutable.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="relative group overflow-hidden neon-border">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
            alt="Security Terminal" 
            className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-black/40">
            <Terminal size={48} className="text-[var(--accent)] mb-6 animate-pulse" />
            <h3 className="text-2xl font-display font-bold mb-4">OPEN SOURCE CORE</h3>
            <p className="text-sm font-mono text-gray-400 mb-8 max-w-sm">Verify every line of logic yourself. Transparency is our only defense.</p>
            <button className="flex items-center gap-2 px-6 py-3 border border-[var(--accent)] text-[var(--accent)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all">
              VIEW GITHUB <ExternalLink size={16} />
            </button>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.6} className="bg-[var(--accent)]/[0.05] p-12 border border-[var(--accent)]/[0.2]">
        <h2 className="text-3xl font-display font-bold mb-12 text-center uppercase tracking-widest italic">THE_PROTOCOL_STACK</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "SENDER_PRIVACY", content: "Zero knowledge proof integration for lock states. No one knows your targets unless you choose to share them." },
            { title: "ORACLE_RESILIENCE", content: "Using 5 redundant data sources. If one oracle fails, the others reach consensus. No single point of failure." },
            { title: "BCH_NATIVE", content: "Leveraging Bitcoin Cash's UTXO model for superior contract isolation. No shared contract state, no cross-contract drain attacks." }
          ].map((item, i) => (
            <div key={i} className="text-center space-y-4">
              <Zap className="mx-auto text-[var(--accent)]" size={32} />
              <h4 className="font-display font-bold text-lg">{item.title}</h4>
              <p className="text-xs text-gray-500 font-mono leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
};

export default Security;
