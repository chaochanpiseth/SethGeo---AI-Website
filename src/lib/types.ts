export interface GeoAnalysis {
  country: string;
  state_region: string | null;
  city_town: string | null;
  specific_landmarks: string[];
  estimated_latitude: number | null;
  estimated_longitude: number | null;
  confidence_score: number;
  rawAnalysis: string;
}
