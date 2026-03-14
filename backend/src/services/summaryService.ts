import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const generateSummary = async (transcript: string): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set in environment variables');
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Empty transcript provided');
  }

  try {
    const systemPrompt = `Eres un asistente experto en crear resúmenes detallados y estructurados de transcripciones de audio.

Tu tarea es:
1. Crear un resumen detallado que capture los puntos principales
2. Mantener la estructura lógica del contenido
3. Ser preciso y conciso
4. Destacar información importante
5. Incluir detalles relevantes

Formato recomendado:
- Resumen ejecutivo (2-3 párrafos)
- Puntos clave (lista)
- Temas tratados
- Conclusiones o próximos pasos (si aplican)`;

    const userPrompt = `Por favor, crea un resumen detallado de la siguiente transcripción:

${transcript}`;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    console.log(`📝 Generating summary with Groq API (model: ${model})`);

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 1 minute timeout
      }
    );

    const summary = response.data.choices[0].message.content;
    console.log(`✅ Summary generated successfully`);
    
    return summary;
  } catch (error: any) {
    console.error('❌ Summary generation error:', error.message);
    
    if (error.response?.data) {
      console.error('API Error details:', error.response.data);
    }
    
    throw new Error(`Summary generation failed: ${error.message}`);
  }
};

export const validateTranscript = (transcript: string): boolean => {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Empty transcript');
  }

  if (transcript.length > 25000) {
    console.warn('⚠️ Transcript is very long (>25000 chars), this may be truncated by Groq');
  }

  return true;
};
