import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useLogout } from '@/domains/auth/hooks/use-auth.hooks';
import { UserRole } from '@/domains/users/types/users.types';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MenuOption {
  icon: IconName;
  label: string;
  description: string;
  action: () => void;
  danger?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.AUTOR]: 'Autor',
  [UserRole.CANTAUTOR]: 'Cantautor',
  [UserRole.INTERPRETE]: 'Intérprete',
  [UserRole.INVITADO]: 'Invitado',
  [UserRole.EDITOR]: 'Editor',
};

function MoreMenuCard({ icon, label, description, action, danger }: MenuOption) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={action}
    >
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={danger ? 'rgba(255,80,80,0.9)' : Brand.accent}
        />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardLabel, danger && styles.cardLabelDanger]}>{label}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.25)" />
    </Pressable>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const initials = `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user?.name ?? ''} ${user?.lastName ?? ''}`.trim();
  const roleLabel = ROLE_LABELS[user?.role as UserRole] ?? user?.role;

  const comingSoon = (label: string) =>
    Toast.show({ type: 'info', text1: label, text2: 'Próximamente disponible' });

  const menuOptions: MenuOption[] = [
    {
      icon: 'account-circle-outline',
      label: 'Mi Perfil',
      description: 'Ver y editar tu información personal',
      action: () => comingSoon('Mi Perfil'),
    },
    {
      icon: 'account-plus-outline',
      label: 'Invitar Usuario',
      description: 'Genera un enlace de invitación',
      action: () => comingSoon('Invitar Usuario'),
    },
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
      {/* Orbes decorativos */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      {/* Perfil del usuario */}
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

      {/* Opciones */}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(32,138,239,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBoxDanger: {
    backgroundColor: 'rgba(255,80,80,0.1)',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardLabel: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardLabelDanger: {
    color: 'rgba(255,80,80,0.9)',
  },
  cardDesc: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
});
