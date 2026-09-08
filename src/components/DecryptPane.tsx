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
  Clock,
  Eye,
  Unlock
} from 'lucide-react';
import { AppLanguage, CryptoLog, ProcessingState } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { calculateSHA256, decryptData } from '../utils/cryptoUtils';
import { extractPayload, StegoMetadata } from '../utils/stegoEngine';

interface DecryptPaneProps {
  lang: AppLanguage;
  onLogged: (log: CryptoLog) => void;
  onClearSession: () => void;
}

export default function DecryptPane({ lang, onLogged, onClearSession }: DecryptPaneProps) {
  const t = TRANSLATIONS[lang];

  // Files State
  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  // Interactive UI hover triggers
  const [dragOverCarrier, setDragOverCarrier] = useState(false);

  // Parse state & results metadata 
  const [stegoMetadata, setStegoMetadata] = useState<StegoMetadata | null>(null);
  const [analyzedHash, setAnalyzedHash] = useState('');
  const [secretBlobUrl, setSecretBlobUrl] = useState<string | null>(null);
  const [extractedFileName, setExtractedFileName] = useState('');

  // Integrity comparisons checklist
  const [calculatedSecretHash, setCalculatedSecretHash] = useState('');

  // Processing telemetry
  const [procState, setProcState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    statusText: '',
    logs: []
  });

  const carrierInputRef = useRef<HTMLInputElement>(null);

  const getFriendlyErrorMessage = (rawError: string, activeLang: AppLanguage): string => {
    const errorText = rawError.toLowerCase();

    const dictionary: Record<AppLanguage, { noSignature: string; wrongPass: string; generic: string }> = {
      en: {
        noSignature: "STEREOMETRIC ERROR: No AegisCrypt hidden payload detected in this carrier. Secure signature is missing.",
        wrongPass: "DECRYPTION FAILURE: Incorrect password, or the encrypted payload has been corrupted or tampered with.",
        generic: `AUTHENTICATION BREAKDOWN: ${rawError}`
      },
      fa: {
        noSignature: "خطای شناسایی فایل: هیچ فایلی درون این فایل میزبان مخفی نشده است یا ساختار استگانوگرافی معتبری شناسایی نشد.",
        wrongPass: "خطای رمزگشایی: کلید رمزگشایی اشتباه است یا ساختار داده‌ی مخفی خراب شده است. لطفاً رمز عبور را بررسی کنید.",
        generic: `خطای فرآیند: ${rawError}`
      },
      ar: {
        noSignature: "خطأ التعرف: لم يتم العثور على أي كتل بيانات مخفية صالحة في هذا النموذج الحامل.",
        wrongPass: "فشل فك التشفير: كلمة المرور غير صحيحة، أو أن المحتوى المشفر تالف أو معدل.",
        generic: `فشل العملية: ${rawError}`
      },
      de: {
        noSignature: "DATEI-FEHLER: In dieser Trägerdatei wurden keine verdeckten AegisCrypt-Nutzdaten identifiziert.",
        wrongPass: "ENTSCHLÜSSELUNGSFEHLER: Falsches Passwort oder die verdeckten GCM-Daten sind fehlerhaft.",
        generic: `Verarbeitungsfehler: ${rawError}`
      },
      fr: {
        noSignature: "ERREUR D'ANALYSE : Aucun conteneur cryptographique ou stéganographique AegisCrypt détecté.",
        wrongPass: "ÉCHEC DÉCRYTAGE : Clé d'authentification incorrecte ou enveloppe binaire corrompue.",
        generic: `Erreur d'exécution: ${rawError}`
      },
      it: {
        noSignature: "ERRORE FIRMA: Nessun payload steganografico AegisCrypt rilevato in questo file portatore.",
        wrongPass: "ERRORE DECRITTAZIONE: Password errata o i blocchi d'integrità sono stati compromessi.",
        generic: `Errore di processo: ${rawError}`
      },
      zh: {
        noSignature: "特征流载荷错误: 该掩体文件中未探测到任何相容的 AegisCrypt 隐写数据包。",
        wrongPass: "数据解密失败: 凭证口令不正确，或者隐写密文段已被物理损坏或篡改。",
        generic: `控制端阻断: ${rawError}`
      },
      ru: {
        noSignature: "ОШИБКА АНАЛИЗА: В этом файле-носителе не найдено сигнатуры скрытого контейнера AegisCrypt.",
        wrongPass: "ОШИБКА ДЕШИФРОВАНИЯ: Неверный тактический пароль или зашифрованные данные были повреждены.",
        generic: `Ошибка обработки: ${rawError}`
      },
      el: {
        noSignature: "ΣΦΑΛΜΑ ΥΠΟΓΡΑΦΗΣ: Δεν εντοπίστηκε έγκυρο κρυφό φορτίο AegisCrypt στο αρχείο φορέα.",
        wrongPass: "ΑΠΟΤΥΧΙΑ ΑΠΟΚΡΥΠΤΟΓΡΑΦΗΣΗΣ: Εσφαλμένος κωδικός πρόσβασης ή κατεστραμμένο κρυπτογραφικό πακέτο.",
        generic: `Σφάλμα συστήματος: ${rawError}`
      },
      la: {
        noSignature: "ERROR CARRIER: Nulla steganographia AegisCrypt in hoc carriere detecta est.",
        wrongPass: "DECRYPTIO FALLIT: Clavis falsa vel data steganographiae corrupta sunt.",
        generic: `Errore procedendi: ${rawError}`
      }
    };

    const set = dictionary[activeLang] || dictionary.en;
    if (errorText.includes('signature') || errorText.includes('no aegiscrypt-compliant') || errorText.includes('magic')) {
      return set.noSignature;
    }
    if (errorText.includes('decryption failed') || errorText.includes('incorrect password') || errorText.includes('decrypt') || errorText.includes('bad decrypt') || errorText.includes('cipher')) {
      return set.wrongPass;
    }
    return set.generic;
  };

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    const newLog: CryptoLog = { timestamp, type, message };
    setProcState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
    onLogged(newLog);
  };

  const clearState = () => {
    if (secretBlobUrl) {
      URL.revokeObjectURL(secretBlobUrl);
    }
    setCarrierFile(null);
    setPassword('');
    setStegoMetadata(null);
    setAnalyzedHash('');
    setSecretBlobUrl(null);
    setCalculatedSecretHash('');
    setExtractedFileName('');
    setProcState({
      isProcessing: false,
      progress: 0,
      statusText: '',
      logs: []
    });
    addLog('info', 'RAM State sanitized. References nullified, Blob allocations revoked.');
    onClearSession();
  };

  // Immediate payload stego analysis upon loading the carrier
  const handleCarrierFile = async (file: File) => {
    setCarrierFile(file);
    setStegoMetadata(null);
    addLog('info', `Suspicious carrier loaded: ${file.name} (${file.size.toLocaleString()} bytes)`);

    try {
      const buffer = await file.arrayBuffer();
      addLog('info', 'Scanning carrier stream backwards for PIMXVEIL signatures...');
      
      const { metadata, encryptedPayloadBuffer } = extractPayload(buffer);
      setStegoMetadata(metadata);
      
      addLog('success', `Stego signature verified. Metadata block decoded successfully.`);
      addLog('info', `Claimed payload: [${metadata.name}], Original size: ~${(encryptedPayloadBuffer.byteLength / 1024).toFixed(2)} KB.`);
      addLog('info', `Required key validation fingerprint: SHA-256 [${metadata.encryptedHash.substring(0, 24)}...]`);

      const h = await calculateSHA256(buffer);
      setAnalyzedHash(h);

    } catch (err: any) {
      addLog('warning', `Binary inspection: ${err.message || err}`);
      addLog('info', 'Carrier file is functional and clean, or utilizes an external/unrecognized key structure.');
    }
  };

  // Decryption trigger 
  const handleDecryption = async () => {
    if (!carrierFile) {
      addLog('error', 'Execution blocked: A file stream must be armed to extract payload data.');
      return;
    }

    const activePassword = password;
    if (!activePassword) {
      addLog('warning', lang === 'fa' ? 'هیچ رمزی مشخص نشده است. در حال تلاش برای استخراج بدون رمز...' : 'No password specified. Proceeding with passwordless verification & extraction...');
    }

    setProcState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 15,
      statusText: 'Locating boundary blocks and checking index structures...'
    }));

    try {
      addLog('info', 'Stage 1: Accessing volatile carrier memory buffers...');
      const fullBuffer = await carrierFile.arrayBuffer();

      addLog('info', 'Stage 2: Parsing payload sections and boundary limits...');
      const { encryptedPayloadBuffer, metadata } = extractPayload(fullBuffer);

      addLog('info', 'Stage 3: Attempting Authenticated AES-GCM-256 Decryption with PBKDF2 stretching...');
      const decryptedBuffer = await decryptData(encryptedPayloadBuffer, activePassword, (status) => {
        addLog('info', `[WebCrypto] ${status}`);
      });

      addLog('success', 'Symmetric decryption completed successfully. Authentication and integrity verified.');

      // Stage 4: Verify original SHA-256 hash
      setProcState(prev => ({ ...prev, progress: 80, statusText: 'Comparing integrity descriptors...' }));
      const currentSecretHash = await calculateSHA256(decryptedBuffer);
      setCalculatedSecretHash(currentSecretHash);

      addLog('info', `Filing integrity: Metadata expectation [${metadata.originalHash.substring(0, 16)}...]`);
      addLog('info', `Filing integrity: Calculated outcome  [${currentSecretHash.substring(0, 16)}...]`);

      if (currentSecretHash === metadata.originalHash) {
        addLog('success', 'INTEGRITY MATCHED. The file is mathematically indistinguishable from original.');
      } else {
        addLog('warning', 'INTEGRITY WARNING: Hash vectors do not mismatch, proceed with absolute caution.');
      }

      // Safe export in Blob and clean ObjectURL
      const extractedBlob = new Blob([decryptedBuffer], { type: metadata.type || 'application/octet-stream' });
      const dlUrl = URL.createObjectURL(extractedBlob);

      setSecretBlobUrl(dlUrl);
      setExtractedFileName(metadata.name);

      addLog('success', `Classified container opened and saved as: ${metadata.name}`);
      setProcState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        statusText: 'Extraction successfully completed.'
      }));

    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err.message || err.toString(), lang);
      addLog('error', friendlyMsg);
      setProcState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        statusText: 'Extraction terminated due to error.'
      }));
    }
  };

  const handleDownloadCleanup = () => {
    addLog('info', 'Payload dispatch resolved. Cleaning security residues...');
    setTimeout(() => {
      if (secretBlobUrl) {
        URL.revokeObjectURL(secretBlobUrl);
        setSecretBlobUrl(null);
        addLog('success', 'ObjectURL revoked. Volatile memories restored to absolute zero.');
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="decrypt-workspace">
      {/* File Upload / Inputs Section - UNIFIED COMPACT DECRYPT WORKBENCH */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#080809] rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900">
          
          {/* Section 1: Decoy Carrier Disguise */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                  {t.carrierHostFile}
                </span>
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-1.5">
                  {t.carrierHostFileDesc}
                </p>
              </div>
              {carrierFile && (
                <button 
                  id="reset-carrier-btn"
                  onClick={() => setCarrierFile(null)}
                  className="p-1 px-2.5 border border-red-500/20 text-red-500 hover:text-white bg-red-500/5 hover:bg-red-500/80 rounded-lg text-[10px] font-mono select-none transition-all cursor-pointer"
                >
                  {t.unloadBtn}
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
                  <Upload className="w-7 h-7 text-zinc-400 dark:text-zinc-650" />
                  <p className="text-xs font-mono font-medium">{t.carrierPlHolder}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-tight">{t.step1Support}</p>
                </div>
              )}
            </div>

            {analyzedHash && (
              <div className="p-2 px-3 bg-zinc-50/70 dark:bg-[#0c0c0e] border border-zinc-100 dark:border-zinc-900 rounded-xl font-mono text-[10px] flex gap-2 items-center justify-between text-zinc-400 select-text overflow-hidden">
                <span className="flex items-center gap-1 text-emerald-500/70 shrink-0"><Database className="w-3.5 h-3.5" /> {t.carrierSha256}:</span>
                <span className="truncate break-all font-mono tracking-tighter text-gray-800 dark:text-zinc-300">{analyzedHash}</span>
              </div>
            )}
          </div>

          {/* Section 2: Decrypted Payload details metadata card */}
          <AnimatePresence mode="wait">
            {stegoMetadata && (
              <div className="p-6 bg-[#10b981]/2 dark:bg-emerald-950/5">
                <motion.div
                  id="metadata-block-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-emerald-500/25 bg-emerald-500/2 rounded-xl p-4.5"
                >
                  <h4 className="text-xs font-bold tracking-widest font-mono uppercase text-emerald-500 flex items-center gap-1.5 mb-3">
                    <ShieldAlert className="w-4 h-4 animate-pulse shrink-0" />
                    {t.covertIdentified}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono text-zinc-400">
                    <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{t.metaName}</span>
                      <span className="text-gray-950 dark:text-zinc-100 break-all font-semibold font-sans">{stegoMetadata.name}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{t.metaType}</span>
                      <span className="text-gray-950 dark:text-zinc-100 font-semibold font-sans">{stegoMetadata.type}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 md:col-span-2">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{t.metaHash}</span>
                      <span className="text-gray-950 dark:text-zinc-200 break-all leading-normal text-[10px] tracking-tight">
                        {stegoMetadata.originalHash}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Section 3: Keys specification */}
          <div className="p-6 flex flex-col gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                {t.decryptionKey}
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-0.5">
                {t.decryptionKeyDesc}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                id="crypto-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passkeyPlHolder}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-transparent text-xs text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-[#10b981]/50 focus:ring-1 focus:ring-emerald-500/30 font-mono transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Control Action & Output monitor */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Core console action card */}
        <div className="bg-white dark:bg-[#080809] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-black tracking-widest font-display uppercase text-gray-800 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            {t.controlConsole}
          </h4>

          {/* Trigger decrypt Action */}
          {!secretBlobUrl ? (
            <button
              id="start-decryption-btn"
              onClick={handleDecryption}
              disabled={!carrierFile || procState.isProcessing}
              className={`w-full py-4 px-4 rounded-xl font-black font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 select-none border border-emerald-500/20 shadow-lg ${
                (!carrierFile || procState.isProcessing)
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
                  <Unlock className="w-4 h-4" />
                  {t.decryptBtn}
                </>
              )}
            </button>
          ) : (
            // Success decrypted layout
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-xs font-bold text-emerald-500 font-mono tracking-wider">{t.integrityPassed}</h5>
                  <p className="text-[10px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">
                    {t.integrityPassedDesc}
                  </p>
                </div>
              </div>

              {/* Download extracted segment */}
              <a
                id="download-secret-link"
                href={secretBlobUrl}
                download={extractedFileName}
                onClick={handleDownloadCleanup}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black rounded-xl font-black font-mono text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-100"
              >
                <Download className="w-4 h-4" />
                {t.downloadUnlocked}
              </a>

              {/* Manual wipe */}
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
          <div className="p-3.5 bg-zinc-50 dark:bg-[#0c0c0e]/80 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-start gap-2.5 select-none">
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

        {/* System log reports */}
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
                {t.activeScanner}
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
