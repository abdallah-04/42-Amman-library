import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native'; // ← useWindowDimensions
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ← add this
import { colors } from '@/constants/Colors';

const HEIGHT = 60;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ICONS = {
  library: { active: 'book', inactive: 'book-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  addBooks: { active: 'add-circle', inactive: 'add-circle-outline' },
} as const;

// ← width is now a parameter instead of a module-level constant
function generatePath(centerX: number, w: number) {
  'worklet';
  const curveWidth = 50;
  const curveDepth = 18;

  return `
    M0 0
    H${centerX - curveWidth}
    C${centerX - 25} 0,
     ${centerX - 25} ${curveDepth},
     ${centerX} ${curveDepth}
    C${centerX + 25} ${curveDepth},
     ${centerX + 25} 0,
     ${centerX + curveWidth} 0
    H${w}
    V${HEIGHT}
    H0
    Z
  `;
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions(); // ← reactive to orientation
  const insets = useSafeAreaInsets();       // ← home indicator / gesture bar

  const TAB_WIDTH = width / state.routes.length;
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 12,
      stiffness: 220,
      mass: 0.6,
      velocity: 8,
    });
  }, [state.index]);

  const animatedProps = useAnimatedProps(() => {
    const centerX = TAB_WIDTH * activeIndex.value + TAB_WIDTH / 2;
    return {
      d: generatePath(centerX, width), // ← pass reactive width
    };
  });

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: TAB_WIDTH * activeIndex.value + TAB_WIDTH / 2 - 24,
      },
    ],
  }));

  const svgHeight = HEIGHT + insets.bottom + 20; // ← covers inset space

  return (
    <View style={[styles.wrapper, { height: HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      <Svg width={width} height={svgHeight} style={StyleSheet.absoluteFill}>
        <AnimatedPath
          animatedProps={animatedProps}
          fill={colors.surface}
        />
      </Svg>

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name as keyof typeof ICONS] || ICONS.library;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              style={[styles.tab, { width: TAB_WIDTH }]}
              onPress={onPress}
            >
              <Ionicons
                name={focused ? icon.active : icon.inactive}
                size={24}
                color={focused ? colors.white : colors.textDark}
              />
            </Pressable>
          );
        })}
      </View>

      <Animated.View style={[styles.circle, circleStyle]} />
    </View>
  );
}

export default function DashLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="addBooks" options={{ title: 'Add Book' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // height and paddingBottom set inline above (dynamic)
    backgroundColor: colors.background,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    height: HEIGHT - 5,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circle: {
    position: 'absolute',
    bottom: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});