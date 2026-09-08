/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { FileCode, FileText, KeyRound, Radio, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { TranslationSet } from '../utils/i18n';

interface FlowchartProps {
  t: TranslationSet;
  isRtl?: boolean;
}

export default function Flowchart({ t, isRtl = false }: FlowchartProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: t.flowCarrier,
      desc: t.step1Desc,
      icon: Radio,
      color: 'from-blue-50/60 to-blue-100/30 dark:from-blue-950/15 dark:to-blue-900/10',
      border: 'border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'shadow-blue-500/5 dark:shadow-blue-500/10',
      details: t.flowStep1Details
    },
    {
      id: 2,
      title: t.flowSecret,
      desc: t.step2Desc,
      icon: FileCode,
      color: 'from-amber-50/60 to-amber-100/30 dark:from-amber-950/15 dark:to-amber-900/10',
      border: 'border-amber-250 dark:border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-500/5 dark:shadow-amber-500/10',
      details: t.flowStep2Details
    },
    {
      id: 3,
      title: t.flowKey,
      desc: t.step3Desc,
      icon: KeyRound,
      color: 'from-cyan-50/60 to-cyan-100/30 dark:from-cyan-950/15 dark:to-cyan-900/10',
      border: 'border-cyan-200 dark:border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      glow: 'shadow-cyan-500/5 dark:shadow-cyan-500/10',
      details: t.flowStep3Details
    },
    {
      id: 4,
      title: t.flowOutput,
      desc: t.step4Desc,
      icon: FileText,
      color: 'from-emerald-50/60 to-emerald-100/30 dark:from-emerald-950/15 dark:to-emerald-900/10',
      border: 'border-emerald-250 dark:border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-500/5 dark:shadow-emerald-500/10',
      details: t.flowStep4Details
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6" id="flowchart-panel">
      <div className="flex flex-col gap-1.5 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-emerald-400 font-display uppercase flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-500" />
          {t.flowTitle}
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          {t.flowSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isSelected = activeStep === step.id;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Connector arrows for larger devices */}
              {idx < 3 && (
                <div className={`hidden md:block absolute top-10 z-10 text-gray-300 dark:text-zinc-700 ${
                  isRtl ? '-left-3 -translate-x-1/2' : '-right-3 translate-x-1/2'
                }`}>
                  <ArrowRight className={`w-4 h-4 animate-pulse text-emerald-500/40 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              )}

              <motion.button
                id={`flow-step-${step.id}`}
                onClick={() => setActiveStep(isSelected ? null : step.id)}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-full p-4 rounded-xl border bg-gradient-to-b ${step.color} ${step.border} ${step.glow} text-start cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-md ring-emerald-500/20 hover:ring-2`}
              >
                {/* Tech grid decoration inside card */}
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(rgba(0,0,0,0)_1px,rgba(255,255,255,0.01)_1px)] bg-[size:100%_4px] opacity-20 pointer-events-none" />

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/70 dark:bg-black/40 border ${step.border} ${step.text}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-widest font-display uppercase text-gray-900 dark:text-zinc-200">
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                      {t.flowPhase}0{step.id}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-gray-600 dark:text-zinc-400">
                  {step.desc}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-t border-zinc-205 dark:border-emerald-500/10 pt-2">
                  <span>{t.flowNodeState}</span>
                  <span className="font-extrabold">{isSelected ? t.flowCollapse : t.flowExpand}</span>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Expanded details sector */}
      <div className="min-h-12">
        {activeStep !== null ? (
          <motion.div
            id="flow-details-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-zinc-200 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <h5 className="text-xs font-bold tracking-widest font-mono uppercase text-emerald-700 dark:text-emerald-400">
                {t.flowNodeMetrics} {activeStep}
              </h5>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-gray-700 dark:text-zinc-300">
              {steps.find(s => s.id === activeStep)?.details.map((detail, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-emerald-500 select-none inline-block rtl:rotate-180">▶</span>
                  <span className="break-words">{detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-gray-50/10 dark:bg-zinc-900/10 border-dashed text-xs text-zinc-400 select-none font-mono">
            {t.flowNodeSelectPlaceholder}
          </div>
        )}
      </div>
    </div>
  );
}
