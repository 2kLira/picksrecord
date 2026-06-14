import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getPicksForUser } from "@/lib/queries";
import { computeStats } from "@/lib/stats";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "@/components/ProfileForm";
import { LogoutButton } from "@/components/app/LogoutButton";
import { formatDate } from "@/lib/format";

export default async function ProfilePage() {
  const user = await requireUser();
  const t = await getT();
  const picks = await getPicksForUser(user.id);
  const stats = computeStats(picks);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={t.profile.eyebrow} title={t.profile.title} subtitle={t.profile.subtitle} />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">{t.profile.preferences}</h2>
          <ProfileForm user={user} />
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">{t.profile.account}</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t.profile.email}</dt>
                <dd className="truncate font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t.profile.memberSince}</dt>
                <dd className="font-mono">{formatDate(user.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t.profile.totalPicks}</dt>
                <dd className="font-mono">{stats.total}</dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-hair pt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
