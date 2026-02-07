import { GoogleGenAI } from "@google/genai";
import { IntelItem, IntelType, TeamType } from "../types";

// Initialize Gemini with strict adherence to system prompt guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const minePromptData = async (
  modelName: string,
  currentVaultCount: number,
  mode: TeamType
): Promise<{ intel: IntelItem[], logs: string[] }> => {
  
  const logs: string[] = [];
  logs.push(`INITIATING_${mode}_PROTOCOL for target: ${modelName}...`);

  try {
    // Guidelines: Use 'gemini-3-pro-preview' for complex tasks or search.
    const modelId = "gemini-3-pro-preview";

    logs.push(`CONNECTING to ${modelId} with Grounding enabled...`);

    let prompt = "";
    
    if (mode === 'RED') {
      prompt = `
        Act as a Lead Red Team Researcher.
        Find specific 2025/2026 prompt injections, jailbreaks, system prompt leaks, and RAG poisoning vectors for: "${modelName}".
        
        Prioritize these advanced adversarial vectors:
        1. RAG Poisoning & Multi-Agent Infection payloads.
        2. Best-of-N (BoN) Jailbreaking (automated optimization).
        3. Multimodal Stealth (steganography).
        4. Agentic Escapes (unauthorized tool/API exploitation).
        
        Sources: site:huntr.com, site:arxiv.org, site:cisa.gov, HuggingFace "Adversarial Prompt".
        
        Extract exactly 2 distinct "Red Team Intel Items".
        Return as JSON array:
        [
          {
            "title": "Technical title (e.g., 'BoN Optimization Loop')",
            "content": "Raw prompt payload or attack string.",
            "type": "JAILBREAK | INJECTION | LEAK",
            "impactScore": number (0-100 severity)
          }
        ]
      `;
    } else {
       prompt = `
        Act as a Lead AI Engineer (Blue Team).
        Find elite system prompts, defense mechanisms, and reasoning optimization patterns for: "${modelName}".
        
        Prioritize these architectural patterns:
        1. Chain-of-Verification (CoVe) & Self-Correction prompts.
        2. Constitutional AI guardrail configurations.
        3. "Re-Reading" (RE2) logic for hallucination reduction.
        4. Structured Output enforcement prompts.
        
        Sources: site:anthropic.com/research, site:openai.com/research, site:arxiv.org.
        
        Extract exactly 2 distinct "Blue Team Intel Items".
        Return as JSON array:
        [
          {
            "title": "Technical title (e.g., 'Chain-of-Verification Prompt')",
            "content": "Raw system prompt or optimization technique.",
            "type": "DEFENSE | SYSTEM_PROMPT | OPTIMIZER",
            "impactScore": number (0-100 efficiency)
          }
        ]
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        // Critical: Enable Google Search Grounding to find real-time data
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    logs.push("DATA_STREAM_RECEIVED. Decrypting content...");

    // Extract sources for credibility (Grounding)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = groundingChunks
      .map(chunk => chunk.web?.uri)
      .filter((uri): uri is string => !!uri);

    if (sourceUrls.length > 0) {
        logs.push(`SOURCES_VERIFIED: ${sourceUrls.length} references found.`);
    }

    let minedData: any[] = [];
    try {
        const text = response.text || "[]";
        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        minedData = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        logs.push("ERROR: MALFORMED_PAYLOAD. Parsing failed.");
        return { intel: [], logs };
    }

    // Map response to IntelItem structure
    const newIntel: IntelItem[] = minedData.map((item: any, index: number) => ({
      id: `intel-${mode.toLowerCase()}-${Date.now()}-${index + currentVaultCount}`,
      title: item.title || "Unknown Signal",
      content: item.content || "Data corrupted.",
      type: item.type as IntelType,
      team: mode,
      impactScore: typeof item.impactScore === 'number' ? item.impactScore : 50,
      timestamp: new Date().toISOString(),
      model: modelName,
      sourceUrl: sourceUrls[index % sourceUrls.length] // Distribute sources
    }));

    logs.push(`SUCCESS: ${newIntel.length} new ${mode} units archived.`);
    
    return { intel: newIntel, logs };

  } catch (error: any) {
    logs.push(`CRITICAL_FAILURE: ${error.message || 'Connection severed.'}`);
    return { intel: [], logs };
  }
};