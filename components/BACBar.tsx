import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '@/hooks/useSettings';
import { BORDER_RADIUS } from '@/constants/theme';

interface BACBarProps {
  bac: number;
  height?: number;
}

export default function BACBar({ bac, height = 16 }: BACBarProps) {
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  
  // Calculate fill percentage (max BAC visualized = 3.0 g/L)
  const maxBAC = 3.0;
  const percentage = Math.min(100, (bac / maxBAC) * 100);
  
  // Full gradient colors for background (green → yellow → red)
  const backgroundGradientColors = ['#28A745', '#FFEB3B', '#FF5252'];
  const backgroundGradientLocations = [0, 0.5, 1];
  
  // Function to interpolate RGB color at specific position (0 to 1)
  const interpolateColor = (position: number): string => {
    // Clamp position between 0 and 1
    const pos = Math.max(0, Math.min(1, position));
    
    if (pos <= 0.5) {
      // Green (#28A745) to Yellow (#FFEB3B) - 0 to 0.5
      const localPos = pos * 2; // Scale 0-0.5 to 0-1
      const r = Math.round(40 + (255 - 40) * localPos);
      const g = Math.round(167 + (235 - 167) * localPos);
      const b = Math.round(69 + (59 - 69) * localPos);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow (#FFEB3B) to Red (#FF5252) - 0.5 to 1
      const localPos = (pos - 0.5) * 2; // Scale 0.5-1 to 0-1
      const r = Math.round(255);
      const g = Math.round(235 - (235 - 82) * localPos);
      const b = Math.round(59 - (59 - 82) * localPos);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };
  
  // Color at the indicator position (for the dot)
  const indicatorColor = interpolateColor(percentage / 100);
  
  // PROGRESSIVE fill gradient: from green (start) to indicatorColor (end)
  // This creates a gradient that goes ONLY from green to the indicator color
  const fillGradientColors = ['#28A745', indicatorColor];
  const fillGradientLocations = [0, 1];

  return (
    <View style={[styles.container, { height: height + 12 }]}>
      {/* Background bar - full gradient in transparency */}
      <View style={[styles.backgroundBar, { height }]}>
        <LinearGradient
          colors={backgroundGradientColors}
          locations={backgroundGradientLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { opacity: 0.3 }]}
        />
      </View>
      
      {/* Fill bar - progressive gradient from green to indicator color ONLY */}
      <View 
        style={[
          styles.fillBar, 
          { 
            height,
            width: `${percentage}%`,
          }
        ]}
      >
        <LinearGradient
          colors={fillGradientColors}
          locations={fillGradientLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </View>
      
      {/* Indicator dot */}
      <View
        style={[
          styles.indicator,
          {
            left: `${percentage}%`,
            backgroundColor: indicatorColor,
            shadowColor: isDark ? '#000000' : '#000000',
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  backgroundBar: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  fillBar: {
    position: 'absolute',
    left: 0,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});