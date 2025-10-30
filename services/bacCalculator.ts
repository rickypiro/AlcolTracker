import { BACInput, Gender } from '@/types/bac';

export const calculateBAC = (input: BACInput): { bacAtZero: number; bacAfterTime?: number; timeToSober: number } => {
  const { weight, gender, predefinedDrinks, customDrinks, timeSinceDrinking, timeUnit } = input;
  
  // Calculate total alcohol consumed in grams
  let totalAlcoholGrams = 0;
  
  // Predefined drinks
  predefinedDrinks.forEach(drink => {
    if (drink.count > 0) {
      const alcoholGrams = (drink.volumeMl * drink.alcoholPercentage / 100) * 0.8;
      totalAlcoholGrams += alcoholGrams * drink.count;
    }
  });
  
  // Custom drinks
  customDrinks.forEach(drink => {
    if (drink.count > 0) {
      const alcoholGrams = (drink.volumeMl * drink.alcoholPercentage / 100) * 0.8;
      totalAlcoholGrams += alcoholGrams * drink.count;
    }
  });
  
  // Distribution coefficient
  const r = gender === 'male' ? 0.68 : 0.55;
  
  // Elimination rate (g/L/h)
  const beta = 0.15;
  
  // Calculate BAC at t=0
  const bacAtZero = totalAlcoholGrams / (r * weight);
  
  // Calculate BAC after time if provided
  let bacAfterTime: number | undefined;
  let timeInHours = 0;
  
  if (timeSinceDrinking !== undefined && timeSinceDrinking > 0) {
    timeInHours = timeUnit === 'hours' ? timeSinceDrinking : timeSinceDrinking / 60;
    bacAfterTime = Math.max(0, bacAtZero - (beta * timeInHours));
  }
  
  // Calculate time to sober (BAC = 0)
  const timeToSober = bacAtZero / beta;
  
  return {
    bacAtZero: Math.max(0, bacAtZero),
    bacAfterTime,
    timeToSober,
  };
};

export const getBACLevel = (bac: number): string => {
  if (bac < 0.2) return 'sober';
  if (bac < 0.5) return 'slightImpairment';
  if (bac < 0.8) return 'mildImpairment';
  if (bac < 1.5) return 'significantImpairment';
  if (bac < 2.5) return 'severeImpairment';
  return 'dangerousLevel';
};

export const getBACColor = (bac: number, isDark: boolean): string => {
  const colors = isDark ? {
    sober: '#66BB6A',
    slight: '#9CCC65',
    mild: '#FFCA28',
    significant: '#FFA726',
    severe: '#FF7043',
    dangerous: '#EF5350',
  } : {
    sober: '#28A745',
    slight: '#82C91E',
    mild: '#FFC107',
    significant: '#FF9800',
    severe: '#FF5722',
    dangerous: '#DC3545',
  };
  
  if (bac < 0.2) return colors.sober;
  if (bac < 0.5) return colors.slight;
  if (bac < 0.8) return colors.mild;
  if (bac < 1.5) return colors.significant;
  if (bac < 2.5) return colors.severe;
  return colors.dangerous;
};

export const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};