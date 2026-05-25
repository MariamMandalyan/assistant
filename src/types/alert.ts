export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  /** Main call-to-action (filled button). If omitted, last non-cancel button is primary. */
  preferred?: boolean;
};
