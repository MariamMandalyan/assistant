import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { AppModal } from '../components/AppModal';
import { ru } from '../i18n';
import type { AlertButton } from '../types/alert';

export type { AlertButton } from '../types/alert';

type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type AlertModalContextValue = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AlertModalContext = createContext<AlertModalContextValue | null>(null);

/** Imperative API (drop-in for Alert.alert) — works after AlertModalProvider mounts */
let globalAlert: AlertModalContextValue['alert'] | null = null;

export function alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (globalAlert) {
    globalAlert(title, message, buttons);
    return;
  }
  console.warn('[alert] AlertModalProvider not mounted');
}

export function AlertModalProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const hide = useCallback(() => setOptions(null), []);

  const showAlert = useCallback(
    (title: string, message?: string, buttons?: AlertButton[]) => {
      const resolved: AlertButton[] =
        buttons && buttons.length > 0
          ? buttons
          : [{ text: ru.common.ok, style: 'default' }];

      setOptions({ title, message, buttons: resolved });
    },
    [],
  );

  globalAlert = showAlert;

  const handleButtonPress = useCallback(
    (button: AlertButton) => {
      hide();
      button.onPress?.();
    },
    [hide],
  );

  const value = useMemo(
    () => ({ alert: showAlert }),
    [showAlert],
  );

  const buttons = options?.buttons ?? [];

  return (
    <AlertModalContext.Provider value={value}>
      {children}
      {options ? (
        <AppModal
          visible
          title={options.title}
          message={options.message}
          buttons={buttons}
          onButtonPress={handleButtonPress}
        />
      ) : null}
    </AlertModalContext.Provider>
  );
}

export function useAlert(): AlertModalContextValue {
  const ctx = useContext(AlertModalContext);
  if (!ctx) {
    throw new Error('useAlert must be used within AlertModalProvider');
  }
  return ctx;
}
