import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from '../hooks/useCapacitor';

export const lightTap = async () => {
  if (isNative) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};

export const mediumTap = async () => {
  if (isNative) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};

export const heavyTap = async () => {
  if (isNative) {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};

export const successVibration = async () => {
  if (isNative) {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};

export const errorVibration = async () => {
  if (isNative) {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};

export const selectionChanged = async () => {
  if (isNative) {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (e) {
      console.error('Haptics error', e);
    }
  }
};
