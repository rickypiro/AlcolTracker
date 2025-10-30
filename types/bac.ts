export type Gender = 'male' | 'female';
export type TimeUnit = 'minutes' | 'hours';
export type DrinkType = 'beer' | 'wine' | 'spritz' | 'cocktail' | 'liqueur' | 'custom';

export interface PredefinedDrink {
  type: DrinkType;
  name: string;
  alcoholPercentage: number;
  volumeMl: number;
  count: number;
}

export interface CustomDrink {
  id: string;
  name: string;
  alcoholPercentage: number;
  volumeMl: number;
  count: number;
}

export interface BACInput {
  weight: number;
  gender: Gender;
  predefinedDrinks: PredefinedDrink[];
  customDrinks: CustomDrink[];
  timeSinceDrinking?: number;
  timeUnit?: TimeUnit;
}

export interface BACResult {
  id: string;
  date: string;
  weight: number;
  gender: Gender;
  drinks: {
    predefined: PredefinedDrink[];
    custom: CustomDrink[];
  };
  bacAtZero: number;
  bacAfterTime?: number;
  timeSinceDrinking?: number;
  timeUnit?: TimeUnit;
  timeToSober: number;
}

export interface SavedCustomDrink {
  id: string;
  name: string;
  alcoholPercentage: number;
  volumeMl: number;
}

export type Language = 'ar' | 'zh' | 'de' | 'en' | 'es' | 'fr' | 'it' | 'ja' | 'pt';
export type Theme = 'light' | 'dark';