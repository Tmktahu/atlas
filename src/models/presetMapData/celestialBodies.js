/* eslint-disable prettier/prettier */
/* eslint-disable id-length */
export const MOONS = [
  { name: 'Eos', celestialType: 'moon', color: '#234672', position: { x: -8450000, y: 0, z: 0 }, radius: 5500000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Elysium', celestialType: 'moon', color: '#D2B9BD', position: { x: -5008441.769, y: -21729143.49, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Chemosh', celestialType: 'moon', color: '#8FA249', position: { x: -21571180.58, y: 15094191.6, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Kumi', celestialType: 'moon', color: '#A98883', position: { x: -28873963.81, y: -31450146.3, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Szellem', celestialType: 'moon', color: '#99A3A5', position: { x: 17116140.89, y: 31571554.68, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Albedo', celestialType: 'moon', color: '#D4B2A8', position: { x: -49433311.56, y: 24625257.96, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Mare', celestialType: 'moon', color: '#4C6A8C', position: { x: 39162992.84, y: -8395455.27, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Alstel', celestialType: 'moon', color: '#9C714E', position: { x: -3840528.126, y: -58568893.36, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Masser', celestialType: 'moon', color: '#A32F30', position: { x: -71519222.21, y: -15724923.21, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Caecus', celestialType: 'moon', color: '#457F45', position: { x: -16126592.93, y: 67376591.46, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Neso', celestialType: 'moon', color: '#81307F', position: { x: -6666695.397, y: 68101655.26, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Aurora', celestialType: 'moon', color: '#7D8742', position: { x: 45087210.85, y: -46539187.37, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Amethyst', celestialType: 'moon', color: '#68353A', position: { x: -50999924.61, y: -65521138.12, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Tartarus', celestialType: 'moon', color: '#D596B3', position: { x: 65753950.06, y: 34601870.18, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Kypselis', celestialType: 'moon', color: '#507D7A', position: { x: -86816109.42, y: -59053099.15, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Magellan', celestialType: 'moon', color: '#82C1CA', position: { x: -79420454.34, y: 76106494.57, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Iris', celestialType: 'moon', color: '#C09E94', position: { x: 33126823.67, y: -114231384.2, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Szalonna', celestialType: 'moon', color: '#AD2D2E', position: { x: 13548596.65, y: 138893672.9, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
  { name: 'Ciel', celestialType: 'moon', color: '#704A57', position: { x: 134839528.1, y: 25265809.85, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9 },
];

export const ORBIT_RINGS = [
  { name: 'Elysium Orbit', radius: 22000000, color: '#FFFFFF'},
  { name: 'Chemosh Orbit', radius: 20000000, color: '#FFFFFF'},
  { name: 'Kumi Orbit', radius: 37500000, color: '#FFFFFF'},
  { name: 'Szellem Orbit', radius: 40625000, color: '#FFFFFF'},
  { name: 'Albedo Orbit', radius: 47812500, color: '#FFFFFF'},
  { name: 'Mare Orbit', radius: 48347500, color: '#FFFFFF'},
  { name: 'Alstel Orbit', radius: 58750000, color: '#FFFFFF'},
  { name: 'Masser Orbit', radius: 65000000, color: '#FFFFFF'},
  { name: 'Caecus Orbit', radius: 67812500, color: '#FFFFFF'},
  { name: 'Neso Orbit', radius: 68125000, color: '#FFFFFF'},
  { name: 'Aurora Orbit', radius: 70937500, color: '#FFFFFF'},
  { name: 'Amethyst Orbit', radius: 78125000, color: '#FFFFFF'},
  { name: 'Tartarus Orbit', radius: 81875000, color: '#FFFFFF'},
  { name: 'Kypselis Orbit', radius: 98125000, color: '#FFFFFF'},
  { name: 'Magellan Orbit', radius: 104062500, color: '#FFFFFF'},
  { name: 'Iris Orbit', radius: 121562500, color: '#FFFFFF'},
  { name: 'Szalonna Orbit', radius: 140625000, color: '#FFFFFF'},
  { name: 'Ciel Orbit', radius: 145500000, color: '#FFFFFF'},
];

export const ASTROID_BELTS = [
  { name: 'Eos Belt', color: '#2c809b', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 300000, radialSegments: 100, tubularSegments: 100, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Elysium Belt', color: '#459474', position: { x: -5008441.769, y: -21729143.49, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 100, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Chemosh Belt', color: '#981300', position: { x: -21571180.58, y: 15094191.6, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 100, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Kumi Belt', color: '#A05400', position: { x: -28873963.81, y: -31450146.3, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 100, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Szellem Belt', color: '#FCAFDB', position: { x: 17116140.89, y: 31571554.68, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 100, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Alstel Belt', color: '#C55CFF', position: { x: -3840528.126, y: -58568893.36, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 100, scaleX: 2, scaleY: 2, opacity: 0.5 },
];
