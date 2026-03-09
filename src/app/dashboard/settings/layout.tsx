import { SettingsShell } from '@/components/dashboard/SettingsShell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
