import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACResult, SavedCustomDrink } from '@/types/bac';

const RESULTS_KEY = '@bac_results';
const CUSTOM_DRINKS_KEY = '@custom_drinks';

export const saveResult = async (result: BACResult): Promise<void> => {
  try {
    const existing = await getResults();
    const updated = [result, ...existing];
    await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving result:', error);
  }
};

export const getResults = async (): Promise<BACResult[]> => {
  try {
    const data = await AsyncStorage.getItem(RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting results:', error);
    return [];
  }
};

export const deleteResult = async (id: string): Promise<void> => {
  try {
    const existing = await getResults();
    const updated = existing.filter(r => r.id !== id);
    await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting result:', error);
  }
};

export const saveCustomDrink = async (drink: SavedCustomDrink): Promise<void> => {
  try {
    const existing = await getCustomDrinks();
    const updated = [drink, ...existing];
    await AsyncStorage.setItem(CUSTOM_DRINKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving custom drink:', error);
  }
};

export const getCustomDrinks = async (): Promise<SavedCustomDrink[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_DRINKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom drinks:', error);
    return [];
  }
};

export const deleteCustomDrink = async (id: string): Promise<void> => {
  try {
    const existing = await getCustomDrinks();
    const updated = existing.filter(d => d.id !== id);
    await AsyncStorage.setItem(CUSTOM_DRINKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting custom drink:', error);
  }
};