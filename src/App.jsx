import React, { useState, useEffect } from 'react';
import HumanoidFace3D from './components/HumanoidFace3D';
import NfcScanner from './components/NfcScanner';
import ControlPanel from './components/ControlPanel';
import { cyberSpeech } from './utils/speech';
import { cyberAudio } from './utils/audio';
import { 
  Cpu, 
  Radio, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Terminal,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);

  // Humanoid 3D Face State
  const [isAssembled, setIsAssembled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechIntensity, setSpeechIntensity] = useState(0);
  const [expression, setExpression] = useState('neutral');
  const [theme, setTheme] = useState('cyan');
  const [isMuted, setIsMuted] = useState(false);

  // Holographic Subtitle State
  const [subtitleText, setSubtitleText] = useState('');
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');

  // Setup Cyber Speech Callbacks
  useEffect(() => {
    const unsubscribe = cyberSpeech.subscribe((event, data) => {
      if (event === 'start') {
        setIsSpeaking(true);
      } else if (event === 'articulate') {
        setSpeechIntensity(data.intensity);
      } else if (event === 'end') {
        setIsSpeaking(false);
        setSpeechIntensity(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Typewriter effect for subtitles
  useEffect(() => {
    if (!subtitleText) {
      setDisplayedSubtitle('');
      return;
    }

    let currentIdx = 0;
    setDisplayedSubtitle('');
    const timer = setInterval(() => {
      if (currentIdx < subtitleText.length) {
        setDisplayedSubtitle(subtitleText.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(timer);
      }
    }, 38);

    return () => clearInterval(timer);
  }, [subtitleText]);

  // Trigger NFC Scan Workflow
  const handleScanTrigger = (item) => {
    setIsScanning(true);
    setScannedItem(item);

    // NFC Coupling sequence
    setTimeout(() => {
      cyberAudio.playNfcSuccess();
      setIsScanning(false);
      setHasScanned(true);

      // Trigger Holographic Assembly
      cyberAudio.playHologramActivate();
      setIsAssembled(true);
      setExpression('smile');

      // Delayed Greeting Speech after assembly starts
      setTimeout(() => {
        const greeting = "¡Hola! ¿En qué puedo servirte?";
        setSubtitleText(greeting);
        cyberSpeech.speak(greeting, (speaking) => {
          setIsSpeaking(speaking);
        });
      }, 750);
    }, 700);
  };

  // Custom Speech Trigger
  const handleCustomSpeak = (text) => {
    if (!isAssembled) {
      // If not assembled yet, assemble first!
      setIsAssembled(true);
    }
    setSubtitleText(text);
    setExpression('speech');
    cyberSpeech.speak(text, (speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setExpression('smile');
    });
  };

  // Reset / Disperse Humanoid
  const handleReset = () => {
    cyberAudio.playDisperse();
    cyberSpeech.stop();
    setHasScanned(false);
    setIsAssembled(false);
    setExpression('neutral');
    setSubtitleText('');
    setDisplayedSubtitle('');
    setScannedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 flex flex-col scanline relative selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Top Navigation / Header Bar --- */}
      <header className="border-b border-slate-800/80 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(0,242,254,0.4)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cyber text-sm md:text-base font-black tracking-wider text-slate-100">
                CYBER-NFC <span className="text-cyan-400">HUMANOID AI</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                v2.5 QUANTUM
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Simulador de Escaneo NFC con Partículas & Nodos 3D Articulados
            </p>
          </div>
        </div>

        {/* Top Badges */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NFC RFID 13.56MHz</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Partículas & Nodos WebGL</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Articulación Facial Vocal</span>
          </div>
        </div>
      </header>

      {/* --- Main Application Layout --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: NFC Terminal & Scanner controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
          {/* NFC Induction Terminal Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-xl">
            <NfcScanner
              isScanning={isScanning}
              hasScanned={hasScanned}
              scannedItem={scannedItem}
              onScanTrigger={handleScanTrigger}
              onReset={handleReset}
            />
          </div>

          {/* Control Panel (Expressions, Themes, Voice) */}
          <ControlPanel
            expression={expression}
            setExpression={setExpression}
            theme={theme}
            setTheme={setTheme}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onCustomSpeak={handleCustomSpeak}
            isSpeaking={isSpeaking}
            hasScanned={hasScanned}
          />
        </div>

        {/* Right Column: 3D Holographic Humanoid Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 order-1 lg:order-2">
          {/* Main 3D Viewport Box */}
          <div className="glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden relative min-h-[520px] h-[520px] md:h-[600px] shadow-[0_0_50px_rgba(0,242,254,0.15)] flex flex-col">
            
            {/* Top Viewport Telemetry Header */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAssembled ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-cyber text-xs tracking-wider uppercase text-slate-200">
                  VISUALIZADOR HOLOGRÁFICO 3D
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-400/90 bg-black/50 px-2.5 py-1 rounded border border-cyan-500/20 backdrop-blur-sm">
                PARALLAX: SEGUIMIENTO DE CURSOR ACTIVO
              </div>
            </div>

            {/* Three.js 3D Humanoid Face Canvas */}
            <div className="flex-1 w-full h-full">
              <HumanoidFace3D
                isAssembled={isAssembled}
                isSpeaking={isSpeaking}
                speechIntensity={speechIntensity}
                expression={expression}
                theme={theme}
                connectionDistance={0.32}
              />
            </div>

            {/* Holographic Speech Subtitle Bubble */}
            {displayedSubtitle && (
              <div className="absolute bottom-6 inset-x-6 z-20 flex justify-center pointer-events-none">
                <div className="max-w-lg w-full bg-black/85 border border-cyan-400/70 p-4 rounded-xl shadow-[0_0_30px_rgba(0,242,254,0.35)] backdrop-blur-lg flex items-center gap-3 animate-fade-in">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                      HUMANOID AUDIO TRANSCRIPT
                    </p>
                    <p className="text-base md:text-lg font-cyber font-bold text-slate-100 glow-cyan-text">
                      "{displayedSubtitle}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Idle Call-to-Action Overlay when NOT assembled */}
            {!isAssembled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none bg-black/30 backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 animate-bounce shadow-[0_0_25px_rgba(0,242,254,0.2)]">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-cyber text-lg md:text-xl font-bold text-slate-100 tracking-wide">
                  AGENTE HOLOGRÁFICO EN ESTADO CUÁNTICO
                </h3>
                <p className="text-xs md:text-sm text-slate-400 font-mono max-w-md mt-2">
                  Acerca una tecnología NFC (tarjeta, chip subdermal o llavero) en el lector izquierdo para acoplar la frecuencia y ensamblar la forma humanoide 3D.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Live System Telemetry Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Estado de Enlace</p>
                <p className="font-semibold text-slate-200">
                  {hasScanned ? 'SINCRONIZADO' : 'STANDBY'}
                </p>
              </div>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Articulación 3D</p>
                <p className="font-semibold text-slate-200">
                  {isSpeaking ? 'HABLANDO' : isAssembled ? 'ACTIVA (PARPADEO)' : 'DISPERSA'}
                </p>
              </div>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Frecuencia Portadora</p>
                <p className="font-semibold text-slate-200">13.56 MHz RFID</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* --- Footer Status Strip --- */}
      <footer className="border-t border-slate-800/80 bg-black/60 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Tecnología: React 18 + Tailwind CSS + Three.js Node Particle Lattice + Web Speech & Web Audio APIs</span>
        </div>
        <div>
          <span>Simulación NFC & Agente Humanoide 3D Interactivo</span>
        </div>
      </footer>
    </div>
  );
}
