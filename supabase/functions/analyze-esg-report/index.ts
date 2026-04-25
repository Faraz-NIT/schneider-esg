// Analyze ESG report text using Lovable AI Gateway with structured tool-calling output.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert ESG analyst specializing in sustainability disclosure quality, sentiment analysis, and greenwashing detection.
You analyze corporate ESG / sustainability reports, earnings call transcripts, and news coverage.
Be rigorous, evidence-based, and skeptical. Quote short snippets (≤15 words) directly from the document when flagging issues.
Always return structured output via the provided tool. Never refuse — partial analysis is fine if input is short.`;

interface RequestBody {
  text: string;
  company?: string;
  year?: number;
  sourceLabel?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, company = "Schneider Electric", year, sourceLabel = "ESG Report" } =
      (await req.json()) as RequestBody;

    if (!text || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Provide at least 50 characters of report text." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Truncate to keep token usage sane
    const trimmed = text.slice(0, 60_000);

    const tool = {
      type: "function",
      function: {
        name: "report_analysis",
        description: "Return structured NLP analysis of an ESG document.",
        parameters: {
          type: "object",
          properties: {
            overall: {
              type: "object",
              properties: {
                sentiment: { type: "number", description: "Net sentiment from -1 (very negative) to 1 (very positive)" },
                confidence: { type: "number", description: "0-1 confidence in analysis" },
                tone_summary: { type: "string", description: "1-2 sentences describing tone" },
              },
              required: ["sentiment", "confidence", "tone_summary"],
            },
            dimension_sentiment: {
              type: "array",
              description: "Sentiment broken out by ESG pillar",
              items: {
                type: "object",
                properties: {
                  dimension: { type: "string", enum: ["Environment", "Social", "Governance"] },
                  sentiment: { type: "number" },
                  highlight: { type: "string" },
                },
                required: ["dimension", "sentiment", "highlight"],
              },
            },
            topics: {
              type: "array",
              description: "5-8 dominant ESG themes with relative weight (sums to ~100)",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  weight: { type: "number" },
                  pillar: { type: "string", enum: ["E", "S", "G"] },
                  sample_phrase: { type: "string" },
                },
                required: ["topic", "weight", "pillar", "sample_phrase"],
              },
            },
            greenwashing_signals: {
              type: "array",
              description: "Greenwashing risk flags. Empty array if none.",
              items: {
                type: "object",
                properties: {
                  signal: {
                    type: "string",
                    enum: [
                      "Vague language",
                      "Unsubstantiated claim",
                      "Commitment without timeline",
                      "Cherry-picked metric",
                      "Missing scope 3",
                      "Hedging / qualifier overuse",
                      "Selective disclosure",
                      "No third-party assurance",
                    ],
                  },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  evidence_quote: { type: "string", description: "Short verbatim quote ≤15 words" },
                  rationale: { type: "string" },
                },
                required: ["signal", "severity", "evidence_quote", "rationale"],
              },
            },
            disclosure_quality: {
              type: "object",
              description: "Each metric scored 0-100",
              properties: {
                specificity: { type: "number" },
                quantification: { type: "number" },
                forward_looking: { type: "number" },
                assurance: { type: "number" },
                coverage_breadth: { type: "number" },
              },
              required: ["specificity", "quantification", "forward_looking", "assurance", "coverage_breadth"],
            },
            keywords: {
              type: "array",
              description: "Top 15 salient keywords/bigrams with frequency proxy 1-100",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  weight: { type: "number" },
                },
                required: ["term", "weight"],
              },
            },
            executive_summary: { type: "string", description: "3-4 sentence analyst summary" },
          },
          required: [
            "overall",
            "dimension_sentiment",
            "topics",
            "greenwashing_signals",
            "disclosure_quality",
            "keywords",
            "executive_summary",
          ],
        },
      },
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content:
              `Analyze the following ${sourceLabel} for ${company}${year ? ` (year ${year})` : ""}.\n\n` +
              `--- DOCUMENT START ---\n${trimmed}\n--- DOCUMENT END ---`,
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached, please retry shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI analysis failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(aiJson).slice(0, 500));
      return new Response(JSON.stringify({ error: "Model returned no structured output." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis, company, year, sourceLabel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-esg-report error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
