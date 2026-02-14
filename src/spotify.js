const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

const STORAGE_AUTH_KEY = 'spotify_auth_v1';
const STORAGE_PKCE_VERIFIER_KEY = 'spotify_pkce_verifier_v1';
const STORAGE_PKCE_STATE_KEY = 'spotify_pkce_state_v1';

const EXPIRY_BUFFER_MS = 60 * 1000;
const DEFAULT_SPOTIFY_CLIENT_ID = 'bf9eb93f37fb406cb73fbf8abecc8c69';

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
];

let sdkLoadPromise = null;

function makeError(message, code = 'SPOTIFY_ERROR', status = null) {
  const error = new Error(message);
  error.code = code;
  if (status) error.status = status;
  return error;
}

function getClientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || DEFAULT_SPOTIFY_CLIENT_ID;
}

export function hasSpotifyConfig() {
  return Boolean(getClientId());
}

export function getRedirectUri() {
  if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  }

  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

function randomString(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (v) => charset[v % charset.length]).join('');
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return window.crypto.subtle.digest('SHA-256', data);
}

function toBase64Url(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getStoredAuth() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuth(tokenResponse, previous = null) {
  if (typeof window === 'undefined') return null;

  const auth = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token || previous?.refresh_token || null,
    expires_at: Date.now() + (tokenResponse.expires_in * 1000),
  };

  window.localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(auth));
  return auth;
}

export function clearSpotifyAuth() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(STORAGE_AUTH_KEY);
  window.sessionStorage.removeItem(STORAGE_PKCE_VERIFIER_KEY);
  window.sessionStorage.removeItem(STORAGE_PKCE_STATE_KEY);
}

async function readResponseError(response) {
  try {
    const payload = await response.json();
    if (payload?.error_description) return payload.error_description;
    if (typeof payload?.error === 'string') return payload.error;
    if (payload?.error?.message) return payload.error.message;
  } catch {
    // ignore
  }

  return `Spotify request failed (${response.status})`;
}

async function exchangeCodeForToken(code, codeVerifier) {
  const clientId = getClientId();
  if (!clientId) {
    throw makeError('Missing Spotify client id', 'MISSING_CONFIG');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: codeVerifier,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const message = await readResponseError(response);
    throw makeError(`Spotify auth failed: ${message}`, 'AUTH_FAILED', response.status);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken) {
  const clientId = getClientId();
  if (!clientId) {
    throw makeError('Missing Spotify client id', 'MISSING_CONFIG');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const message = await readResponseError(response);
    throw makeError(`Spotify refresh failed: ${message}`, 'AUTH_FAILED', response.status);
  }

  return response.json();
}

export async function getValidAccessToken() {
  const auth = getStoredAuth();
  if (!auth) return null;

  if (auth.access_token && auth.expires_at - Date.now() > EXPIRY_BUFFER_MS) {
    return auth.access_token;
  }

  if (!auth.refresh_token) {
    clearSpotifyAuth();
    return null;
  }

  try {
    const refreshed = await refreshAccessToken(auth.refresh_token);
    const stored = storeAuth(refreshed, auth);
    return stored?.access_token || null;
  } catch {
    clearSpotifyAuth();
    return null;
  }
}

export async function beginSpotifyAuthorization() {
  const clientId = getClientId();
  if (!clientId) {
    throw makeError('VITE_SPOTIFY_CLIENT_ID is not configured.', 'MISSING_CONFIG');
  }

  const verifier = randomString(64);
  const challenge = toBase64Url(await sha256(verifier));
  const state = randomString(16);

  window.sessionStorage.setItem(STORAGE_PKCE_VERIFIER_KEY, verifier);
  window.sessionStorage.setItem(STORAGE_PKCE_STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SPOTIFY_SCOPES.join(' '),
    state,
  });

  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`);
}

function cleanAuthQueryParams() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');

  const cleanPath = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, cleanPath || '/');
}

export async function handleSpotifyAuthCallback() {
  if (typeof window === 'undefined') {
    return { handled: false, success: false, error: null };
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const authError = url.searchParams.get('error');

  if (!code && !authError) {
    return { handled: false, success: false, error: null };
  }

  if (authError) {
    cleanAuthQueryParams();
    return {
      handled: true,
      success: false,
      error: makeError(`Spotify authorization error: ${authError}`, 'AUTH_DENIED'),
    };
  }

  const expectedState = window.sessionStorage.getItem(STORAGE_PKCE_STATE_KEY);
  const codeVerifier = window.sessionStorage.getItem(STORAGE_PKCE_VERIFIER_KEY);

  window.sessionStorage.removeItem(STORAGE_PKCE_STATE_KEY);
  window.sessionStorage.removeItem(STORAGE_PKCE_VERIFIER_KEY);

  if (!expectedState || state !== expectedState || !codeVerifier) {
    cleanAuthQueryParams();
    return {
      handled: true,
      success: false,
      error: makeError('Spotify auth state mismatch. Please try again.', 'AUTH_STATE_MISMATCH'),
    };
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code, codeVerifier);
    storeAuth(tokenResponse, getStoredAuth());
    cleanAuthQueryParams();
    return { handled: true, success: true, error: null };
  } catch (error) {
    cleanAuthQueryParams();
    return { handled: true, success: false, error };
  }
}

export function loadSpotifySdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(makeError('Spotify SDK can only run in a browser', 'SDK_UNAVAILABLE'));
  }

  if (window.Spotify) {
    return Promise.resolve(window.Spotify);
  }

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(makeError('Spotify SDK load timed out', 'SDK_TIMEOUT'));
    }, 15000);

    const previousHandler = window.onSpotifyWebPlaybackSDKReady;
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (typeof previousHandler === 'function') {
        previousHandler();
      }
      window.clearTimeout(timeoutId);
      resolve(window.Spotify);
    };

    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) {
      existing.addEventListener(
        'error',
        () => {
          window.clearTimeout(timeoutId);
          reject(makeError('Failed to load Spotify SDK', 'SDK_LOAD_FAILED'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(makeError('Failed to load Spotify SDK', 'SDK_LOAD_FAILED'));
    };

    document.body.appendChild(script);
  });

  return sdkLoadPromise;
}

export async function createSpotifyPlayer({ onReady, onNotReady, onAutoplayFailed, onError }) {
  const Spotify = await loadSpotifySdk();

  const player = new Spotify.Player({
    name: 'Valentine Player',
    getOAuthToken: (cb) => {
      void getValidAccessToken().then((token) => {
        if (token) cb(token);
      });
    },
    volume: 0.85,
  });

  player.addListener('ready', ({ device_id: deviceId }) => {
    if (typeof onReady === 'function') onReady(deviceId);
  });

  player.addListener('not_ready', ({ device_id: deviceId }) => {
    if (typeof onNotReady === 'function') onNotReady(deviceId);
  });

  player.addListener('autoplay_failed', () => {
    if (typeof onAutoplayFailed === 'function') onAutoplayFailed();
  });

  ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach((eventName) => {
    player.addListener(eventName, ({ message }) => {
      if (typeof onError === 'function') onError(message || 'Spotify playback error');
    });
  });

  const connected = await player.connect();
  if (!connected) {
    throw makeError('Could not connect Spotify player', 'PLAYER_CONNECT_FAILED');
  }

  return player;
}

async function spotifyApi(path, { method = 'GET', body, expectJson = false } = {}) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw makeError('Spotify login required', 'AUTH_REQUIRED');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return null;
  }

  if (response.ok) {
    if (!expectJson) return null;
    return response.json();
  }

  const message = await readResponseError(response);
  if (response.status === 401) {
    throw makeError(`Spotify authorization expired: ${message}`, 'AUTH_REQUIRED', 401);
  }
  if (response.status === 403) {
    throw makeError(`Spotify playback not allowed: ${message}`, 'PREMIUM_REQUIRED', 403);
  }

  throw makeError(`Spotify API error: ${message}`, 'API_ERROR', response.status);
}

export async function transferAndPlayTrack({ deviceId, trackUri }) {
  if (!deviceId) {
    throw makeError('No Spotify playback device is ready', 'DEVICE_NOT_READY');
  }

  await spotifyApi('/me/player', {
    method: 'PUT',
    body: { device_ids: [deviceId], play: false },
  });

  await new Promise((resolve) => window.setTimeout(resolve, 240));

  await spotifyApi(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    body: { uris: [trackUri] },
  });
}

export async function playTrackOnActiveDevice({ trackUri }) {
  if (!trackUri) {
    throw makeError('Missing track uri', 'MISSING_TRACK_URI');
  }

  // If the user already has an active device (typically the Spotify mobile app),
  // this starts playback there without needing the Web Playback SDK.
  await spotifyApi('/me/player/play', {
    method: 'PUT',
    body: { uris: [trackUri] },
  });
}

export async function pausePlayback({ deviceId } = {}) {
  const query = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
  await spotifyApi(`/me/player/pause${query}`, { method: 'PUT' });
}

export async function fetchTrackDetails(trackId) {
  const payload = await spotifyApi(`/tracks/${encodeURIComponent(trackId)}`, {
    method: 'GET',
    expectJson: true,
  });

  if (!payload) return null;

  return {
    name: payload.name || '',
    artist: Array.isArray(payload.artists) ? payload.artists.map((a) => a.name).filter(Boolean).join(', ') : '',
    album: payload.album?.name || '',
    image: payload.album?.images?.[2]?.url || payload.album?.images?.[1]?.url || payload.album?.images?.[0]?.url || '',
  };
}
