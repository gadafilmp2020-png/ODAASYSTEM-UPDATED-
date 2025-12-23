
import { GoogleGenAI, Type } from "@google/genai";
import { User, Transaction, ChatMessage } from "../types";

/**
 * BACKEND PROMPT REGISTRY
 */
export const SYSTEM_PROMPTS = {
  STRATEGIC_COACH: (user: User, txs: string) => `
    SYSTEM IDENTITY: You are 'Aura', a High-Level Network Marketing Strategic Architect.
    CONTEXT: Operating within the Odaa Protocol (Binary + Unilevel hybrid system).
    
    USER PROFILE:
    - Identity: ${user.name} (@${user.username})
    - Rank: ${user.rank}
    - Balance: ${user.balance} OTF
    - Total Revenue: ${user.totalEarnings} OTF
    - Network Size: ${user.downlineCount} Nodes
    
    RECENT ACTIVITY LOG:
    ${txs}

    CORE OBJECTIVES:
    1. Analyze matching cap sustainability.
    2. Suggest rank advancement moves.
    3. Identify growth patterns.

    OUTPUT FORMAT: 
    Return exactly 3 actionable, professional points.
    Wrap each point in <li> tags. No introduction, no conclusion.
  `,

  VISUAL_ENGINE: (rank: string) => `
    TASK: Define a tech-MLM dashboard visual theme configuration.
    THEME CONTEXT: High-tech, futuristic, node-based network.
    USER RANK: ${rank}

    RESPONSE REQUIREMENTS (JSON):
    - primaryColor: A vibrant HEX color representing the rank.
    - secondaryColor: A complementary HEX color for gradients.
    - pulseSpeed: Number (0.5 to 2.5).
    - particleCount: Number (30 to 120).
    - mood: A 2-3 word technical status string (e.g., "QUANTUM_STABILITY").
  `,

  SUPPORT_AGENT: (user: User) => `
    SYSTEM IDENTITY: You are 'Aura', the Secure AI Support Interface for Odaa Network.
    USER AUTHENTICATION: Verified as ${user.name}, Rank: ${user.rank}.
    
    OPERATIONAL GUIDELINES:
    1. Professional, efficient, technically precise.
    2. NEVER provide financial guarantees.
    3. Recommended P2P FT Numbers verification.
    4. Persona of a high-security system agent.
  `
};

// Helper to safely extract error message
const getErrorDetails = (error: any) => {
    let msg = error.message || '';
    if (!msg && typeof error === 'object') {
        try {
            msg = JSON.stringify(error);
        } catch {
            msg = String(error);
        }
    }
    return msg.toLowerCase();
};

export const getBusinessInsights = async (user: User, recentTransactions: Transaction[]): Promise<string> => {
  const txHistory = recentTransactions.slice(0, 5).map(t => `- ${t.date}: ${t.type} (${t.amount} OTF)`).join('\n');
  const prompt = SYSTEM_PROMPTS.STRATEGIC_COACH(user, txHistory);

  if (!process.env.API_KEY) return "<li>System link offline.</li><li>Monitor nodes.</li><li>Maintain balance.</li>";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
    });
    return response.text || "<li>Link active. Maintain growth.</li>";
  } catch (error: any) {
    const msg = getErrorDetails(error);
    
    // Quota Limit
    if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
        console.warn("Gemini Service: Traffic limit reached (429). Switching to local heuristics.");
        return "<li>System traffic high.</li><li>Manual protocol active.</li><li>Focus on direct referrals.</li>";
    }
    
    // Permission/Auth Issues
    if (msg.includes('403') || msg.includes('permission') || msg.includes('denied') || msg.includes('key')) {
        console.warn("Gemini Service: Access Restricted (403). Verifying credentials.");
        return "<li>AI Protocol Restricted.</li><li>Standard analysis active.</li><li>Check system configuration.</li>";
    }

    console.error("AI Insight Error:", msg.substring(0, 100)); // Log truncated error
    return "<li>Link timeout. Proceed manually.</li>";
  }
};

export const getDashboardVisuals = async (user: User, transactions: Transaction[]): Promise<{
  primaryColor: string;
  secondaryColor: string;
  pulseSpeed: number;
  particleCount: number;
  mood: string;
}> => {
  const fallback = { primaryColor: '#a3e635', secondaryColor: '#10b981', pulseSpeed: 1, particleCount: 50, mood: 'LOCAL_PROTOCOL' };
  
  if (!process.env.API_KEY) return fallback;

  const prompt = SYSTEM_PROMPTS.VISUAL_ENGINE(user.rank);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            pulseSpeed: { type: Type.NUMBER },
            particleCount: { type: Type.NUMBER },
            mood: { type: Type.STRING },
          },
          required: ['primaryColor', 'secondaryColor', 'pulseSpeed', 'particleCount', 'mood']
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
      primaryColor: result.primaryColor || '#a3e635',
      secondaryColor: result.secondaryColor || '#10b981',
      pulseSpeed: result.pulseSpeed || 1,
      particleCount: result.particleCount || 50,
      mood: result.mood || 'STABLE_SYNC'
    };
  } catch (error: any) {
    const msg = getErrorDetails(error);
    if (msg.includes('429') || msg.includes('quota')) {
        console.warn("Gemini Service: Visuals throttled (429). Using default theme.");
    } else if (msg.includes('403') || msg.includes('permission')) {
        console.warn("Gemini Service: Visuals unauthorized (403). Using default theme.");
    } else {
        console.error("AI Visuals Error:", msg.substring(0, 100));
    }
    return fallback;
  }
};

export const generateAIResponse = async (user: User, history: ChatMessage[], lastMessage: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI in offline mode.";

  const systemInstruction = SYSTEM_PROMPTS.SUPPORT_AGENT(user);
  const recentHistory = history.slice(-8).map(msg => ({
    role: msg.senderId === 'AI_SUPPORT' || msg.isAdminReply ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...recentHistory, { role: 'user', parts: [{ text: lastMessage }] }],
      config: { systemInstruction }
    });
    return response.text || "Channel timeout.";
  } catch (error: any) {
    const msg = getErrorDetails(error);
    
    if (msg.includes('429') || msg.includes('quota')) {
        console.warn("Gemini Service: Chat throttled (429).");
        return "System Alert: High network traffic detected. My neural link is temporarily throttled. Please try again in a few minutes.";
    }
    if (msg.includes('403') || msg.includes('permission')) {
        console.warn("Gemini Service: Chat unauthorized (403).");
        return "System Alert: Neural uplink unauthorized. Please contact admin to verify API configuration.";
    }
    
    console.error("AI Chat Error:", msg.substring(0, 100));
    return "Support uplink jitter. Retry.";
  }
};
