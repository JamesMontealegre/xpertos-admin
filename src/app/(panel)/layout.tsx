import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { PanelShell } from "@/components/panel-shell";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const [{ profile }, cookieStore] = await Promise.all([requireAdmin(), cookies()]);
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <PanelShell
      operator={{ full_name: profile.full_name, email: profile.email, is_super_admin: profile.is_super_admin }}
      initialCollapsed={collapsed}
    >
      {children}
    </PanelShell>
  );
}
