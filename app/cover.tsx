import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, useWindowDimensions, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Carrot, Egg, Milk, Beef, Salad, Refrigerator } from 'lucide-react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Baloo2_400Regular, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';

export default function CoverScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Fredoka_400Regular,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const descriptionOpacity = useRef(new Animated.Value(0)).current;

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const textColor1 = useRef(new Animated.Value(0)).current;
  const textColor2 = useRef(new Animated.Value(0)).current;
  const textColor3 = useRef(new Animated.Value(0)).current;
  
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;
  const float5 = useRef(new Animated.Value(0)).current;
  const float6 = useRef(new Animated.Value(0)).current;
  
  const floatX1 = useRef(new Animated.Value(0)).current;
  const floatX2 = useRef(new Animated.Value(0)).current;
  const floatX3 = useRef(new Animated.Value(0)).current;
  const floatX4 = useRef(new Animated.Value(0)).current;
  const floatX5 = useRef(new Animated.Value(0)).current;
  const floatX6 = useRef(new Animated.Value(0)).current;
  
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;
  const spin4 = useRef(new Animated.Value(0)).current;
  const spin5 = useRef(new Animated.Value(0)).current;
  const spin6 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const createFloatingXAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const createSpinAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          })
        ),
      ]).start();
    };

    createFloatingAnimation(float1, 2000, 0);
    createFloatingAnimation(float2, 2500, 200);
    createFloatingAnimation(float3, 2200, 400);
    createFloatingAnimation(float4, 2800, 600);
    createFloatingAnimation(float5, 2400, 800);
    createFloatingAnimation(float6, 2600, 1000);

    createFloatingXAnimation(floatX1, 3000, 0);
    createFloatingXAnimation(floatX2, 3500, 300);
    createFloatingXAnimation(floatX3, 3200, 600);
    createFloatingXAnimation(floatX4, 3800, 900);
    createFloatingXAnimation(floatX5, 3400, 1200);
    createFloatingXAnimation(floatX6, 3600, 1500);

    createSpinAnimation(spin1, 5000, 0);
    createSpinAnimation(spin2, 6000, 200);
    createSpinAnimation(spin3, 5500, 400);
    createSpinAnimation(spin4, 6500, 600);
    createSpinAnimation(spin5, 5200, 800);
    createSpinAnimation(spin6, 5800, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(textColor1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(textColor1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(textColor2, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(textColor2, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(textColor3, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(textColor3, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [fontsLoaded, buttonOpacity, buttonScale, descriptionOpacity, float1, float2, float3, float4, float5, float6, floatX1, floatX2, floatX3, floatX4, floatX5, floatX6, logoRotate, logoScale, spin1, spin2, spin3, spin4, spin5, spin6, textColor1, textColor2, textColor3]);

  const handleEnter = () => {
    try {
      console.log('[CoverScreen] Enter button pressed, navigating to main tabs');
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)/(home)');
      });
    } catch (e) {
      console.error('[CoverScreen] Navigation error', e);
    }
  };

  const titleFontSize = Math.max(28, Math.min(42, Math.round(width * 0.08)));
  const buttonContainerPadding = width > 700 ? 28 : 20;
  const logoSize = Math.min(width * 0.45, height * 0.25);



  const floatTransform1 = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const floatTransform2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });
  const floatTransform3 = float3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const floatTransform4 = float4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32],
  });
  const floatTransform5 = float5.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const floatTransform6 = float6.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -38],
  });

  const floatTransformX1 = floatX1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });
  const floatTransformX2 = floatX2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const floatTransformX3 = floatX3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const floatTransformX4 = floatX4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const floatTransformX5 = floatX5.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });
  const floatTransformX6 = floatX6.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  const spinInterpolate1 = spin1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinInterpolate2 = spin2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const spinInterpolate3 = spin3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinInterpolate4 = spin4.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const spinInterpolate5 = spin5.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinInterpolate6 = spin6.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const animatedColor1 = textColor1.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#000000'],
  });

  const animatedColor2 = textColor2.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#000000'],
  });

  const animatedColor3 = textColor3.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#000000'],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.root} testID="cover-root">
      <SafeAreaView style={styles.safe}>

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon1,
              {
                transform: [
                  { translateY: floatTransform1 },
                  { translateX: floatTransformX1 },
                  { rotate: spinInterpolate1 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F5A962' }]}>
              <Text style={styles.emojiIcon}>🥕</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon2,
              {
                transform: [
                  { translateY: floatTransform2 },
                  { translateX: floatTransformX2 },
                  { rotate: spinInterpolate2 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#D4A574' }]}>
              <Text style={styles.emojiIcon}>🍞</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon3,
              {
                transform: [
                  { translateY: floatTransform3 },
                  { translateX: floatTransformX3 },
                  { rotate: spinInterpolate3 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E57373' }]}>
              <Text style={styles.emojiIcon}>🍅</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon4,
              {
                transform: [
                  { translateY: floatTransform4 },
                  { translateX: floatTransformX4 },
                  { rotate: spinInterpolate4 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF', borderColor: '#81C784', borderWidth: 3 }]}>
              <Text style={styles.emojiIcon}>🥛</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon5,
              {
                transform: [
                  { translateY: floatTransform5 },
                  { translateX: floatTransformX5 },
                  { rotate: spinInterpolate5 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFC107' }]}>
              <Text style={styles.emojiIcon}>🧀</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon,
              styles.icon6,
              {
                transform: [
                  { translateY: floatTransform6 },
                  { translateX: floatTransformX6 },
                  { rotate: spinInterpolate6 },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFB74D' }]}>
              <Text style={styles.emojiIcon}>🍊</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.logoWrap,
              { width: logoSize * 1.2, height: logoSize * 1.2 },
              {
                transform: [
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <Image
              testID="cover-logo"
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/zod2c8xclbtqz3xc20n5j' }}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityLabel={t('cover.logoAccessibility')}
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.descriptionContainer, { opacity: descriptionOpacity }]}>
          <View style={styles.featureItem}>
            <Animated.Text style={[styles.featureText, { color: animatedColor1 }]}>{t('cover.feature1')}</Animated.Text>
          </View>
          <View style={styles.featureItem}>
            <Animated.Text style={[styles.featureText, { color: animatedColor2 }]}>{t('cover.feature2')}</Animated.Text>
          </View>
          <View style={styles.featureItem}>
            <Animated.Text style={[styles.featureText, { color: animatedColor3 }]}>{t('cover.feature3')}</Animated.Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, { padding: buttonContainerPadding, opacity: buttonOpacity }]}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              testID="cover-enter-button"
              style={styles.goButton}
              onPress={handleEnter}
              activeOpacity={0.7}
              accessibilityLabel={t('cover.enterAccessibility')}
            >
              <Text style={styles.goButtonText}>{t('cover.enterButton')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EDE7E0',
  },
  safe: {
    flex: 1,
  },

  descriptionContainer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    gap: 10,
  },
  featureItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Baloo2_700Bold',
    fontStyle: 'italic' as const,
    fontWeight: '700' as const,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000000',
    maxWidth: 280,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoWrap: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  emojiIcon: {
    fontSize: 28,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  goButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: 'transparent',
    borderRadius: 50,
  },
  goButtonText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#6B9B7E',
    textAlign: 'center',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  icon1: {
    top: '22%',
    left: '50%',
    marginLeft: -28,
  },
  icon2: {
    top: '32%',
    left: '78%',
    marginLeft: -28,
  },
  icon3: {
    top: '58%',
    left: '75%',
    marginLeft: -28,
  },
  icon4: {
    top: '70%',
    left: '50%',
    marginLeft: -28,
  },
  icon5: {
    top: '58%',
    left: '25%',
    marginLeft: -28,
  },
  icon6: {
    top: '32%',
    left: '22%',
    marginLeft: -28,
  },
});
