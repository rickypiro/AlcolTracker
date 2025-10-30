import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/hooks/useSettings';
import { useBAC } from '@/hooks/useBAC';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';
import { Gender } from '@/types/bac';

type TimeFilterMode = 'all' | 'atZero' | 'afterTime';
type GenderFilterMode = 'all' | 'male' | 'female';

export default function ChartPage() {
  const colors = useThemeColors();
  const { t, theme } = useSettings();
  const { history } = useBAC();
  const insets = useSafeAreaInsets();

  const [dimensions, setDimensions] = useState({ width: 375, height: 667 });
  useEffect(() => {
    const update = () => setDimensions(Dimensions.get('window'));
    update();
    const sub = Dimensions.addEventListener('change', update);
    return () => sub?.remove();
  }, []);

  const [timeFilter, setTimeFilter] = useState<TimeFilterMode>('all');
  const [genderFilter, setGenderFilter] = useState<GenderFilterMode>('all');

  const filteredData = useMemo(() => {
    let filtered = [...history];

    if (genderFilter !== 'all') {
      filtered = filtered.filter(r => r.gender === genderFilter);
    }

    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered;
  }, [history, genderFilter]);

  const chartData = useMemo(() => {
    if (filteredData.length === 0) {
      return null;
    }

    const labels = filteredData.map((_, index) => `${index + 1}`);
    
    const datasets = [];
    
    if (timeFilter === 'all' || timeFilter === 'atZero') {
      datasets.push({
        data: filteredData.map(r => r.bacAtZero),
        color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
        strokeWidth: 3,
      });
    }
    
    if (timeFilter === 'all' || timeFilter === 'afterTime') {
      const afterTimeData = filteredData.map(r => r.bacAfterTime ?? r.bacAtZero);
      datasets.push({
        data: afterTimeData,
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 3,
      });
    }

    return {
      labels,
      datasets,
      legend: timeFilter === 'all' 
        ? [t('bacAtMoment'), t('bacAfterTime')] 
        : timeFilter === 'atZero' 
          ? [t('bacAtMoment')] 
          : [t('bacAfterTime')],
    };
  }, [filteredData, timeFilter, t]);

  const handleReset = () => {
    setTimeFilter('all');
    setGenderFilter('all');
  };

  const chartWidth = Math.max(1, dimensions.width - SPACING.md * 2);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }, FONTS.playful]}>{t('tabChart')}</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>{t('filterByTime')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                timeFilter === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setTimeFilter('all')}
            >
              <MaterialIcons 
                name="show-chart" 
                size={20} 
                color={timeFilter === 'all' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: timeFilter === 'all' ? '#FFFFFF' : colors.text }]}>
                {t('allData')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                timeFilter === 'atZero' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setTimeFilter('atZero')}
            >
              <MaterialIcons 
                name="access-time" 
                size={20} 
                color={timeFilter === 'atZero' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: timeFilter === 'atZero' ? '#FFFFFF' : colors.text }]}>
                {t('bacAtMomentOnly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                timeFilter === 'afterTime' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setTimeFilter('afterTime')}
            >
              <MaterialIcons 
                name="schedule" 
                size={20} 
                color={timeFilter === 'afterTime' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: timeFilter === 'afterTime' ? '#FFFFFF' : colors.text }]}>
                {t('bacAfterTimeOnly')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.filterLabel, { color: colors.text, marginTop: SPACING.lg }]}>{t('filterByGender')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                genderFilter === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setGenderFilter('all')}
            >
              <MaterialIcons 
                name="people" 
                size={20} 
                color={genderFilter === 'all' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: genderFilter === 'all' ? '#FFFFFF' : colors.text }]}>
                {t('allData')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                genderFilter === 'male' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setGenderFilter('male')}
            >
              <MaterialIcons 
                name="male" 
                size={20} 
                color={genderFilter === 'male' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: genderFilter === 'male' ? '#FFFFFF' : colors.text }]}>
                {t('male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                genderFilter === 'female' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setGenderFilter('female')}
            >
              <MaterialIcons 
                name="female" 
                size={20} 
                color={genderFilter === 'female' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[styles.optionText, { color: genderFilter === 'female' ? '#FFFFFF' : colors.text }]}>
                {t('female')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={handleReset}
          >
            <MaterialIcons name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.resetButtonText, { color: colors.primary }]}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {chartData ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max(chartWidth, filteredData.length * 60)}
                height={280}
                chartConfig={{
                  backgroundColor: colors.cardBackground,
                  backgroundGradientFrom: colors.cardBackground,
                  backgroundGradientTo: colors.cardBackground,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  labelColor: (opacity = 1) => theme === 'dark' ? `rgba(204, 204, 204, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: BORDER_RADIUS.md,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                  },
                }}
                bezier
                style={{
                  marginVertical: SPACING.sm,
                  borderRadius: BORDER_RADIUS.md,
                }}
              />
            </ScrollView>
            <View style={styles.legendContainer}>
              {chartData.legend.map((label, index) => (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor,
                      { backgroundColor: index === 0 ? '#4A90E2' : '#FF9800' }
                    ]} 
                  />
                  <Text style={[styles.legendText, { color: colors.text }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }, theme === 'light' ? SHADOWS.light : SHADOWS.dark]}>
            <View style={styles.emptyContainer}>
              <MaterialIcons name="show-chart" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('noData')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    fontSize: 32,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    gap: SPACING.xs,
    minWidth: 100,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendColor: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    marginTop: SPACING.md,
  },
});