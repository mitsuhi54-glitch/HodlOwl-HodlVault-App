import React from 'react';
import { FadeIn } from '../components/FadeIn';
import { Mail, MapPin, Globe, Cpu, Users, Layers } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="px-8 md:px-16 py-16 container mx-auto">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <FadeIn direction="right">
            <div className="inline-block px-3 py-1 bg-[var(--neon-pink)]/[0.1] border border-[var(--neon-pink)] text-[var(--neon-pink)] text-xs font-mono mb-6">
              EST. 2024 // SECTOR 7
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 italic uppercase leading-none">
              WHO_IS <br />
              <span className="text-[var(--accent)] neon-text">HODLOWL?</span>
            </h1>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                We started in 2024 with a simple observation: humans are bad at holding through volatility. We sell the bottom and buy the top. We let fear and greed dictate our financial fate.
              </p>
              <p>
                <span className="text-[var(--accent)] font-bold">HODLOWL</span> was built to fix this. By moving trust from people to code, we've created a stais protocol that forces discipline.
              </p>
              <p>
                Our mission is to make Bitcoin Cash the ultimate store of value through cryptographic commitment. No more paper hands. Only diamond code.
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FadeIn delay={0.2} className="aspect-square bg-[var(--cyber-gray)] neon-border p-8 flex flex-col justify-end">
            <Cpu className="mb-4 text-[var(--accent)]" size={32} />
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter">DECENTRALIZED</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-2">NO CENTRAL_AUTH</p>
          </FadeIn>
          <FadeIn delay={0.3} className="aspect-square bg-[var(--cyber-gray)] neon-border p-8 flex flex-col justify-end">
            <Users className="mb-4 text-[var(--neon-pink)]" size={32} />
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter">COMMUNITY</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-2">USER_DRIVEN</p>
          </FadeIn>
          <FadeIn delay={0.4} className="aspect-square bg-[var(--cyber-gray)] neon-border p-8 flex flex-col justify-end">
            <Layers className="mb-4 text-[var(--neon-yellow)]" size={32} />
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter">SCALABLE</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-2">UTXO_OPTIMIZED</p>
          </FadeIn>
          <FadeIn delay={0.5} className="aspect-square bg-[var(--cyber-gray)] neon-border p-8 flex flex-col justify-end">
            <Globe className="mb-4 text-[var(--accent)]" size={32} />
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter">GLOBAL</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-2">BORDERS_REMOVED</p>
          </FadeIn>
        </div>
      </div>

      <section className="mt-32 py-24 border-t border-[var(--cyber-gray)]">
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold uppercase tracking-widest italic">CONTACT_CORE</h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-12 text-center">
          <FadeIn delay={0.2}>
            <div className="mb-4 flex justify-center"><Mail className="text-[var(--accent)]" /></div>
            <h4 className="font-bold mb-2">COMMUNICATIONS</h4>
            <p className="text-sm font-mono text-gray-500">INTEL@HODLOWL.SYS</p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mb-4 flex justify-center"><MapPin className="text-[var(--accent)]" /></div>
            <h4 className="font-bold mb-2">DISTRICT</h4>
            <p className="text-sm font-mono text-gray-500">DECENTRALIZED_VOID</p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="mb-4 flex justify-center"><Twitter className="text-[var(--accent)]" /></div>
            <h4 className="font-bold mb-2">NETWORK</h4>
            <p className="text-sm font-mono text-gray-500">@HODLOWL_PROTOCOL</p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default About;
