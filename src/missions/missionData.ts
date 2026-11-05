import type { Mission, ToyId } from '../store/types';

const DEFAULT_DURATION = 120;

export const MISSIONS: Record<ToyId, Mission> = {
  'car': {
    id: 'mission-car',
    toyId: 'car',
    targets: [
      { partName: 'body', targetColor: '#FF0000' },
      { partName: 'roof', targetColor: '#FFFFFF' },
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
      { partName: 'frame', targetColor: '#0000FF' },
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
      { partName: 'cab', targetColor: '#FF8000' },
      { partName: 'cargo', targetColor: '#00AA00' },
      { partName: 'wheel-front', targetColor: '#000000' },
      { partName: 'wheel-rear', targetColor: '#000000' },
      { partName: 'window', targetColor: '#87CEEB' },
      { partName: 'bumper', targetColor: '#808080' },
    ],
    durationSeconds: DEFAULT_DURATION,
  },
};

export const TOY_DEFINITIONS_2D: Record<ToyId, { id: ToyId; label: Record<'en'|'ta', string>; parts: { name: string; label: Record<'en'|'ta', string> }[] }> = {
  'car': {
    id: 'car',
    label: { en: 'Car', ta: 'கார்' },
    parts: [
      { name: 'body', label: { en: 'Body', ta: 'உடல்' } },
      { name: 'roof', label: { en: 'Roof', ta: 'கூரை' } },
      { name: 'wheel-front', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear', label: { en: 'Rear Wheel', ta: 'பின் சக்கரம்' } },
      { name: 'window', label: { en: 'Window', ta: 'ஜன்னல்' } },
      { name: 'bumper', label: { en: 'Bumper', ta: 'பம்பர்' } },
    ],
  },
  'bike': {
    id: 'bike',
    label: { en: 'Bike', ta: 'சைக்கிள்' },
    parts: [
      { name: 'frame', label: { en: 'Frame', ta: 'சட்டகம்' } },
      { name: 'wheel-front', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear', label: { en: 'Rear Wheel', ta: 'பின் சக்கரம்' } },
      { name: 'handlebar', label: { en: 'Handlebar', ta: 'கைப்பிடி' } },
      { name: 'seat', label: { en: 'Seat', ta: 'இருக்கை' } },
    ],
  },
  'lorry': {
    id: 'lorry',
    label: { en: 'Lorry', ta: 'லாரி' },
    parts: [
      { name: 'cab', label: { en: 'Cab', ta: 'கேபின்' } },
      { name: 'cargo', label: { en: 'Cargo', ta: 'சரக்கு' } },
      { name: 'wheel-front', label: { en: 'Front Wheel', ta: 'முன் சக்கரம்' } },
      { name: 'wheel-rear', label: { en: 'Rear Wheel', ta: 'பின் சக்கரம்' } },
      { name: 'window', label: { en: 'Window', ta: 'ஜன்னல்' } },
      { name: 'bumper', label: { en: 'Bumper', ta: 'பம்பர்' } },
    ],
  },
};
