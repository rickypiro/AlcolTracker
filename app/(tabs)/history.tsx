import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/hooks/useSettings';
import { useBAC } from '@/hooks/useBAC';
import BACBar from '@/components/BACBar';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';
import { getBACLevel, getBACColor, formatTime } from '@/services/bacCalculator';

export default function HistoryPage() {
  const colors = useThemeColors();
  const { t, theme } = useSettings();
  const { history, deleteHistoryItem } = useBAC();
  const insets = useSafeAreaInsets();

      const handleDelete = (id: string) => {
    deleteHistoryItem(id);
  };

  const groupedHistory = React.useMemo(() => {
    const groups: { [key: string]: typeof history } = {};
    
    history.forEach(result => {
      const date = new Date(result.date);
      const dateKey = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(result);
    });
    
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].date);
      const dateB = new Date(b[1][0].date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [history]);

  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.text }, FONTS.playful]}>{t('tabHistory')}</Text>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noHistory')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }, FONTS.playful]}>{t('tabHistory')}</Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedHistory.map(([dateKey, results]) => (
          <View key={dateKey}>
            <Text style={[styles.dateHeader, { color: colors.text }]}>{dateKey}</Text>
            
            {results.map((result) => (
              <View 
                key={result.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colors.cardBackground }, 
                  theme === 'light' ? SHADOWS.light : SHADOWS.dark
                ]}
              >
                <View style={styles.header}>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {new Date(result.date).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(result.id)}>
                    <MaterialIcons name="delete" size={24} color="#DC3545" />
                  </TouchableOpacity>
                </View>

                <View style={styles.bacSection}>
                  <Text style={[styles.bacLabel, { color: colors.text }]}>
                    {t('bacAtMoment')}
                  </Text>
                  <Text style={[styles.bacValue, { color: getBACColor(result.bacAtZero, theme === 'dark') }]}>
                    {result.bacAtZero.toFixed(2)} g/L
                  </Text>
                  <BACBar bac={result.bacAtZero} />
                  <Text style={[styles.levelText, { color: colors.textSecondary }]}>
                    {t(getBACLevel(result.bacAtZero))}
                  </Text>
                </View>

                {result.bacAfterTime !== undefined && (
                  <View style={[styles.bacSection, styles.secondaryBac]}>
                    <Text style={[styles.bacLabel, { color: colors.text }]}>
                      {t('bacAfterTime')} {result.timeSinceDrinking} {t(result.timeUnit || 'hours')}
                    </Text>
                    <Text style={[styles.bacValue, { color: getBACColor(result.bacAfterTime, theme === 'dark') }]}>
                      {result.bacAfterTime.toFixed(2)} g/L
                    </Text>
                    <BACBar bac={result.bacAfterTime} />
                    <Text style={[styles.levelText, { color: colors.textSecondary }]}>
                      {t(getBACLevel(result.bacAfterTime))}
                    </Text>
                  </View>
                )}

                <View style={styles.timeSection}>
                  <MaterialIcons name="schedule" size={20} color={colors.primary} />
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {t('timeToSober')}: {formatTime(result.timeToSober)}
                  </Text>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={[styles.detailsTitle, { color: colors.text }]}>Dettagli:</Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {t('weight')}: {result.weight} kg • {t('gender')}: {t(result.gender)}
                  </Text>
                  {result.drinks.predefined.length > 0 && (
                    <View style={styles.drinksDetail}>
                      {result.drinks.predefined.map((drink, index) => (
                        <Text key={index} style={[styles.drinkText, { color: colors.textSecondary }]}>
                          • {drink.name} x{drink.count}
                        </Text>
                      ))}
                    </View>
                  )}
                  {result.drinks.custom.length > 0 && (
                    <View style={styles.drinksDetail}>
                      {result.drinks.custom.map((drink, index) => (
                        <Text key={index} style={[styles.drinkText, { color: colors.textSecondary }]}>
                          • {drink.name} x{drink.count}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    marginTop: SPACING.md,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  bacSection: {
    marginBottom: SPACING.md,
  },
  secondaryBac: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bacLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bacValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  levelText: {
    fontSize: 14,
    marginTop: 4,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    paddingTop: SPACING.sm,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  drinksDetail: {
    marginTop: 4,
  },
  drinkText: {
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
});