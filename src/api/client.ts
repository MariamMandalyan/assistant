import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { apiError, apiLog, apiWarn } from './logger';

const TOKEN_KEY = 'citizen_access_token';

export class ApiError extends Error {
  status: number;
  url: string;
  body: unknown;

  constructor(message: string, status: number, url: string, body: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

function extractMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Request failed';
  const record = body as Record<string, unknown>;
  const msg = record.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return 'Request failed';
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** Extra label for logs, e.g. "register" */
  debugLabel?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false, debugLabel } = options;
  const url = `${API_BASE_URL}${path}`;
  const label = debugLabel ?? path;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getToken();
    if (!token) {
      apiError(`${label} — no token`);
      throw new ApiError('Not authenticated', 401, url);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  apiLog(`→ ${label}`, {
    method,
    url,
    baseUrl: API_BASE_URL,
    body,
    auth,
  });

  const started = Date.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const ms = Date.now() - started;
    apiError(`✗ ${label} network error (${ms}ms)`, {
      url,
      error: err instanceof Error ? { name: err.name, message: err.message } : err,
      hint: `ERP на ${API_BASE_URL}. Телефон: IP ПК в config.ts. Эмулятор: ANDROID_LAN_HOST=null`,
    });
    throw err;
  }

  const ms = Date.now() - started;
  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text, raw: text };
      apiWarn(`${label} — response is not JSON`, { status: response.status, text });
    }
  }

  if (!response.ok) {
    apiError(`✗ ${label} HTTP ${response.status} (${ms}ms)`, {
      url,
      status: response.status,
      body: data,
    });
    throw new ApiError(extractMessage(data), response.status, url, data);
  }

  apiLog(`✓ ${label} HTTP ${response.status} (${ms}ms)`, { url, data });

  return data as T;
}

export async function apiUploadFile<T>(
  path: string,
  file: { uri: string; name: string; type: string },
  debugLabel?: string,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const label = debugLabel ?? path;
  const token = await getToken();
  if (!token) {
    throw new ApiError('Not authenticated', 401, url);
  }

  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  apiLog(`→ ${label} (multipart)`, { url });

  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
  } catch (err) {
    apiError(`✗ ${label} network error`, { url, error: err });
    throw err;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    apiError(`✗ ${label} HTTP ${response.status}`, { body: data });
    throw new ApiError(extractMessage(data), response.status, url, data);
  }

  apiLog(`✓ ${label} HTTP ${response.status} (${Date.now() - started}ms)`);
  return data as T;
}
