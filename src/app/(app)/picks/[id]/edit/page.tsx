import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEventOptions, getPick } from "@/lib/queries";
import { updatePickAction } from "@/app/actions/picks";
import { PickForm } from "@/components/PickForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function EditPickPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getT();
  const pick = await getPick(user.id, id);
  if (!pick) notFound();

  const events = await getEventOptions(user.id);
  const action = updatePickAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/events/${pick.event_id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeft size={16} /> {t.eventForm.backToEvent}
      </Link>
      <PageHeader eyebrow={t.pickForm.editEyebrow} title={t.pickForm.editTitle} subtitle={t.pickForm.editSubtitle} />
      <PickForm action={action} events={events} pick={pick} submitLabel={t.common.saveChanges} />
    </div>
  );
}
