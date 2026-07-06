import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useLogout } from '@/domains/auth/hooks/use-auth.hooks';
import { UserRole } from '@/domains/users/types/users.types';
import { ROLE_LABELS } from '@/domains/users/constants/role-labels';
import { MoreMenuCard, MenuOption } from '@/domains/users/components/MoreMenuCard';

export function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const initials = `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user?.name ?? ''} ${user?.lastName ?? ''}`.trim();
  const roleLabel = ROLE_LABELS[user?.role as UserRole] ?? user?.role;

  const comingSoon = (label: string) =>
    Toast.show({ type: 'info', text1: label, text2: 'Próximamente disponible' });

  const isAuthor = user?.role === UserRole.AUTOR;

  const menuOptions: MenuOption[] = [
    {
      icon: 'account-circle-outline',
      label: 'Mi Perfil',
      description: 'Ver y editar tu información personal',
      action: () => comingSoon('Mi Perfil'),
    },
    {
      icon: 'chat-processing-outline',
      label: 'Chat',
      description: 'Conversaciones sobre solicitudes activas',
      action: () => router.push('/(tabs)/more/chat' as any),
    },
    ...(isAuthor
      ? []
      : [
          {
            icon: 'account-plus-outline' as const,
            label: 'Invitar Usuario',
            description: 'Genera un enlace de invitación',
            action: () => comingSoon('Invitar Usuario'),
          },
        ]),
    {
      icon: 'cog-outline',
      label: 'Ajustes',
      description: 'Preferencias de la aplicación',
      action: () => comingSoon('Ajustes'),
    },
    {
      icon: 'logout',
      label: 'Cerrar Sesión',
      description: 'Salir de tu cuenta',
      action: () => logoutMutation.mutate(undefined),
      danger: true,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials || '?'}</Text>
        </View>
        <Text style={styles.userName}>{fullName || 'Usuario'}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
        {!!user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(160).springify()} style={styles.menuSection}>
        {menuOptions.map((opt) => (
          <MoreMenuCard key={opt.label} {...opt} />
        ))}
      </ReAnimated.View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bgOrb1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(32,138,239,0.06)',
    top: -80,
    right: -80,
  },
  bgOrb2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(60,159,254,0.04)',
    bottom: 100,
    left: -60,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    gap: 10,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderWidth: 2,
    borderColor: `${Brand.primary}60`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.accent,
  },
  userName: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  rolePill: {
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Brand.primary}40`,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roleText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
  email: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.35)',
  },
  menuSection: {
    gap: 8,
  },
});
