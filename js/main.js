// Starts every feature behind its own error boundary: if one fails to load or
// to start (say, audio), the rest of the page keeps working.
import { initMotion } from './core/motion.js';
import { loadFeature, safeInit } from './core/errors.js';

safeInit('motion', initMotion);
loadFeature('heart', () => import('./features/heart.js'));
loadFeature('entry', () => import('./features/entry/entry.js'));
loadFeature('audio', () => import('./features/audio.js'));
loadFeature('letter', () => import('./features/letter.js'));
loadFeature('celebration', () => import('./features/celebration/celebration.js'));
loadFeature('ending', () => import('./features/celebration/ending.js'));
loadFeature('keepsake', () => import('./features/keepsake.js'));
loadFeature('feedback', () => import('./features/feedback/feedback.js'));
