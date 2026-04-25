import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------
export type Analysis = {
  overall: { sentiment: number; confidence: number; tone_summary: string };
  dimension_sentiment: { dimension: "Environment" | "Social" | "Governance"; sentiment: number; highlight: string }[];
  topics: { topic: string; weight: number; pillar: "E" | "S" | "G"; sample_phrase: string }[];
  greenwashing_signals: { signal: string; severity: "low" | "medium" | "high"; evidence_quote: string; rationale: string }[];
  disclosure_quality: {
    specificity: number;
    quantification: number;
    forward_looking: number;
    assurance: number;
    coverage_breadth: number;
  };
  keywords: { term: string; weight: number }[];
  executive_summary: string;
};

type ReportEntry = {
  id: string;
  label: string;
  year: number;
  analysis: Analysis;
};

// ---------- Demo data (Schneider 2021-2024 + peers) ----------
const DEMO_REPORTS: ReportEntry[] = [
  {
    id: "se-2021",
    label: "Schneider · Universal Registration Document 2021",
    year: 2021,
    analysis: {
      overall: { sentiment: 0.42, confidence: 0.82, tone_summary: "Optimistic but heavy on aspiration; quantified Scope 1-2 progress, lighter on Scope 3 specifics." },
      dimension_sentiment: [
        { dimension: "Environment", sentiment: 0.55, highlight: "Net-zero ambition reaffirmed across operations." },
        { dimension: "Social", sentiment: 0.31, highlight: "Diversity targets disclosed; supply-chain labor data sparse." },
        { dimension: "Governance", sentiment: 0.38, highlight: "Board ESG oversight formalized via Sustainability Committee." },
      ],
      topics: [
        { topic: "Decarbonization", weight: 22, pillar: "E", sample_phrase: "halve operational CO₂ by 2025" },
        { topic: "Energy efficiency", weight: 16, pillar: "E", sample_phrase: "EcoStruxure smart-building deployments" },
        { topic: "Circular economy", weight: 11, pillar: "E", sample_phrase: "take-back programs and refurbished offers" },
        { topic: "Diversity & inclusion", weight: 14, pillar: "S", sample_phrase: "50/40/30 gender ambition" },
        { topic: "Health & safety", weight: 9, pillar: "S", sample_phrase: "MIR reduction year-on-year" },
        { topic: "Supply-chain ethics", weight: 10, pillar: "S", sample_phrase: "responsible sourcing audits" },
        { topic: "Board oversight", weight: 9, pillar: "G", sample_phrase: "ESG-linked executive remuneration" },
        { topic: "Cybersecurity", weight: 9, pillar: "G", sample_phrase: "secure-by-design product lifecycle" },
      ],
      greenwashing_signals: [
        { signal: "Commitment without timeline", severity: "medium", evidence_quote: "ambition to reach net-zero across the value chain", rationale: "Value-chain net-zero stated without interim Scope 3 milestones." },
        { signal: "Hedging / qualifier overuse", severity: "low", evidence_quote: "we aim to substantially reduce", rationale: "Soft modal verbs cluster around emissions targets." },
      ],
      disclosure_quality: { specificity: 72, quantification: 68, forward_looking: 81, assurance: 64, coverage_breadth: 78 },
      keywords: [
        { term: "net-zero", weight: 92 }, { term: "scope 1-2", weight: 78 }, { term: "EcoStruxure", weight: 71 },
        { term: "circular", weight: 64 }, { term: "diversity", weight: 60 }, { term: "supplier", weight: 57 },
        { term: "renewable", weight: 55 }, { term: "scope 3", weight: 41 }, { term: "biodiversity", weight: 28 },
        { term: "human rights", weight: 35 }, { term: "audit", weight: 33 }, { term: "remuneration", weight: 30 },
        { term: "TCFD", weight: 47 }, { term: "SBTi", weight: 52 }, { term: "transition plan", weight: 39 },
      ],
      executive_summary: "2021 report is forward-leaning with strong narrative on decarbonization and EcoStruxure-led customer abatement. Quantified operational targets contrast with vaguer Scope 3 framing. Disclosure breadth is strong; assurance scope still limited.",
    },
  },
  {
    id: "se-2022",
    label: "Schneider · Universal Registration Document 2022",
    year: 2022,
    analysis: {
      overall: { sentiment: 0.48, confidence: 0.85, tone_summary: "Tighter quantification, more interim milestones, stronger linkage between strategy and ESG KPIs." },
      dimension_sentiment: [
        { dimension: "Environment", sentiment: 0.6, highlight: "Scope 3 baseline disclosed for the first time." },
        { dimension: "Social", sentiment: 0.4, highlight: "Family Leave Policy expanded globally." },
        { dimension: "Governance", sentiment: 0.42, highlight: "Sustainability KPIs weight 20% of LTI." },
      ],
      topics: [
        { topic: "Decarbonization", weight: 23, pillar: "E", sample_phrase: "-25% absolute Scope 1+2 vs 2017" },
        { topic: "Scope 3 supply chain", weight: 14, pillar: "E", sample_phrase: "Zero Carbon Project for 1,000 suppliers" },
        { topic: "Energy efficiency", weight: 14, pillar: "E", sample_phrase: "customers' avoided emissions" },
        { topic: "Diversity & inclusion", weight: 13, pillar: "S", sample_phrase: "hiring, paying and promoting equity" },
        { topic: "Health & safety", weight: 8, pillar: "S", sample_phrase: "MIR target 0.45" },
        { topic: "Supply-chain ethics", weight: 9, pillar: "S", sample_phrase: "ICOFR controls extended" },
        { topic: "Board oversight", weight: 10, pillar: "G", sample_phrase: "Lead Independent Director" },
        { topic: "Cybersecurity", weight: 9, pillar: "G", sample_phrase: "ISA/IEC 62443 alignment" },
      ],
      greenwashing_signals: [
        { signal: "Cherry-picked metric", severity: "low", evidence_quote: "800 million tonnes of CO₂ saved by customers", rationale: "Avoided emissions framed prominently; methodology footnote dense." },
        { signal: "No third-party assurance", severity: "medium", evidence_quote: "internally reviewed Schneider Sustainability Impact", rationale: "SSI program lacks limited assurance for several KPIs." },
      ],
      disclosure_quality: { specificity: 79, quantification: 76, forward_looking: 83, assurance: 70, coverage_breadth: 82 },
      keywords: [
        { term: "scope 3", weight: 70 }, { term: "Zero Carbon", weight: 75 }, { term: "SBTi 1.5°C", weight: 68 },
        { term: "EcoStruxure", weight: 72 }, { term: "avoided emissions", weight: 66 }, { term: "diversity", weight: 60 },
        { term: "LTI", weight: 47 }, { term: "TCFD", weight: 55 }, { term: "biodiversity", weight: 33 },
        { term: "human rights", weight: 41 }, { term: "audit", weight: 40 }, { term: "supplier", weight: 64 },
        { term: "transition plan", weight: 50 }, { term: "circular", weight: 58 }, { term: "renewable", weight: 60 },
      ],
      executive_summary: "Material progress on Scope 3 baseline disclosure and supplier engagement. Compensation linkage to ESG strengthens governance signal. Avoided-emissions claims remain prominent and warrant clearer attribution methodology.",
    },
  },
  {
    id: "se-2023",
    label: "Schneider · Sustainability & URD 2023",
    year: 2023,
    analysis: {
      overall: { sentiment: 0.51, confidence: 0.87, tone_summary: "Mature reporting cadence; SBTi 1.5°C validated; clearer Scope 3 trajectory but mixed third-party assurance coverage." },
      dimension_sentiment: [
        { dimension: "Environment", sentiment: 0.62, highlight: "Validated SBTi 1.5°C pathway including FLAG." },
        { dimension: "Social", sentiment: 0.45, highlight: "Wellbeing index rolled out across 150K employees." },
        { dimension: "Governance", sentiment: 0.46, highlight: "Independent assurance extended to 9 KPIs." },
      ],
      topics: [
        { topic: "Decarbonization", weight: 24, pillar: "E", sample_phrase: "-90% Scope 1+2 by 2030" },
        { topic: "Scope 3 supply chain", weight: 16, pillar: "E", sample_phrase: "Materials Impact Calculator" },
        { topic: "Energy efficiency", weight: 13, pillar: "E", sample_phrase: "customer prosumer offer" },
        { topic: "Diversity & inclusion", weight: 12, pillar: "S", sample_phrase: "Global Family Leave 12 weeks" },
        { topic: "Health & safety", weight: 7, pillar: "S", sample_phrase: "MIR 0.40 achieved" },
        { topic: "Supply-chain ethics", weight: 9, pillar: "S", sample_phrase: "responsible sourcing playbook" },
        { topic: "Board oversight", weight: 10, pillar: "G", sample_phrase: "ESG Committee chaired by LID" },
        { topic: "Cybersecurity", weight: 9, pillar: "G", sample_phrase: "Cyber Trust mark" },
      ],
      greenwashing_signals: [
        { signal: "Selective disclosure", severity: "low", evidence_quote: "leading sustainable industrial company", rationale: "Self-ranking phrase used without comparator framework." },
        { signal: "Hedging / qualifier overuse", severity: "low", evidence_quote: "we aspire to substantially decarbonize", rationale: "Aspirational verbs persist alongside hard targets." },
      ],
      disclosure_quality: { specificity: 84, quantification: 82, forward_looking: 85, assurance: 76, coverage_breadth: 86 },
      keywords: [
        { term: "SBTi 1.5°C", weight: 82 }, { term: "scope 3", weight: 80 }, { term: "Zero Carbon", weight: 78 },
        { term: "avoided emissions", weight: 70 }, { term: "EcoStruxure", weight: 73 }, { term: "diversity", weight: 64 },
        { term: "biodiversity", weight: 47 }, { term: "human rights", weight: 50 }, { term: "audit", weight: 48 },
        { term: "remuneration", weight: 44 }, { term: "TCFD", weight: 60 }, { term: "transition plan", weight: 65 },
        { term: "supplier", weight: 70 }, { term: "circular", weight: 62 }, { term: "renewable", weight: 66 },
      ],
      executive_summary: "Disclosure quality moves clearly above peer median. Validated 1.5°C pathway and broader assurance coverage are the standout governance signals. Residual aspirational phrasing kept greenwashing risk low but non-zero.",
    },
  },
  {
    id: "se-2024",
    label: "Schneider · Sustainability Report 2024",
    year: 2024,
    analysis: {
      overall: { sentiment: 0.55, confidence: 0.89, tone_summary: "Confident, data-rich, peer-leading on quantification; biodiversity and water disclosure remain the lighter chapters." },
      dimension_sentiment: [
        { dimension: "Environment", sentiment: 0.66, highlight: "Scope 3 down 11% vs 2021 baseline." },
        { dimension: "Social", sentiment: 0.5, highlight: "Living wage achieved for 99.6% of employees." },
        { dimension: "Governance", sentiment: 0.5, highlight: "CSRD double-materiality assessment published." },
      ],
      topics: [
        { topic: "Decarbonization", weight: 25, pillar: "E", sample_phrase: "Scope 3 -11% vs 2021" },
        { topic: "Scope 3 supply chain", weight: 18, pillar: "E", sample_phrase: "1,000 suppliers halve emissions" },
        { topic: "Energy efficiency", weight: 12, pillar: "E", sample_phrase: "Grid-edge orchestration" },
        { topic: "Diversity & inclusion", weight: 11, pillar: "S", sample_phrase: "pay equity ratio 99%" },
        { topic: "Living wage", weight: 8, pillar: "S", sample_phrase: "99.6% of workforce above living wage" },
        { topic: "Supply-chain ethics", weight: 8, pillar: "S", sample_phrase: "human-rights saliency map" },
        { topic: "Board oversight", weight: 9, pillar: "G", sample_phrase: "CSRD double materiality" },
        { topic: "Cybersecurity", weight: 9, pillar: "G", sample_phrase: "secure development lifecycle" },
      ],
      greenwashing_signals: [
        { signal: "Selective disclosure", severity: "low", evidence_quote: "industry-leading climate transition plan", rationale: "Leadership phrasing without external benchmarking citation." },
      ],
      disclosure_quality: { specificity: 88, quantification: 87, forward_looking: 86, assurance: 83, coverage_breadth: 89 },
      keywords: [
        { term: "CSRD", weight: 85 }, { term: "double materiality", weight: 80 }, { term: "scope 3", weight: 84 },
        { term: "SBTi 1.5°C", weight: 83 }, { term: "Zero Carbon", weight: 80 }, { term: "living wage", weight: 70 },
        { term: "EcoStruxure", weight: 72 }, { term: "biodiversity", weight: 55 }, { term: "human rights", weight: 60 },
        { term: "audit", weight: 56 }, { term: "remuneration", weight: 50 }, { term: "TCFD", weight: 66 },
        { term: "transition plan", weight: 72 }, { term: "supplier", weight: 72 }, { term: "circular", weight: 65 },
      ],
      executive_summary: "Strongest disclosure year on record. CSRD-aligned double materiality and broadened assurance perimeter stand out. Greenwashing risk now confined to mild leadership self-positioning.",
    },
  },
];

const PEER_DISCLOSURE = [
  { metric: "Specificity", "Schneider Electric": 88, Siemens: 84, ABB: 79, Eaton: 73 },
  { metric: "Quantification", "Schneider Electric": 87, Siemens: 82, ABB: 78, Eaton: 71 },
  { metric: "Forward-looking", "Schneider Electric": 86, Siemens: 80, ABB: 76, Eaton: 70 },
  { metric: "Assurance", "Schneider Electric": 83, Siemens: 78, ABB: 70, Eaton: 64 },
  { metric: "Coverage", "Schneider Electric": 89, Siemens: 85, ABB: 80, Eaton: 72 },
];

const PEER_HEX: Record<string, string> = {
  "Schneider Electric": "#3DCD58",
  Siemens: "#00B0F0",
  ABB: "#FF6B35",
  Eaton: "#9B59B6",
};

const PILLAR_HEX: Record<"E" | "S" | "G", string> = {
  E: "#3DCD58",
  S: "#00B0F0",
  G: "#9B59B6",
};

const SEVERITY_STYLE: Record<string, { bg: string; text: string; ring: string }> = {
  low: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/30" },
  medium: { bg: "bg-orange-500/10", text: "text-orange-600", ring: "ring-orange-500/30" },
  high: { bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/30" },
};

// ---------- Component ----------
export const NLPTab = () => {
  const [reports, setReports] = useState<ReportEntry[]>(DEMO_REPORTS);
  const [selectedId, setSelectedId] = useState<string>(DEMO_REPORTS[DEMO_REPORTS.length - 1].id);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteLabel, setPasteLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const sentimentTrend = useMemo(() => {
    const sorted = [...reports].sort((a, b) => a.year - b.year);
    return sorted.map((r) => {
      const dim = r.analysis.dimension_sentiment;
      const env = dim.find((d) => d.dimension === "Environment")?.sentiment ?? 0;
      const soc = dim.find((d) => d.dimension === "Social")?.sentiment ?? 0;
      const gov = dim.find((d) => d.dimension === "Governance")?.sentiment ?? 0;
      return {
        year: r.year,
        Overall: +(r.analysis.overall.sentiment * 100).toFixed(1),
        Environment: +(env * 100).toFixed(1),
        Social: +(soc * 100).toFixed(1),
        Governance: +(gov * 100).toFixed(1),
      };
    });
  }, [reports]);

  const radarData = useMemo(() => {
    const dq = selected.analysis.disclosure_quality;
    return [
      { metric: "Specificity", "Schneider Electric": dq.specificity, Siemens: PEER_DISCLOSURE[0].Siemens, ABB: PEER_DISCLOSURE[0].ABB, Eaton: PEER_DISCLOSURE[0].Eaton },
      { metric: "Quantification", "Schneider Electric": dq.quantification, Siemens: PEER_DISCLOSURE[1].Siemens, ABB: PEER_DISCLOSURE[1].ABB, Eaton: PEER_DISCLOSURE[1].Eaton },
      { metric: "Forward-looking", "Schneider Electric": dq.forward_looking, Siemens: PEER_DISCLOSURE[2].Siemens, ABB: PEER_DISCLOSURE[2].ABB, Eaton: PEER_DISCLOSURE[2].Eaton },
      { metric: "Assurance", "Schneider Electric": dq.assurance, Siemens: PEER_DISCLOSURE[3].Siemens, ABB: PEER_DISCLOSURE[3].ABB, Eaton: PEER_DISCLOSURE[3].Eaton },
      { metric: "Coverage", "Schneider Electric": dq.coverage_breadth, Siemens: PEER_DISCLOSURE[4].Siemens, ABB: PEER_DISCLOSURE[4].ABB, Eaton: PEER_DISCLOSURE[4].Eaton },
    ];
  }, [selected]);

  const sortedTopics = useMemo(
    () => [...selected.analysis.topics].sort((a, b) => b.weight - a.weight),
    [selected]
  );

  const analyzeText = async (text: string, label: string, year: number) => {
    if (!text || text.trim().length < 50) {
      toast.error("Need at least 50 characters of report text");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-esg-report", {
        body: { text, sourceLabel: label, year, company: "Schneider Electric" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const id = `custom-${Date.now()}`;
      const entry: ReportEntry = { id, label, year, analysis: data.analysis as Analysis };
      setReports((cur) => [...cur, entry]);
      setSelectedId(id);
      setPasteOpen(false);
      setPasteText("");
      setPasteLabel("");
      toast.success("Report analyzed");
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    const pdfjs: any = await import("pdfjs-dist");
    // Use the worker from the same package via Vite's ?url import
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    const parts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 200);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map((it: any) => it.str).join(" "));
      if (parts.join(" ").length > 80_000) break; // keep token usage sane
    }
    return parts.join("\n\n");
  };

  const yearFromName = (name: string) => {
    const m = name.match(/(20\d{2})/);
    return m ? parseInt(m[1], 10) : new Date().getFullYear();
  };

  const handleFile = async (file: File) => {
    if (file.size > 25_000_000) {
      toast.error("File too large (max 25 MB).");
      return;
    }
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isText = file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name);
    if (!isPdf && !isText) {
      toast.error("Upload a .pdf, .txt or .md file.");
      return;
    }
    setLoading(true);
    try {
      const text = isPdf ? await extractPdfText(file) : await file.text();
      const year = yearFromName(file.name);
      await analyzeText(text, file.name, year);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to read file");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <Card className="border-border/60 p-5 shadow-card-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">AI-powered NLP</div>
              <div className="text-lg font-extrabold tracking-tight">Sentiment & disclosure intelligence</div>
              <div className="text-xs text-muted-foreground">
                {reports.length} report{reports.length === 1 ? "" : "s"} analyzed · powered by Lovable AI
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload .txt
            </Button>
            <Button size="sm" onClick={() => setPasteOpen((v) => !v)} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
              Analyze new report
            </Button>
          </div>
        </div>

        {pasteOpen && (
          <div className="mt-5 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <input
              value={pasteLabel}
              onChange={(e) => setPasteLabel(e.target.value)}
              placeholder="Label (e.g. Schneider Q3 2024 earnings call)"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste ESG report text, press release, earnings call transcript… (max ~60k chars analyzed)"
              className="min-h-[160px] font-mono text-xs"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{pasteText.length.toLocaleString()} chars</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPasteOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={loading || pasteText.length < 50}
                  onClick={() =>
                    analyzeText(
                      pasteText,
                      pasteLabel || `Pasted report ${new Date().toISOString().slice(0, 10)}`,
                      new Date().getFullYear()
                    )
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Brain className="mr-1.5 h-3.5 w-3.5" />}
                  Run analysis
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Executive summary + KPIs */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/60 p-6 shadow-card-soft">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <FileText className="h-3.5 w-3.5" />
            AI executive summary · {selected.label}
          </div>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">
            {selected.analysis.executive_summary}
          </p>
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tone</div>
            <p className="mt-1 text-sm italic text-foreground/80">"{selected.analysis.overall.tone_summary}"</p>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Net sentiment", value: (selected.analysis.overall.sentiment * 100).toFixed(0), unit: "/100", tone: "primary" },
            { label: "Confidence", value: (selected.analysis.overall.confidence * 100).toFixed(0), unit: "%", tone: "info" },
            { label: "Greenwash flags", value: selected.analysis.greenwashing_signals.length.toString(), unit: "signals", tone: "warning" },
            { label: "Disclosure score", value: Math.round(
              (selected.analysis.disclosure_quality.specificity +
                selected.analysis.disclosure_quality.quantification +
                selected.analysis.disclosure_quality.forward_looking +
                selected.analysis.disclosure_quality.assurance +
                selected.analysis.disclosure_quality.coverage_breadth) / 5
            ).toString(), unit: "/100", tone: "primary" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-border/60 bg-card p-5 shadow-card-soft">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-3xl font-extrabold tracking-tight">{k.value}</div>
                <div className="text-xs font-semibold text-muted-foreground">{k.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment over time */}
      <Card className="border-border/60 p-6 shadow-card-soft">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="h-2 w-2 rounded-sm bg-primary" />
            Sentiment trajectory
          </div>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight">
            How tone has shifted across reports
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Per-pillar sentiment scaled to –100 / +100. Rising trends signal increasing confidence and quantified commitments.
          </p>
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer>
            <LineChart data={sentimentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} tickLine={false} />
              <YAxis domain={[-20, 80]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  boxShadow: "var(--shadow-elegant)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} iconType="circle" />
              <Line type="monotone" dataKey="Overall" stroke="#1F2A37" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: "white" }} />
              <Line type="monotone" dataKey="Environment" stroke={PILLAR_HEX.E} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} />
              <Line type="monotone" dataKey="Social" stroke={PILLAR_HEX.S} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} />
              <Line type="monotone" dataKey="Governance" stroke={PILLAR_HEX.G} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Greenwashing flags + Topic mix */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="border-border/60 p-6 shadow-card-soft">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                Greenwashing signals
              </div>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                Risk flags · {selected.year}
              </h3>
            </div>
            <Badge variant="outline" className="border-warning/30 bg-warning/10 font-bold text-warning">
              {selected.analysis.greenwashing_signals.length} flag
              {selected.analysis.greenwashing_signals.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {selected.analysis.greenwashing_signals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div className="text-sm font-bold">No material greenwashing signals detected</div>
              <div className="text-xs text-muted-foreground">Disclosures are specific, quantified, and substantiated.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {selected.analysis.greenwashing_signals.map((g, i) => {
                const s = SEVERITY_STYLE[g.severity];
                return (
                  <div key={i} className={`rounded-lg border border-border/60 bg-card p-4 ring-1 ${s.ring}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold">{g.signal}</div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${s.bg} ${s.text}`}>
                        {g.severity}
                      </span>
                    </div>
                    <blockquote className="mt-2 border-l-2 border-warning/50 pl-3 text-sm italic text-foreground/80">
                      "{g.evidence_quote}"
                    </blockquote>
                    <p className="mt-2 text-xs text-muted-foreground">{g.rationale}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="border-border/60 p-6 shadow-card-soft">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 rounded-sm bg-primary" />
              Topic mix
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight">Dominant ESG themes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share of voice by topic, color-coded by E / S / G pillar.
            </p>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer>
              <BarChart data={sortedTopics} layout="vertical" margin={{ top: 10, right: 24, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-elegant)",
                    fontSize: 13,
                  }}
                  formatter={(v: number, _n, p: any) => [`${v}%`, `Pillar ${p.payload.pillar}`]}
                />
                <Bar dataKey="weight" radius={[0, 8, 8, 0]} barSize={20}>
                  {sortedTopics.map((t) => (
                    <Cell key={t.topic} fill={PILLAR_HEX[t.pillar]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold">
            {(["E", "S", "G"] as const).map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PILLAR_HEX[p] }} />
                {p === "E" ? "Environment" : p === "S" ? "Social" : "Governance"}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Peer disclosure radar + keyword cloud */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border-border/60 p-6 shadow-card-soft">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 rounded-sm bg-primary" />
              Peer disclosure quality
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight">
              Schneider vs industrial peers
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Five-dimension fingerprint of how thorough each company's ESG disclosure reads.
            </p>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={90} domain={[40, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                {(["Schneider Electric", "Siemens", "ABB", "Eaton"] as const).map((name) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={PEER_HEX[name]}
                    fill={PEER_HEX[name]}
                    fillOpacity={name === "Schneider Electric" ? 0.3 : 0.1}
                    strokeWidth={name === "Schneider Electric" ? 3 : 2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} iconType="circle" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-elegant)",
                    fontSize: 13,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/60 p-6 shadow-card-soft">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 rounded-sm bg-primary" />
              Salient terms
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight">Keyword density</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Most distinctive phrases extracted from {selected.label}.
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2 rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-card p-5">
            {[...selected.analysis.keywords]
              .sort((a, b) => b.weight - a.weight)
              .map((k) => {
                const size = 11 + (k.weight / 100) * 22;
                const opacity = 0.55 + (k.weight / 100) * 0.45;
                return (
                  <span
                    key={k.term}
                    className="font-extrabold tracking-tight text-primary-deep transition-smooth hover:text-primary"
                    style={{ fontSize: `${size}px`, opacity }}
                    title={`weight ${k.weight}`}
                  >
                    {k.term}
                  </span>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
};
