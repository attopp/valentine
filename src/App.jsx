import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { PenguinIcon, HeartIcon } from './Icons';
import FloatingHearts from './FloatingHearts';
import Snow from './Snow';
import WalkScene from './WalkScene';
import {
  beginSpotifyAuthorization,
  createSpotifyPlayer,
  fetchTrackDetails,
  getValidAccessToken,
  handleSpotifyAuthCallback,
  hasSpotifyConfig,
  pausePlayback,
  transferAndPlayTrack,
} from './spotify';
import './App.css';

const NO_TEXTS = [
  'No', 'Nope!', 'Catch me!', 'Too slow!',
  'Try again!', 'Hehe', 'Never!', "Can't touch this!",
  'Just say YES!',
];

const BURST_COLORS = ['#e74c3c', '#ff6b81', '#c0392b', '#e84393', '#fd79a8'];
const SPOTIFY_TRACK_ID = '7gKxCvTDWwV9wBhdeBbr3l';
const SPOTIFY_TRACK_URI = 'spotify:track:7gKxCvTDWwV9wBhdeBbr3l';
const PENDING_SPOTIFY_KEY = 'valentine_pending_spotify_play';
const DEFAULT_TRACK_INFO = {
  name: 'Nice To Each Other',
  artist: 'Olivia Dean',
  album: '',
  image: '',
};

function HeartBurst() {
  const hearts = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 40;
      const dist = 100 + Math.random() * 350;
      return {
        id: i,
        color: BURST_COLORS[i % 5],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };
    }), []
  );

  return hearts.map(h => (
    <Motion.span
      key={h.id}
      className="burst-heart"
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: h.x, y: h.y, scale: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <HeartIcon color={h.color} />
    </Motion.span>
  ));
}

function AskScene({ onYes }) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noStyle, setNoStyle] = useState({});
  const [yesScale, setYesScale] = useState(1);

  const dodge = useCallback(() => {
    setDodgeCount(prev => {
      const next = prev + 1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const m = 30;
      setNoStyle({
        position: 'fixed',
        left: Math.random() * (vw - 140 - m * 2) + m,
        top: Math.random() * (vh - 50 - m * 2) + m,
        zIndex: 999,
        transform: `scale(${Math.max(0.4, 1 - next * 0.06)})`,
      });
      setYesScale(s => Math.min(s + 0.1, 2));
      return next;
    });
  }, []);

  return (
    <Motion.div
      className="scene ask-scene"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
      transition={{ duration: 0.8 }}
    >
      <Motion.div
        className="ask-penguin"
        animate={{ rotate: [0, -4, 4, -4, 0], y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PenguinIcon />
      </Motion.div>

      <Motion.span
        className="ask-heart"
        animate={{ scale: [1, 1.2, 1], y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <HeartIcon color="#e74c3c" />
      </Motion.span>

      <h1>Will you be my Valentine?</h1>

      <div className="buttons">
        <Motion.button
          className="btn btn-yes"
          onClick={onYes}
          animate={{ scale: yesScale }}
          whileHover={{ scale: yesScale * 1.08 }}
          whileTap={{ scale: yesScale * 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Yes!
        </Motion.button>

        <Motion.button
          className="btn btn-no"
          style={noStyle}
          onMouseEnter={dodge}
          onTouchStart={(e) => { e.preventDefault(); dodge(); }}
          onClick={(e) => { e.preventDefault(); dodge(); }}
        >
          {NO_TEXTS[Math.min(dodgeCount, NO_TEXTS.length - 1)]}
        </Motion.button>
      </div>
    </Motion.div>
  );
}

export default function App() {
  const [said, setSaid] = useState(false);
  const [burst, setBurst] = useState(false);
  const isMobileDevice = useMemo(
    () => (typeof navigator !== 'undefined'
      ? /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
      : false),
    []
  );
  const mobileAuthHint = isMobileDevice
    ? 'On mobile web, Spotify login opens in the browser by design.'
    : '';

  const spotifyEnabled = hasSpotifyConfig();
  const [spotifyUi, setSpotifyUi] = useState(() => ({
    status: spotifyEnabled ? 'idle' : 'missing_config',
    message: spotifyEnabled
      ? 'Music will start when you click Yes.'
      : 'Spotify is not configured for this build.',
    needsTap: false,
    showLogin: false,
  }));
  const [trackInfo, setTrackInfo] = useState(DEFAULT_TRACK_INFO);

  const switchTimeoutRef = useRef(null);
  const spotifyPlayerRef = useRef(null);
  const spotifyDeviceIdRef = useRef('');

  const updateSpotifyUi = useCallback((patch) => {
    setSpotifyUi(prev => ({ ...prev, ...patch }));
  }, []);

  const loadSpotifyTrackInfo = useCallback(async () => {
    if (!spotifyEnabled) return;

    try {
      const details = await fetchTrackDetails(SPOTIFY_TRACK_ID);
      if (!details) return;

      setTrackInfo({
        name: details.name || DEFAULT_TRACK_INFO.name,
        artist: details.artist || DEFAULT_TRACK_INFO.artist,
        album: details.album || '',
        image: details.image || '',
      });
    } catch {
      // Keep fallback static text if metadata fetch fails.
    }
  }, [spotifyEnabled]);

  const waitForSpotifyDevice = useCallback(async () => {
    if (spotifyDeviceIdRef.current) {
      return spotifyDeviceIdRef.current;
    }

    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timerId = window.setInterval(() => {
        if (spotifyDeviceIdRef.current) {
          window.clearInterval(timerId);
          resolve(spotifyDeviceIdRef.current);
          return;
        }

        if (Date.now() - started > 8000) {
          window.clearInterval(timerId);
          reject(new Error('Timed out waiting for Spotify player device.'));
        }
      }, 120);
    });
  }, []);

  const ensureSpotifyPlayer = useCallback(async () => {
    if (spotifyPlayerRef.current) {
      return spotifyPlayerRef.current;
    }

    updateSpotifyUi({
      status: 'connecting',
      message: 'Connecting Spotify player...',
      needsTap: false,
      showLogin: false,
    });

    const player = await createSpotifyPlayer({
      onReady: (deviceId) => {
        spotifyDeviceIdRef.current = deviceId;
        updateSpotifyUi({
          status: 'ready',
          message: 'Spotify player is ready.',
          showLogin: false,
        });
      },
      onNotReady: () => {
        spotifyDeviceIdRef.current = '';
        updateSpotifyUi({
          status: 'connecting',
          message: 'Reconnecting Spotify player...',
        });
      },
      onAutoplayFailed: () => {
        updateSpotifyUi({
          status: 'blocked',
          message: 'Playback was blocked. Tap below to start music.',
          needsTap: true,
        });
      },
      onError: (message) => {
        if (/auth/i.test(message)) {
          updateSpotifyUi({
            status: 'needs_login',
            message: 'Spotify login expired. Connect again to continue.',
            showLogin: true,
            needsTap: false,
          });
          return;
        }

        updateSpotifyUi({
          status: 'error',
          message: message || 'Spotify playback failed.',
          needsTap: true,
          showLogin: false,
        });
      },
    });

    spotifyPlayerRef.current = player;
    return player;
  }, [updateSpotifyUi]);

  const requestSpotifyLogin = useCallback(async () => {
    if (!spotifyEnabled) return;

    window.sessionStorage.setItem(PENDING_SPOTIFY_KEY, '1');

    updateSpotifyUi({
      status: 'authorizing',
      message: 'Opening Spotify login...',
      needsTap: false,
      showLogin: false,
    });

    await beginSpotifyAuthorization();
  }, [spotifyEnabled, updateSpotifyUi]);

  const startSpotifyPlayback = useCallback(async ({ fromUserGesture }) => {
    if (!spotifyEnabled) return;

    try {
      updateSpotifyUi({
        status: 'connecting',
        message: 'Starting Spotify playback...',
        needsTap: false,
        showLogin: false,
      });

      const player = await ensureSpotifyPlayer();

      if (fromUserGesture && typeof player.activateElement === 'function') {
        await player.activateElement();
      }

      const deviceId = await waitForSpotifyDevice();
      await transferAndPlayTrack({ deviceId, trackUri: SPOTIFY_TRACK_URI });

      window.sessionStorage.removeItem(PENDING_SPOTIFY_KEY);

      updateSpotifyUi({
        status: 'playing',
        message: 'Playing Olivia Dean on Spotify.',
        needsTap: false,
        showLogin: false,
      });
    } catch (error) {
      if (error?.code === 'AUTH_REQUIRED') {
        updateSpotifyUi({
          status: 'needs_login',
          message: 'Connect Spotify to play the full track.',
          needsTap: false,
          showLogin: true,
        });
        throw error;
      }

      if (error?.code === 'PREMIUM_REQUIRED') {
        updateSpotifyUi({
          status: 'error',
          message: 'Spotify Premium is required for full-song playback.',
          needsTap: false,
          showLogin: false,
        });
        throw error;
      }

      updateSpotifyUi({
        status: 'blocked',
        message: error?.message || 'Playback was blocked. Tap below to start music.',
        needsTap: true,
        showLogin: false,
      });
      throw error;
    }
  }, [ensureSpotifyPlayer, spotifyEnabled, updateSpotifyUi, waitForSpotifyDevice]);

  useEffect(() => {
    if (!spotifyEnabled) return undefined;

    let cancelled = false;

    const bootstrapSpotify = async () => {
      const authResult = await handleSpotifyAuthCallback();
      if (cancelled) return;

      if (authResult.error) {
        window.sessionStorage.removeItem(PENDING_SPOTIFY_KEY);
        updateSpotifyUi({
          status: 'error',
          message: authResult.error.message,
          showLogin: true,
          needsTap: false,
        });
        return;
      }

      const token = await getValidAccessToken();
      const hasPendingPlay = window.sessionStorage.getItem(PENDING_SPOTIFY_KEY) === '1';

      if (!token) {
        if (hasPendingPlay) {
          updateSpotifyUi({
            status: 'needs_login',
            message: 'Connect Spotify to continue playback.',
            showLogin: true,
            needsTap: false,
          });
        }
        return;
      }

      updateSpotifyUi({
        status: 'authorized',
        message: 'Spotify connected.',
        showLogin: false,
      });
      void loadSpotifyTrackInfo();

      if (!hasPendingPlay) return;

      setBurst(true);
      setSaid(true);

      try {
        await startSpotifyPlayback({ fromUserGesture: false });
      } catch (error) {
        if (error?.code === 'AUTH_REQUIRED') {
          updateSpotifyUi({
            status: 'needs_login',
            message: 'Connect Spotify again to continue.',
            showLogin: true,
            needsTap: false,
          });
        }
      }
    };

    void bootstrapSpotify();

    return () => {
      cancelled = true;
    };
  }, [loadSpotifyTrackInfo, spotifyEnabled, startSpotifyPlayback, updateSpotifyUi]);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
      }
    };
  }, []);

  const handleYes = useCallback(() => {
    setBurst(true);
    switchTimeoutRef.current = setTimeout(() => setSaid(true), 700);

    if (!spotifyEnabled) return;

    window.sessionStorage.setItem(PENDING_SPOTIFY_KEY, '1');

    void (async () => {
      const token = await getValidAccessToken();
      if (!token) {
        await requestSpotifyLogin();
        return;
      }

      void loadSpotifyTrackInfo();

      try {
        await startSpotifyPlayback({ fromUserGesture: true });
      } catch (error) {
        if (error?.code === 'AUTH_REQUIRED') {
          await requestSpotifyLogin();
        }
      }
    })();
  }, [loadSpotifyTrackInfo, requestSpotifyLogin, spotifyEnabled, startSpotifyPlayback]);

  const handleTapToStartMusic = () => {
    void startSpotifyPlayback({ fromUserGesture: true });
  };

  const handleStopMusic = () => {
    void (async () => {
      try {
        if (spotifyPlayerRef.current && typeof spotifyPlayerRef.current.pause === 'function') {
          await spotifyPlayerRef.current.pause();
        }
      } catch {
        // ignore SDK pause failures and still try Web API pause below
      }

      try {
        await pausePlayback({ deviceId: spotifyDeviceIdRef.current || undefined });
      } catch {
        // ignore pause API errors; local player pause is usually enough
      }

      updateSpotifyUi({
        status: 'paused',
        message: 'Music paused.',
        needsTap: true,
        showLogin: false,
      });
    })();
  };

  const handleConnectSpotify = () => {
    void requestSpotifyLogin();
  };

  return (
    <>
      {!said && (
        <>
          <div className="ask-bg" />
          <FloatingHearts />
          <Snow count={30} />
        </>
      )}

      {burst && <HeartBurst />}

      <AnimatePresence mode="wait">
        {!said ? (
          <AskScene key="ask" onYes={handleYes} />
        ) : (
          <Motion.div
            key="yes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ position: 'fixed', inset: 0 }}
          >
            <WalkScene
              spotify={{
                status: spotifyUi.status,
                message: spotifyUi.message,
                authHint: mobileAuthHint,
                needsTap: spotifyUi.needsTap,
                showLogin: spotifyUi.showLogin,
                onTapStart: spotifyEnabled ? handleTapToStartMusic : undefined,
                onLogin: spotifyEnabled ? handleConnectSpotify : undefined,
                onStop: spotifyEnabled ? handleStopMusic : undefined,
                canStop: spotifyUi.status === 'playing',
                track: trackInfo,
              }}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
