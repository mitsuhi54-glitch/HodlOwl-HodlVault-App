import React from 'react';
import { FadeIn } from '../components/FadeIn';
import { Lock, TrendingUp, DollarSign, Wallet, ArrowRight, Info } from 'lucide-react';

/**
 * Terminal Interface for smart contract interaction.
 * Allows users to create new "POD" locks or view active stasis units.
 * Security Note: All operations are non-custodial and occur on-chain via Bitcoin Cash CashTokens.
 */
const Dashboard: React.FC = () => {
  return (
    <div className="px-8 md:px-16 py-12 container mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[var(--cyber-gray)] pb-8">
        <div>
          <FadeIn direction="right">
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-2 italic uppercase">DASHBOARD_<span className="text-[var(--accent)]">ROOT</span></h1>
            <p className="text-[10px] font-mono text-gray-500 tracking-[0.3em]">SECURE ACCESS POINT // TERMINAL 08</p>
          </FadeIn>
        </div>
        <FadeIn direction="left" className="flex gap-4">
          <div className="bg-[var(--cyber-gray)] p-4 neon-border flex items-center gap-4 min-w-[200px]">
            <Wallet className="text-[var(--accent)]" size={20} />
            <div className="text-left">
              <p className="text-[8px] font-mono opacity-50 uppercase">WALLET_BALANCE</p>
              <p className="font-display font-bold">1,240.45 BCH</p>
            </div>
          </div>
          <div className="bg-[var(--cyber-gray)] p-4 neon-border flex items-center gap-4 min-w-[200px]">
            <TrendingUp className="text-[var(--accent)]" size={20} />
            <div className="text-left">
              <p className="text-[8px] font-mono opacity-50 uppercase">BCH_PRICE</p>
              <p className="font-display font-bold">$482.12 <span className="text-green-500 text-[10px] font-mono">+4.2%</span></p>
            </div>
          </div>
        </FadeIn>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Lock Form */}
        <FadeIn className="lg:col-span-1 space-y-8">
          <div className="neon-border bg-[var(--cyber-gray)] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--accent)] opacity-10 rotate-45 translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
              <Lock size={24} className="text-[var(--accent)]" /> 
              NEW_FORCE_LOCK
            </h2>
            
            <form className="space-y-6">
              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-2 uppercase tracking-widest">AMOUNT (BCH)</label>
                <div className="relative">
                  <input type="number" placeholder="0.00" className="w-full bg-black/40 border border-gray-700 p-4 font-mono focus:border-[var(--accent)] focus:outline-none transition-colors" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs opacity-50">MAX</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-2 uppercase tracking-widest">PRICE_TARGET (USD/BCH)</label>
                <input type="number" placeholder="500.00" className="w-full bg-black/40 border border-gray-700 p-4 font-mono focus:border-[var(--accent)] focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-2 uppercase tracking-widest">MIN_DURATION (DAYS)</label>
                <select className="w-full bg-black/40 border border-gray-700 p-4 font-mono focus:border-[var(--accent)] focus:outline-none transition-colors appearance-none">
                  <option>30 DAYS</option>
                  <option>90 DAYS</option>
                  <option>180 DAYS</option>
                  <option>365 DAYS</option>
                </select>
              </div>

              <div className="bg-black/20 p-4 border-l-4 border-[var(--accent)] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-50 uppercase">ORACLE_FEE</span>
                  <span>0.005 BCH</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-50 uppercase">TARGET_REACH_GAS</span>
                  <span>ESTIMATED</span>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-[var(--accent)] text-black font-bold font-display uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                DEPLOY_SMART_LOCK
              </button>
            </form>
          </div>

          <div className="p-6 border border-gray-800 flex items-start gap-4">
            <Info className="text-gray-500 flex-shrink-0" size={20} />
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              WARNING: FUNDS LOCKED VIA THIS INTERFACE CANNOT BE ACCESSED UNTIL THE ORACLE CONFIRMS THE PRICE TARGET HAS BEEN MET OR THE DURATION EXPIRES. NO EXCEPTIONS OR BACKDOORS EXIST.
            </p>
          </div>
        </FadeIn>

        {/* Locks Table */}
        <div className="lg:col-span-2 space-y-8">
          <FadeIn delay={0.2}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight">ACTIVE_STASIS_PODS</h2>
              <span className="text-[10px] font-mono bg-green-500/10 text-green-500 px-3 py-1 border border-green-500/20">3 LOCKS ACTIVE</span>
            </div>

            <div className="space-y-4">
              {[
                { id: 'POD_x882', amount: 45.2, target: 1200, progress: 40, status: 'LOCKED', date: '2023-12-15' },
                { id: 'POD_x921', amount: 12.5, target: 800, progress: 65, status: 'LOCKED', date: '2024-01-10' },
                { id: 'POD_A104', amount: 100, target: 3500, progress: 14, status: 'LOCKED', date: '2024-02-05' },
              ].map((lock, i) => (
                <div key={lock.id} className="bg-[var(--cyber-gray)] p-6 border-l-4 border-[var(--accent)] hover:translate-x-2 transition-transform duration-300">
                  <div className="flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black flex items-center justify-center font-display font-bold text-[var(--accent)] text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500">ID: {lock.id}</p>
                        <p className="font-display font-bold text-lg">{lock.amount} BCH</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">TARGET_PROGRESS</span>
                        <span className="text-[10px] font-mono text-[var(--accent)]">{lock.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-black/40">
                        <div 
                          className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] transition-all duration-1000" 
                          style={{ width: `${lock.progress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] font-mono text-gray-500 uppercase">TARGET_PRICE</p>
                      <p className="font-display font-bold text-[var(--accent)]">${lock.target}</p>
                    </div>

                    <div className="flex gap-4">
                      <button className="p-3 border border-gray-700 opacity-50 hover:opacity-100 transition-opacity">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="p-8 border border-dashed border-gray-700 text-center">
              <h3 className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-4">COMPLETED_HISTORY</h3>
              <div className="flex justify-center gap-8 text-[10px] font-mono text-gray-600">
                <span>05 TOTAL SETTLED</span>
                <span>450.2 BCH DISTRIBUTED</span>
                <span>$1.2M GAINS REALIZED</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
