import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzeVideo } from './services/geminiService';
import { AppState, AnalysisResponse } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File, context: string) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const data = await analyzeVideo(file, context);
      setAnalysisData(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.IDLE);
      setError(err.message || "Ocorreu um erro desconhecido durante a análise. Verifique sua conexão e tente novamente.");
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-rose-50/50 font-sans text-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {appState === AppState.IDLE || appState === AppState.ANALYZING ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in-up">
            <div className="text-center mb-10 max-w-3xl">
              <h1 className="text-5xl font-black text-rose-950 mb-6 tracking-tight">
                Transforme seus vídeos em <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-400">
                  Máquinas de Venda
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                A primeira IA treinada para analisar estética visual, roteiro e comunicação para médicos e clínicas de alto padrão.
              </p>
            </div>
            
            {error && (
              <div className="w-full max-w-2xl mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm animate-fade-in">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div className="text-left">
                  <h3 className="font-bold text-red-800">Falha na Análise</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <UploadSection 
              onAnalyze={handleAnalyze} 
              isAnalyzing={appState === AppState.ANALYZING} 
            />

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto opacity-70">
                <div className="p-4">
                    <div className="font-bold text-rose-900 text-lg mb-2">Auditoria Visual</div>
                    <p className="text-sm">Análise de iluminação, ângulos e edição para percepção de valor.</p>
                </div>
                <div className="p-4">
                    <div className="font-bold text-rose-900 text-lg mb-2">Copywriting</div>
                    <p className="text-sm">Verificação de hooks, retenção e chamadas para ação.</p>
                </div>
                <div className="p-4">
                    <div className="font-bold text-rose-900 text-lg mb-2">Novos Roteiros</div>
                    <p className="text-sm">Gere versões melhoradas do seu script instantaneamente.</p>
                </div>
            </div>
          </div>
        ) : (
          appState === AppState.RESULTS && analysisData && (
            <AnalysisDashboard data={analysisData} onReset={handleReset} />
          )
        )}
      </main>

      <footer className="py-8 text-center text-rose-300 text-sm">
        <p>&copy; 2025 Aesthetica AI. Desenvolvido para a elite da estética.</p>
      </footer>
    </div>
  );
}