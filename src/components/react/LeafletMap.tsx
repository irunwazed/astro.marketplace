import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  markerDraggable?: boolean;
  height?: string;
  onChange?: (lat: number, lng: number) => void;
}

/**
 * Map Leaflet + tile OpenStreetMap. Marker draggable untuk pilih koordinat.
 *
 * Leaflet di-import dynamically di useEffect agar `window`/`document` tidak
 * diakses saat SSR/build — Astro prerender static.
 */
export default function LeafletMap({
  lat,
  lng,
  zoom = 13,
  markerDraggable = true,
  height = "320px",
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current).setView([lat, lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([lat, lng], { icon, draggable: markerDraggable }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current?.(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current?.(e.latlng.lat, e.latlng.lng);
      });

      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      const map = mapRef.current as { remove?: () => void } | null;
      if (map && typeof map.remove === "function") map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker bila koordinat berubah dari luar.
  useEffect(() => {
    const marker = markerRef.current as { setLatLng?: (latlng: [number, number]) => void } | null;
    const map = mapRef.current as { setView?: (latlng: [number, number], zoom: number) => void; getZoom?: () => number } | null;
    if (marker && typeof marker.setLatLng === "function") marker.setLatLng([lat, lng]);
    if (map && typeof map.setView === "function") map.setView([lat, lng], map.getZoom?.() ?? zoom);
  }, [lat, lng, zoom]);

  return <div ref={containerRef} style={{ height }} className="w-full rounded-lg border border-ink/10" />;
}