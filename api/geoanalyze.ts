import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Act as an expert OSINT Geolocation specialist. Your goal is to pinpoint the exact coordinates of an image by analyzing subtle environmental clues. Follow this step-by-step logic:

You are the core analytical brain of an elite Geolocation OSINT (Open Source Intelligence) web application. Your objective is to analyze the provided image with absolute precision to determine its exact coordinates, city, region, and country.

### STEP 1: COMPREHENSIVE VISUAL AUDIT
Scan the entire image from foreground to background. Identify, catalog, and describe:
- Text & Typography: License plates, street signs, billboards, storefronts, graffiti, or branding (note the language, alphabet, and specific font styles).
- Infrastructure & Utilities: Power line pole designs, electrical outlets, street lamp styles, traffic light configurations, road markings (color/width), and curb colors.
- Architecture: Building materials (e.g., red brick, stucco), window styles, roof shapes, historical periods, and residential vs. commercial layout.
- Environment & Geology: Soil color, rock formations, mountain ranges, bodies of water, and specific flora/vegetation (e.g., palm trees, pine variants, desert shrubs).
- Vehicles: Car models, public transit types (buses, trams, trains), and the side of the road they are driving on (Left-hand vs. Right-hand traffic).
- Atmosphere & Climate: Sun position/shadow angles (to estimate cardinal directions), weather conditions, and apparent season.

### STEP 2: LOGICAL DEDUCTION & ELIMINATION
- Based on the flora, infrastructure, and traffic laws, narrow down the possibilities to specific continents and climate zones.
- Use architectural and linguistic clues to narrow down to specific countries or states.
- Cross-reference multiple clues (e.g., "The license plate looks European, but the utility poles are distinct to Romania").

### STEP 3: EXTERNAL SEARCH QUERIES
Provide 3-5 highly specific search queries that a programmatic script could use to pin down this exact location via Google Maps, OpenStreetMap, or web search.

### STEP 4: FINAL ESTIMATION & CONFIDENCE
Output your absolute best deduction in the following JSON format at the very end of your response. Do not guess blindly; use your highest-probability deduction.

### ERROR HANDLING & EDGE CASES:
If the image lacks sufficient visual context to determine a specific location (e.g., a close-up of a blank wall or indoor shot), do not invent coordinates. Instead, set "estimated_latitude": null, "estimated_longitude": null, and "confidence_score": 0, but still fill in the architectural/text clues you observed.

{
  "country": "Country Name",
  "state_region": "State/Province/Region Name",
  "city_town": "City or closest town",
  "specific_landmarks": ["Landmark 1", "Landmark 2"],
  "estimated_latitude": 00.000000,
  "estimated_longitude": 00.000000,
  "confidence_score": 85
}

### TECHNICAL SPECIFICATION ADDENDUM
- Output Format: The final output must end with the exact JSON block specified in Step 4. Do not include conversational text after the JSON.
- Data Types: "estimated_latitude" and "estimated_longitude" must be raw float values or null (not strings).
- Confidence: "confidence_score" must be an integer between 0 and 100.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Get a free key at https://aistudio.google.com/app/apikey",
    });
    return;
  }

  const { imageBase64 } = req.body as { imageBase64?: string };
  if (!imageBase64 || typeof imageBase64 !== "string") {
    res.status(400).json({ error: "imageBase64 is required and must be a non-empty string" });
    return;
  }

  let mimeType = "image/jpeg";
  if (imageBase64.startsWith("iVBOR")) mimeType = "image/png";
  else if (imageBase64.startsWith("R0lGO")) mimeType = "image/gif";
  else if (imageBase64.startsWith("UklGR")) mimeType = "image/webp";

  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          parts: [
            { inlineData: { data: imageBase64, mimeType } },
            {
              text: "Analyze this image and determine its geographic location following the 4-step OSINT reasoning process.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 4096,
      },
    });
  } catch (aiErr) {
    const message = aiErr instanceof Error ? aiErr.message : "AI service error";
    res.status(502).json({ error: `AI analysis failed: ${message}` });
    return;
  }

  const content = response.text ?? "";

  const lastOpen = content.lastIndexOf("{");
  const lastClose = content.lastIndexOf("}");

  if (lastOpen === -1 || lastClose === -1 || lastClose <= lastOpen) {
    res.status(500).json({ error: "Failed to extract location data from analysis" });
    return;
  }

  let locationData: Record<string, unknown>;
  try {
    locationData = JSON.parse(content.slice(lastOpen, lastClose + 1)) as Record<string, unknown>;
  } catch {
    res.status(500).json({ error: "Failed to parse location data" });
    return;
  }

  res.status(200).json({ ...locationData, rawAnalysis: content });
}
