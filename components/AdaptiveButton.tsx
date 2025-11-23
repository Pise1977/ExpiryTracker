import React, { memo, useCallback, useRef } from 'react';
import { Pressable, Text, View, StyleSheet, Platform, GestureResponderEvent, Animated } from 'react-native';

export type AdaptiveButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  testID?: string;
  iconLeft?: React.ComponentType<{ size?: number; color?: string }>; 
  iconRight?: React.ComponentType<{ size?: number; color?: string }>;
  backgroundColor?: string;
  textColor?: string;
  rippleColor?: string;
};

const DEFAULT_BG = '#FF6B6B';
const DEFAULT_TEXT = '#FFFFFF';
const FONT_FAMILY = 'Poppins_600SemiBold' as const;

function AdaptiveButtonBase({
  label,
  onPress,
  disabled = false,
  testID,
  iconLeft: IconLeft,
  iconRight: IconRight,
  backgroundColor = DEFAULT_BG,
  textColor = DEFAULT_TEXT,
  rippleColor = 'rgba(255,255,255,0.2)',
}: AdaptiveButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;
      if (onPress) onPress(e);
    },
    [disabled, onPress]
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        testID={testID ?? 'adaptive-button'}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        android_ripple={{ color: rippleColor, borderless: false }}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={[
          styles.base,
          { 
            backgroundColor, 
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
      <View style={styles.content}>
        {IconLeft ? (
          <View style={styles.iconWrapper}>
            <IconLeft size={18} color={textColor} />
          </View>
        ) : null}
        <Text
          style={[styles.label, { color: textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          allowFontScaling
        >
          {label}
        </Text>
        {IconRight ? (
          <View style={styles.iconWrapper}>
            <IconRight size={18} color={textColor} />
          </View>
        ) : null}
      </View>
      </Pressable>
    </Animated.View>
  );
}

export const AdaptiveButton = memo(AdaptiveButtonBase);

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: 0,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: FONT_FAMILY,
    fontWeight: '600' as const,
    lineHeight: Platform.select({ default: 22, ios: 22, android: 22 }),
  },
});
