import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Smile, 
  HelpCircle, 
  Meh, 
  MessageSquare, 
  Palette, 
  Sliders, 
  Send,
  Terminal,
  Activity
} from 'lucide-react';
import { cyberSpeech } from '../utils/speech';
import { cyberAudio } from '../utils/audio';

export default function ControlPanel({
  expression,
  setExpression,
  theme,
  setTheme,
  isMuted,
  setIsMuted,
  onCustomSpeak,
  isSpeaking,
  hasScanned
}) {
  const [customText, setCustomText] = useState('');

  const expressions = [
    { id: 'neutral', label: 'Neutral', icon: Meh },
    { id: 'smile', label: 'Sonrisa', icon: Smile },
    { id: 'curious', label: 'Curioso', icon: HelpCircle },
    { id: 'speech', label: 'Hablar', icon: MessageSquare }
  ];

  const themes = [
    { id: 'cyan', label: 'Ciber Cyan', color: 'bg-cyan-400' },
    { id: 'emerald', label: 'Esmeralda', color: 'bg-emerald-400' },
    { id: 'violet', label: 'Violeta Neón', color: 'bg-purple-400' },
    { id: 'gold', label: 'Oro Cuántico', color: 'bg-amber-400' }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onCustomSpeak(customText.trim());
  };

  const handleToggleSound = () => {
    const muted = cyberAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-5">
      {/* --- Header / Quick Sound Toggle --- */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-cyber uppercase tracking-wider text-slate-200 font-bold">
            Panel de Control del Agente Humanoide
          </h3>
        </div>
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-lg border transition-all ${
            isMuted 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' 
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
          }`}
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* --- Facial Expression & Gestures Selection --- */}
      <div>
        <label className="text-xs font-cyber tracking-wider text-slate-400 uppercase block mb-2">
          Gestos y Expresiones Faciales:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {expressions.map((item) => {
            const Icon = item.icon;
            const isActive = expression === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setExpression(item.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-mono flex flex-col items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Holographic Theme / Particle Color Matrix --- */}
      <div>
        <label className="text-xs font-cyber tracking-wider text-slate-400 uppercase block mb-2">
          Matriz de Color Holográfica:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-2 px-2 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 text-slate-100 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                    : 'bg-black/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.color} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Custom Voice Interaction / Prompt --- */}
      <div>
        <label className="text-xs font-cyber tracking-wider text-slate-400 uppercase block mb-2">
          Interacción por Voz & Articulación:
        </label>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder='Escribe algo (ej: "Sistemas en línea")...'
            className="flex-1 bg-black/50 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            disabled={isSpeaking || !customText.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hablar</span>
          </button>
        </form>
      </div>

      {/* --- Quick Voice Greeting Playback Button --- */}
      <button
        onClick={() => onCustomSpeak("Hola, ¿en qué puedo servirte?")}
        disabled={isSpeaking}
        className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,242,254,0.15)] disabled:opacity-50"
      >
        <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>Repetir Saludo: "Hola, ¿en qué puedo servirte?"</span>
      </button>

      {/* --- Architecture Footnote --- */}
      <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-1.5 border-t border-slate-800/80">
        <Terminal className="w-3.5 h-3.5 text-cyan-500/70" />
        <span>Three.js WebGL Particle Engine + Web Speech API + Web Audio</span>
      </div>
    </div>
  );
}
