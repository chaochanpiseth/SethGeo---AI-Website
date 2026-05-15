import { useMutation } from "@tanstack/react-query";
import type { GeoAnalysis } from "@/lib/types";

async function analyzeImageFetch(imageBase64: string): Promise<GeoAnalysis> {
  const response = await fetch("/api/geoanalyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<GeoAnalysis>;
}

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: (imageBase64: string) => analyzeImageFetch(imageBase64),
  });
}
