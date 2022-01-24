/* eslint-disable prettier/prettier */
/* eslint-disable id-length */
import eosTexture from '@/assets/textures/eos.png';

export const MOONS = [
  { name: 'Eos', id: 'p0', type: 'planet', color: '#234672', texture: eosTexture, position: { x: -8450000, y: 0, z: 0 }, radius: 5500000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: 'The primary planet of the solar system, Eos is a blue gas giant that marks the center of civilization.\n\nEos has an 11,000 kilometer diameter, the largest astroid belt in the system, and is home to the \'pringle\' of Origin Stations.', namedBy: null, namedAt: null },
  { name: 'Elysium', id: 'm0', type: 'moon', color: '#D2B9BD', position: { x: -5008441.769, y: -21729143.49, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[Collective] Hatman', namedAt: null },
  { name: 'Chemosh', id: 'm1', type: 'moon', color: '#8FA249', position: { x: -21571180.58, y: 15094191.6, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: null, namedAt: null },
  { name: 'Kumi', id: 'm2', type: 'moon', color: '#A98883', position: { x: -28873963.81, y: -31450146.3, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '/u/WAYTOPOE', namedAt: '8/30/2021' },
  { name: 'Szellem', id: 'm3', type: 'moon', color: '#99A3A5', position: { x: 17116140.89, y: 31571554.68, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Rabir', namedAt: '8/18/2021' },
  { name: 'Albedo', id: 'm4', type: 'moon', color: '#D4B2A8', position: { x: -49433311.56, y: 24625257.96, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[AA] Diez, Laiskiainen, and KuiK', namedAt: '8/24/2021' },
  { name: 'Mare', id: 'm5', type: 'moon', color: '#4C6A8C', position: { x: 39162992.84, y: -8395455.27, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Subaru', namedAt: '8/13/2021' },
  { name: 'Alstel', id: 'm6', type: 'moon', color: '#9C714E', position: { x: -3840528.126, y: -58568893.36, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: 'Zz', namedAt: '9/13/2021' },
  { name: 'Masser', id: 'm7', type: 'moon', color: '#A32F30', position: { x: -71519222.21, y: -15724923.21, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Nihil', namedAt: '10/9/2021' },
  { name: 'Caecus', id: 'm8', type: 'moon', color: '#457F45', position: { x: -16126592.93, y: 67376591.46, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Senkii', namedAt: '8/21/2021' },
  { name: 'Neso', id: 'm9', type: 'moon', color: '#81307F', position: { x: -6666695.397, y: 68101655.26, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Senkii', namedAt: '8/23/2021' },
  { name: 'Aurora', id: 'm10', type: 'moon', color: '#7D8742', position: { x: 45087210.85, y: -46539187.37, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Alegost', namedAt: '8/21/2021' },
  { name: 'Amethyst', id: 'm11', type: 'moon', color: '#68353A', position: { x: -50999924.61, y: -65521138.12, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Alegost', namedAt: '9/21/2021' },
  { name: 'Tartarus', id: 'm12', type: 'moon', color: '#D596B3', position: { x: 65753950.06, y: 34601870.18, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Subaru', namedAt: '8/20/2021' },
  { name: 'Kypselis', id: 'm13', type: 'moon', color: '#507D7A', position: { x: -86816109.42, y: -59053099.15, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[B.E.E.S.] MrMunchkin21', namedAt: '9/18/2021' },
  { name: 'Magellan', id: 'm14', type: 'moon', color: '#82C1CA', position: { x: -79420454.34, y: 76106494.57, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Nihil', namedAt: '9/15/2021' },
  { name: 'Iris', id: 'm15', type: 'moon', color: '#C09E94', position: { x: 33126823.67, y: -114231384.2, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Alegost', namedAt: '9/1/2021' },
  { name: 'Szalonna', id: 'm16', type: 'moon', color: '#AD2D2E', position: { x: 13548596.65, y: 138893672.9, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Rabir', namedAt: '8/31/2021' },
  { name: 'Ciel', id: 'm17', type: 'moon', color: '#704A57', position: { x: 134839528.1, y: 25265809.85, z: 0 }, radius: 245000, widthSegments: 50, heightSegments: 50, opacity: 0.9, description: '', namedBy: '[EPIC Corp] Subaru', namedAt: '8/27/2021' },
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
  { name: 'Eos Belt', type: 'belt', moon: 'eos', color: '#2c809b', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 300000, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Elysium Belt', type: 'belt', moon: 'elysium', color: '#459474', position: { x: -5008441.769, y: -21729143.49, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 200, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Chemosh Belt', type: 'belt', moon: 'chemosh', color: '#981300', position: { x: -21571180.58, y: 15094191.6, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 200, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Kumi Belt', type: 'belt', moon: 'kumi', color: '#A05400', position: { x: -28873963.81, y: -31450146.3, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 200, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Szellem Belt', type: 'belt', moon: 'szellem', color: '#FCAFDB', position: { x: 17116140.89, y: 31571554.68, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 200, scaleX: 2, scaleY: 2, opacity: 0.5 },
  { name: 'Alstel Belt', type: 'belt', moon: 'alstel', color: '#C55CFF', position: { x: -3840528.126, y: -58568893.36, z: 0 }, overalRadius: 220000, innerRadius: 40000, radialSegments: 100, tubularSegments: 200, scaleX: 2, scaleY: 2, opacity: 0.5 },
];

export const EOS_BELT_ZONES = [
  { name: 'Eos Belt Zone 5', moon: 'eos', color: '#931fff', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 27272.72727, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Eos Belt Zone 4', moon: 'eos', color: '#ff2121', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 122727.272727272, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Eos Belt Zone 3', moon: 'eos', color: '#ff902e', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 204545.454545454, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Eos Belt Zone 2', moon: 'eos', color: '#2e74ff', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 286363.636363636, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
  { name: 'Eos Belt Zone 1', moon: 'eos', color: '#2eff66', position: { x: -8450000, y: 0, z: 0 }, overalRadius: 2618229.42235, innerRadius: 300000, radialSegments: 100, tubularSegments: 200, scaleX: 3.6666, scaleY: 3.6666, opacity: 0.5 },
];
