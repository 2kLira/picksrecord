import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEventOptions } from "@/lib/queries";
import { createPickAction } from "@/app/actions/picks";
import { PickForm } from "@/components/PickForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default async function NewPickPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const user = await requireUser();
  const t = await getT();
  const { event } = await searchParams;
  const events = await getEventOptions(user.id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft size={16} /> {t.nav.dashboard}
      </Link>
      <PageHeader eyebrow={t.pickForm.newEyebrow} title={t.pickForm.newTitle} subtitle={t.pickForm.newSubtitle} />

      {events.length > 0 ? (
        <PickForm action={createPickAction} events={events} defaultEventId={event} submitLabel={t.pickForm.savePick} />
      ) : (
        <EmptyState
          icon={<Trophy size={26} />}
          title={t.pickForm.needEventTitle}
          body={t.pickForm.needEventBody}
          action={
            <Link href="/events/new">
              <Button>{t.common.newEvent}</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
