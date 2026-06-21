import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useMemo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { UserRole } from "@/domains/users/types/users.types";
import { tabsByRoles } from "@/shared/constants/routes";

export default function TabLayout() {
  const role = useAuthStore((s) => s.user?.role ?? UserRole.INVITADO);

  const allowedTabNames = useMemo(
    () => new Set(tabsByRoles.filter((t) => t.rolAccess.includes(role)).map((t) => t.name)),
    [role]
  );

  return (
    <NativeTabs labelVisibilityMode="labeled">
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
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
