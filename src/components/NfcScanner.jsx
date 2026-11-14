import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Cpu, 
  Key, 
  Smartphone, 
  Radio, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Wifi,
  Sparkles
} from 'lucide-react';
import { cyberAudio } from '../utils/audio';

const NFC_ITEMS = [
  {
    id: 'cyber-card',
    name: 'NTAG-215 CyberCard',
    type: 'Smart Card ISO 14443-A',
    uid: '04:8F:A2:3B:5C:88:90',
    frequency: '13.56 MHz',
    capacity: '504 Bytes',
    payload: 'AI-CORE-HUMANOID:INIT_SEQUENCE_SIG_ALPHA',
    icon: CreditCard,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400'
  },
  {
    id: 'bio-implant',
    name: 'Bio-Subdermal Chip',
    type: 'Biocompatible RFID Capsule',
    uid: 'E0:04:01:A0:5B:C2:19',
    frequency: '13.56 MHz / NFC Type 2',
    capacity: '888 Bytes',
    payload: 'BIOMETRIC_IDENT:HUMANOID_SYNAPSE_LINK',
    icon: Cpu,
    color: 'from-emerald-400 to-teal-600',
    borderColor: 'border-emerald-400'
  },
  {
    id: 'key-fob',
    name: 'Quantum Key Fob',
    type: 'MIFARE DESFire EV3',
    uid: '1A:77:C3:90:22:DF:44',
    frequency: '13.56 MHz',
    capacity: '4096 Bytes',
    payload: 'SECURITY_TOKEN:QUANTUM_NEURAL_OVERRIDE',
    icon: Key,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400'
  },
  {
    id: 'phone-wallet',
    name: 'Mobile Cyber Wallet',
    type: 'Host Card Emulation (HCE)',
    uid: '80:12:34:56:78:9A:BC',
    frequency: '13.56 MHz',
    capacity: 'Dynamic Cloud',
    payload: 'MOBILE_NFC_TAP:GREETING_PROTOCOL_START',
    icon: Smartphone,
    color: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-400'
  }
];

export default function NfcScanner({
  isScanning,
  hasScanned,
  scannedItem,
  onScanTrigger,
  onReset
}) {
  const [selectedTech, setSelectedTech] = useState(NFC_ITEMS[0]);
  const [isHoveringPad, setIsHoveringPad] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hardwareNfcSupported, setHardwareNfcSupported] = useState(false);
  const [hardwareNfcListening, setHardwareNfcListening] = useState(false);
  const [readoutLog, setReadoutLog] = useState([]);

  // Check Web NFC API support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window && typeof window.NDEFReader === 'function') {
      setHardwareNfcSupported(true);
    }
  }, []);

  // Listen for real physical NFC tap if user is on compatible device
  const toggleHardwareNfc = async () => {
    if (typeof window === 'undefined' || !('NDEFReader' in window) || typeof window.NDEFReader !== 'function') {
      alert('La API Web NFC solo está disponible en navegadores compatibles (como Chrome en Android) con chip NFC activado.');
      return;
    }

    try {
      if (hardwareNfcListening) {
        setHardwareNfcListening(false);
        return;
      }

      const ndef = Reflect.construct(window.NDEFReader, []);
      await ndef.scan();
      setHardwareNfcListening(true);
      cyberAudio.playNfcTap();

      ndef.onreading = (event) => {
        cyberAudio.playNfcSuccess();
        const customItem = {
          id: 'real-hardware-nfc',
          name: 'Tarjeta NFC Física Detectada',
          type: 'Hardware Real NDEF Tag',
          uid: event.serialNumber || '04:XX:REAL:TAG:UID',
          frequency: '13.56 MHz RF Field',
          capacity: 'Variable',
          payload: `Tag Records: ${event.message.records.length} detectados`,
          icon: Radio,
          color: 'from-cyan-400 to-emerald-500',
          borderColor: 'border-cyan-400'
        };
        onScanTrigger(customItem);
      };

      ndef.onreadingerror = () => {
        alert('Error al leer el tag NFC físico.');
      };
    } catch (error) {
      console.error('Error starting Web NFC:', error);
      alert('No se pudo iniciar el escáner NFC: ' + error.message);
    }
  };

  const handleSimulateScan = (techToScan = selectedTech) => {
    if (isScanning) return;
    cyberAudio.playNfcTap();
    onScanTrigger(techToScan);
  };

  // Drag and Drop simulation
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    setDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHoveringPad(true);
  };

  const handleDragLeave = () => {
    setIsHoveringPad(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHoveringPad(false);
    setDragActive(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      setSelectedTech(data);
      handleSimulateScan(data);
    } catch (err) {
      handleSimulateScan(selectedTech);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* --- Section Title & Quick Info --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h2 className="text-sm font-cyber uppercase tracking-wider text-cyan-400 font-bold">
            Terminal de Lectura NFC (13.56 MHz)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {hardwareNfcSupported && (
            <button
              onClick={toggleHardwareNfc}
              className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
                hardwareNfcListening 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                  : 'bg-black/40 text-slate-400 border-slate-700 hover:border-cyan-500'
              }`}
            >
              <Wifi className="w-3 h-3 inline mr-1" />
              {hardwareNfcListening ? 'Hardware NFC Activo' : 'Escanear NFC Real'}
            </button>
          )}
          {hasScanned && (
            <button
              onClick={onReset}
              className="text-xs px-2.5 py-1 rounded font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,242,254,0.2)]"
            >
              <RefreshCw className="w-3 h-3" />
              Retirar / Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* --- The NFC Induction Scanner Pad --- */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !hasScanned && handleSimulateScan(selectedTech)}
        className={`relative group rounded-2xl p-6 transition-all duration-300 border cursor-pointer select-none overflow-hidden ${
          hasScanned
            ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900/60 border-cyan-400 shadow-[0_0_35px_rgba(0,242,254,0.3)]'
            : isHoveringPad || isScanning
            ? 'bg-cyan-950/30 border-cyan-300 shadow-[0_0_25px_rgba(0,242,254,0.4)] scale-[1.01]'
            : 'bg-slate-900/40 border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-900/70'
        }`}
      >
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* Electromagnetic Induction Field Waves (Concentric Rings) */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer Induction Coil Ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500 ${
              isScanning || isHoveringPad 
                ? 'border-cyan-400 animate-spin-slow' 
                : hasScanned 
                ? 'border-cyan-500/70' 
                : 'border-slate-600/60'
            }`} />

            {/* Middle Magnetic Flux Ring */}
            <div className={`absolute inset-3 rounded-full border border-dotted transition-all duration-300 ${
              isScanning || isHoveringPad 
                ? 'border-cyan-300 scale-105 animate-pulse' 
                : hasScanned 
                ? 'border-cyan-400/50' 
                : 'border-slate-700/40'
            }`} />

            {/* Inner Contact Target Node */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              hasScanned
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.6)]'
                : isScanning
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-300 animate-ping-slow'
                : 'bg-black/60 text-slate-400 border border-slate-700 group-hover:border-cyan-500/60 group-hover:text-cyan-400'
            }`}>
              {hasScanned ? (
                <CheckCircle2 className="w-10 h-10 text-cyan-300 animate-bounce" />
              ) : isScanning ? (
                <Zap className="w-9 h-9 text-cyan-300 animate-pulse" />
              ) : (
                <Radio className="w-9 h-9 transition-transform group-hover:scale-110" />
              )}
            </div>

            {/* Expanding Pulse Waves when Contacting */}
            {(isScanning || isHoveringPad) && (
              <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50" />
            )}
          </div>

          {/* Reader Instruction & Status Banner */}
          <div className="mt-4 text-center">
            <p className="font-cyber text-base font-bold tracking-wide">
              {hasScanned ? (
                <span className="text-cyan-300 glow-cyan-text">
                  ¡AUTENTICACIÓN NFC EXITOSA!
                </span>
              ) : isScanning ? (
                <span className="text-cyan-400 animate-pulse">
                  ACOPLANDO CAMPO ELECTROMAGNÉTICO...
                </span>
              ) : (
                <span className="text-slate-300 group-hover:text-cyan-300 transition-colors">
                  ACERCA O ARRASTRA EL CHIP/TARJETA AQUÍ
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {hasScanned
                ? `Payload transferido: ${scannedItem?.payload || selectedTech.payload}`
                : 'Haz clic aquí o pulsa el botón para pasar la tecnología seleccionada'}
            </p>
          </div>
        </div>

        {/* Active Scan Telemetry Bar */}
        {hasScanned && (
          <div className="mt-2 pt-3 border-t border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300/90">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              UID: {scannedItem?.uid || selectedTech.uid}
            </span>
            <span className="text-slate-400">
              Protocolo: {scannedItem?.type || selectedTech.type}
            </span>
          </div>
        )}
      </div>

      {/* --- Selectable NFC Technologies (Cards, Chips, Fobs, Phones) --- */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-cyber tracking-wider text-slate-400 uppercase">
            Selecciona la tecnología a transmitir:
          </span>
          <span className="text-[11px] text-cyan-400/80 font-mono">
            (Arrastra o selecciona)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {NFC_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedTech.id === item.id;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => setSelectedTech(item)}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `bg-slate-900/90 ${item.borderColor} shadow-[0_0_15px_rgba(0,242,254,0.25)]`
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-black font-bold shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      ACTIVO
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-slate-200 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {item.type}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{item.frequency}</span>
                  <span className="text-cyan-400/80">{item.capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Instant Scan Trigger Button --- */}
      <button
        disabled={isScanning}
        onClick={() => handleSimulateScan(selectedTech)}
        className={`w-full py-3.5 px-6 rounded-xl font-cyber uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
          hasScanned
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_25px_rgba(0,242,254,0.4)]'
            : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-black shadow-[0_0_25px_rgba(0,242,254,0.5)] active:scale-[0.98]'
        }`}
      >
        <Sparkles className="w-5 h-5 text-black animate-spin-slow" />
        {hasScanned ? 'Volver a Escanear Tecnología NFC' : 'Pasar Tecnología por el Lector'}
      </button>
    </div>
  );
}
