'use client';

import React from 'react';
import { Film, CheckCircle, Sparkles, X } from 'lucide-react';

interface FrameDetail {
  timestamp: string;
  seconds: number;
  title: string;
  sceneSummary: string;
  visualSymbols: string;
  threeJsImplementation: string;
  palette: string[];
}

export const VIDEO_FRAME_ANALYSIS: FrameDetail[] = [
  {
    timestamp: '00:00 - 00:01',
    seconds: 0.0,
    title: 'Festive Garland & Sacred Dahi Handi',
    sceneSummary:
      'The video opens on an immaculate warm off-white canvas with a vibrant horizontal floral Toran. Green mango leaves and multicolored flowers hang gracefully across the top, while the red clay Dahi Handi pot rests suspended in the center.',
    visualSymbols: 'Toran (prosperity), Terracotta Matki (devotion, makhan), Hanging Jute Ropes.',
    threeJsImplementation:
      'LatheGeometry for the earthenware pot, CatmullRomCurve3 catenary sag for the garland rope, directional rim light, and soft shadow plane.',
    palette: ['#F8F8F2', '#BA372A', '#C49A45', '#2E5C38', '#1E88E5'],
  },
  {
    timestamp: '00:02 - 00:06',
    seconds: 2.5,
    title: 'Gopalas Rush & Congregate',
    sceneSummary:
      'Cute chibi Gopalas in bright joyful colors (Yellow, Cyan Blue, Orange-Red, Violet, Green) sprint into the frame from stage right with buoyant leaps, waving their arms excitedly beneath the Handi.',
    visualSymbols: 'Balgopal friends (fellowship, shared devotion, infectious joy).',
    threeJsImplementation:
      'Procedural chibi rigs with articulated shoulder/hip pivot groups, running gait harmonic sin() cycles, and dynamic facial expression rigs.',
    palette: ['#F5B014', '#38BDF8', '#EF4444', '#AB47BC', '#84CC16'],
  },
  {
    timestamp: '00:07 - 00:16',
    seconds: 7.0,
    title: 'Govinda Human Pyramid (The Stacking)',
    sceneSummary:
      'The Gopalas chant "Govinda! Govinda!" in cadence with festive dholak beats. A sturdy 3-tier pyramid rises: Yellow, Green, and Red form the strong base; Purple and Amber climb to the second tier; and Blue Bal Gopal scales to the apex.',
    visualSymbols: 'Human pyramid (unity, teamwork, rising higher through collective strength).',
    threeJsImplementation:
      'Multi-tiered hierarchy positioning with harmonic tower wobble physics, climbing step cycles, and synchronized Dholak audio synthesis.',
    palette: ['#F5B014', '#38BDF8', '#EF4444', '#F59E0B', '#78350F'],
  },
  {
    timestamp: '00:17 - 00:18',
    seconds: 17.5,
    title: 'The Handi Breaks! (Makhan Explosion)',
    sceneSummary:
      'Bal Gopal stretches upward and strikes the Dahi Handi! The earthen pot fractures into flying shards as white creamy makhan, golden blossoms, and celebratory sparks shower down.',
    visualSymbols: 'Breaking the Matki (release of divine grace, sweetness of devotion, victory).',
    threeJsImplementation:
      '3D fragment shatter with radial velocity vectors, downward gravity physics, white curd droplet splatters, and synthesizer audio impact.',
    palette: ['#FFFFFF', '#BA372A', '#FACC15', '#F59E0B'],
  },
  {
    timestamp: '00:19 - 00:29',
    seconds: 19.5,
    title: 'Grand Celebration, Dholak & Happy Janmashtami',
    sceneSummary:
      'The Gopalas land safely on the ground and perform an exuberant Janmashtami dance! The Purple Gopala plays the Dholak rhythmically while others dance with raised hands, as "Happy Janmashtami" emerges with glowing aura rays.',
    visualSymbols: 'Folk Dholak music, victory dance, festive blessings.',
    threeJsImplementation:
      'Drummer arm reciprocation, synchronized line dance cycles, 350-particle confetti vortex, and 3D glowing aura sunburst typography.',
    palette: ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#FEF08A'],
  },
];

interface FrameAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTime: (time: number) => void;
}

export const FrameAnalysisDrawer: React.FC<FrameAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  onJumpToTime,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      id="frame-analysis-modal"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-amber-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/70">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-amber-950">
              Frame-by-Frame Video Analysis & 3D Conversion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Here is the breakdown of the uploaded Janmashtami video animation, detailing how every scene,
            character movement, physical reaction, and festive element was translated into real-time
            Three.js WebGL rendering:
          </p>

          <div className="space-y-3">
            {VIDEO_FRAME_ANALYSIS.map((frame, idx) => (
              <div
                key={frame.timestamp}
                className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-mono text-xs font-bold">
                      {frame.timestamp}
                    </span>
                    <h3 className="text-xs font-bold text-amber-950">{frame.title}</h3>
                  </div>

                  <button
                    onClick={() => {
                      onJumpToTime(frame.seconds);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
                  >
                    Jump to Scene
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{frame.sceneSummary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      Cultural & Visual Symbols:
                    </span>
                    <span className="text-slate-600">{frame.visualSymbols}</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      Three.js / WebGL Technical Detail:
                    </span>
                    <span className="text-slate-600">{frame.threeJsImplementation}</span>
                  </div>
                </div>

                {/* Color Palette Pill row */}
                <div className="flex items-center space-x-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Palette:</span>
                  {frame.palette.map((color, cIdx) => (
                    <span
                      key={cIdx}
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs inline-block"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-amber-100 bg-amber-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
