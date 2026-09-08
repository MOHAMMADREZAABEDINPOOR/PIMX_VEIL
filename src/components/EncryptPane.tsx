/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Upload, 
  Key, 
  Trash2, 
  CheckCircle, 
  Download, 
  ShieldAlert, 
  Database,
  RefreshCw,
  Clock
} from 'lucide-react';
import { AppLanguage, CryptoLog, ProcessingState } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { calculateSHA256, encryptData } from '../utils/cryptoUtils';
import { embedPayload } from '../utils/stegoEngine';

interface EncryptPaneProps {
  lang: AppLanguage;
  onLogged: (log: CryptoLog) => void;
  onClearSession: () => void;
}

export default function EncryptPane({ lang, onLogged, onClearSession }: EncryptPaneProps) {
  const t = TRANSLATIONS[lang];

  // Files State
  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  // Interactive UI hover triggers
  const [dragOverCarrier, setDragOverCarrier] = useState(false);
  const [dragOverSecret, setDragOverSecret] = useState(false);

  // File analysis hashes
  const [carrierHash, setCarrierHash] = useState('');
  const [secretHash, setSecretHash] = useState('');

  // Cryptographic runtime state
  const [stegoBlobUrl, setStegoBlobUrl] = useState<string | null>(null);
  const [stegoFileName, setStegoFileName] = useState('');

  // Processing telemetry
  const [procState, setProcState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    statusText: '',
    logs: []
  });

  // Reference elements to trigger explorer input clicks
  const carrierInputRef = useRef<HTMLInputElement>(null);
  const secretInputRef = useRef<HTMLInputElement>(null);

  // Appends localized log lines 
  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    const newLog: CryptoLog = { timestamp, type, message };
    setProcState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
    onLogged(newLog);
  };

  // Computes password strength estimation
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-zinc-805', width: '0%', textColor: 'text-zinc-500' };
    
    const len = password.length;
    let criteriaCount = 0;
    if (/[A-Z]/.test(password)) criteriaCount++;
    if (/[a-z]/.test(password)) criteriaCount++;
    if (/[0-9]/.test(password)) criteriaCount++;
    if (/[#@$%^&*!()_\-+=[\]{};':"\\|,.<>/?~`]/.test(password)) criteriaCount++;

    // Calculate width linearly
    // Each character adds 4% (max 40% at length 10)
    // Each unique character type adds 15% (max 60% for 4 types)
    const lengthScore = Math.min(len * 4, 40);
    const typeScore = criteriaCount * 15;
    const totalPercentage = lengthScore + typeScore;

    const width = `${totalPercentage}%`;
    let color = 'bg-red-550';
    let textColor = 'text-red-400';
    let label = t.passkeyWeak;

    if (totalPercentage < 35) {
      color = 'bg-red-500';
      textColor = 'text-red-400';
      label = t.passkeyWeak;
    } else if (totalPercentage < 70) {
      color = 'bg-yellow-500';
      textColor = 'text-yellow-400';
      label = t.passkeyMedium;
    } else {
      color = 'bg-emerald-500';
      textColor = 'text-emerald-400';
      label = t.passkeyStrong;
    }

    return { label, color, width, textColor };
  };

  // Fast drag & drop implementations
  const handleCarrierFile = async (file: File) => {
    setCarrierFile(file);
    addLog('info', `Carrier loaded: ${file.name} (${file.size.toLocaleString()} bytes, MIME: ${file.type || 'unknown'})`);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await calculateSHA256(buffer);
      setCarrierHash(hash);
      addLog('success', `Carrier checksum generated: SHA-256 [${hash.substring(0, 24)}...]`);
    } catch {
      addLog('error', `Failed to construct carrier binary array map.`);
    }
  };

  const handleSecretFile = async (file: File) => {
    setSecretFile(file);
    addLog('info', `Secret loaded: ${file.name} (${file.size.toLocaleString()} bytes, MIME: ${file.type || 'unknown'})`);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await calculateSHA256(buffer);
      setSecretHash(hash);
      addLog('success', `Secret payload checksum generated: SHA-256 [${hash.substring(0, 24)}...]`);
    } catch {
      addLog('error', `Failed to construct secret payload binary array map.`);
    }
  };

  const clearState = () => {
    // Revoke any previous download URL to prevent memory forensics leaks
    if (stegoBlobUrl) {
      URL.revokeObjectURL(stegoBlobUrl);
    }
    setCarrierFile(null);
    setSecretFile(null);
    setPassword('');
    setCarrierHash('');
    setSecretHash('');
    setStegoBlobUrl(null);
    setStegoFileName('');
    setProcState({
      isProcessing: false,
      progress: 0,
      statusText: '',
      logs: []
    });
    addLog('info', 'RAM State sanitized. References nullified, Blob allocations revoked.');
    onClearSession();
  };

  // Synthesize stego action
  const handleEmbedding = async () => {
    if (!carrierFile || !secretFile) {
      addLog('error', 'Execution blocked: Disguise Carrier and Classified Payload are mandatory inputs.');
      return;
    }
    const activePassword = password;
    if (!activePassword) {
      addLog('warning', lang === 'fa' ? 'هیچ رمزی مشخص نشده است. در حال اجرای پنهان‌سازی بدون رمز...' : 'No password specified. Proceeding with passwordless steganography...');
    }

    setProcState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 10,
      statusText: 'Locking thread state and preparing raw buffers...'
    }));

    try {
      addLog('info', 'Stage 1: Accessing volatile file resources...');
      const carrierBuffer = await carrierFile.arrayBuffer();
      const secretBuffer = await secretFile.arrayBuffer();

      addLog('info', 'Stage 2: Beginning asymmetric hash fingerprint comparisons...');
      const sHash = await calculateSHA256(secretBuffer);

      addLog('info', `Stage 3: Passing payload content to Symmetric GCM Encrypter...`);
      const encryptedSecretBuffer = await encryptData(secretBuffer, activePassword, (status) => {
        addLog('info', `[WebCrypto] ${status}`);
      });

      addLog('success', 'AES-GCM-256 Symmetric encryption operation completed securely.');
      const encryptedHash = await calculateSHA256(encryptedSecretBuffer);
      addLog('info', `Encrypted payload fingerprint: SHA-256 [${encryptedHash.substring(0, 24)}...]`);

      addLog('info', 'Stage 4: Fusing structures via EOF-Padding Polyglot method...');
      const finalStegoBuffer = embedPayload(
        carrierBuffer,
        encryptedSecretBuffer,
        {
          name: secretFile.name,
          type: secretFile.type || 'application/octet-stream',
          originalHash: sHash
        },
        encryptedHash
      );

      setProcState(prev => ({ ...prev, progress: 90, statusText: 'Packaging synthesized binary package...' }));
      
      // Build binary stream and issue clean ObjectURL
      const stegoBlob = new Blob([finalStegoBuffer], { type: carrierFile.type || 'application/octet-stream' });
      const dlUrl = URL.createObjectURL(stegoBlob);

      // Save a localized file layout. E.g. encrypted_image.jpg or stego_audio.mp3
      const originalExtension = carrierFile.name.includes('.') ? carrierFile.name.split('.').pop() : 'bin';
      const outputName = `aegis_${Date.now()}.${originalExtension}`;

      setStegoBlobUrl(dlUrl);
      setStegoFileName(outputName);

      addLog('success', `Steganographic compilation complete. File packaged: ${outputName} (${stegoBlob.size.toLocaleString()} bytes)`);
      setProcState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        statusText: 'Operational Ready. Secured file compiled successfully.'
      }));

    } catch (err: any) {
      addLog('error', `Compilation aborted: ${err.message || err}`);
      setProcState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        statusText: 'Operation cancelled due to execution failure.'
      }));
    }
  };

  // Immediate Revoke & Cleanup upon triggering of download link
  const handleDownloadCleanup = () => {
    addLog('info', 'Distribution triggered. Evacuating ObjectURL memory pointers...');
    // Setting a micro-timeout so download initiates in background before revocation is validated
    setTimeout(() => {
      if (stegoBlobUrl) {
        URL.revokeObjectURL(stegoBlobUrl);
        setStegoBlobUrl(null);
        addLog('success', 'Active download pointer successfully revoked. Residual data elements flushed.');
      }
    }, 1500);
  };

  const strength = getPasswordStrength();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="encrypt-workspace">
      {/* File Upload / Inputs Section - UNIFIED COMPACT WORKBENCH */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#080809] rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900">
          
          {/* Step 1: Carrier host upload */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                  {t.step1}
                </span>
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-1.5">
                  {t.step1Desc}
                </p>
              </div>
              {carrierFile && (
                <button 
                  id="reset-carrier-btn"
                  onClick={() => setCarrierFile(null)}
                  className="p-1 px-2.5 border border-red-500/20 text-red-500 hover:text-white bg-red-500/5 hover:bg-red-500/80 rounded-lg text-[10px] font-mono select-none transition-all cursor-pointer"
                >
                  {t.unloadBtn.toUpperCase()}
                </button>
              )}
            </div>

            <div
              id="carrier-dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOverCarrier(true); }}
              onDragLeave={() => setDragOverCarrier(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCarrier(false);
                if (e.dataTransfer.files?.[0]) handleCarrierFile(e.dataTransfer.files[0]);
              }}
              onClick={() => carrierInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 py-6 text-center cursor-pointer transition-all duration-300 relative ${
                dragOverCarrier 
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/2' 
                  : carrierFile 
                    ? 'border-emerald-500/40 bg-zinc-100/55 dark:bg-[#0c0c0e]/30' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/10 hover:border-emerald-500/30 hover:bg-zinc-100/40 dark:hover:bg-[#070707]'
              }`}
            >
              <input 
                type="file" 
                ref={carrierInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCarrierFile(e.target.files[0]);
                }}
                className="hidden" 
              />
              {carrierFile ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 animate-pulse" />
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-950 dark:text-zinc-100 max-w-[280px] truncate">
                    {carrierFile.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {(carrierFile.size / 1024).toFixed(2)} KB | {carrierFile.type || 'RAW_BINARY'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                  <Upload className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
                  <p className="text-xs font-mono font-medium">{t.carrierPlHolder}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-tight">{t.step1Support}</p>
                </div>
              )}
            </div>

            {carrierHash && (
              <div className="p-2 px-3 bg-zinc-50/70 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900 rounded-xl font-mono text-[10px] flex gap-2 items-center justify-between text-zinc-400 select-text overflow-hidden">
                <span className="flex items-center gap-1 text-emerald-500/70 shrink-0"><Database className="w-3.5 h-3.5" /> {t.hostSha256}:</span>
                <span className="truncate break-all font-mono tracking-tighter text-gray-800 dark:text-zinc-300">{carrierHash}</span>
              </div>
            )}
          </div>

          {/* Step 2: Secret payload file */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/10 uppercase tracking-wider">
                  {t.step2}
                </span>
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-1.5">
                  {t.step2Desc}
                </p>
              </div>
              {secretFile && (
                <button 
                  id="reset-secret-btn"
                  onClick={() => setSecretFile(null)}
                  className="p-1 px-2.5 border border-red-500/20 text-red-500 hover:text-white bg-red-500/5 hover:bg-red-500/80 rounded-lg text-[10px] font-mono select-none transition-all cursor-pointer"
                >
                  {t.unloadBtn.toUpperCase()}
                </button>
              )}
            </div>

            <div
              id="secret-dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOverSecret(true); }}
              onDragLeave={() => setDragOverSecret(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSecret(false);
                if (e.dataTransfer.files?.[0]) handleSecretFile(e.dataTransfer.files[0]);
              }}
              onClick={() => secretInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 py-6 text-center cursor-pointer transition-all duration-300 relative ${
                dragOverSecret 
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/2' 
                  : secretFile 
                    ? 'border-amber-500/40 bg-zinc-100/55 dark:bg-[#0c0c0e]/30' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/10 hover:border-amber-500/30 hover:bg-zinc-100/40 dark:hover:bg-[#070707]'
              }`}
            >
              <input 
                type="file" 
                ref={secretInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleSecretFile(e.target.files[0]);
                }}
                className="hidden" 
              />
              {secretFile ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <FileCode className="w-6 h-6 animate-pulse" />
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-950 dark:text-zinc-100 max-w-[280px] truncate">
                    {secretFile.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {(secretFile.size / 1024).toFixed(2)} KB | {secretFile.type || 'RAW_CLASSIFIED'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                  <Upload className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
                  <p className="text-xs font-mono font-medium">{t.secretPlHolder}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-tight">{t.step2Support}</p>
                </div>
              )}
            </div>

            {secretHash && (
              <div className="p-2 px-3 bg-zinc-50/70 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900 rounded-xl font-mono text-[10px] flex gap-2 items-center justify-between text-zinc-400 select-text overflow-hidden">
                <span className="flex items-center gap-1 text-amber-500/70 shrink-0"><Database className="w-3.5 h-3.5" /> {t.payloadSha256}:</span>
                <span className="truncate break-all font-mono tracking-tighter text-gray-800 dark:text-zinc-300">{secretHash}</span>
              </div>
            )}
          </div>

          {/* Step 3: Password / Derivation criteria */}
          <div className="p-6 flex flex-col gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                {t.step3}
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-0.5">
                {t.step3Desc}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  id="crypto-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passkeyPlHolder}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-transparent text-xs text-gray-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-[#10b981]/50 focus:ring-1 focus:ring-emerald-500/30 font-mono transition-all"
                />
              </div>

              {/* Password entropy quality monitor */}
              {password && (
                <div className="flex flex-col gap-1.5 p-2.5 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 rounded-xl select-none">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 font-bold">{t.passkeyStrength}:</span>
                    <span className={`${strength.textColor} font-black`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Compiler Action & Output Monitor Section */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* State and Action controller */}
        <div className="bg-white dark:bg-[#080809] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-black tracking-widest font-display uppercase text-gray-800 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            {t.controlConsole}
          </h4>

          {/* Trigger synthesis Button */}
          {!stegoBlobUrl ? (
            <button
              id="start-synthesis-btn"
              onClick={handleEmbedding}
              disabled={!carrierFile || !secretFile || procState.isProcessing}
              className={`w-full py-4 px-4 rounded-xl font-black font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 select-none border border-emerald-500/20 shadow-lg ${
                (!carrierFile || !secretFile || procState.isProcessing)
                  ? 'bg-zinc-100 dark:bg-[#0d0d0f]/60 text-zinc-400 dark:text-zinc-700 border-zinc-200/50 dark:border-zinc-900/60 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/90 hover:dark:bg-emerald-500 text-black hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-100 cursor-pointer'
              }`}
            >
              {procState.isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t.processingText} {procState.progress}%
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  {t.processBtn}
                </>
              )}
            </button>
          ) : (
            // Success package downloaded frame
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-xs font-bold text-emerald-500 font-mono tracking-wider">{t.synthesisSuccess}</h5>
                  <p className="text-[10px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">
                    {t.synthesisSuccessDesc}
                  </p>
                </div>
              </div>

              {/* Download Action */}
              <a
                id="download-stego-link"
                href={stegoBlobUrl}
                download={stegoFileName}
                onClick={handleDownloadCleanup}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black rounded-xl font-black font-mono text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-100"
              >
                <Download className="w-4 h-4" />
                {t.downloadBtn}
              </a>

              {/* Manual reset button */}
              <button
                id="sanitize-all-btn"
                onClick={clearState}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#0f0f12] dark:hover:bg-[#16161b] text-gray-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:dark:border-zinc-700"
              >
                <Trash2 className="w-4 h-4 text-rose-500/80" />
                {t.resetBtn}
              </button>
            </div>
          )}

          {/* Quick Stats / Environment warning */}
          <div className="p-3.5 bg-zinc-50 dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-start gap-2.5 select-none">
            <ShieldAlert className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-gray-800 dark:text-zinc-300 font-display uppercase tracking-wider">
                {t.antiForensicTitle}
              </span>
              <p className="text-[9px] text-zinc-400 leading-relaxed mt-0.5 font-sans">
                {t.antiForensicDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Console / System Event Log Terminal */}
        <div className="bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-[#10b981] rounded-2xl p-4.5 shadow-sm min-h-[340px] flex flex-col gap-3.5 relative overflow-hidden font-mono transition-colors duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20" />
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900 pb-2.5 select-none">
            <span className="text-[9px] font-black tracking-widest text-emerald-800/80 dark:text-[#10b981]/60 font-display uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-500 rounded-full animate-ping" />
              {t.statusLogTitle}
            </span>
            <button
              id="clear-logs-btn"
              onClick={() => setProcState(prev => ({ ...prev, logs: [] }))}
              className="text-[9px] text-emerald-700/60 dark:text-[#10b981]/50 hover:text-emerald-900 dark:hover:text-[#10b981] font-display hover:underline cursor-pointer"
            >
              {t.clearScreen}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-350 dark:scrollbar-thumb-zinc-805 font-mono text-[9px] select-text">
            {procState.logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-800/25 dark:text-[#10b981]/20 text-center uppercase tracking-widest font-mono text-[9px] select-none py-12">
                {t.activeRam}
              </div>
            ) : (
              procState.logs.map((log, i) => (
                <div key={i} className="flex gap-2 items-start break-all font-mono leading-relaxed">
                  <span className="text-zinc-400 dark:text-zinc-650 opacity-80">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'error' ? 'text-red-650 dark:text-rose-400 font-bold' :
                    log.type === 'success' ? 'text-emerald-600 dark:text-[#34d399] font-black' :
                    log.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-emerald-400'
                  }>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-zinc-700 dark:text-emerald-300 font-mono font-medium">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
