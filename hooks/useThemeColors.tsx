import { useSettings } from './useSettings';
import { COLORS } from '@/constants/theme';

export function useThemeColors() {
  const { theme } = useSettings();
  return COLORS[theme];
}