'use client';

import React, { useState } from 'react';
import { Heart, Share2, Copy, Check, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { festiveAudio } from '@/lib/audio';

const BLESSINGS = [
  'May Lord Krishna shower his divine love, joy, and peace upon you and your loved ones on this holy day of Shri Krishna Janmashtami! 🪔✨',
  'May the melodious tunes of Krishna’s flute remove all sadness and fill your life with eternal happiness and prosperity! 🪈💛',
  'May the sweetness of makhan and misri bring boundless joy to your home. Wishing you a thrilling and blessed Dahi Handi celebration! 🍯🌟',
  'May Kanha bless you with immense courage, wisdom, and boundless devotion. Happy Shri Krishna Janmashtami! 🙏🦚',
];

export const JanmashtamiGreetingCard: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [selectedBlessing, setSelectedBlessing] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🌸 *Happy Shri Krishna Janmashtami* 🌸\n${
      recipient ? `Dearest ${recipient},\n\n` : ''
    }${BLESSINGS[selectedBlessing]}\n\nJai Shri Krishna! 🙏🦚✨`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    festiveAudio.playTempleBell(2000, 0.5);

    // Fire festive celebration confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#EF4444', '#38BDF8', '#10B981', '#FEF08A'],
    });

    setTimeout(() => setCopied(false), 2500);
  };

  const handleCelebrateBurst = () => {
    festiveAudio.playCheerSound();
    festiveAudio.playTempleBell(2200, 0.6);
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#38BDF8', '#10B981', '#FEF08A'],
    });
  };

  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 p-5 shadow-lg shadow-amber-900/5 space-y-4"
      id="janmashtami-greeting-panel"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-amber-950">
            Personalized Janmashtami Blessing & Share
          </h3>
        </div>

        <button
          onClick={handleCelebrateBurst}
          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition flex items-center gap-1 shadow-xs"
        >
          <span>Flower Shower 🌸</span>
        </button>
      </div>

      {/* Recipient Input */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-amber-900 block">
          To (Family / Friend Name):
        </label>
        <input
          id="greeting-recipient-input"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="e.g., Shubhendu & Family"
          className="w-full px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Blessing selector pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-amber-900 block">Choose a Blessing:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {BLESSINGS.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedBlessing(idx)}
              className={`p-2 rounded-xl text-left text-[11px] font-medium border transition ${
                selectedBlessing === idx
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50/50 text-amber-950 hover:bg-amber-100/70 border-amber-200/60'
              }`}
            >
              <div className="truncate font-semibold">Blessing {idx + 1}</div>
              <div
                className={`truncate text-[10px] ${
                  selectedBlessing === idx ? 'text-amber-100' : 'text-slate-500'
                }`}
              >
                {b}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 via-amber-100/40 to-orange-50 border border-amber-200/90 text-center space-y-1.5 shadow-inner">
        <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-800">
          ✦ Shri Krishna Janmashtami ✦
        </div>
        {recipient && (
          <div className="text-xs font-bold text-amber-950">Dearest {recipient},</div>
        )}
        <p className="text-xs text-amber-900/90 italic leading-relaxed">
          &ldquo;{BLESSINGS[selectedBlessing]}&rdquo;
        </p>
        <div className="text-[11px] font-semibold text-amber-800 pt-1">
          Radhe Radhe • Jai Shri Krishna 🙏🦚
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          id="copy-greeting-btn"
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied Blessing!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Greeting</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
