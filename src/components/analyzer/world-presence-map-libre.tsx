"use client";

import { useEffect, useRef, useState } from "react";
import type { GACountryEntry } from "./world-presence-map";

/* ─── ISO alpha-2 → ISO numeric ───────────────────────────────────────── */
const ALPHA2_TO_NUMERIC: Record<string, number> = {
  AF:4,AL:8,DZ:12,AD:20,AO:24,AG:28,AR:32,AM:51,AU:36,AT:40,AZ:31,BS:44,
  BH:48,BD:50,BB:52,BY:112,BE:56,BZ:84,BJ:204,BT:64,BO:68,BA:70,BW:72,
  BR:76,BN:96,BG:100,BF:854,BI:108,CV:132,KH:116,CM:120,CA:124,CF:140,
  TD:148,CL:152,CN:156,CO:170,KM:174,CG:178,CD:180,CR:188,CI:384,HR:191,
  CU:192,CY:196,CZ:203,DK:208,DJ:262,DM:212,DO:214,EC:218,EG:818,SV:222,
  GQ:226,ER:232,EE:233,SZ:748,ET:231,FJ:242,FI:246,FR:250,GA:266,GM:270,
  GE:268,DE:276,GH:288,GR:300,GD:308,GT:320,GN:324,GW:624,GY:328,HT:332,
  HN:340,HU:348,IS:352,IN:356,ID:360,IR:364,IQ:368,IE:372,IL:376,IT:380,
  JM:388,JP:392,JO:400,KZ:398,KE:404,KI:296,KW:414,KG:417,LA:418,LV:428,
  LB:422,LS:426,LR:430,LY:434,LI:438,LT:440,LU:442,MG:450,MW:454,MY:458,
  MV:462,ML:466,MT:470,MH:584,MR:478,MU:480,MX:484,FM:583,MD:498,MC:492,
  MN:496,ME:499,MA:504,MZ:508,MM:104,NA:516,NR:520,NP:524,NL:528,NZ:554,
  NI:558,NE:562,NG:566,NO:578,OM:512,PK:586,PW:585,PS:275,PA:591,PG:598,
  PY:600,PE:604,PH:608,PL:616,PT:620,QA:634,RO:642,RU:643,RW:646,KN:659,
  LC:662,VC:670,WS:882,SM:674,ST:678,SA:682,SN:686,RS:688,SC:690,SL:694,
  SG:702,SK:703,SI:705,SB:90,SO:706,ZA:710,SS:728,ES:724,LK:144,SD:729,
  SR:740,SE:752,CH:756,SY:760,TW:158,TJ:762,TZ:834,TH:764,TL:626,TG:768,
  TO:776,TT:780,TN:788,TR:792,TM:795,TV:798,UG:800,UA:804,AE:784,GB:826,
  US:840,UY:858,UZ:860,VU:548,VE:862,VN:704,YE:887,ZM:894,ZW:716,
};

const NUMERIC_TO_NAME: Record<number, string> = {
  4:"Afghanistan",8:"Albania",12:"Algeria",24:"Angola",32:"Argentina",36:"Australia",
  40:"Austria",50:"Bangladesh",56:"Belgium",68:"Bolivia",76:"Brazil",100:"Bulgaria",
  116:"Cambodia",120:"Cameroon",124:"Canada",144:"Sri Lanka",152:"Chile",156:"China",
  170:"Colombia",180:"DR Congo",188:"Costa Rica",191:"Croatia",192:"Cuba",203:"Czech Rep.",
  208:"Denmark",214:"Dominican Rep.",218:"Ecuador",818:"Egypt",231:"Ethiopia",
  246:"Finland",250:"France",276:"Germany",288:"Ghana",300:"Greece",320:"Guatemala",
  332:"Haiti",340:"Honduras",348:"Hungary",356:"India",360:"Indonesia",364:"Iran",
  368:"Iraq",372:"Ireland",376:"Israel",380:"Italy",392:"Japan",400:"Jordan",
  398:"Kazakhstan",404:"Kenya",414:"Kuwait",418:"Laos",422:"Lebanon",434:"Libya",
  458:"Malaysia",484:"Mexico",504:"Morocco",104:"Myanmar",524:"Nepal",528:"Netherlands",
  554:"New Zealand",558:"Nicaragua",566:"Nigeria",578:"Norway",586:"Pakistan",
  591:"Panama",604:"Peru",608:"Philippines",616:"Poland",620:"Portugal",634:"Qatar",
  642:"Romania",643:"Russia",682:"Saudi Arabia",686:"Senegal",703:"Slovakia",
  705:"Slovenia",706:"Somalia",710:"South Africa",728:"South Sudan",724:"Spain",
  729:"Sudan",752:"Sweden",756:"Switzerland",760:"Syria",764:"Thailand",788:"Tunisia",
  792:"Turkey",800:"Uganda",804:"Ukraine",784:"UAE",826:"United Kingdom",840:"United States",
  858:"Uruguay",860:"Uzbekistan",704:"Vietnam",887:"Yemen",716:"Zimbabwe",
};

/* ─── TopoJSON → GeoJSON ─────────────────────────────────────────────── */
interface TopoJson {
  type: "Topology";
  transform?: { scale: [number, number]; translate: [number, number] };
  objects: Record<string, { type: string; geometries: TopoGeometry[] }>;
  arcs: [number, number][][];
}
interface TopoGeometry {
  type: string;
  id?: number | string;
  arcs?: unknown;
}

function decodeArcs(topo: TopoJson): [number, number][][] {
  const { transform, arcs } = topo;
  if (!transform) return arcs;
  const [sx, sy] = transform.scale;
  const [tx, ty] = transform.translate;
  return arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty] as [number, number]; });
  });
}

function resolveRing(indices: number[], decoded: [number, number][][]): [number, number][] {
  const coords: [number, number][] = [];
  for (const idx of indices) {
    const fwd = idx >= 0;
    const arc = decoded[fwd ? idx : ~idx];
    const pts = fwd ? arc : [...arc].reverse();
    const start = coords.length > 0 ? 1 : 0;
    for (let k = start; k < pts.length; k++) coords.push(pts[k]);
  }
  if (coords.length) {
    const [fx, fy] = coords[0], [lx, ly] = coords[coords.length - 1];
    if (fx !== lx || fy !== ly) coords.push([fx, fy]);
  }
  return coords;
}

function toGeoJSON(topo: TopoJson, scoreMap: Map<number, number>) {
  const decoded = decodeArcs(topo);
  const geometries = topo.objects.countries?.geometries ?? [];
  const features = geometries
    .map((geo) => {
      const id = typeof geo.id === "string" ? parseInt(geo.id, 10) : (geo.id ?? 0);
      if (id === 10 || !geo.arcs) return null;
      let geometry: object;
      if (geo.type === "Polygon") {
        geometry = { type: "Polygon", coordinates: (geo.arcs as number[][]).map((r) => resolveRing(r, decoded)) };
      } else if (geo.type === "MultiPolygon") {
        geometry = { type: "MultiPolygon", coordinates: (geo.arcs as number[][][]).map((poly) => poly.map((r) => resolveRing(r, decoded))) };
      } else return null;
      return {
        type: "Feature", id,
        properties: { id, name: NUMERIC_TO_NAME[id] ?? "", score: scoreMap.get(id) ?? 0 },
        geometry,
      };
    })
    .filter(Boolean);
  return { type: "FeatureCollection", features };
}

/* ─── Score map ──────────────────────────────────────────────────────── */
// Following SEMrush / Similarweb: only paint countries we have real data for.
// Without GA per-country sessions, the only confirmed signal is the brand's
// declared home country. Broadcasting platform weights across every member
// country of a region (as a previous version did) misleadingly lights up the
// whole globe from a small Google footprint.
function buildScoreMap(
  _regionScores: Record<string, number>,
  gaCountries?: GACountryEntry[] | null,
  homeCountry?: string,
) {
  const map = new Map<number, number>();

  if (gaCountries && gaCountries.length > 0) {
    // Real GA data: per-country session counts
    const maxS = Math.max(...gaCountries.map((c) => c.sessions), 1);
    for (const e of gaCountries) {
      const id = ALPHA2_TO_NUMERIC[e.country_id.toUpperCase()];
      if (id) map.set(id, Math.round((e.sessions / maxS) * 100));
    }
  }

  // Always pin the analysis target country to 100 — this is the real primary market
  if (homeCountry) {
    const homeId = ALPHA2_TO_NUMERIC[homeCountry.toUpperCase()];
    if (homeId) map.set(homeId, 100);
  }

  return map;
}

/* ─── Load MapLibre v3 (UMD build — sets window.maplibregl) ──────────── */
let mlPromise: Promise<MapLibreGl> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreGl = any;

function loadML(): Promise<MapLibreGl> {
  if (mlPromise) return mlPromise;
  mlPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.maplibregl) { resolve(w.maplibregl); return; }

    // CSS
    if (!document.querySelector("[data-ml-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-ml-css", "1");
      link.href = "https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }
    // UMD JS (v3 still ships UMD that exposes window.maplibregl)
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ml = (window as any).maplibregl;
      ml ? resolve(ml) : reject(new Error("maplibregl not on window after load"));
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return mlPromise;
}

/* ─── Component ──────────────────────────────────────────────────────── */
export interface WorldPresenceMapLibreProps {
  coral: string;
  regionScores: Record<string, number>;
  gaCountries?: GACountryEntry[] | null;
  homeCountry?: string; // ISO alpha-2 from run.country — real analysis target
}

export function WorldPresenceMapLibre({ regionScores, gaCountries, homeCountry }: WorldPresenceMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; score: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    const scoreMap = buildScoreMap(regionScores, gaCountries, homeCountry);

    loadML()
      .then((ml) => {
        if (cancelled || !containerRef.current) return;

        map = new ml.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [{ id: "background", type: "background", paint: { "background-color": "#f1f5f9" } }],
          },
          center: [10, 15],
          zoom: 0.9,
          pitch: 0,
          bearing: 0,
          dragRotate: false,
          scrollZoom: false,
          attributionControl: false,
          renderWorldCopies: false,
        });

        map.addControl(new ml.AttributionControl({ compact: true }), "bottom-right");

        map.on("load", async () => {
          if (cancelled) return;
          try {
            const topo: TopoJson = await fetch("/world-110m.json").then((r) => r.json());
            const geojson = toGeoJSON(topo, scoreMap);

            map.addSource("countries", { type: "geojson", data: geojson, promoteId: "id" });

            map.addLayer({
              id: "countries-fill",
              type: "fill",
              source: "countries",
              paint: {
                "fill-color": [
                  "case",
                  ["==", ["get", "score"], 0], "#e2e8f0",
                  ["interpolate", ["linear"], ["get", "score"],
                    1,   "rgba(228,96,85,0.15)",
                    25,  "rgba(228,96,85,0.38)",
                    50,  "rgba(228,96,85,0.62)",
                    75,  "rgba(228,96,85,0.82)",
                    100, "#e46055",
                  ],
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false], 1,
                  0.85,
                ],
              },
            });

            map.addLayer({
              id: "countries-border",
              type: "line",
              source: "countries",
              paint: { "line-color": "#ffffff", "line-width": 0.6, "line-opacity": 1 },
            });

            if (!cancelled) setLoading(false);
          } catch {
            if (!cancelled) { setLoading(false); setError(true); }
          }
        });

        map.on("error", () => {
          if (!cancelled) { setLoading(false); setError(true); }
        });

        let hoveredId: string | number | null = null;

        map.on("mousemove", "countries-fill", (e: { features?: { id?: unknown; properties?: Record<string, unknown> }[]; point: { x: number; y: number } }) => {
          if (!e.features?.length) return;
          map.getCanvas().style.cursor = "pointer";
          if (hoveredId !== null) map.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
          const fid = e.features[0].id;
          hoveredId = (typeof fid === "string" || typeof fid === "number") ? fid : null;
          if (hoveredId !== null) map.setFeatureState({ source: "countries", id: hoveredId }, { hover: true });
          const p = e.features[0].properties ?? {};
          setTooltip({ x: e.point.x, y: e.point.y, name: (p.name as string) || "", score: (p.score as number) ?? 0 });
        });

        map.on("mouseleave", "countries-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId !== null) { map.setFeatureState({ source: "countries", id: hoveredId }, { hover: false }); hoveredId = null; }
          setTooltip(null);
        });
      })
      .catch(() => { if (!cancelled) { setLoading(false); setError(true); } });

    return () => { cancelled = true; map?.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    // Fallback: render nothing so the card still looks clean
    return (
      <div className="flex h-full min-h-[180px] w-full items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(228,96,85,0.05)" }}>
        <p className="text-[11px] text-muted-foreground">Map unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ minHeight: 200, height: "100%" }}>
      {/* MapLibre canvas */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Spinner */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(228,96,85,0.06)" }}>
          <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "rgba(228,96,85,0.25)", borderTopColor: "#e46055" }} />
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg bg-white px-2.5 py-1.5 shadow-md"
          style={{ border: "1px solid rgba(228,96,85,0.2)", left: Math.min(tooltip.x + 12, 200), top: Math.max(tooltip.y - 52, 4) }}
        >
          {tooltip.name && <p className="text-[11px] font-semibold text-neutral-800">{tooltip.name}</p>}
          <p className="text-[10px] font-bold" style={{ color: "#e46055" }}>{tooltip.score}<span className="font-normal text-muted-foreground">/100</span></p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-lg bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm" style={{ border: "1px solid rgba(228,96,85,0.15)" }}>
        <span className="text-[9px] font-medium text-neutral-500">Low</span>
        <div className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(to right, rgba(228,96,85,0.15), rgba(228,96,85,0.55), #e46055)" }} />
        <span className="text-[9px] font-medium text-neutral-500">High</span>
      </div>
    </div>
  );
}
