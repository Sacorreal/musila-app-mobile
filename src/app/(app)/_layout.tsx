import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'react-native';

import { Brand, Colors } from '@/constants/theme';

type TabSymbol = {
  ios: string;
  android: string;
  web: string;
};

const TAB_SYMBOLS: Record<string, TabSymbol> = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  discover: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  library: { ios: 'music.note.list', android: 'library_music', web: 'music_note' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
};

function TabIcon({ name, color, size = 24 }: { name: TabSymbol; color: string; size?: number }) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}

export default function AppLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <TabIcon name={TAB_SYMBOLS.home} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Descubrir',
          tabBarIcon: ({ color }) => (
            <TabIcon name={TAB_SYMBOLS.discover} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ color }) => (
            <TabIcon name={TAB_SYMBOLS.library} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <TabIcon name={TAB_SYMBOLS.profile} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
