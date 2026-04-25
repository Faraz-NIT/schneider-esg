import { Download, FileText, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import data from "@/data/esgNlpAnalysis.json";

// Map of available downloadable PDFs (filename in /public/reports/)
const PDF_FILES: Record<number, string | null> = {
  2020: null,
  2021: null,
  2022: null,
  2023: null,
  2024: "schneider-sustainability-2024.pdf",
};

const HEADLINES: Record<number, string> = Object.fromEntries(
  (data.reports as any[]).map((r) => [r.year, r.overall.headline])
);

export default function ReportsTab() {
  const years = (data.reports as any[]).map((r) => r.year).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Source Reports · Schneider Electric</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sustainable Development Reports underpinning the NLP analysis. Click to download the original PDF.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {years.map((year) => {
          const file = PDF_FILES[year];
          const stats = (data.reports as any[]).find((r) => r.year === year)?.doc_stats;
          return (
            <Card key={year} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Sustainable Development Report</div>
                  <div className="text-3xl font-extrabold tracking-tight mt-1">{year}</div>
                </div>
                <Badge variant={file ? "default" : "outline"} className="text-[10px]">
                  {file ? "PDF available" : "Analysis only"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                {HEADLINES[year]}
              </p>

              {stats && (
                <div className="text-xs text-muted-foreground mb-4 flex gap-3">
                  <span>{stats.words.toLocaleString()} words</span>
                  <span>·</span>
                  <span>{Math.round(stats.characters / 1000)}k chars</span>
                </div>
              )}

              {file ? (
                <Button asChild className="w-full" size="sm">
                  <a href={`/reports/${file}`} download={`schneider-sustainability-${year}.pdf`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full" size="sm">
                  <a
                    href={`https://www.se.com/ww/en/about-us/sustainability/reporting-and-disclosure/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on schneider-electric.com
                  </a>
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Source: {data.source}
      </p>
    </div>
  );
}
