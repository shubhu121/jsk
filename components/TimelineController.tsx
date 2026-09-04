'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Camera,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Milestone {
  time: number;
  label: string;
  sublabel: string;
  icon: string;
}

export const MILESTONES: Milestone[] = [
  { time: 0.0, label: '00:00', sublabel: 'Festive Dawn', icon: '🪔' },
  { time: 2.5, label: '00:02', sublabel: 'Gopalas Arrive', icon: '🏃' },
  { time: 7.0, label: '00:07', sublabel: 'Govinda Pyramid', icon: '🪜' },
  { time: 17.5, label: '00:17', sublabel: 'Handi Break!', icon: '💥' },
  { time: 19.5, label: '00:19', sublabel: 'Celebration Dance', icon: '🥁' },
  { time: 29.0, label: '00:29', sublabel: 'Happy Janmashtami', icon: '✨' },
];

interface TimelineControllerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;
  cameraMode: 'video' | 'orbit' | 'climber' | 'celebration';
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetCameraMode: (mode: 'video' | 'orbit' | 'climber' | 'celebration') => void;
  onReset: () => void;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  currentTime,
  duration,
  isPlaying,
  isMuted,
  playbackRate,
  cameraMode,
  onPlayPause,
  onSeek,
  onToggleMute,
  onSetPlaybackRate,
  onSetCameraMode,
  onReset,
}) => {
  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const ms = Math.floor((secs % 1) * 10);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${m.toString().padStart(2, '0')}:${remS.toString().padStart(2, '0')}.${ms}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 p-4 md:p-5 shadow-lg shadow-amber-900/5 space-y-4"
      id="timeline-controller-panel"
    >
      {/* Milestone Chapters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MILESTONES.map((m, idx) => {
          const isActive =
            currentTime >= m.time &&
            (idx === MILESTONES.length - 1 || currentTime < MILESTONES[idx + 1].time);

          return (
            <button
              key={m.label}
              id={`milestone-btn-${idx}`}
              onClick={() => onSeek(m.time)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-all border ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                  : 'bg-amber-50/70 text-amber-950 hover:bg-amber-100/80 border-amber-200/60'
              }`}
            >
              <span className="text-base select-none">{m.icon}</span>
              <div className="min-w-0">
                <div className={`text-[11px] font-bold ${isActive ? 'text-amber-100' : 'text-amber-700'}`}>
                  {m.label}
                </div>
                <div className="text-xs font-semibold truncate">{m.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Slider with Timestamp tooltips */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono text-xs font-bold">
              {formatTime(currentTime)}
            </span>
            <span className="text-slate-500 text-[11px]">/ {formatTime(duration)}</span>
          </div>

          <div className="text-[11px] text-amber-800/80 font-medium">
            {currentTime < 2.0 && 'Phase 0: Scenic Dawn'}
            {currentTime >= 2.0 && currentTime < 6.5 && 'Phase 1: Gopalas Rushing In'}
            {currentTime >= 6.5 && currentTime < 16.5 && 'Phase 2: Building Human Pyramid'}
            {currentTime >= 16.5 && currentTime < 18.5 && 'Phase 3: Breaking the Dahi Handi!'}
            {currentTime >= 18.5 && 'Phase 4: Celebration Dance & Music'}
          </div>
        </div>

        {/* Custom Styled Range Slider */}
        <div className="relative group flex items-center">
          <input
            id="video-timeline-scrubber"
            type="range"
            min="0"
            max={duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            style={{
              background: `linear-gradient(to right, #d97706 ${progressPercent}%, #fef3c7 ${progressPercent}%)`,
            }}
          />
        </div>
      </div>

      {/* Controls & Quick Views Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-100">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            id="rewind-step-btn"
            onClick={() => onSeek(Math.max(0, currentTime - 1.0))}
            title="Step Back 1s"
            className="p-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition active:scale-95"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            id="play-pause-btn"
            onClick={onPlayPause}
            title={isPlaying ? 'Pause Animation' : 'Play Video Timeline'}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 active:scale-95 transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play Video</span>
              </>
            )}
          </button>

          <button
            id="forward-step-btn"
            onClick={() => onSeek(Math.min(duration, currentTime + 1.0))}
            title="Step Forward 1s"
            className="p-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            id="reset-btn"
            onClick={onReset}
            title="Replay from start"
            className="p-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center space-x-1 bg-amber-50 p-1 rounded-xl border border-amber-200/70">
          {[0.5, 1.0, 1.5].map((rate) => (
            <button
              key={rate}
              id={`playback-rate-${rate}`}
              onClick={() => onSetPlaybackRate(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                playbackRate === rate
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Camera Views Selection */}
        <div className="flex items-center space-x-1.5 bg-amber-50/90 p-1 rounded-xl border border-amber-200/70 text-xs">
          <span className="text-[11px] font-bold text-amber-800 px-1.5 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" /> Cam:
          </span>
          <button
            id="cam-video-btn"
            onClick={() => onSetCameraMode('video')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              cameraMode === 'video'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            🎬 Video
          </button>
          <button
            id="cam-orbit-btn"
            onClick={() => onSetCameraMode('orbit')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              cameraMode === 'orbit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            🔄 3D Free
          </button>
          <button
            id="cam-climber-btn"
            onClick={() => onSetCameraMode('climber')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              cameraMode === 'climber'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            🧗 Climber
          </button>
          <button
            id="cam-celebration-btn"
            onClick={() => onSetCameraMode('celebration')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              cameraMode === 'celebration'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            🥁 Dance
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          id="audio-toggle-btn"
          onClick={onToggleMute}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
            isMuted
              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
          }`}
          title={isMuted ? 'Unmute Dholak, Flute & Chants' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
          <span>{isMuted ? 'Audio Off' : 'Festive Audio'}</span>
        </button>
      </div>
    </div>
  );
};
