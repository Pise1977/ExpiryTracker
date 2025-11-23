import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

export type AdaptiveListCellProps = {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  imageUri?: string;
  onPress?: () => void;
  testID?: string;
};

function AdaptiveListCellBase({ title, subtitle, rightLabel, imageUri, onPress, testID }: AdaptiveListCellProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.96 : 1 }]}
      testID={testID ?? 'adaptive-list-cell'}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.avatar} /> : <View style={styles.placeholder} />}
      <View style={styles.center}>
        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={styles.subtitle}
            numberOfLines={2}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightLabel ? (
        <View style={styles.right}>
          <Text
            style={styles.rightText}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {rightLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const AdaptiveListCell = memo(AdaptiveListCellBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
  },
  right: {
    marginLeft: 8,
    maxWidth: '30%',
  },
  rightText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#6B7280',
  },
});
