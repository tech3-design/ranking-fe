"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Minimal TopoJSON → SVG path decoder ─────────────────────────────── */

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
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * sx + tx, y * sy + ty] as [number, number];
    });
  });
}

function mercator(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = (lon + 180) / 360 * w;
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = h / 2 - (mercN * h) / (2 * Math.PI);
  return [x, y];
}

function buildPath(arcIndices: unknown, decoded: [number, number][][], w: number, h: number): string {
  const rings: [number, number][][] = [];

  function collectRings(a: unknown) {
    if (typeof a === "number") {
      const idx = a < 0 ? ~a : a;
      const pts = a < 0 ? [...decoded[idx]].reverse() : decoded[idx];
      rings.push(pts);
    } else if (Array.isArray(a)) {
      for (const item of a) collectRings(item);
    }
  }
  collectRings(arcIndices);

  return rings.map((ring) => {
    const cmds: string[] = [];
    let prevX: number | null = null;
    for (let i = 0; i < ring.length; i++) {
      const [lon, lat] = ring[i];
      const [px, py] = mercator(lon, lat, w, h);
      // Break path on antimeridian crossings (large x jump > 30% of width)
      if (prevX !== null && Math.abs(px - prevX) > w * 0.3) {
        cmds.push(`M${px.toFixed(1)},${py.toFixed(1)}`);
      } else {
        cmds.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
      }
      prevX = px;
    }
    cmds.push("Z");
    return cmds.join(" ");
  }).join(" ");
}

/* ─── ISO alpha-2 → ISO numeric mapping (common countries) ───────────── */
const ALPHA2_TO_NUMERIC: Record<string, number> = {
  AF:4, AL:8, DZ:12, AD:20, AO:24, AG:28, AR:32, AM:51, AU:36, AT:40,
  AZ:31, BS:44, BH:48, BD:50, BB:52, BY:112, BE:56, BZ:84, BJ:204, BT:64,
  BO:68, BA:70, BW:72, BR:76, BN:96, BG:100, BF:854, BI:108, CV:132, KH:116,
  CM:120, CA:124, CF:140, TD:148, CL:152, CN:156, CO:170, KM:174, CG:178,
  CD:180, CR:188, CI:384, HR:191, CU:192, CY:196, CZ:203, DK:208, DJ:262,
  DM:212, DO:214, EC:218, EG:818, SV:222, GQ:226, ER:232, EE:233, SZ:748,
  ET:231, FJ:242, FI:246, FR:250, GA:266, GM:270, GE:268, DE:276, GH:288,
  GR:300, GD:308, GT:320, GN:324, GW:624, GY:328, HT:332, HN:340, HU:348,
  IS:352, IN:356, ID:360, IR:364, IQ:368, IE:372, IL:376, IT:380, JM:388,
  JP:392, JO:400, KZ:398, KE:404, KI:296, KW:414, KG:417, LA:418, LV:428,
  LB:422, LS:426, LR:430, LY:434, LI:438, LT:440, LU:442, MG:450, MW:454,
  MY:458, MV:462, ML:466, MT:470, MH:584, MR:478, MU:480, MX:484, FM:583,
  MD:498, MC:492, MN:496, ME:499, MA:504, MZ:508, MM:104, NA:516, NR:520,
  NP:524, NL:528, NZ:554, NI:558, NE:562, NG:566, NO:578, OM:512, PK:586,
  PW:585, PS:275, PA:591, PG:598, PY:600, PE:604, PH:608, PL:616, PT:620,
  QA:634, RO:642, RU:643, RW:646, KN:659, LC:662, VC:670, WS:882, SM:674,
  ST:678, SA:682, SN:686, RS:688, SC:690, SL:694, SG:702, SK:703, SI:705,
  SB:90, SO:706, ZA:710, SS:728, ES:724, LK:144, SD:729, SR:740, SE:752,
  CH:756, SY:760, TW:158, TJ:762, TZ:834, TH:764, TL:626, TG:768, TO:776,
  TT:780, TN:788, TR:792, TM:795, TV:798, UG:800, UA:804, AE:784, GB:826,
  US:840, UY:858, UZ:860, VU:548, VE:862, VN:704, YE:887, ZM:894, ZW:716,
};

/* ─── Region → ISO numeric country IDs mapping (fallback when no GA data) */
const REGION_COUNTRIES: Record<string, number[]> = {
  na:  [840, 124, 484, 192, 214, 332, 388, 320, 222, 558, 340, 188, 591, 862, 780, 28, 44, 52],
  sa:  [76, 32, 152, 170, 604, 858, 600, 218, 68, 740, 328, 630],
  eu:  [276, 250, 826, 380, 724, 752, 578, 208, 246, 372, 528, 56, 756, 40, 203, 348, 616, 642, 100, 688, 191, 705, 703, 804, 498, 112, 233, 428, 440, 442, 470, 352, 643],
  me:  [682, 784, 368, 364, 760, 400, 422, 376, 275, 887, 512, 48, 414],
  af:  [12, 818, 504, 716, 710, 404, 566, 288, 231, 144, 466, 706, 108, 646, 800, 180, 894, 454, 516, 686, 624],
  as:  [156, 356, 392, 410, 360, 764, 704, 458, 566, 50, 524, 144, 104, 418, 116, 496],
  sea: [360, 764, 704, 458, 608, 418, 116, 104, 96, 626],
  au:  [36, 554, 242, 598, 90, 548, 184, 570],
};

/* ─── Component ──────────────────────────────────────────────────────── */

export interface GACountryEntry {
  country: string;
  country_id: string; // ISO alpha-2
  sessions: number;
}

interface WorldPresenceMapProps {
  coral: string;
  regionScores: Record<string, number>;
  gaCountries?: GACountryEntry[] | null; // real GA data when available
}

const W = 800;
const H = 440;
// Clip bottom to cut off Antarctica empty space — visible area is top 78%
const CLIP_H = Math.round(H * 0.78);

export function WorldPresenceMap({ coral, regionScores, gaCountries }: WorldPresenceMapProps) {
  const [paths, setPaths] = useState<{ id: number; d: string; region: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo: TopoJson) => {
        const decoded = decodeArcs(topo);
        const geometries = topo.objects.countries?.geometries ?? [];

        // Build country id → region lookup
        const idToRegion: Record<number, string> = {};
        for (const [region, ids] of Object.entries(REGION_COUNTRIES)) {
          for (const id of ids) idToRegion[id] = region;
        }

        const result = geometries
          .filter((geo) => {
            const id = typeof geo.id === "string" ? parseInt(geo.id, 10) : (geo.id ?? 0);
            return id !== 10; // exclude Antarctica
          })
          .map((geo) => {
            const id = typeof geo.id === "string" ? parseInt(geo.id, 10) : (geo.id ?? 0);
            const d = geo.type === "Polygon" || geo.type === "MultiPolygon"
              ? buildPath((geo as unknown as { arcs: unknown }).arcs, decoded, W, H)
              : "";
            return { id, d, region: idToRegion[id] ?? null };
          }).filter((p) => p.d.length > 0);

        setPaths(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxScore = Math.max(...Object.values(regionScores), 1);

  // Build per-country score map from GA data (numeric ID → normalised 0-1)
  const gaNumericScores = new Map<number, number>();
  if (gaCountries && gaCountries.length > 0) {
    const maxSessions = Math.max(...gaCountries.map((c) => c.sessions), 1);
    for (const entry of gaCountries) {
      const numericId = ALPHA2_TO_NUMERIC[entry.country_id.toUpperCase()];
      if (numericId) {
        gaNumericScores.set(numericId, entry.sessions / maxSessions);
      }
    }
  }

  const hasGAData = gaNumericScores.size > 0;

  function getCountryFill(id: number, region: string | null): string {
    if (hasGAData) {
      return gaNumericScores.has(id) ? coral : "var(--muted-foreground)";
    }
    if (!region) return "var(--muted-foreground)";
    const score = regionScores[region] ?? 0;
    return score === 0 ? "var(--muted-foreground)" : coral;
  }

  function getCountryOpacity(id: number, region: string | null): number {
    if (hasGAData) {
      const ratio = gaNumericScores.get(id) ?? 0;
      return ratio === 0 ? 0.1 : 0.15 + ratio * 0.7;
    }
    if (!region) return 0.12;
    const score = regionScores[region] ?? 0;
    if (score === 0) return 0.12;
    return 0.2 + (score / maxScore) * 0.65;
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ aspectRatio: "2/1" }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${coral}40`, borderTopColor: coral }} />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "3/1", background: "transparent" }}>
      <svg
        viewBox={`0 0 ${W} ${CLIP_H}`}
        className="w-full h-full"
        style={{ display: "block" }}
      >
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill={getCountryFill(p.id, p.region)}
            fillOpacity={getCountryOpacity(p.id, p.region)}
            stroke="var(--background)"
            strokeWidth="0.5"
            strokeOpacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
}
