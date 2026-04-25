import { useMemo, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import data from "@/data/esgNlpAnalysis.json";

type Report = typeof data.reports[number];

const PILLAR_COLOR: Record<string, string> = {
  E: "hsl(142 71% 45%)",
  S: "hsl(199 89% 48%)",
  G: "hsl(38 92% 50%)",
};
const SEV_COLOR: Record<string, string> = {
  low: "hsl(142 71% 45%)",
  medium: "hsl(38 92% 50%)",
  high: "hsl(0 84% 60%)",
};

export default function NLPTab() {
  const reports = data.reports as Report[];
  const peers = data.peers;
  const [activeYear, setActiveYear] = useState<number>(reports[reports.length - 1].year);
  const active = reports.find((r) => r.year === activeYear)!;

  const sentimentSeries = useMemo(
    () => reports.map((r) => ({
      year: r.year,
      Overall: r.overall.sentiment,
      Environmental: r.pillar_sentiment.environmental,
      Social: r.pillar_sentiment.social,
      Governance: r.pillar_sentiment.governance,
    })),
    [reports]
  );

  const radarData = useMemo(() => {
    const dims = ["specificity", "quantification", "assurance", "forward_looking", "balance"] as const;
    return dims.map((d) => {
      const row: any = { dimension: d.replace("_", " ") };
      peers.forEach((p) => { row[p.company] = (p as any)[d]; });
      // overlay current Schneider report year
      row[`Schneider ${active.year}`] = (active.disclosure_quality as any)[d];
      return row;
    });
  }, [peers, active]);

  const topics = [...active.topics].sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">NLP Insights · Schneider Electric ESG Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Forensic text analysis across 4 years of Sustainable Development Reports (2020–2023).
              Sentiment lexicon · greenwashing pattern detection · topic frequency · disclosure-quality scoring · peer benchmarking.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {reports.map((r) => (
                <button
                  key={r.year}
                  onClick={() => setActiveYear(r.year)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    r.year === activeYear
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/70 text-foreground"
                  }`}
                >
                  {r.year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Year headline */}
      <Card className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
          <FileText className="h-3.5 w-3.5" /> {active.year} Headline
        </div>
        <p className="text-base leading-relaxed">{active.overall.headline}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Stat label="Overall sentiment" value={active.overall.sentiment.toFixed(2)} hint="-1 to +1" />
          <Stat label="Environmental" value={active.pillar_sentiment.environmental.toFixed(2)} color={PILLAR_COLOR.E} />
          <Stat label="Social" value={active.pillar_sentiment.social.toFixed(2)} color={PILLAR_COLOR.S} />
          <Stat label="Governance" value={active.pillar_sentiment.governance.toFixed(2)} color={PILLAR_COLOR.G} />
        </div>
      </Card>

      {/* Sentiment over time */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Sentiment trajectory 2020–2023</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Lexicon-based polarity per ESG pillar across full report text.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={sentimentSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 1]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <ReferenceLine y={0.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="Overall" stroke="hsl(var(--primary))" strokeWidth={3} />
            <Line type="monotone" dataKey="Environmental" stroke={PILLAR_COLOR.E} strokeWidth={2} />
            <Line type="monotone" dataKey="Social" stroke={PILLAR_COLOR.S} strokeWidth={2} />
            <Line type="monotone" dataKey="Governance" stroke={PILLAR_COLOR.G} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Greenwashing + Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-500" /> Greenwashing signals · {active.year}</h3>
          <p className="text-xs text-muted-foreground mb-4">Pattern-based detection of vague, hedged, or unverifiable claims.</p>
          <div className="space-y-3">
            {active.greenwashing_signals.map((g, i) => (
              <div key={i} className="border border-border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{g.signal}</div>
                  <Badge style={{ background: SEV_COLOR[g.severity], color: "white" }} className="text-[10px]">
                    {g.severity.toUpperCase()} · {(g as any).count ?? ""}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground italic mb-1">"{g.evidence_quote}"</p>
                <p className="text-xs">{g.rationale}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-1">Topic mix · {active.year}</h3>
          <p className="text-xs text-muted-foreground mb-4">Share of attention across ESG themes (keyword frequency).</p>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topics} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="topic" width={150} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {topics.map((t, i) => (
                  <Cell key={i} fill={PILLAR_COLOR[t.pillar]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 text-xs mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: PILLAR_COLOR.E }} /> Environmental</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: PILLAR_COLOR.S }} /> Social</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: PILLAR_COLOR.G }} /> Governance</span>
          </div>
        </Card>
      </div>

      {/* Peer radar + keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-1">Disclosure quality vs peers</h3>
          <p className="text-xs text-muted-foreground mb-4">Schneider {active.year} benchmarked against industrial peers across 5 quality dimensions.</p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name={`Schneider ${active.year}`} dataKey={`Schneider ${active.year}`} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              <Radar name="Siemens" dataKey="Siemens" stroke={PILLAR_COLOR.E} fill={PILLAR_COLOR.E} fillOpacity={0.1} />
              <Radar name="ABB" dataKey="ABB" stroke={PILLAR_COLOR.S} fill={PILLAR_COLOR.S} fillOpacity={0.1} />
              <Radar name="Eaton" dataKey="Eaton" stroke={PILLAR_COLOR.G} fill={PILLAR_COLOR.G} fillOpacity={0.1} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-1">Salient keywords · {active.year}</h3>
          <p className="text-xs text-muted-foreground mb-4">Top terms by frequency (stopwords & boilerplate removed).</p>
          <div className="flex flex-wrap gap-2">
            {active.keywords.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                style={{ fontSize: `${0.7 + (k.weight / 100) * 0.6}rem`, opacity: 0.5 + k.weight / 200 }}
              >
                {k.term}
              </span>
            ))}
          </div>
          {active.key_metrics.length > 0 && (
            <>
              <h4 className="font-semibold text-sm mt-6 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Quantitative KPIs detected</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {active.key_metrics.map((m, i) => (
                  <div key={i} className="text-xs border border-border rounded-md p-2 flex justify-between gap-2">
                    <span className="text-muted-foreground">{m.metric}</span>
                    <span className="font-mono font-semibold" style={{ color: PILLAR_COLOR[m.pillar] }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Source: {data.source} · {active.doc_stats.words.toLocaleString()} words analyzed for {active.year}.
      </p>
    </div>
  );
}

function Stat({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-muted/30">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1" style={color ? { color } : {}}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
