import { Award, Download, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import data from "@/data/ssi2025.json";

const PILLAR_COLOR: Record<string, string> = {
  E: "hsl(142 71% 45%)",
  S: "hsl(199 89% 48%)",
  G: "hsl(38 92% 50%)",
};

export default function SSITab() {
  const overall = data.overall_score;
  const overallPct = (overall.actual / overall.ambition) * 100;
  const targetPct = (overall.target / overall.ambition) * 100;

  // Build chart data: each KPI as % of its ambition (clamp 100)
  const kpiBars = data.pillars.flatMap((p) =>
    p.kpis.map((k) => ({
      name: `#${k.id} ${k.name}`,
      pillar: p.name,
      color: PILLAR_COLOR[p.color],
      progress: Math.min(100, Math.round((Number(k.actual) / Number(k.ambition)) * 100)),
      targetProgress: Math.min(100, Math.round((Number(k.target) / Number(k.ambition)) * 100)),
      actual: `${k.actual}${k.unit}`,
      ambition: `${k.ambition}${k.unit}`,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Badge className="mb-2 bg-primary/15 text-primary border-primary/30">
                <Sparkles className="mr-1 h-3 w-3" /> Special Report · {data.cycle} cycle close-out
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Final results of Schneider's 11-KPI sustainability scorecard, tied to executive & 80,000-employee incentives.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href={`/reports/${data.pdf}`} download>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </a>
          </Button>
        </div>
      </Card>

      {/* Overall score */}
      <Card className="p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Target className="h-3.5 w-3.5" /> Composite SSI Score
        </div>
        <div className="mt-3 flex items-end gap-3">
          <div className="text-6xl font-extrabold tracking-tight text-primary">{overall.actual}</div>
          <div className="pb-2 text-lg text-muted-foreground">/ {overall.ambition}</div>
          <Badge variant="outline" className="ml-2 mb-2 border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400">
            +{(overall.actual - overall.baseline).toFixed(2)} vs 2020 baseline
          </Badge>
        </div>
        <div className="relative mt-4">
          <Progress value={overallPct} className="h-3" />
          <div
            className="absolute -top-1 h-5 w-0.5 bg-foreground/70"
            style={{ left: `${targetPct}%` }}
            title={`2025 target: ${overall.target}`}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Baseline {overall.baseline}</span>
          <span>2025 target {overall.target} ↑</span>
          <span>Ambition {overall.ambition}</span>
        </div>
      </Card>

      {/* Headline metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.headline_metrics.map((m, i) => (
          <Card key={i} className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight">{m.value}</span>
              <span className="text-sm font-semibold text-muted-foreground">{m.unit}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{m.context}</div>
          </Card>
        ))}
      </div>

      {/* KPI scoreboard */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> 11 SSI KPIs · % of 2025 ambition reached
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bars show actual progress; vertical line marks the 2025 target. Color-coded by pillar.
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(380, kpiBars.length * 32)}>
          <BarChart data={kpiBars} layout="vertical" margin={{ left: 30, right: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" domain={[0, 110]} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={260} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              formatter={(_v, _n, p: any) => [`${p.payload.actual} of ${p.payload.ambition} (${p.payload.progress}%)`, p.payload.pillar]}
            />
            <ReferenceLine x={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
              {kpiBars.map((b, i) => (
                <Cell key={i} fill={b.color} />
              ))}
              <LabelList dataKey="actual" position="right" style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: PILLAR_COLOR.E }} /> Environmental (Climate · Resources)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: PILLAR_COLOR.S }} /> Social (Equal · Generations · Local)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: PILLAR_COLOR.G }} /> Governance (Trust)</span>
        </div>
      </Card>

      {/* Recognitions + highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-amber-500" /> 2025 External Recognitions
          </h3>
          <ul className="space-y-2.5">
            {data.recognitions.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">2025 Programme Highlights</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {data.highlights.map((h, i) => {
              const pillarColor = data.pillars.find((p) => p.name === h.pillar)?.color || "E";
              return (
                <div key={i} className="flex gap-3 text-sm border-l-2 pl-3" style={{ borderColor: PILLAR_COLOR[pillarColor] }}>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: PILLAR_COLOR[pillarColor] }}>
                      {h.pillar}
                    </div>
                    <div className="mt-0.5">{h.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Source: {data.source} · SSI links to 20% of executive & ~80,000 employee short-term incentives.
      </p>
    </div>
  );
}
