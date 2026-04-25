import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  ChevronDown,
  Database,
  FileText,
  Gauge,
  Info,
  Layers,
  LineChart as LineChartIcon,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";

import { KpiCard } from "@/components/KpiCard";
import NLPTab from "@/components/NLPTab";
import ReportsTab from "@/components/ReportsTab";
import SSITab from "@/components/SSITab";
import { ProviderCard } from "@/components/ProviderCard";
import { SchneiderLogo } from "@/components/SchneiderLogo";
import mcgillLogo from "@/assets/mcgill-logo.png";
import {
  PROVIDER_HEX,
  methodology,
  scores,
  type Provider,
} from "@/data/esgData";

const PROVIDERS: Provider[] = ["MSCI", "Sustainalytics", "CDP", "S&P CSA"];
const ALL_YEARS = Array.from(new Set(scores.map((s) => s.year))).sort();
const MIN_YEAR = ALL_YEARS[0];
const MAX_YEAR = ALL_YEARS[ALL_YEARS.length - 1];

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(MAX_YEAR);
  const [activeTab, setActiveTab] = useState<string>("scores");

  const goToTab = (value: string) => {
    setActiveTab(value);
    setTimeout(() => {
      const el = document.getElementById("main-tabs");
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
  };
  const [activeProviders, setActiveProviders] = useState<Provider[]>(PROVIDERS);

  const filtered = useMemo(
    () => scores.filter((s) => activeProviders.includes(s.provider)),
    [activeProviders]
  );

  const yearScores = useMemo(
    () => filtered.filter((s) => s.year === selectedYear),
    [filtered, selectedYear]
  );

  const prevYearScores = useMemo(
    () => filtered.filter((s) => s.year === selectedYear - 1),
    [filtered, selectedYear]
  );

  const stats = useMemo(() => {
    const vals = yearScores.map((s) => s.normalized_score);
    if (!vals.length) return { mean: 0, min: 0, max: 0, spread: 0, std: 0 };
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
    return { mean, min, max, spread: max - min, std };
  }, [yearScores]);

  const prevStats = useMemo(() => {
    const vals = prevYearScores.map((s) => s.normalized_score);
    if (!vals.length) return null;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { mean, spread: Math.max(...vals) - Math.min(...vals) };
  }, [prevYearScores]);

  // Bar chart data with rank
  const ranked = useMemo(() => {
    const sorted = [...yearScores].sort((a, b) => b.normalized_score - a.normalized_score);
    return sorted.map((s, i) => {
      const prev = prevYearScores.find((p) => p.provider === s.provider);
      return {
        ...s,
        rank: i + 1,
        yoy: prev ? s.normalized_score - prev.normalized_score : null,
      };
    });
  }, [yearScores, prevYearScores]);

  // Time series — wide format for recharts
  const timeData = useMemo(() => {
    return ALL_YEARS.map((y) => {
      const row: Record<string, number | string | null> = { year: y };
      activeProviders.forEach((p) => {
        const found = scores.find((s) => s.year === y && s.provider === p);
        row[p] = found ? found.normalized_score : null;
      });
      return row;
    });
  }, [activeProviders]);

  // Divergence over time
  const divergenceData = useMemo(() => {
    return ALL_YEARS.map((y) => {
      const vals = scores
        .filter((s) => s.year === y && activeProviders.includes(s.provider))
        .map((s) => s.normalized_score);
      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { year: y, spread: max - min, mean: +mean.toFixed(1), min, max };
    });
  }, [activeProviders]);

  // Radar — E/S/G per provider for selected year
  const radarData = useMemo(() => {
    return ["environment_score", "social_score", "governance_score"].map((dim) => {
      const row: Record<string, number | string> = {
        dimension:
          dim === "environment_score"
            ? "Environment"
            : dim === "social_score"
            ? "Social"
            : "Governance",
      };
      yearScores.forEach((s) => {
        row[s.provider] = (s as any)[dim];
      });
      return row;
    });
  }, [yearScores]);

  const toggleProvider = (p: Provider) => {
    setActiveProviders((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-4">
            <SchneiderLogo />
            <div className="hidden h-10 w-px bg-border sm:block" />
            <img
              src={mcgillLogo}
              alt="McGill University"
              height={40}
              loading="lazy"
              className="hidden h-10 w-auto object-contain sm:block"
            />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Overview", tab: "scores" },
              { label: "Providers", tab: "drivers" },
              { label: "NLP Insights", tab: "nlp" },
              { label: "Reports", tab: "reports" },
            ].map((n) => (
              <Button
                key={n.label}
                variant="ghost"
                size="sm"
                onClick={() => goToTab(n.tab)}
                className={`text-sm font-semibold ${
                  activeTab === n.tab ? "bg-accent text-primary-deep" : "text-muted-foreground"
                }`}
              >
                {n.label}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="font-semibold">
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-6 pb-20">
        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-2xl bg-hero p-8 text-white shadow-elegant md:p-12">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl animate-fade-up">
              <Badge className="border-primary/40 bg-primary/15 font-bold uppercase tracking-[0.18em] text-primary-glow hover:bg-primary/20">
                <Zap className="mr-1.5 h-3 w-3" />
                Energy Management · ESG Divergence
              </Badge>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Where ratings agree.<br />
                <span className="bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">
                  Where they don't.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
                Compare Schneider Electric's ESG signal across the four providers that move
                capital — through an electrification & sustainability lens. See the spread,
                surface the methodology gaps, and act on what's material.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => toggleProvider(p)}
                    className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-smooth ${
                      activeProviders.includes(p)
                        ? "border-white/40 bg-white/10 text-white shadow-md"
                        : "border-white/15 bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PROVIDER_HEX[p] }}
                    />
                    {p}
                  </button>
                ))}
                <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/70">
                  <Info className="h-3 w-3" />
                  0 – 100 normalized scale
                </span>
              </div>
            </div>

            {/* Hero stat panel */}
            <div className="relative w-full lg:w-[340px]">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary-glow">
                  {selectedYear} composite signal
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className="text-6xl font-extrabold tracking-tight text-white">
                    {stats.mean.toFixed(1)}
                  </div>
                  <div className="text-sm font-semibold text-white/60">/ 100</div>
                </div>
                {prevStats && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-bold text-primary-glow">
                    {stats.mean - prevStats.mean >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {(stats.mean - prevStats.mean >= 0 ? "+" : "") + (stats.mean - prevStats.mean).toFixed(1)} vs {selectedYear - 1}
                  </div>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">High</div>
                    <div className="text-2xl font-extrabold text-primary-glow">{stats.max.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Low</div>
                    <div className="text-2xl font-extrabold text-white">{stats.min.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Spread</div>
                    <div className="text-2xl font-extrabold text-warning">{stats.spread.toFixed(0)}<span className="text-sm">pts</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Std dev</div>
                    <div className="text-2xl font-extrabold text-white">{stats.std.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Year selector strip */}
        <section className="mt-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-card-soft md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reporting year</div>
              <div className="text-lg font-extrabold tracking-tight">{selectedYear}</div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-4 md:max-w-xl">
            <span className="text-xs font-semibold text-muted-foreground">{MIN_YEAR}</span>
            <Slider
              value={[selectedYear]}
              min={MIN_YEAR}
              max={MAX_YEAR}
              step={1}
              onValueChange={(v) => setSelectedYear(v[0])}
              className="flex-1"
            />
            <span className="text-xs font-semibold text-muted-foreground">{MAX_YEAR}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {ALL_YEARS.map((y) => (
              <Toggle
                key={y}
                pressed={selectedYear === y}
                onPressedChange={() => setSelectedYear(y)}
                size="sm"
                className="h-8 min-w-[3rem] text-xs font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {y}
              </Toggle>
            ))}
          </div>
        </section>

        {/* KPI grid */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Average score"
            value={stats.mean.toFixed(1)}
            unit="/ 100"
            delta={prevStats ? stats.mean - prevStats.mean : undefined}
            icon={Gauge}
            tone="primary"
          />
          <KpiCard
            label="Provider spread"
            value={stats.spread.toFixed(0)}
            unit="pts"
            delta={prevStats ? stats.spread - prevStats.spread : undefined}
            icon={Activity}
            tone="warning"
          />
          <KpiCard
            label="Highest score"
            value={stats.max.toFixed(0)}
            unit="/ 100"
            icon={TrendingUp}
            tone="info"
          />
          <KpiCard
            label="Lowest score"
            value={stats.min.toFixed(0)}
            unit="/ 100"
            icon={ArrowDownRight}
            tone="destructive"
          />
        </section>

        {/* Tabs */}
        <section className="mt-8" id="main-tabs">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-card-soft">
              {[
                { value: "scores", label: "Provider Scores", icon: BarChart3 },
                { value: "drivers", label: "Why Scores Differ", icon: Layers },
                { value: "history", label: "Score History", icon: LineChartIcon },
                { value: "nlp", label: "NLP Insights", icon: Brain },
                { value: "ssi", label: "SSI 2025", icon: Trophy },
                { value: "reports", label: "Reports", icon: FileText },
                { value: "data", label: "Data Notes", icon: Database },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* === SCORES TAB === */}
            <TabsContent value="scores" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                {/* Bar chart */}
                <Card className="overflow-hidden border-border/60 p-6 shadow-card-soft">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                        <span className="h-2 w-2 rounded-sm bg-primary" />
                        {selectedYear} normalized comparison
                      </div>
                      <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                        Provider scoreboard
                      </h3>
                    </div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/5 text-xs font-bold text-primary-deep">
                      Target ≥ 90
                    </Badge>
                  </div>

                  <div className="h-[380px] w-full">
                    <ResponsiveContainer>
                      <BarChart
                        data={ranked}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="provider"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={13}
                          fontWeight={700}
                          tickLine={false}
                          axisLine={false}
                          width={110}
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
                          formatter={(v: number) => [`${v.toFixed(1)}`, "Normalized"]}
                        />
                        <ReferenceLine
                          x={90}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          label={{ value: "Target 90", position: "top", fill: "hsl(var(--primary))", fontSize: 11, fontWeight: 700 }}
                        />
                        <Bar dataKey="normalized_score" radius={[0, 8, 8, 0]} barSize={32}>
                          {ranked.map((r) => (
                            <Cell key={r.provider} fill={PROVIDER_HEX[r.provider]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Higher normalized score indicates stronger ESG performance / lower risk.
                  </p>
                </Card>

                {/* Provider readout */}
                <Card className="border-border/60 p-6 shadow-card-soft">
                  <div className="mb-5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <span className="h-2 w-2 rounded-sm bg-primary" />
                      Latest readout
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight">Provider detail</h3>
                  </div>
                  <div className="space-y-3">
                    {ranked.map((r) => (
                      <ProviderCard
                        key={r.provider}
                        provider={r.provider}
                        rank={r.rank}
                        rawScore={r.raw_score}
                        normalized={r.normalized_score}
                        yoy={r.yoy}
                        confidence={r.confidence}
                      />
                    ))}
                  </div>
                </Card>
              </div>

              {/* E/S/G Radar */}
              <Card className="border-border/60 p-6 shadow-card-soft">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <span className="h-2 w-2 rounded-sm bg-primary" />
                      E / S / G dimensional view
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                      Where each provider sees the gap
                    </h3>
                  </div>
                </div>
                <div className="h-[380px]">
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={90} domain={[60, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      {activeProviders.map((p) => (
                        <Radar
                          key={p}
                          name={p}
                          dataKey={p}
                          stroke={PROVIDER_HEX[p]}
                          fill={PROVIDER_HEX[p]}
                          fillOpacity={0.18}
                          strokeWidth={2.5}
                        />
                      ))}
                      <Legend
                        wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                        iconType="circle"
                      />
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
            </TabsContent>

            {/* === DRIVERS TAB === */}
            <TabsContent value="drivers" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: Layers,
                    title: "Methodology gaps",
                    body: "Providers don't evaluate the same question. Some emphasise unmanaged financial risk; others reward disclosure breadth or operational performance.",
                  },
                  {
                    icon: Database,
                    title: "Data gaps",
                    body: "Coverage depends on public filings, questionnaire response depth, estimation models, controversies, and reporting boundaries.",
                  },
                  {
                    icon: Gauge,
                    title: "Weighting differences",
                    body: "Climate, supply chain, governance, product exposure, and industry materiality are weighted very differently across providers.",
                  },
                ].map((d) => (
                  <Card key={d.title} className="group relative overflow-hidden border-border/60 p-6 shadow-card-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-smooth group-hover:bg-primary/20" />
                    <div className="relative">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <d.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold tracking-tight">{d.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="border-border/60 p-6 shadow-card-soft">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="h-2 w-2 rounded-sm bg-primary" />
                    Per-provider explanation · {selectedYear}
                  </div>
                  <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                    Click a provider to unpack the gap
                  </h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {ranked.map((r) => (
                    <AccordionItem key={r.provider} value={r.provider} className="border-border/60">
                      <AccordionTrigger className="group hover:no-underline">
                        <div className="flex flex-1 items-center justify-between gap-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold text-white"
                              style={{ background: PROVIDER_HEX[r.provider] }}
                            >
                              {r.rank}
                            </div>
                            <div className="text-left">
                              <div className="text-base font-extrabold">{r.provider}</div>
                              <div className="text-xs font-medium text-muted-foreground">
                                Raw {r.raw_score} · Confidence {r.confidence}%
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl font-extrabold" style={{ color: PROVIDER_HEX[r.provider] }}>
                            {r.normalized_score.toFixed(1)}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4 pl-12 pt-2 md:grid-cols-3">
                          {[
                            { label: "Methodology gap", body: r.methodology_gap },
                            { label: "Data gap", body: r.data_gap },
                            { label: "Weighting difference", body: r.weighting_difference },
                          ].map((b) => (
                            <div key={b.label} className="rounded-lg border border-border/60 bg-muted/30 p-4">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                {b.label}
                              </div>
                              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{b.body}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </TabsContent>

            {/* === HISTORY TAB === */}
            <TabsContent value="history" className="mt-6 space-y-6">
              <Card className="border-border/60 p-6 shadow-card-soft">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="h-2 w-2 rounded-sm bg-primary" />
                    Score trajectory
                  </div>
                  <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                    {MIN_YEAR}–{MAX_YEAR} provider trajectories
                  </h3>
                </div>
                <div className="h-[420px]">
                  <ResponsiveContainer>
                    <LineChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        {activeProviders.map((p) => (
                          <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={PROVIDER_HEX[p]} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={PROVIDER_HEX[p]} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} tickLine={false} />
                      <YAxis domain={[70, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
                      <ReferenceLine x={selectedYear} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                      {activeProviders.map((p) => (
                        <Line
                          key={p}
                          type="monotone"
                          dataKey={p}
                          stroke={PROVIDER_HEX[p]}
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                          activeDot={{ r: 7 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border-border/60 p-6 shadow-card-soft">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <span className="h-2 w-2 rounded-sm bg-primary" />
                      Convergence trend
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                      Spread between providers (lower = closer agreement)
                    </h3>
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer>
                    <BarChart data={divergenceData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          boxShadow: "var(--shadow-elegant)",
                          fontSize: 13,
                        }}
                        formatter={(v: number) => [`${v.toFixed(1)} pts`, "Spread"]}
                      />
                      <Bar dataKey="spread" fill="url(#spreadGrad)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            {/* === NLP TAB === */}
            <TabsContent value="nlp" className="mt-6">
              <NLPTab />
            </TabsContent>

            {/* === SSI 2025 TAB === */}
            <TabsContent value="ssi" className="mt-6">
              <SSITab />
            </TabsContent>

            {/* === REPORTS TAB === */}
            <TabsContent value="reports" className="mt-6">
              <ReportsTab />
            </TabsContent>

            {/* === DATA NOTES TAB === */}
            <TabsContent value="data" className="mt-6 space-y-6">
              <Card className="border-border/60 p-6 shadow-card-soft">
                <h3 className="text-xl font-extrabold tracking-tight">Provider methodology reference</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  How each rater defines the question — and where they typically diverge.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {methodology.map((m) => (
                    <div
                      key={m.provider}
                      className="rounded-xl border border-border/60 bg-card p-5 transition-smooth hover:shadow-elegant"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: PROVIDER_HEX[m.provider] }}
                          />
                          <div className="text-base font-extrabold">{m.provider}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">
                          {m.scale}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Key lens</div>
                          <p className="mt-0.5 text-foreground/80">{m.key_lens}</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Typical weighting</div>
                          <p className="mt-0.5 text-foreground/80">{m.typical_weighting}</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Why scores differ</div>
                          <p className="mt-0.5 text-foreground/80">{m.why_differ}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="overflow-hidden border-border/60 shadow-card-soft">
                <div className="flex items-center justify-between border-b border-border/60 p-5">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">Full dataset</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Illustrative normalized scores · Schneider Electric · {MIN_YEAR}–{MAX_YEAR}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 font-bold text-primary-deep">
                    {filtered.length} rows
                  </Badge>
                </div>
                <div className="max-h-[480px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                      <TableRow>
                        <TableHead className="font-extrabold">Year</TableHead>
                        <TableHead className="font-extrabold">Provider</TableHead>
                        <TableHead className="font-extrabold">Raw</TableHead>
                        <TableHead className="font-extrabold text-right">Normalized</TableHead>
                        <TableHead className="font-extrabold text-right">E</TableHead>
                        <TableHead className="font-extrabold text-right">S</TableHead>
                        <TableHead className="font-extrabold text-right">G</TableHead>
                        <TableHead className="font-extrabold">Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered
                        .slice()
                        .sort((a, b) => a.year - b.year || a.provider.localeCompare(b.provider))
                        .map((r, i) => (
                          <TableRow key={i} className="hover:bg-accent/40">
                            <TableCell className="font-bold">{r.year}</TableCell>
                            <TableCell>
                              <div className="inline-flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: PROVIDER_HEX[r.provider] }}
                                />
                                <span className="font-bold">{r.provider}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{r.raw_score}</TableCell>
                            <TableCell className="text-right font-extrabold" style={{ color: PROVIDER_HEX[r.provider] }}>
                              {r.normalized_score.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right">{r.environment_score}</TableCell>
                            <TableCell className="text-right">{r.social_score}</TableCell>
                            <TableCell className="text-right">{r.governance_score}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${r.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">{r.confidence}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Schneider Electric · ESG Signal Console · Illustrative dataset for prototyping
          </div>
          <div className="flex items-center gap-4">
            <span>Life Is On</span>
            <span className="opacity-50">·</span>
            <span>v2.0 Modern</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
