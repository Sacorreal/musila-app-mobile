import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useMemo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { UserRole } from "@/domains/users/types/users.types";
import { tabsByRoles } from "@/shared/constants/routes";

export default function TabLayout() {
  const role = useAuthStore((s) => s.user?.role ?? UserRole.INVITADO);

  const allowedTabs = useMemo(
    () => tabsByRoles.filter((tab) => tab.rolAccess.includes(role)),
    [role]
  );

  return (
    <NativeTabs labelVisibilityMode="labeled">
      {allowedTabs.map((tab) => (
        <NativeTabs.Trigger key={tab.title} name={tab.name}>
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