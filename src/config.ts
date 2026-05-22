import { Platform } from 'react-native';

/**
 * Подключение к ERP в dev:
 *
 * • Android **эмулятор** → оставь `ANDROID_LAN_HOST = null` (будет 10.0.2.2)
 * • **Реальный телефон** (та же Wi‑Fi, что и ПК) → укажи IPv4 ПК из `ipconfig`
 *   (сейчас: 10.1.1.132 — поменяй, если у тебя другой)
 */
const ANDROID_LAN_HOST: string | null = '10.1.1.132';

const API_PORT = 3000;

function getDevHost(): string {
  if (Platform.OS === 'android') {
    return ANDROID_LAN_HOST ?? '10.0.2.2';
  }
  return 'localhost';
}

export const DEV_API_HOST = getDevHost();
export const API_BASE_URL = `http://${DEV_API_HOST}:${API_PORT}/api/v1`;

if (__DEV__) {
  console.log('[Config] API_BASE_URL =', API_BASE_URL);
}
