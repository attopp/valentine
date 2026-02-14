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
  getPlaybackDevices,
  handleSpotifyAuthCallback,
  hasSpotifyConfig,
  pausePlayback,
  playTrackOnActiveDevice,
  playTrackOnDevice,
  transferPlaybackToDevice,
  transferAndPlayTrack,
} from './spotify';
import './App.css';

const NO_TEXTS = [
  'Ne', 'Ani náhodou!', 'Chyť mě!', 'Moc pomalý!',
  'Zkus to znovu!', 'Hehe', 'Nikdy!', 'Nemáš šanci!',
  'Řekni jen ANO!',
];

const BURST_COLORS = ['#e74c3c', '#ff6b81', '#c0392b', '#e84393', '#fd79a8'];
const SPOTIFY_TRACK_ID = '7gKxCvTDWwV9wBhdeBbr3l';
const SPOTIFY_TRACK_URI = 'spotify:track:7gKxCvTDWwV9wBhdeBbr3l';
const PENDING_SPOTIFY_KEY = 'valentine_pending_spotify_play';
const MOBILE_SPOTIFY_RETURN_RETRY_KEY = 'valentine_mobile_spotify_return_retry';
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

      <h1>Lásko, will you be my Valentine?</h1>

      <div className="buttons">
        <Motion.button
          className="btn btn-yes"
          onClick={onYes}
          animate={{ scale: yesScale }}
          whileHover={{ scale: yesScale * 1.08 }}
          whileTap={{ scale: yesScale * 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Ano!
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
    ? 'Na mobilním webu se přihlášení Spotify otevírá v prohlížeči.'
    : '';

  const spotifyEnabled = hasSpotifyConfig();
  const [spotifyUi, setSpotifyUi] = useState(() => ({
    status: spotifyEnabled ? 'idle' : 'missing_config',
    message: spotifyEnabled
      ? 'Hudba se spustí po kliknutí na Ano.'
      : 'Spotify v této verzi není nastavené.',
    needsTap: false,
    showLogin: false,
    showOpenSpotify: false,
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
          reject(new Error('Vypršel čas při čekání na zařízení Spotify přehrávače.'));
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
      message: 'Připojuji Spotify přehrávač...',
      needsTap: false,
      showLogin: false,
    });

    const player = await createSpotifyPlayer({
      onReady: (deviceId) => {
        spotifyDeviceIdRef.current = deviceId;
        updateSpotifyUi({
          status: 'ready',
          message: 'Spotify přehrávač je připraven.',
          showLogin: false,
        });
      },
      onNotReady: () => {
        spotifyDeviceIdRef.current = '';
        updateSpotifyUi({
          status: 'connecting',
          message: 'Znovu připojuji Spotify přehrávač...',
        });
      },
      onAutoplayFailed: () => {
        updateSpotifyUi({
          status: 'blocked',
          message: 'Přehrávání bylo zablokováno. Klepni níže pro spuštění hudby.',
          needsTap: true,
        });
      },
      onError: (message) => {
        if (/auth/i.test(message)) {
          updateSpotifyUi({
            status: 'needs_login',
            message: 'Přihlášení ke Spotify vypršelo. Připoj ho znovu.',
            showLogin: true,
            needsTap: false,
          });
          return;
        }

        updateSpotifyUi({
          status: 'error',
          message: message || 'Přehrávání Spotify selhalo.',
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
      message: 'Otevírám přihlášení Spotify...',
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
        message: 'Spouštím přehrávání Spotify...',
        needsTap: false,
        showLogin: false,
        showOpenSpotify: false,
      });

      // Mobile browsers are often unreliable/unsupported for the Web Playback SDK.
      // Prefer controlling the user's active device (Spotify app) via Web API.
      if (isMobileDevice) {
        try {
          await playTrackOnActiveDevice({ trackUri: SPOTIFY_TRACK_URI });
        } catch (error) {
          // If there is no active device yet (common right after auth), poll for devices
          // and start playback on the first available phone/computer.
          const status = error?.status;
          if (status !== 404) throw error;

          const started = Date.now();
          let devices = [];
          while (Date.now() - started < 9000) {
            devices = await getPlaybackDevices();
            if (devices.length) break;
            await new Promise((r) => window.setTimeout(r, 450));
          }

          const preferred = devices.find((d) => d?.is_active) || devices[0];
          if (!preferred?.id) throw error;

          await transferPlaybackToDevice({ deviceId: preferred.id, play: false });
          await new Promise((r) => window.setTimeout(r, 220));
          await playTrackOnDevice({ deviceId: preferred.id, trackUri: SPOTIFY_TRACK_URI });
        }
      } else {
        const player = await ensureSpotifyPlayer();

        if (fromUserGesture && typeof player.activateElement === 'function') {
          await player.activateElement();
        }

        const deviceId = await waitForSpotifyDevice();
        await transferAndPlayTrack({ deviceId, trackUri: SPOTIFY_TRACK_URI });
      }

      window.sessionStorage.removeItem(PENDING_SPOTIFY_KEY);

      updateSpotifyUi({
        status: 'playing',
        message: isMobileDevice ? 'Přehrávám ve Spotify aplikaci.' : 'Přehrávám Olivia Dean na Spotify.',
        needsTap: false,
        showLogin: false,
        showOpenSpotify: false,
      });
    } catch (error) {
      if (error?.code === 'AUTH_REQUIRED') {
        updateSpotifyUi({
          status: 'needs_login',
          message: 'Pro přehrání celé skladby připoj Spotify.',
          needsTap: false,
          showLogin: true,
          showOpenSpotify: false,
        });
        throw error;
      }

      if (error?.code === 'PREMIUM_REQUIRED') {
        updateSpotifyUi({
          status: 'error',
          message: 'Pro přehrání celé skladby je potřeba Spotify Premium.',
          needsTap: false,
          showLogin: false,
          showOpenSpotify: false,
        });
        throw error;
      }

      // Common on mobile: no active device selected (user hasn't opened Spotify app yet).
      if (isMobileDevice) {
        window.sessionStorage.setItem(MOBILE_SPOTIFY_RETURN_RETRY_KEY, '1');
        updateSpotifyUi({
          status: 'blocked',
          message: 'Otevři Spotify aplikaci (tlačítko níže). Pokud je potřeba, pusť tam cokoliv na 1 vteřinu a vrať se sem. Hudbu zkusím spustit znovu automaticky.',
          needsTap: true,
          showLogin: false,
          showOpenSpotify: true,
        });
        throw error;
      }

      updateSpotifyUi({
        status: 'blocked',
        message: error?.message || 'Přehrávání bylo zablokováno. Klepni níže pro spuštění hudby.',
        needsTap: true,
        showLogin: false,
        showOpenSpotify: false,
      });
      throw error;
    }
  }, [ensureSpotifyPlayer, isMobileDevice, spotifyEnabled, updateSpotifyUi, waitForSpotifyDevice]);

  useEffect(() => {
    if (!spotifyEnabled || !isMobileDevice) return undefined;

    const tryResume = () => {
      const shouldRetry = window.sessionStorage.getItem(MOBILE_SPOTIFY_RETURN_RETRY_KEY) === '1';
      if (!shouldRetry) return;

      void (async () => {
        const token = await getValidAccessToken();
        if (!token) return;
        try {
          await startSpotifyPlayback({ fromUserGesture: false });
          window.sessionStorage.removeItem(MOBILE_SPOTIFY_RETURN_RETRY_KEY);
        } catch {
          // keep retry flag; user might not have started anything in Spotify yet
        }
      })();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryResume();
    };

    window.addEventListener('focus', tryResume);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', tryResume);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isMobileDevice, spotifyEnabled, startSpotifyPlayback]);

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
            message: 'Pro pokračování přehrávání připoj Spotify.',
            showLogin: true,
            needsTap: false,
          });
        }
        return;
      }

      updateSpotifyUi({
        status: 'authorized',
        message: 'Spotify připojeno.',
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
            message: 'Pro pokračování připoj Spotify znovu.',
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
        message: 'Hudba pozastavená.',
        needsTap: true,
        showLogin: false,
        showOpenSpotify: false,
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
                showOpenSpotify: spotifyUi.showOpenSpotify,
                onTapStart: spotifyEnabled ? handleTapToStartMusic : undefined,
                onLogin: spotifyEnabled ? handleConnectSpotify : undefined,
                openSpotifyHref: SPOTIFY_TRACK_URI,
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
