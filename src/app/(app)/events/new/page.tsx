import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { createEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NewEventPage() {
  await requireUser();
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft size={16} /> {t.nav.events}
      </Link>
      <PageHeader eyebrow={t.eventForm.newEyebrow} title={t.eventForm.newTitle} subtitle={t.eventForm.newSubtitle} />
      <EventForm action={createEventAction} submitLabel={t.eventForm.create} />
    </div>
  );
}
