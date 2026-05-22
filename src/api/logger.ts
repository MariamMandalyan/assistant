/** Dev-only API logging — filter Metro/logcat by tag [API] */
const TAG = '[API]';

export function apiLog(message: string, data?: unknown) {
  if (!__DEV__) return;
  if (data !== undefined) {
    console.log(TAG, message, data);
  } else {
    console.log(TAG, message);
  }
}

export function apiWarn(message: string, data?: unknown) {
  if (!__DEV__) return;
  if (data !== undefined) {
    console.warn(TAG, message, data);
  } else {
    console.warn(TAG, message);
  }
}

export function apiError(message: string, data?: unknown) {
  if (!__DEV__) return;
  if (data !== undefined) {
    console.error(TAG, message, data);
  } else {
    console.error(TAG, message);
  }
}
