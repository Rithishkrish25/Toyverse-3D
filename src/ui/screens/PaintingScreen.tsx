import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import SvgToy from '../../toys/SvgToys';
import WorkshopCanvas from '../../scene/WorkshopCanvas';
import ToyLoader from '../../toys/ToyLoader';
import { ToyRenderModeProvider } from '../../toys/ToyRenderModeContext';
import Palette from '../components/Palette';
import HUD from '../components/HUD';
import UndoResetBar from '../components/UndoResetBar';
import AchievementToast from '../components/AchievementToast';
import SubmitButton from '../components/SubmitButton';
import ResultsOverlay from '../components/ResultsOverlay';
import type { ToyId } from '../../store/types';

const VALID_TOY_IDS: ToyId[] = ['car', 'bike', 'lorry'];

const TOY_ICONS: Record<ToyId, string> = {
  car: '🚗',
  bike: '🚲',
  lorry: '🚛',
};

/**
 * Toy selector shown at top of the paintable panel.
 * Clicking a different toy navigates to it immediately.
 */
function ToySelector({ current }: { current: ToyId }): React.ReactElement {
  const navigate = useNavigate();
  const selectToy = useGameStore((s) => s.selectToy);

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
      {VALID_TOY_IDS.map((id) => (
        <button
          key={id}
          onClick={() => { selectToy(id); navigate(`/paint/${id}`); }}
          title={id}
          style={{
            fontSize: '26px',
            padding: '7px 14px',
            background: current === id ? '#FF6B35' : '#fff',
            border: current === id ? '2px solid #FF6B35' : '2px solid #E8DDCA',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: current === id ? '0 2px 8px rgba(255,107,53,0.3)' : 'none',
            transition: 'all 0.15s',
            lineHeight: 1,
          }}
        >
          {TOY_ICONS[id]}
        </button>
      ))}
    </div>
  );
}

/**
 * Main painting screen — 2D SVG colouring challenge.
 *
 * Layout:
 *   Top bar: timer (left) | toy label (centre) | submit (right)
 *   Main area: target image (left 38%) | toy selector + paintable SVG (right 62%)
 *   Bottom bar: palette | undo/reset
 */
export default function PaintingScreen(): React.ReactElement {
  const { toyId } = useParams<{ toyId: string }>();
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);
  const phase = useGameStore((s) => s.phase);
  const activeToyId = useGameStore((s) => s.activeToyId);
  const selectToy = useGameStore((s) => s.selectToy);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const resumeTimer = useGameStore((s) => s.resumeTimer);
  const showNoPalettePrompt = useGameStore((s) => s.showNoPalettePrompt);
  const storageWarning = useGameStore((s) => s.storageWarning);

  const validToyId = VALID_TOY_IDS.includes(toyId as ToyId) ? (toyId as ToyId) : null;

  // Initialize toy on mount
  useEffect(() => {
    if (validToyId && (!activeToyId || activeToyId !== validToyId)) {
      selectToy(validToyId);
    }
  }, [validToyId, activeToyId, selectToy]);

  // Timer tick every second while painting
  useEffect(() => {
    if (phase !== 'painting') return;
    const id = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(id);
  }, [phase, tickTimer]);

  // Blur/focus timer pause/resume
  useEffect(() => {
    const onBlur = () => pauseTimer();
    const onFocus = () => resumeTimer();
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [pauseTimer, resumeTimer]);

  if (!validToyId) {
    return (
      <div style={{ background: '#FFF7E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#2D2D2D' }}>
          Invalid vehicle.{' '}
          <button onClick={() => navigate('/')} style={{ color: '#FF6B35', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Go home
          </button>
        </p>
      </div>
    );
  }

  const isPainting = phase === 'painting' || phase === 'submitting';

  return (
    <div style={{
      background: '#FFF7E8',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        borderBottom: '1.5px solid #E8DDCA',
        background: '#fff',
        zIndex: 10,
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <HUD />
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#888' }}>
          {t('painting.targetImage', locale)}
        </span>
        <SubmitButton />
      </div>

      {/* ── Main area ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — Target reference image */}
        {isPainting && (
          <div style={{
            width: '38%',
            flexShrink: 0,
            background: '#fff',
            borderRight: '1.5px solid #E8DDCA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#888',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}>
              {t('painting.targetImage', locale)}
            </div>
            <div style={{ width: '100%', maxWidth: '260px' }}>
              <SvgToy toyId={validToyId} partColors={{}} targetMode={true} />
            </div>
          </div>
        )}

        {/* RIGHT — Paintable 3D toy */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}>
          <ToySelector current={validToyId} />

          {/* 3D canvas — takes remaining space; PartMesh handles clicks */}
          <div style={{ width: '100%', flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden' }}
               className={(phase === 'complete' || phase === 'timeout') ? 'toy-spin-anim' : undefined}>
            <WorkshopCanvas activeToyId={validToyId}>
              <ToyRenderModeProvider value="paintable">
                <ToyLoader toyId={validToyId} />
              </ToyRenderModeProvider>
            </WorkshopCanvas>
          </div>

          {/* No colour selected prompt */}
          {showNoPalettePrompt && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#2D2D2D',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              pointerEvents: 'none',
              zIndex: 20,
            }}>
              {t('error.noColourSelected', locale)}
            </div>
          )}

          {/* Storage warning */}
          {storageWarning && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(200,50,50,0.9)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              zIndex: 20,
            }}>
              {t('error.storageUnavailable', locale)}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '10px 16px',
        borderTop: '1.5px solid #E8DDCA',
        background: '#fff',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <Palette />
        <UndoResetBar />
      </div>

      <AchievementToast />
      <ResultsOverlay />
    </div>
  );
}
