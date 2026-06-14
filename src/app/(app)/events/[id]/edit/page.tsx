import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEvent } from "@/lib/queries";
import { updateEventAction, deleteEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getT();
  const event = await getEvent(user.id, id);
  if (!event) notFound();

  const action = updateEventAction.bind(null, id);
  const deleteEvent = deleteEventAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/events/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft size={16} /> {t.eventForm.backToEvent}
      </Link>
      <PageHeader eyebrow={t.eventForm.editEyebrow} title={t.eventForm.editTitle} subtitle={t.eventForm.editSubtitle} />
      <EventForm action={action} event={event} submitLabel={t.common.saveChanges} />

      <form action={deleteEvent} className="mt-10 border-t border-hair pt-6">
        <h3 className="text-sm font-medium text-lost">{t.eventForm.dangerZone}</h3>
        <p className="mt-1 text-sm text-faint">{t.eventForm.dangerBody}</p>
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-lost/30 bg-lost/10 px-4 py-2.5 text-sm font-medium text-lost transition-colors hover:bg-lost/20 active:scale-[0.98]"
        >
          <Trash2 size={16} /> {t.common.delete}
        </button>
      </form>
    </div>
  );
}
