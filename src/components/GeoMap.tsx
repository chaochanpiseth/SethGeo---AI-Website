import { useEffect, useRef } from "react";

interface GeoMapProps {
  lat: number;
  lng: number;
  locationLabel: string;
}

export function GeoMap({ lat, lng, locationLabel }: GeoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!isMounted || !mapRef.current) return;

      if (mapInstanceRef.current) {
        (mapInstanceRef.current as ReturnType<typeof L.map>).remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, { center: [lat, lng], zoom: 10, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:hsl(152 72% 42%);border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: "",
      });

      L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<strong>${locationLabel}</strong><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();

      mapInstanceRef.current = map;
    };

    initMap();
    return () => { isMounted = false; };
  }, [lat, lng, locationLabel]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        import("leaflet").then(({ default: L }) => {
          (mapInstanceRef.current as ReturnType<typeof L.map>).remove();
          mapInstanceRef.current = null;
        });
      }
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full rounded-lg overflow-hidden border border-border" style={{ height: 280, zIndex: 1 }} />
  );
}
