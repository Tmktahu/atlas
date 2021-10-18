/* eslint-disable id-length */
import station1 from '@/assets/map_icons/station1.png';
import satellite from '@/assets/map_icons/satellite.png';

export const ORIGIN_STATIONS = [
  { name: 'Origin Station 1', color: 'lime', position: { x: 30000, y: 5000, z: 60000 }, id: '1', hide: false, icon: station1 },
  { name: 'Origin Station 2', color: 'lime', position: { x: 25000, y: 15000, z: 55000 }, id: '2', hide: false, icon: station1 },
  { name: 'Origin Station 3', color: 'lime', position: { x: 25000, y: 25000, z: 50000 }, id: '3', hide: false, icon: station1 },
  { name: 'Origin Station 4', color: 'lime', position: { x: 20000, y: 35000, z: 40000 }, id: '4', hide: false, icon: station1 },
  { name: 'Origin Station 5', color: 'lime', position: { x: 15000, y: 40000, z: 30000 }, id: '5', hide: false, icon: station1 },
  { name: 'Origin Station 6', color: 'lime', position: { x: 10000, y: 45000, z: 20000 }, id: '6', hide: false, icon: station1 },
  { name: 'Origin Station 7', color: 'lime', position: { x: 10000, y: 50000, z: 10000 }, id: '7', hide: false, icon: station1 },
  { name: 'Origin Station 8', color: 'lime', position: { x: 10000, y: 50100, z: 0 }, id: '8', hide: false, icon: station1 },
  { name: 'Origin Station 9', color: 'lime', position: { x: 10000, y: 50000, z: -10000 }, id: '9', hide: false, icon: station1 },
  { name: 'Origin Station 10', color: 'lime', position: { x: 10000, y: 45000, z: -20000 }, id: '10', hide: false, icon: station1 },
  { name: 'Origin Station 11', color: 'lime', position: { x: 15000, y: 40000, z: -30000 }, id: '11', hide: false, icon: station1 },
  { name: 'Origin Station 12', color: 'lime', position: { x: 20000, y: 35000, z: -40000 }, id: '12', hide: false, icon: station1 },
  { name: 'Origin Station 13', color: 'lime', position: { x: 25000, y: 25000, z: -50000 }, id: '13', hide: false, icon: station1 },
  { name: 'Origin Station 14', color: 'lime', position: { x: 25000, y: 15000, z: -55000 }, id: '14', hide: false, icon: station1 },
  { name: 'Origin Station 15', color: 'lime', position: { x: 30000, y: 5000, z: -60000 }, id: '15', hide: false, icon: station1 },
  { name: 'Origin Station 16', color: 'lime', position: { x: 30000, y: -5000, z: -60000 }, id: '16', hide: false, icon: station1 },
  { name: 'Origin Station 17', color: 'lime', position: { x: 25000, y: -15000, z: -55000 }, id: '17', hide: false, icon: station1 },
  { name: 'Origin Station 18', color: 'lime', position: { x: 25000, y: -25000, z: -50000 }, id: '18', hide: false, icon: station1 },
  { name: 'Origin Station 19', color: 'lime', position: { x: 20000, y: -35000, z: -40000 }, id: '19', hide: false, icon: station1 },
  { name: 'Origin Station 20', color: 'lime', position: { x: 15000, y: -40000, z: -30000 }, id: '20', hide: false, icon: station1 },
  { name: 'Origin Station 21', color: 'lime', position: { x: 10000, y: -45000, z: -20000 }, id: '21', hide: false, icon: station1 },
  { name: 'Origin Station 22', color: 'lime', position: { x: 10000, y: -50000, z: -10000 }, id: '22', hide: false, icon: station1 },
  { name: 'Origin Station 23', color: 'lime', position: { x: 10000, y: -50000, z: 0 }, id: '23', hide: false, icon: station1 },
  { name: 'Origin Station 24', color: 'lime', position: { x: 10000, y: -50000, z: 10000 }, id: '24', hide: false, icon: station1 },
  { name: 'Origin Station 25', color: 'lime', position: { x: 10000, y: -45000, z: 20000 }, id: '25', hide: false, icon: station1 },
  { name: 'Origin Station 26', color: 'lime', position: { x: 15000, y: -40000, z: 30000 }, id: '26', hide: false, icon: station1 },
  { name: 'Origin Station 27', color: 'lime', position: { x: 20000, y: -35000, z: 40000 }, id: '27', hide: false, icon: station1 },
  { name: 'Origin Station 28', color: 'lime', position: { x: 25000, y: -25000, z: 50000 }, id: '28', hide: false, icon: station1 },
  { name: 'Origin Station 29', color: 'lime', position: { x: 25000, y: -15000, z: 55000 }, id: '29', hide: false, icon: station1 },
  { name: 'Origin Station 30', color: 'lime', position: { x: 30000, y: -5000, z: 60000 }, id: '30', hide: false, icon: station1 },
];

export const TRANSMITTER_STATIONS = [
  { name: 'North', color: 'red', position: { x: 20000, y: 0, z: -65000 }, id: '30', hide: false, icon: satellite },
  { name: 'South', color: 'white', position: { x: 35000, y: 0, z: 65000 }, id: '31', hide: false, icon: satellite },
  { name: 'East', color: 'yellow', position: { x: -20000, y: 60000, z: 0 }, id: '32', hide: false, icon: satellite },
  { name: 'West', color: 'purple', position: { x: -5000, y: -60000, z: 0 }, id: '33', hide: false, icon: satellite },
];
