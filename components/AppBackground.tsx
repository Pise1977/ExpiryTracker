import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

type AppBackgroundProps = {
  children: React.ReactNode;
  showPattern?: boolean;
  showLogo?: boolean;
};

export function AppBackground({ children, showPattern = false, showLogo = false }: AppBackgroundProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/zod2c8xclbtqz3xc20n5j' }}
          style={styles.backgroundLogo}
          resizeMode="contain"
        />
      )}
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7E0',
  },
  backgroundLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    marginTop: -150,
    marginLeft: -150,
    opacity: 0.08,
  },
  overlay: {
    flex: 1,
  },
});
