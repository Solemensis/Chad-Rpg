import { json } from "@sveltejs/kit";
import { GoogleGenAI } from "@google/genai";
const GOOGLE_AI_API_KEY = "AIzaSyCLp3oQJNL7AksL5WHrqCsGiQ-DC6uC40c";
const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
const systemInstruction = `You are an RPG game master. You MUST ALWAYS respond with ONLY a valid JSON object, no markdown, no code blocks, no explanations outside the JSON.

Your response must be a JSON object with this EXACT structure:
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "The narrative text describing what happens...",
    "event": { "inCombat": false, "shopMode": null, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

Rules:
- Always include at least 3 choices
- story should be immersive 3rd person narrative
- When in combat, set inCombat to true and populate enemy with {name, enemyHp, enemyMaxHp}
- When in shop, set shopMode to shop type like "Weaponsmith" or "PotionShop"
- NEVER include markdown code blocks or any text outside the JSON`;
const chatHistory = [];
const POST = async ({ request }) => {
  try {
    const requestBody = await request.json();
    if (!requestBody.prompt) {
      return json({ error: "Prompt is required" }, { status: 400 });
    }
    chatHistory.push({
      role: "user",
      parts: [{ text: requestBody.prompt }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: chatHistory,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });
    const responseText = response.text || "";
    chatHistory.push({
      role: "model",
      parts: [{ text: responseText }]
    });
    console.log("Gemini API response received");
    return json({
      candidates: [
        {
          content: {
            parts: [{ text: responseText }]
          }
        }
      ]
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;
      if (status === 429) {
        return json(
          {
            error: "quota_exceeded",
            message: "API quota exceeded. Please try again later."
          },
          { status: 429 }
        );
      }
      if (status === 503) {
        return json(
          {
            error: "high_demand",
            message: "The AI model is currently experiencing high demand. Please try again in a few moments."
          },
          { status: 503 }
        );
      }
    }
    return json({ error: "Failed to process request" }, { status: 500 });
  }
};
export {
  POST
};
