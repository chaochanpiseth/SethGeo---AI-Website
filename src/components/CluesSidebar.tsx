import type { GeoAnalysis } from "@/lib/types";
import { MapPin, Globe, Building2, Thermometer, Search } from "lucide-react";

interface CluesSidebarProps {
  result: GeoAnalysis;
}

function extractSection(text: string, stepNum: number): string {
  const headers = ["STEP 1", "STEP 2", "STEP 3", "STEP 4"];
  const header = headers[stepNum - 1];
  const next = headers[stepNum];
  const start = text.indexOf(header);
  if (start === -1) return "";
  const end = next ? text.indexOf(next) : text.lastIndexOf("{");
  return (end !== -1 ? text.slice(start, end) : text.slice(start))
    .replace(/###.*?\n/, "").replace(/\*\*/g, "").trim().slice(0, 600);
}

function extractSearchQueries(text: string): string[] {
  const step3 = extractSection(text, 3);
  if (!step3) return [];
  return step3.split("\n").filter(l => /^\d+[\.\)]\s|^[-•]\s/.test(l.trim()))
    .map(l => l.replace(/^\d+[\.\)]\s|^[-•]\s/, "").replace(/"/g, "").trim())
    .slice(0, 5);
}

export function CluesSidebar({ result }: CluesSidebarProps) {
  const landmarks = result.specific_landmarks ?? [];
  const searchQueries = extractSearchQueries(result.rawAnalysis);
  const step1 = extractSection(result.rawAnalysis, 1);
  const step2 = extractSection(result.rawAnalysis, 2);
  const confidenceColor = result.confidence_score >= 70 ? "text-primary" : result.confidence_score >= 40 ? "text-accent" : "text-destructive";

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Location Estimate</h3>
            <div className="space-y-0.5">
              {result.city_town && <p className="text-sm font-semibold text-foreground">{result.city_town}</p>}
              {result.state_region && <p className="text-sm text-muted-foreground">{result.state_region}</p>}
              <p className="text-sm font-medium text-foreground/80">{result.country}</p>
              {result.estimated_latitude != null && result.estimated_longitude != null && (
                <p className="text-xs font-mono text-primary mt-1">{result.estimated_latitude.toFixed(5)}, {result.estimated_longitude.toFixed(5)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Confidence</span>
          </div>
          <span className={`text-xl font-bold font-mono ${confidenceColor}`}>{result.confidence_score}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full confidence-bar rounded-full transition-all duration-700" style={{ width: `${result.confidence_score}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {result.confidence_score >= 70 ? "High confidence" : result.confidence_score >= 40 ? "Moderate confidence" : "Low confidence — limited visual data"}
        </p>
      </div>

      {landmarks.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Identified Landmarks</h3>
          </div>
          <ul className="space-y-1.5">
            {landmarks.map((lm, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-foreground/90">{lm}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step1 && (
        <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Visual Clues</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step1.replace(/^STEP 1.*?\n/m, "").trim().slice(0, 450)}{step1.length > 450 ? "…" : ""}
          </p>
        </div>
      )}

      {step2 && (
        <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Deduction Logic</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step2.replace(/^STEP 2.*?\n/m, "").trim().slice(0, 450)}{step2.length > 450 ? "…" : ""}
          </p>
        </div>
      )}

      {searchQueries.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">OSINT Search Queries</h3>
          </div>
          <ul className="space-y-1.5">
            {searchQueries.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs text-primary flex-shrink-0">{i + 1}.</span>
                <span className="text-xs text-muted-foreground italic">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
