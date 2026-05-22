import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, clearToken, getToken, saveToken } from '../api/client';
import { citizenApi } from '../api/citizenApi';
import { apiError, apiLog } from '../api/logger';
import { API_BASE_URL } from '../config';
import type { CitizenProfile } from '../api/types';

const PENDING_PHONE_KEY = 'citizen_pending_phone';

type RegisterPayload = {
  phone: string;
  fullName: string;
  email?: string;
  passportNumber?: string;
};

type AuthState = {
  citizen: CitizenProfile | null;
  loading: boolean;
  pendingPhone: string | null;
  register: (data: RegisterPayload) => Promise<string | undefined>;
  startLogin: (phone: string) => Promise<string | undefined>;
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<string | undefined>;
  cancelOtpFlow: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updatePassport: (passportNumber: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [citizen, setCitizen] = useState<CitizenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedPhone, token] = await Promise.all([
          AsyncStorage.getItem(PENDING_PHONE_KEY),
          getToken(),
        ]);
        if (storedPhone) setPendingPhone(storedPhone);
        if (token) {
          const profile = await citizenApi.me();
          setCitizen(profile);
        }
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (body: RegisterPayload) => {
    apiLog('AuthContext.register start', body);
    try {
      const result = await citizenApi.register(body);
      apiLog('AuthContext.register success', result);
      setPendingPhone(body.phone);
      await AsyncStorage.setItem(PENDING_PHONE_KEY, body.phone);
      return result.devOtp;
    } catch (e) {
      apiError('AuthContext.register failed', e);
      throw e;
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!pendingPhone) throw new Error('Нет телефона');
      const { accessToken, citizen: profile } = await citizenApi.verifyOtp({
        phone: pendingPhone,
        code,
      });
      await saveToken(accessToken);
      await AsyncStorage.removeItem(PENDING_PHONE_KEY);
      setCitizen(profile);
      setPendingPhone(null);
    },
    [pendingPhone],
  );

  const startLogin = useCallback(async (phone: string) => {
    const normalized = phone.trim();
    setPendingPhone(normalized);
    await AsyncStorage.setItem(PENDING_PHONE_KEY, normalized);
    const { devOtp } = await citizenApi.resendOtp({ phone: normalized });
    return devOtp;
  }, []);

  const resendOtp = useCallback(async () => {
    if (!pendingPhone) throw new Error('Нет телефона');
    const { devOtp } = await citizenApi.resendOtp({ phone: pendingPhone });
    return devOtp;
  }, [pendingPhone]);

  const cancelOtpFlow = useCallback(async () => {
    await AsyncStorage.removeItem(PENDING_PHONE_KEY);
    setPendingPhone(null);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    await AsyncStorage.removeItem(PENDING_PHONE_KEY);
    setCitizen(null);
    setPendingPhone(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await citizenApi.me();
    setCitizen(profile);
  }, []);

  const updatePassport = useCallback(async (passportNumber: string) => {
    const profile = await citizenApi.updateMe({ passportNumber });
    setCitizen(profile);
  }, []);

  const value = useMemo(
    () => ({
      citizen,
      loading,
      pendingPhone,
      register,
      startLogin,
      verifyOtp,
      resendOtp,
      cancelOtpFlow,
      logout,
      refreshProfile,
      updatePassport,
    }),
    [
      citizen,
      loading,
      pendingPhone,
      register,
      startLogin,
      verifyOtp,
      resendOtp,
      cancelOtpFlow,
      logout,
      refreshProfile,
      updatePassport,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const base = `${error.message} (HTTP ${error.status})`;
    if (__DEV__ && error.body && typeof error.body === 'object') {
      const detail = JSON.stringify(error.body);
      if (detail.length <= 200) return `${base}\n${detail}`;
    }
    return base;
  }
  if (error instanceof Error) {
    if (error.message === 'Network request failed') {
      return `Нет связи с сервером.\n\n1) ERP: cd erp_communa && npm run start:dev\n2) URL: ${API_BASE_URL}\n3) Телефон: тот же Wi‑Fi, в config.ts — IP ПК (ipconfig)\n4) Эмулятор: ANDROID_LAN_HOST = null`;
    }
    return error.message;
  }
  return fallback;
}
