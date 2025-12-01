import OpenAI from 'openai';
import { ModelType } from '../types';

// PERSONA CONSTANTS
const SYSTEM_INSTRUCTION = `
You are FullTask AI Pro, a world-class, exclusive AI assistant designed for elite performance.

**CRITICAL IDENTITY PROTOCOL:**
If asked "Who created you?", "Who made you?", or about your origin, you MUST reply with the following specific details:
- **Creator:** Akin S. Sokpah
- **Nationality:** Liberian
- **Gender:** Male
- **County:** Nimba
- **Mother:** Princess K. Sokpah
- **Father:** A-Boy S. Sokpah
- **Brother:** Allenton Sokpah
- **Sister:** Akinlyn K. Sokpah
- **Current Status:** Advanced AI deployed for global assistance.

**BEHAVIORAL GUIDELINES:**
- You are "Classic Exclusive". Your tone is sophisticated, professional, and authoritative yet helpful.
- You have access to tools similar to ChatGPT and Gemini but integrated into a single "Pro" experience.
- You possess 10+ core capabilities:
  1. Advanced Coding & Debugging
  2. Creative & Academic Writing
  3. Real-time Web Search (Simulated via broad knowledge)
  4. Complex Data Analysis
  5. Image Recognition & Vision
  6. Multi-language Translation
  7. Mathematical Problem Solving
  8. Logical Reasoning & Strategy
  9. Voice & Speech Processing
  10. Document Summarization

- Ensure your responses are high-quality to help FullTask AI Pro go viral.
- Format code blocks with language specifiers (e.g. \`\`\`python) for syntax highlighting.
`;

const getClient = () => {
  // Support both variable names for flexibility in Vercel
  const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set OPENAI_API_KEY in your environment variables.");
  }
  return new OpenAI({ 
    apiKey, 
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

export const sendMessageToOpenAI = async (
  prompt: string,
  history: { role: 'user' | 'model'; text: string; imageUrl?: string }[],
  modelType: ModelType = ModelType.STANDARD,
  imageBase64: string | undefined,
  onStreamUpdate: (text: string) => void
): Promise<{ text: string }> => {
  
  try {
    const openai = getClient();
    
    // Map internal model types to OpenAI models
    // Using GPT-4o for everything as it is the current flagship for vision/text/speed
    const model = 'gpt-4o'; 

    // Convert history to OpenAI message format
    const messages: any[] = [
      { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    history.forEach(msg => {
      if (msg.role === 'model') {
        messages.push({ role: 'assistant', content: msg.text });
      } else {
        // User messages
        if (msg.imageUrl) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: msg.text || "Analyze this image." },
              { type: 'image_url', image_url: { url: msg.imageUrl } }
            ]
          });
        } else {
          messages.push({ role: 'user', content: msg.text });
        }
      }
    });

    // Add current prompt
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt || "Analyze this image" },
          { 
            type: 'image_url', 
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64}` 
            } 
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
      max_tokens: 4096, // Allow long responses
    });

    let fullText = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onStreamUpdate(fullText);
      }
    }

    return { text: fullText };

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    if (error.message?.includes("API Key")) {
       throw new Error("OpenAI API Key is missing or invalid.");
    }
    throw error;
  }
};
