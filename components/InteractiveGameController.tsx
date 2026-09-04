'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Zap, AlertCircle, ArrowUpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { festiveAudio } from '@/lib/audio';

interface InteractiveGameControllerProps {
  step: number; // 0 to 4
  onStepChange: (step: number) => void;
  onReset: () => void;
}

export const InteractiveGameController: React.FC<InteractiveGameControllerProps> = ({
  step,
  onStepChange,
  onReset,
}) => {
  const [balance, setBalance] = useState(50); // 0 to 100
  const [isWobbling, setIsWobbling] = useState(false);
  const [score, setScore] = useState(0);

  // Wobble physics loop when building pyramid (steps 1, 2, 3)
  useEffect(() => {
    if (step >= 1 && step <= 3) {
      const interval = setInterval(() => {
        setBalance((prev) => {
          const shift = (Math.random() - 0.5) * 7;
          const next = Math.max(10, Math.min(90, prev + shift));
          return next;
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleNextStep = () => {
    // Check balance zone (sweet spot: 30 to 70)
    if (balance < 25 || balance > 75) {
      // Tower wobbled!
      setIsWobbling(true);
      festiveAudio.playDholak('ta', 0.5);
      setTimeout(() => setIsWobbling(false), 400);
      // Still allow step but with warning
    } else {
      setScore((s) => s + 250);
    }

    festiveAudio.playStepSound(1 + step * 0.2);
    festiveAudio.playDholak(step % 2 === 0 ? 'dha' : 'tin', 0.7);

    if (step === 3) {
      // About to break Handi!
      festiveAudio.playCheerSound();
      festiveAudio.playPotBreakSound();
      setScore((s) => s + 500);
    }

    onStepChange(step + 1);
  };

  const handleTapBalance = (direction: 'left' | 'right') => {
    setBalance((prev) => {
      const nudge = direction === 'left' ? -8 : 8;
      return Math.max(20, Math.min(80, prev + nudge));
    });
    festiveAudio.playStepSound(1.4);
  };

  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 p-5 shadow-lg shadow-amber-900/5 space-y-4"
      id="interactive-game-controller"
    >
      {/* Header & Step progress */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            🎮 Interactive Game Mode
          </span>
          <h3 className="text-base font-bold text-amber-950 mt-1">
            Build the Govinda Tower & Break the Handi!
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Score: {score}</span>
          </div>
          <button
            onClick={onReset}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: 'Base Tier', desc: '3 Gopalas' },
          { num: 2, title: 'Mid Tier', desc: '2 Gopalas' },
          { num: 3, title: 'Bal Gopal', desc: 'Apex Climb' },
          { num: 4, title: 'Smash Handi!', desc: 'Govinda Aala!' },
        ].map((s, idx) => {
          const isDone = step > idx;
          const isCurrent = step === idx;

          return (
            <div
              key={s.title}
              className={`p-2.5 rounded-xl border text-center transition ${
                isDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : isCurrent
                  ? 'bg-amber-500 border-amber-600 text-white shadow-md'
                  : 'bg-amber-50/50 border-amber-200/60 text-amber-900/60'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isCurrent ? 'bg-white text-amber-600' : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {s.num}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold leading-tight">{s.title}</div>
              <div className={`text-[10px] ${isCurrent ? 'text-amber-100' : 'text-slate-500'}`}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance meter during climbing */}
      {step >= 1 && step <= 3 && (
        <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
          <div className="flex justify-between items-center text-xs font-semibold text-amber-900">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Tower Balance Meter
            </span>
            <span className={balance < 30 || balance > 70 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
              {balance < 30 ? 'Leaning Left!' : balance > 70 ? 'Leaning Right!' : 'Balanced! ✨'}
            </span>
          </div>

          <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            {/* Safe zone in middle */}
            <div className="absolute left-[30%] right-[30%] h-full bg-emerald-300/60" />
            {/* Indicator */}
            <div
              className={`absolute top-0 bottom-0 w-3 rounded-full transition-all duration-100 ${
                balance < 30 || balance > 70 ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-amber-600'
              }`}
              style={{ left: `calc(${balance}% - 6px)` }}
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => handleTapBalance('left')}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 active:scale-95 shadow-xs"
            >
              ◀ Lean Left
            </button>
            <span className="text-[10px] text-amber-800/80">Keep pointer in green zone</span>
            <button
              onClick={() => handleTapBalance('right')}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 active:scale-95 shadow-xs"
            >
              Lean Right ▶
            </button>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      {step < 4 ? (
        <button
          onClick={handleNextStep}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center space-x-2 ${
            step === 3
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
          }`}
        >
          {step === 0 && (
            <>
              <ArrowUpCircle className="w-5 h-5" />
              <span>Step 1: Assemble Base Tier (3 Gopalas)</span>
            </>
          )}
          {step === 1 && (
            <>
              <ArrowUpCircle className="w-5 h-5" />
              <span>Step 2: Stack Second Tier (2 Gopalas)</span>
            </>
          )}
          {step === 2 && (
            <>
              <ArrowUpCircle className="w-5 h-5" />
              <span>Step 3: Send Bal Gopal to the Summit!</span>
            </>
          )}
          {step === 3 && (
            <>
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Step 4: SMASH & BREAK THE DAHI HANDI! 💥</span>
            </>
          )}
        </button>
      ) : (
        <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl text-center space-y-2">
          <div className="text-base font-extrabold text-emerald-900 flex items-center justify-center gap-1.5">
            <span>🎉 Govinda Aala Re! Makhan Splashed! 🎉</span>
          </div>
          <p className="text-xs text-emerald-800">
            You successfully built the human pyramid, climbed to the top, and broke the Matki!
          </p>
          <button
            onClick={onReset}
            className="mt-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
