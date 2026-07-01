import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import type { IntellectualPropertyDto } from '../types/tracks.types';

interface IntellectualPropertySectionProps {
  intellectualProperties: IntellectualPropertyDto[];
}

const TYPE_LABELS: Record<IntellectualPropertyDto['type'], string> = {
  copyrightOffice: 'Copyright',
  cmo: 'CMO',
  splitSheet: 'Split Sheet',
};

const TYPE_COLORS: Record<IntellectualPropertyDto['type'], string> = {
  copyrightOffice: 'rgba(74,222,128,0.15)',
  cmo: 'rgba(32,138,239,0.15)',
  splitSheet: 'rgba(251,191,36,0.15)',
};

const TYPE_TEXT_COLORS: Record<IntellectualPropertyDto['type'], string> = {
  copyrightOffice: '#4ade80',
  cmo: '#208AEF',
  splitSheet: '#FBB024',
};

export function IntellectualPropertySection({ intellectualProperties }: IntellectualPropertySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Propiedad Intelectual</Text>

      {intellectualProperties.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="shield-off-outline" size={32} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>Sin documentos registrados</Text>
        </View>
      ) : (
        intellectualProperties.map((ip) => {
          const formattedDate = new Date(ip.createdAt).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <View key={ip.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[ip.type] }]}>
                  <Text style={[styles.typeBadgeText, { color: TYPE_TEXT_COLORS[ip.type] }]}>
                    {TYPE_LABELS[ip.type]}
                  </Text>
                </View>
                <Text style={styles.date}>{formattedDate}</Text>
              </View>

              {!!ip.documentUrl && (
                <Pressable
                  style={({ pressed }) => [styles.docBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Linking.openURL(ip.documentUrl)}
                >
                  <MaterialCommunityIcons name="file-document-outline" size={16} color={Brand.accent} />
                  <Text style={styles.docBtnText}>Ver documento</Text>
                  <MaterialCommunityIcons name="open-in-new" size={14} color="rgba(255,255,255,0.3)" />
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  date: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.35)',
  },
  docBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(32,138,239,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  docBtnText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
});
