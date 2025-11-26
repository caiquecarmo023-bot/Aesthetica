import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      // Robust split to handle different data URI formats
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to determine accurate MIME type based on extension
// This fixes issues where browsers report empty or generic types for some video containers
function getMimeType(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  const mimeMap: Record<string, string> = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    '3gp': 'video/3gpp',
    'ts': 'video/mp2t'
  };

  if (extension && mimeMap[extension]) {
    return mimeMap[extension];
  }

  return file.type || 'video/mp4';
}

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.NUMBER, description: "Overall quality score 0-100" },
    summary: { type: Type.STRING, description: "Brief summary of the video content" },
    metrics: {
      type: Type.OBJECT,
      properties: {
        copywriting: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        },
        visuals: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        },
        pacing: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        },
        branding: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        },
        cta_effectiveness: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        }
      }
    },
    pros: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    cons: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    branding_analysis: { type: Type.STRING, description: "Analysis of color, tone, and positioning for aesthetics market" },
    suggested_scripts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          visual_cues: { type: Type.STRING }
        }
      }
    }
  }
};

export const analyzeVideo = async (file: File, additionalContext: string): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToGenerativePart(file);
  const mimeType = getMimeType(file);

  const prompt = `
    Atue como um especialista em marketing digital de classe mundial e diretor criativo focado no nicho de ESTÉTICA e BELEZA (Dermatologia, Harmonização, Cirurgia Plástica, Clínicas de Estética).
    
    Analise o vídeo fornecido com extremo rigor técnico e estético.
    
    Contexto Adicional do Usuário: "${additionalContext}"

    Sua tarefa é avaliar:
    1. **Copywriting e Roteiro**: A estrutura AIDA está presente? O hook é forte? Retém atenção?
    2. **Visual e Takes**: A iluminação favorece a estética? Os ângulos valorizam o profissional/procedimento? A edição é dinâmica?
    3. **Branding e Comunicação**: A linguagem passa autoridade e elegância? (Essencial para estética de alto ticket).
    4. **CTA**: É claro e direto?

    Além da análise, crie 2 versões OTIMIZADAS de roteiro baseadas no conteúdo do vídeo, mas melhoradas para viralização e conversão.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou nenhuma resposta de texto. O vídeo pode ser muito longo ou complexo.");
    }

    // Clean up potential markdown code blocks that might slip through
    const cleanedText = response.text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(cleanedText) as AnalysisResponse;

  } catch (error: any) {
    console.error("Error analyzing video:", error);
    const errorMessage = error.toString().toLowerCase();
    
    // Size limit errors
    if (errorMessage.includes("413") || errorMessage.includes("payload too large")) {
      throw new Error("O arquivo de vídeo é muito grande. O limite da API para envio direto foi excedido. Tente comprimir o vídeo.");
    }

    // Network/XHR errors (Common with large files in browser)
    if (errorMessage.includes("rpc failed") || errorMessage.includes("xhr error") || errorMessage.includes("error code: 6")) {
      throw new Error("Falha na conexão ao enviar o vídeo. Isso geralmente ocorre com arquivos grandes (>50MB) devido a limitações do navegador. Por favor, comprima o vídeo ou tente um arquivo menor.");
    }

    // Bad Request
    if (errorMessage.includes("400")) {
      throw new Error("Erro na requisição. O formato do vídeo pode não ser suportado ou o conteúdo foi bloqueado pela IA.");
    }

    throw error;
  }
};