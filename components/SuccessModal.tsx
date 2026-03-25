import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { colors } from '@/constants/Colors';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
}

export default function SuccessModal({
  visible,
  title,
  message,
  buttonLabel = 'OK',
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}   
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={colors.available}
            />
          </View>

          <ThemedText variant="h3" center style={styles.title}>
            {title}
          </ThemedText>

          <ThemedText
            variant="body"
            center
            opacity={0.7}
            style={styles.message}
          >
            {message}
          </ThemedText>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <ThemedText variant="button" color="white" center>
              {buttonLabel}
            </ThemedText>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,

    elevation: 10,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 4,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
});