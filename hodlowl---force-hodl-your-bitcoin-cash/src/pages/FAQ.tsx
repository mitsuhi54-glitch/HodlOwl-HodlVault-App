import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FadeIn } from '../components/FadeIn';

const faqData = [
  {
    question: "WHAT HAPPENS IF THE HODLOWL WEBSITE GOES DOWN?",
    answer: "The smart contracts live on the BCH blockchain, not our servers. You can interact with your locks through any BCH wallet that supports CashTokens or generic smart contract calls. Your funds are decentralized."
  },
  {
    question: "CAN I UNLOCK MY FUNDS EARLY IN AN EMERGENCY?",
    answer: "No. The purpose of HodlOwl is to eliminate emotional decisions. Once the lock is deployed, the funds are cryptographically inaccessible until the price target or the time duration is met. There are no admin keys."
  },
  {
    question: "HOW DOES HODLOWL KNOW THE BITCOIN CASH PRICE?",
    answer: "We use a decentralized oracle network. Multiple price feeds are aggregated to prevent manipulation. Only when the consensus price hits your target will the contract provide the unlock signature."
  },
  {
    question: "ARE THERE ANY FEES?",
    answer: "We charge a small protocol fee (0.5%) upon creation of a lock. This goes towards maintaining the oracle network and developing further stasis primitives."
  },
  {
    question: "IS THIS AVAILABLE FOR OTHER CRYPTOCURRENCIES?",
    answer: "Currently, we focus exclusively on Bitcoin Cash due to its robust UTXO-based smart contract capabilities and low transaction fees. We believe in the mission of BCH."
  }
];

const AccordionItem: React.FC<{ question: string, answer: string, isOpen: boolean, toggle: () => void }> = ({ question, answer, isOpen, toggle }) => {
  return (
    <div className={`border border-[var(--cyber-gray)] mb-4 transition-all duration-300 ${isOpen ? 'neon-border bg-[var(--cyber-gray)]/[0.3]' : 'bg-[var(--cyber-gray)]/[0.1]'}`}>
      <button 
        onClick={toggle}
        className="w-full p-6 flex justify-between items-center text-left"
      >
        <span className="font-display font-bold tracking-wider text-sm md:text-base">{question}</span>
        {isOpen ? <Minus className="text-[var(--accent)]" /> : <Plus className="text-gray-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-[var(--cyber-gray)] m-4 mt-0 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="px-8 md:px-16 py-16 container mx-auto max-w-4xl">
      <FadeIn className="text-center mb-16">
        <div className="inline-flex items-center gap-4 text-[var(--accent)] mb-4 font-mono text-xs tracking-[0.3em] uppercase">
          <HelpCircle size={16} />
          INTEL_BASE
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-4 italic uppercase">SYSTEM_FAQ</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Everything you need to know about the stasis protocol and the future of BCH.</p>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="space-y-4">
          {faqData.map((item, i) => (
            <AccordionItem 
              key={i} 
              question={item.question} 
              answer={item.answer} 
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.4} className="mt-16 text-center">
        <p className="text-sm text-gray-500 font-mono italic">STILL HAVE QUESTIONS? CONTACT THE COMM_CORE VIA DISCORD.</p>
      </FadeIn>
    </div>
  );
};

export default FAQ;
