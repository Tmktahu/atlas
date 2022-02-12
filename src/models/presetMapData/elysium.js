/* eslint-disable prettier/prettier */
/* eslint-disable id-length */
import { v4 as uuidv4 } from 'uuid';

export const ELYSIUM_WARP_GATE = {
  name: 'Elysium WarpGate',
  type: 'gate',
  color: 'aqua',
  position: { x: -4948921, y: -21470914, z: 0 },
  id: uuidv4(),
  hide: false,
  icon: 'stargate',
  group: 'Gates',
  description: 'This is the Elysium warp gate. It allows fast travel to the Eos Warp Gate provided the ship has a functioning fast travel core.'
};
