import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { colors } from '../constants/Colors';
interface BookCoverProps {
  imageUrl: string;
  width?: number;
  height?: number;
  radius?: number;
}

export default function BookCover({
  imageUrl,
  width = 178,
  height = 237,
  radius = 10,
}: BookCoverProps) {
  return (
    <View style={[styles.shadow, { width, height, borderRadius: radius }]}>
      <Image
      source={imageUrl ? { uri: imageUrl } : undefined}
      style={[styles.image, { borderRadius: radius }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});