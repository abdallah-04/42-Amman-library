import { Tabs } from 'expo-router';
import { colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  {
    name: 'library',
    title: 'Library',
    icon: 'book' as const,
    iconOutline: 'book-outline' as const,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person' as const,
    iconOutline: 'person-outline' as const,
  },
  {
    name: 'create',
    title: 'Add Book',
    icon: 'add-circle' as const,
    iconOutline: 'add-circle-outline' as const,
  },
];

export default function DashLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 90,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          elevation: 0, 
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDark,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? tab.icon : tab.iconOutline}
                color={focused ? colors.primary : colors.textDark}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}