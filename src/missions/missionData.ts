import type { Mission, ToyId } from '../store/types';

const DEFAULT_DURATION = 120;

/** Maps level number (1-based) to ToyId. Level 1=Car, 2=Bike, 3=Lorry. */
export const LEVEL_TO_TOY: Record<number, ToyId> = {
  1: 'car',
  2: 'bike',
  3: 'lorry',
};

/** Total number of levels in the game. */
export const TOTAL_LEVELS = 3;

export const MISSIONS: Record<ToyId, Mission> = {
  'car': {
    id: 'mission-car',
    toyId: 'car',
    targets: [
      { partName: 'body', targetColor: '#FF0000' },
      { partName: 'roof', targetColor: '#FFFF00' },
      { partName: 'wheel-front', targetColor: '#000000' },
      { partName: 'wheel-rear', targetColor: '#000000' },
      { partName: 'window', targetColor: '#87CEEB' },
      { partName: 'bumper', targetColor: '#808080' },
    ],
    durationSeconds: DEFAULT_DURATION,
  },
  'bike': {
    id: 'mission-bike',
    toyId: 'bike',
    targets: [
      { partName: 'frame', targetColor: '#FF6B35' },
      { partName: 'wheel-front', targetColor: '#000000' },
      { partName: 'wheel-rear', targetColor: '#000000' },
      { partName: 'handlebar', targetColor: '#808080' },
      { partName: 'seat', targetColor: '#8B4513' },
    ],
    durationSeconds: DEFAULT_DURATION,
  },
  'lorry': {
    id: 'mission-lorry',
    toyId: 'lorry',
    targets: [
      { partName: 'cab', targetColor: '#FF0000' },
      { partName: 'cargo', targetColor: '#00AA00' },
      { partName: 'wheel-front', targetColor: '#000000' },
      { partName: 'wheel-rear', targetColor: '#000000' },
      { partName: 'window', targetColor: '#87CEEB' },
      { partName: 'bumper', targetColor: '#808080' },
    ],
    durationSeconds: DEFAULT_DURATION,
  },
};

export const TOY_DEFINITIONS_2D: Record<ToyId, { id: ToyId; label: Record<'en'|'ta', string>; parts: { name: string; defaultColor: string; label: Record<'en'|'ta', string> }[] }> = {
  'car': {
    id: 'car',
    label: { en: 'Car', ta: 'கார்' },
    parts: [
      { name: 'body',        defaultColor: '#CCCCCC', label: { en: 'Body',        ta: 'உடல்' } },
      { name: 'roof',        defaultColor: '#CCCCCC', label: { en: 'Roof',        ta: 'கூரை' } },
      { name: 'wheel-front', defaultColor: '#000000', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear',  defaultColor: '#000000', label: { en: 'Rear Wheel',  ta: 'பின் சக்கரம்' } },
      { name: 'window',      defaultColor: '#CCCCCC', label: { en: 'Window',      ta: 'ஜன்னல்' } },
      { name: 'bumper',      defaultColor: '#808080', label: { en: 'Bumper',      ta: 'பம்பர்' } },
    ],
  },
  'bike': {
    id: 'bike',
    label: { en: 'Bike', ta: 'சைக்கிள்' },
    parts: [
      { name: 'frame',       defaultColor: '#CCCCCC', label: { en: 'Frame',       ta: 'சட்டகம்' } },
      { name: 'wheel-front', defaultColor: '#000000', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear',  defaultColor: '#000000', label: { en: 'Rear Wheel',  ta: 'பின் சக்கரம்' } },
      { name: 'handlebar',   defaultColor: '#808080', label: { en: 'Handlebar',   ta: 'கைப்பிடி' } },
      { name: 'seat',        defaultColor: '#8B4513', label: { en: 'Seat',        ta: 'இருக்கை' } },
    ],
  },
  'lorry': {
    id: 'lorry',
    label: { en: 'Lorry', ta: 'லாரி' },
    parts: [
      { name: 'cab',         defaultColor: '#CCCCCC', label: { en: 'Cab',         ta: 'கேபின்' } },
      { name: 'cargo',       defaultColor: '#CCCCCC', label: { en: 'Cargo',       ta: 'சரக்கு' } },
      { name: 'wheel-front', defaultColor: '#000000', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear',  defaultColor: '#000000', label: { en: 'Rear Wheel',  ta: 'பின் சக்கரம்' } },
      { name: 'window',      defaultColor: '#CCCCCC', label: { en: 'Window',      ta: 'ஜன்னல்' } },
      { name: 'bumper',      defaultColor: '#808080', label: { en: 'Bumper',      ta: 'பம்பர்' } },
    ],
  },
};
