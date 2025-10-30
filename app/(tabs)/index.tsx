import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/hooks/useSettings';
import { useBAC } from '@/hooks/useBAC';
import BACBar from '@/components/BACBar';
import { PREDEFINED_DRINKS } from '@/constants/drinks';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';
import { Gender, TimeUnit, PredefinedDrink, CustomDrink, DrinkType } from '@/types/bac';
import { calculateBAC, getBACLevel, getBACColor, formatTime } from '@/services/bacCalculator';
import { getCustomDrinks, saveCustomDrink } from '@/services/storage';

export default function CalculatePage() {
  const colors = useThemeColors();
  const { t, theme } = useSettings();
  const { saveCurrentResult } = useBAC();
  const insets = useSafeAreaInsets();

  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [predefinedDrinks, setPredefinedDrinks] = useState<PredefinedDrink[]>([
    { type: 'beer', name: t('beer'), ...PREDEFINED_DRINKS.beer, count: 0 },
    { type: 'wine', name: t('wine'), ...PREDEFINED_DRINKS.wine, count: 0 },
    { type: 'spritz', name: t('spritz'), ...PREDEFINED_DRINKS.spritz, count: 0 },
    { type: 'cocktail', name: t('cocktail'), ...PREDEFINED_DRINKS.cocktail, count: 0 },
    { type: 'liqueur', name: t('liqueur'), ...PREDEFINED_DRINKS.liqueur, count: 0 },
  ]);

  const [customDrinks, setCustomDrinks] = useState<CustomDrink[]>([]);
  const [savedCustomDrinks, setSavedCustomDrinks] = useState<any[]>([]);
  const [newCustomDrink, setNewCustomDrink] = useState({
    name: '',
    alcoholPercentage: '',
    volumeMl: '',
  });

  const [timeSinceDrinking, setTimeSinceDrinking] = useState('');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('hours');
  
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  useEffect(() => {
    loadSavedCustomDrinks();
  }, []);

  useEffect(() => {
    setPredefinedDrinks([
      { type: 'beer', name: t('beer'), ...PREDEFINED_DRINKS.beer, count: 0 },
      { type: 'wine', name: t('wine'), ...PREDEFINED_DRINKS.wine, count: 0 },
      { type: 'spritz', name: t('spritz'), ...PREDEFINED_DRINKS.spritz, count: 0 },
      { type: 'cocktail', name: t('cocktail'), ...PREDEFINED_DRINKS.cocktail, count: 0 },
      { type: 'liqueur', name: t('liqueur'), ...PREDEFINED_DRINKS.liqueur, count: 0 },
    ]);
  }, [t]);

  const loadSavedCustomDrinks = async () => {
    const saved = await getCustomDrinks();
    setSavedCustomDrinks(saved);
  };

  const updatePredefinedDrinkCount = (type: DrinkType, delta: number) => {
    setPredefinedDrinks(prev =>
      prev.map(d => d.type === type ? { ...d, count: Math.max(0, d.count + delta) } : d)
    );
  };

  const updateCustomDrinkCount = (id: string, delta: number) => {
    setCustomDrinks(prev =>
      prev.map(d => d.id === id ? { ...d, count: Math.max(0, d.count + delta) } : d)
    );
  };

  const addCustomDrink = () => {
    if (!newCustomDrink.name || !newCustomDrink.alcoholPercentage || !newCustomDrink.volumeMl) {
      return;
    }

    const drink: CustomDrink = {
      id: Date.now().toString(),
      name: newCustomDrink.name,
      alcoholPercentage: parseFloat(newCustomDrink.alcoholPercentage),
      volumeMl: parseFloat(newCustomDrink.volumeMl),
      count: 1,
    };

    setCustomDrinks(prev => [...prev, drink]);
    setNewCustomDrink({ name: '', alcoholPercentage: '', volumeMl: '' });
  };

  const saveCustomDrinkForFuture = async () => {
    if (!newCustomDrink.name || !newCustomDrink.alcoholPercentage || !newCustomDrink.volumeMl) {
      return;
    }

    const drink = {
      id: Date.now().toString(),
      name: newCustomDrink.name,
      alcoholPercentage: parseFloat(newCustomDrink.alcoholPercentage),
      volumeMl: parseFloat(newCustomDrink.volumeMl),
    };

    await saveCustomDrink(drink);
    await loadSavedCustomDrinks();
    setNewCustomDrink({ name: '', alcoholPercentage: '', volumeMl: '' });
  };

  const addSavedCustomDrink = (saved: any) => {
    const drink: CustomDrink = {
      id: Date.now().toString(),
      name: saved.name,
      alcoholPercentage: saved.alcoholPercentage,
      volumeMl: saved.volumeMl,
      count: 1,
    };
    setCustomDrinks(prev => [...prev, drink]);
  };

  const handleDeleteCustomDrink = async (id: string) => {
    const { deleteCustomDrink } = await import('@/services/storage');
    await deleteCustomDrink(id);
    await loadSavedCustomDrinks();
  };

  const resetForm = () => {
    setWeight('');
    setGender('male');
    setPredefinedDrinks([
      { type: 'beer', name: t('beer'), ...PREDEFINED_DRINKS.beer, count: 0 },
      { type: 'wine', name: t('wine'), ...PREDEFINED_DRINKS.wine, count: 0 },
      { type: 'spritz', name: t('spritz'), ...PREDEFINED_DRINKS.spritz, count: 0 },
      { type: 'cocktail', name: t('cocktail'), ...PREDEFINED_DRINKS.cocktail, count: 0 },
      { type: 'liqueur', name: t('liqueur'), ...PREDEFINED_DRINKS.liqueur, count: 0 },
    ]);
    setCustomDrinks([]);
    setTimeSinceDrinking('');
    setTimeUnit('hours');
  };

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      return;
    }

    const activePredefined = predefinedDrinks.filter(d => d.count > 0);
    const activeCustom = customDrinks.filter(d => d.count > 0);

    if (activePredefined.length === 0 && activeCustom.length === 0) {
      return;
    }

    const timeNum = timeSinceDrinking ? parseFloat(timeSinceDrinking) : undefined;

    const result = calculateBAC({
      weight: weightNum,
      gender,
      predefinedDrinks: activePredefined,
      customDrinks: activeCustom,
      timeSinceDrinking: timeNum,
      timeUnit: timeUnit,
    });

    const bacResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: weightNum,
      gender,
      drinks: {
        predefined: activePredefined,
        custom: activeCustom,
      },
      bacAtZero: result.bacAtZero,
      bacAfterTime: result.bacAfterTime,
      timeSinceDrinking: timeNum,
      timeUnit: timeUnit,
      timeToSober: result.timeToSober,
    };

    setCurrentResult(bacResult);
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    if (currentResult) {
      await saveCurrentResult(currentResult);
      setShowResultModal(false);
      resetForm();
    }
  };

  const handleNewCalculation = () => {
    setShowResultModal(false);
    resetForm();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }, FONTS.playful]}>{t('appTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('appSubtitle')}</Text>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('weight')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: SPACING.md }]}>{t('gender')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { borderColor: colors.border },
                gender === 'male' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setGender('male')}
            >
              <MaterialIcons name="male" size={24} color={gender === 'male' ? '#FFFFFF' : colors.text} />
              <Text style={[styles.genderText, { color: gender === 'male' ? '#FFFFFF' : colors.text }]}>
                {t('male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { borderColor: colors.border },
                gender === 'female' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setGender('female')}
            >
              <MaterialIcons name="female" size={24} color={gender === 'female' ? '#FFFFFF' : colors.text} />
              <Text style={[styles.genderText, { color: gender === 'female' ? '#FFFFFF' : colors.text }]}>
                {t('female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('predefinedDrinks')}</Text>
          {predefinedDrinks.map((drink) => (
            <View key={drink.type} style={styles.drinkRow}>
              <View style={styles.drinkInfo}>
                <Text style={[styles.drinkName, { color: colors.text }]}>{drink.name}</Text>
                <Text style={[styles.drinkDetails, { color: colors.textSecondary }]}>
                  {drink.alcoholPercentage}% • {drink.volumeMl}ml
                </Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: colors.inputBackground }]}
                  onPress={() => updatePredefinedDrinkCount(drink.type, -1)}
                >
                  <MaterialIcons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.count, { color: colors.text }]}>{drink.count}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: colors.primary }]}
                  onPress={() => updatePredefinedDrinkCount(drink.type, 1)}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('customDrinks')}</Text>
          
          {customDrinks.map((drink) => (
            <View key={drink.id} style={styles.drinkRow}>
              <View style={styles.drinkInfo}>
                <Text style={[styles.drinkName, { color: colors.text }]}>{drink.name}</Text>
                <Text style={[styles.drinkDetails, { color: colors.textSecondary }]}>
                  {drink.alcoholPercentage}% • {drink.volumeMl}ml
                </Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: colors.inputBackground }]}
                  onPress={() => updateCustomDrinkCount(drink.id, -1)}
                >
                  <MaterialIcons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.count, { color: colors.text }]}>{drink.count}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateCustomDrinkCount(drink.id, 1)}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.customDrinkForm}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              value={newCustomDrink.name}
              onChangeText={(text) => setNewCustomDrink(prev => ({ ...prev, name: text }))}
              placeholder={t('drinkName')}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                value={newCustomDrink.alcoholPercentage}
                onChangeText={(text) => setNewCustomDrink(prev => ({ ...prev, alcoholPercentage: text }))}
                placeholder={t('alcoholPercentage')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                value={newCustomDrink.volumeMl}
                onChangeText={(text) => setNewCustomDrink(prev => ({ ...prev, volumeMl: text }))}
                placeholder={t('volumeMl')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={addCustomDrink}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t('addCustomDrink')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.inputBackground, borderColor: colors.primary }]}
              onPress={saveCustomDrinkForFuture}
            >
              <MaterialIcons name="bookmark" size={20} color={colors.primary} />
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>{t('saveAsDefault')}</Text>
            </TouchableOpacity>
          </View>

          {savedCustomDrinks.length > 0 && (
            <View style={styles.savedDrinksContainer}>
              <Text style={[styles.savedDrinksTitle, { color: colors.textSecondary }]}>
                {t('savedDrinks')}:
              </Text>
              {savedCustomDrinks.map((saved) => (
                <View key={saved.id} style={styles.savedDrinkRow}>
                  <TouchableOpacity
                    style={[styles.savedDrinkChip, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                    onPress={() => addSavedCustomDrink(saved)}
                  >
                    <Text style={[styles.savedDrinkText, { color: colors.text }]}>{saved.name}</Text>
                    <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteCustomButton}
                    onPress={() => handleDeleteCustomDrink(saved.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#DC3545" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('timeSinceDrinking')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              value={timeSinceDrinking}
              onChangeText={setTimeSinceDrinking}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.timeUnitContainer}>
              <TouchableOpacity
                style={[
                  styles.timeUnitButton,
                  { borderColor: colors.border },
                  timeUnit === 'minutes' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setTimeUnit('minutes')}
              >
                <Text style={[styles.timeUnitText, { color: timeUnit === 'minutes' ? '#FFFFFF' : colors.text }]}>
                  {t('minutes')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeUnitButton,
                  { borderColor: colors.border },
                  timeUnit === 'hours' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setTimeUnit('hours')}
              >
                <Text style={[styles.timeUnitText, { color: timeUnit === 'hours' ? '#FFFFFF' : colors.text }]}>
                  {t('hours')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: colors.primary }]}
          onPress={handleCalculate}
        >
          <Text style={styles.calculateButtonText}>{t('calculate')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }, FONTS.playful]}>{t('results')}</Text>
              
              {currentResult && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.text }]}>{t('bacAtMoment')}</Text>
                    <Text style={[styles.modalBacValue, { color: getBACColor(currentResult.bacAtZero, theme === 'dark') }]}>
                      {currentResult.bacAtZero.toFixed(2)} g/L
                    </Text>
                    <BACBar bac={currentResult.bacAtZero} height={16} />
                    <Text style={[styles.modalLevel, { color: colors.textSecondary }]}>
                      {t(getBACLevel(currentResult.bacAtZero))}
                    </Text>
                  </View>

                  {currentResult.bacAfterTime !== undefined && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalLabel, { color: colors.text }]}>
                        {t('bacAfterTime')} {currentResult.timeSinceDrinking} {t(currentResult.timeUnit || 'hours')}
                      </Text>
                      <Text style={[styles.modalBacValue, { color: getBACColor(currentResult.bacAfterTime, theme === 'dark') }]}>
                        {currentResult.bacAfterTime.toFixed(2)} g/L
                      </Text>
                      <BACBar bac={currentResult.bacAfterTime} height={16} />
                      <Text style={[styles.modalLevel, { color: colors.textSecondary }]}>
                        {t(getBACLevel(currentResult.bacAfterTime))}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <View style={styles.timeRow}>
                      <MaterialIcons name="schedule" size={32} color={colors.primary} />
                      <View>
                        <Text style={[styles.modalLabel, { color: colors.text }]}>{t('timeToSober')}</Text>
                        <Text style={[styles.modalTimeValue, { color: colors.text }]}>
                          {currentResult.timeToSober > 0 ? formatTime(currentResult.timeToSober) : t('alreadySober')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveResult}
                  >
                    <MaterialIcons name="save" size={20} color="#FFFFFF" />
                    <Text style={styles.modalButtonText}>{t('saveResult')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSecondaryButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                    onPress={handleNewCalculation}
                  >
                    <MaterialIcons name="refresh" size={20} color={colors.primary} />
                    <Text style={[styles.modalButtonText, { color: colors.primary }]}>{t('newCalculation')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    gap: SPACING.sm,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  drinkDetails: {
    fontSize: 14,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  customDrinkForm: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  savedDrinksContainer: {
    marginTop: SPACING.md,
  },
  savedDrinksTitle: {
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  savedDrinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  savedDrinkChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  deleteCustomButton: {
    padding: SPACING.sm,
  },
  savedDrinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeUnitContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeUnitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  timeUnitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calculateButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  modalBacValue: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalLevel: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  modalTimeValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalSecondaryButton: {
    borderWidth: 2,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});