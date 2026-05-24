import { View, type DimensionValue } from 'react-native'

interface SpacerProps {
  width?: DimensionValue
  height?: DimensionValue
}

export default function Spacer({
  width = "100%",
  height = 40,
}: SpacerProps) {
  return <View style={{ width, height }} />
}
