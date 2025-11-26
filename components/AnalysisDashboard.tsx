import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Video, 
  PenTool, 
  Megaphone, 
  Activity, 
  TrendingUp,
  FileText,
  Copy,
  Download
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AnalysisResponse, ScoreMetric, ScriptSuggestion } from '../types';

interface AnalysisDashboardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

const ScoreCard: React.FC<{ metric: ScoreMetric; icon: React.ReactNode }> = ({ metric, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
        {icon}
      </div>
      <span className={`text-2xl font-bold ${
        metric.score >= 80 ? 'text-green-500' : metric.score >= 50 ? 'text-amber-500' : 'text-red-500'
      }`}>
        {metric.score}
      </span>
    </div>
    <h3 className="font-semibold text-gray-800 mb-1">{metric.name}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{metric.feedback}</p>
  </div>
);

const ScriptCard: React.FC<{ script: ScriptSuggestion; index: number }> = ({ script, index }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const text = `TÍTULO: ${script.title}\n\nHOOK: ${script.hook}\n\nCORPO: ${script.body}\n\nCTA: ${script.cta}\n\nVISUAL: ${script.visual_cues}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-white to-rose-50/30 p-6 rounded-2xl border border-rose-200 shadow-sm mb-6 break-inside-avoid">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2">
                    <span className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded-full">Opção {index + 1}</span>
                    {script.title}
                </h3>
                <button 
                    onClick={handleCopy}
                    className="text-rose-400 hover:text-rose-600 transition-colors"
                    title="Copiar roteiro"
                >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Hook (Gancho)</span>
                    <p className="text-gray-800 font-medium">{script.hook}</p>
                </div>
                <div>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Roteiro</span>
                    <p className="text-gray-600 whitespace-pre-line">{script.body}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">CTA</span>
                        <p className="text-rose-700 font-bold">{script.cta}</p>
                    </div>
                </div>
                 <div className="bg-white p-3 rounded-lg border border-rose-100 mt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Video size={12} /> Sugestão Visual
                    </span>
                    <p className="text-sm text-gray-500 italic">{script.visual_cues}</p>
                </div>
            </div>
        </div>
    )
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const chartData = [
    { name: 'Score', value: data.overall_score, fill: data.overall_score > 70 ? '#f43f5e' : '#fbbf24' }
  ];

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;

    setIsDownloading(true);
    
    // Scroll to top to ensure capturing doesn't get cut off
    window.scrollTo(0, 0);

    try {
        // Wait for charts to animate/render completely
        await new Promise(resolve => setTimeout(resolve, 1500));

        const canvas = await html2canvas(element, {
            scale: 2, // High resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#fff1f2',
            windowWidth: 1400, // Force desktop width for consistent layout
            onclone: (document) => {
                const el = document.getElementById('analysis-report');
                if (el) {
                    // Ensure the cloned element captures full height
                    el.style.overflow = 'visible';
                    el.style.height = 'auto';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate ratio to fit width
        const ratio = pdfWidth / imgWidth;
        const imgHeightInPdf = imgHeight * ratio;

        let heightLeft = imgHeightInPdf;
        let position = 0;
        let page = 1;

        // Set PDF Metadata
        pdf.setProperties({
            title: `Análise Aesthetica AI - ${data.metrics.branding.name || 'Relatório'}`,
            subject: 'Auditoria de Criativo',
            creator: 'Aesthetica AI Platform',
            author: 'Aesthetica AI'
        });

        // Loop to create pages
        while (heightLeft > 0) {
            // Add the image slice for the current page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            
            // Add Footer to each page
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Aesthetica AI - Relatório Gerado em ${currentDate}`, 10, pdfHeight - 10);
            pdf.text(`Página ${page}`, pdfWidth - 10, pdfHeight - 10, { align: 'right' });

            heightLeft -= pdfHeight;
            position -= pdfHeight;

            // If there is still content left, add a new page
            if (heightLeft > 0) {
                pdf.addPage();
                page++;
            }
        }

        const fileNameDate = new Date().toISOString().split('T')[0];
        pdf.save(`Relatorio-Aesthetica-${fileNameDate}.pdf`);

    } catch (error) {
        console.error('Error generating PDF', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Resultado da Auditoria</h2>
          <p className="text-gray-500">Análise completa baseada em padrões de alta conversão.</p>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isDownloading ? (
                <span className="animate-pulse">Gerando PDF...</span>
            ) : (
                <>
                <Download size={16} />
                Baixar PDF
                </>
            )}
            </button>
            <button 
            onClick={onReset}
            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm"
            >
            Analisar Novo Vídeo
            </button>
        </div>
      </div>

      <div id="analysis-report" className="bg-rose-50/50 p-6 md:p-10 rounded-3xl">
        
        {/* Report Header for PDF capture */}
        <div className="mb-8 border-b border-rose-200 pb-6 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-rose-900">Relatório de Análise de Criativo</h1>
                <p className="text-rose-500 text-sm font-medium">Aesthetica AI - Inteligência para Estética</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-rose-400 uppercase font-bold tracking-wider">Gerado em</p>
                <p className="font-medium text-gray-700">{currentDate}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Main Score Column */}
            <div className="col-span-1 bg-white rounded-3xl p-8 shadow-lg border border-rose-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-rose-600"></div>
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Score Geral</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="70%" 
                            outerRadius="100%" 
                            barSize={20} 
                            data={chartData} 
                            startAngle={180} 
                            endAngle={0}
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={30 / 2}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pt-8">
                        <span className="text-6xl font-black text-rose-600">{data.overall_score}</span>
                        <span className="text-gray-400 text-sm font-medium">de 100</span>
                    </div>
                </div>
                <p className="text-gray-600 mt-2 text-sm italic">"{data.summary}"</p>
            </div>

            {/* Branding & Pros/Cons */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Megaphone size={20} className="text-rose-500"/> Análise de Branding
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{data.branding_analysis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                        <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                            <CheckCircle size={18} /> Pontos Fortes
                        </h4>
                        <ul className="space-y-3">
                            {data.pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                    {pro}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                        <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                            <XCircle size={18} /> Pontos de Atenção
                        </h4>
                        <ul className="space-y-3">
                            {data.cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                    {con}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* Metrics Grid */}
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-rose-500"/> Detalhes Técnicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16 break-inside-avoid">
            <ScoreCard metric={data.metrics.copywriting} icon={<PenTool size={20}/>} />
            <ScoreCard metric={data.metrics.visuals} icon={<Video size={20}/>} />
            <ScoreCard metric={data.metrics.branding} icon={<Megaphone size={20}/>} />
            <ScoreCard metric={data.metrics.pacing} icon={<Activity size={20}/>} />
            <ScoreCard metric={data.metrics.cta_effectiveness} icon={<TrendingUp size={20}/>} />
        </div>

        {/* AI Scripts */}
        <div className="bg-rose-50 rounded-3xl p-8 border border-rose-200">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-rose-900 flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6"/> Roteiros Otimizados
                </h2>
                <p className="text-rose-700 mt-2">Versões geradas por IA para melhorar a performance do seu conteúdo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.suggested_scripts.map((script, idx) => (
                    <ScriptCard key={idx} script={script} index={idx} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};