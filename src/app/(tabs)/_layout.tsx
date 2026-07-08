import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useMemo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useReceivedRequestsBadgeCount } from "@/domains/requests/hooks/use-requests.hooks";
import { UserRole } from "@/domains/users/types/users.types";
import { tabsByRoles } from "@/shared/constants/routes";
import { Brand } from "@/constants/theme";

export default function TabLayout() {
  const role = useAuthStore((s) => s.user?.role ?? UserRole.INVITADO);

  const allowedTabNames = useMemo(
    () => new Set(tabsByRoles.filter((t) => t.rolAccess.includes(role)).map((t) => t.name)),
    [role]
  );

  const receivedRequestsBadgeCount = useReceivedRequestsBadgeCount(allowedTabNames.has("request"));

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      labelStyle={{
        default: { fontSize: 10, fontWeight: '600' },
        selected: { fontSize: 10, fontWeight: '700', color: Brand.accent },
      }}
      iconColor={{ default: 'rgba(255,255,255,0.45)', selected: Brand.accent }}
      indicatorColor={`${Brand.primary}33`}
      rippleColor={`${Brand.primary}22`}
    >
      {tabsByRoles.map((tab) => (
        <NativeTabs.Trigger
          key={tab.name}
          name={tab.name}
          hidden={!allowedTabNames.has(tab.name)}
        >
          <NativeTabs.Trigger.Label>{tab.title}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={
              <NativeTabs.Trigger.VectorIcon
                family={MaterialCommunityIcons}
                name={tab.icon}
              />
            }
          />
          {tab.name === "request" && (
            <NativeTabs.Trigger.Badge hidden={receivedRequestsBadgeCount === 0}>
              {String(receivedRequestsBadgeCount)}
            </NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
