import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@dev-amirzubair/react-native-voice';
import { alert } from '../context/AlertModalContext';
import { ru } from '../i18n';

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: ru.chat.voicePermissionTitle,
      message: ru.chat.voicePermissionMessage,
      buttonPositive: ru.common.ok,
      buttonNegative: ru.common.later,
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const transcriptRef = useRef('');

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setRecording(true);
      transcriptRef.current = '';
    };
    Voice.onSpeechEnd = () => setRecording(false);
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0];
      if (text) transcriptRef.current = text;
    };
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0];
      if (text) transcriptRef.current = text;
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setRecording(false);
      if (e.error?.message && !e.error?.message.includes('No match')) {
        alert(ru.common.error, ru.chat.voiceRecordError);
      }
    };

    return () => {
      void Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    const ok = await ensureMicPermission();
    if (!ok) {
      alert(ru.common.error, ru.chat.voicePermissionDenied);
      return false;
    }
    try {
      await Voice.cancel();
      transcriptRef.current = '';
      await Voice.start('ru-RU');
      return true;
    } catch {
      alert(ru.common.error, ru.chat.voiceRecordError);
      return false;
    }
  }, []);

  const stop = useCallback(async (): Promise<string | null> => {
    try {
      await Voice.stop();
    } catch {
      try {
        await Voice.cancel();
      } catch {
        /* ignore */
      }
    }
    setRecording(false);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 350);
    });
    const text = transcriptRef.current.trim();
    transcriptRef.current = '';
    return text || null;
  }, []);

  const cancel = useCallback(async () => {
    try {
      await Voice.cancel();
    } catch {
      /* ignore */
    }
    setRecording(false);
    transcriptRef.current = '';
  }, []);

  return { recording, durationSec: 0, start, stop, cancel };
};
