export const COLORS = {
  light: {
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6C757D',
    primary: '#4A90E2',
    border: '#E9ECEF',
    inputBackground: '#F8F9FA',
    shadow: '#000000',
    
    // BAC levels
    bacSober: '#28A745',
    bacSlight: '#82C91E',
    bacMild: '#FFC107',
    bacSignificant: '#FF9800',
    bacSevere: '#FF5722',
    bacDangerous: '#DC3545',
  },
  dark: {
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    primary: '#64B5F6',
    border: '#404040',
    inputBackground: '#2C2C2C',
    shadow: '#000000',
    
    // BAC levels
    bacSober: '#66BB6A',
    bacSlight: '#9CCC65',
    bacMild: '#FFCA28',
    bacSignificant: '#FFA726',
    bacSevere: '#FF7043',
    bacDangerous: '#EF5350',
  },
};

export const FONTS = {
  playful: {
    fontFamily: 'System',
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};