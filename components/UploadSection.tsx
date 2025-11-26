import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, FileVideo, AlertCircle, Sparkles, X, AlertTriangle } from 'lucide-react';

interface UploadSectionProps {
  onAnalyze: (file: File, context: string) => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    // Robust check for video files: MIME type or Extension
    // Some browsers/OS don't populate file.type for mp4 correctly
    const isVideoType = selectedFile.type.startsWith('video/');
    const isVideoExtension = /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(selectedFile.name);

    if (!isVideoType && !isVideoExtension) {
      setError("O arquivo selecionado não parece ser um vídeo válido (MP4, MOV, etc).");
      return;
    }

    // Limit set to 150MB as requested
    const maxSize = 150 * 1024 * 1024; 
    if (selectedFile.size > maxSize) {
        setError(`O arquivo é muito grande (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). O limite é 150MB.`);
        return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (file) {
      onAnalyze(file, context);
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const isLargeFile = file && file.size > 50 * 1024 * 1024;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-rose-900 mb-2">Análise de Criativo</h2>
          <p className="text-rose-600">Envie seu vídeo (MP4, MOV - até 150MB) para uma auditoria completa.</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-in-out cursor-pointer ${
            dragActive 
              ? "border-rose-500 bg-rose-50 scale-[1.02]" 
              : error 
                ? "border-red-300 bg-red-50 hover:bg-red-50/50"
                : "border-rose-200 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-100/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept="video/*,.mp4,.mov,.avi,.mkv"
            disabled={isAnalyzing}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {file ? (
              <>
                <div className="bg-rose-100 p-4 rounded-full animate-bounce-short">
                  <FileVideo className="h-10 w-10 text-rose-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-rose-900">{file.name}</p>
                  <p className="text-sm text-rose-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                  }}
                  className="z-20 text-xs text-rose-400 hover:text-rose-700 underline flex items-center gap-1"
                >
                  <X size={12} /> Remover arquivo
                </button>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-full ${error ? "bg-red-100" : "bg-rose-100"}`}>
                  {error ? (
                     <AlertCircle className="h-10 w-10 text-red-500" />
                  ) : (
                     <UploadCloud className="h-10 w-10 text-rose-600" />
                  )}
                </div>
                <div className="text-center">
                  {error ? (
                    <p className="font-medium text-red-600">{error}</p>
                  ) : (
                    <>
                      <p className="font-medium text-rose-900">Arraste e solte seu vídeo aqui</p>
                      <p className="text-sm text-rose-500 mt-1">ou clique para buscar</p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isLargeFile && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800 animate-fade-in">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p>
                    <strong>Atenção:</strong> Arquivos acima de 50MB podem falhar no envio pelo navegador. 
                    Se ocorrer erro, recomendamos comprimir o vídeo.
                </p>
            </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-rose-900 mb-2">
            Contexto Adicional (Opcional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Vídeo para campanha de Botox Day, público alvo mulheres 35-50 anos..."
            className="w-full p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-rose-900 placeholder-rose-300 resize-none h-24"
            disabled={isAnalyzing}
          />
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!file || isAnalyzing}
            className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all shadow-lg shadow-rose-200 ${
              !file || isAnalyzing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando Criativo...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Gerar Análise Profissional
              </>
            )}
          </button>
          {!process.env.API_KEY && (
             <div className="flex items-center gap-2 mt-4 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>API Key não configurada. O app não funcionará corretamente.</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};