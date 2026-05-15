import { useState, useCallback } from "react";
import type { GeoAnalysis } from "@/lib/types";
import { useAnalyzeImage } from "@/hooks/useAnalyzeImage";
import { UploadZone } from "@/components/UploadZone";
import { GeoMap } from "@/components/GeoMap";
import { CluesSidebar } from "@/components/CluesSidebar";
import { ScanAnimation } from "@/components/ScanAnimation";
import { Satellite, Crosshair, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<GeoAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: analyze, isPending } = useAnalyzeImage();

  const handleImageSelect = useCallback((base64: string, preview: string) => {
    setImageBase64(base64); setImagePreview(preview); setResult(null); setErrorMsg(null);
  }, []);

  const handleClear = useCallback(() => {
    setImageBase64(null); setImagePreview(null); setResult(null); setErrorMsg(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!imageBase64) return;
    setResult(null); setErrorMsg(null);
    analyze(imageBase64, {
      onSuccess: (data) => setResult(data),
      onError: (err) => setErrorMsg(err instanceof Error ? err.message : "Analysis failed"),
    });
  }, [imageBase64, analyze]);

  const hasCoords = result && result.estimated_latitude != null && result.estimated_longitude != null;
  const locationLabel = [result?.city_town, result?.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Satellite className="w-5 h-5 text-primary" />
            </div>
            {isPending && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary pulse-glow" />}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-foreground font-mono">
              SETH<span className="text-primary">GEO AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">Dev: Chao Chanpiseth</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-glow" />
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative rounded-lg">
              <UploadZone onImageSelect={handleImageSelect} preview={imagePreview} onClear={handleClear} disabled={isPending} />
              {isPending && <ScanAnimation isScanning={isPending} />}
            </div>

            <Button onClick={handleAnalyze} disabled={!imageBase64 || isPending} className="w-full h-11 font-mono tracking-wider text-sm uppercase" size="lg">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4" />
                  Geolocate Image
                </span>
              )}
            </Button>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 fade-in-up">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{errorMsg}</p>
              </div>
            )}

            {!result && !isPending && !imageBase64 && (
              <div className="rounded-lg border border-border bg-card p-4 mt-2">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">How It Works</h3>
                <ol className="space-y-2.5">
                  {[["Visual Audit","Scans infrastructure, text, flora, vehicles"],["Deduction","Eliminates regions using visual clues"],["OSINT Queries","Generates targeted search strings"],["Coordinate Fix","Returns GPS estimate with confidence score"]].map(([title, desc], i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="font-mono text-xs text-primary w-5 flex-shrink-0 mt-0.5">0{i+1}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            {!result && !isPending && (
              <div className="flex-1 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center p-8 min-h-64">
                <div className="p-4 rounded-full bg-card border border-border mb-4">
                  <Satellite className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload an image and click <span className="text-primary font-medium">Geolocate</span> to begin OSINT analysis
                </p>
              </div>
            )}

            {isPending && !result && (
              <div className="flex-1 rounded-lg border border-border bg-card flex flex-col items-center justify-center p-8 min-h-64 gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 radar-spin border-t-primary" />
                  <div className="absolute inset-4 rounded-full border border-primary/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Crosshair className="w-5 h-5 text-primary pulse-glow" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono text-primary tracking-widest">ANALYZING</p>
                  <p className="text-xs text-muted-foreground mt-1">Running 4-step OSINT reasoning...</p>
                </div>
              </div>
            )}

            {result && (
              <>
                {hasCoords && (
                  <div className="fade-in-up">
                    <GeoMap lat={result.estimated_latitude!} lng={result.estimated_longitude!} locationLabel={locationLabel || result.country} />
                  </div>
                )}
                {!hasCoords && (
                  <div className="rounded-lg border border-border bg-card flex flex-col items-center justify-center p-6 text-center min-h-32 fade-in-up">
                    <AlertCircle className="w-6 h-6 text-accent mb-2" />
                    <p className="text-sm text-muted-foreground">Insufficient visual data to determine precise coordinates</p>
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <CluesSidebar result={result} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
