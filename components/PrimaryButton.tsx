import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import { colors } from '@/constants/Colors';

interface PrimaryButtonProps
{
    label : string;
    onPress : () => void;
    color ?: string;
    disabeld : boolean;
    radius?: number;

}

export default function PrimaryButton({
    label,
    onPress,
    color = colors.primary,
    disabeld = false,
    radius = 24,

    }: PrimaryButtonProps) 
{

    return (
        <TouchableOpacity 
        style={[
            styles.button,
            { backgroundColor: color, borderRadius: radius },
            disabeld && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabeld}
        activeOpacity={0.8}
        >
            <ThemedText variant="button" color="white" center>
                {label}
            </ThemedText>
        </TouchableOpacity>
        );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});