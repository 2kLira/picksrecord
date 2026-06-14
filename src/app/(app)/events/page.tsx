import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEventsWithStats } from "@/lib/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default async function EventsPage() {
  const user = await requireUser();
  const t = await getT();
  const events = await getEventsWithStats(user.id);

  return (
    <div>
      <PageHeader
        eyebrow={t.events.eyebrow}
        title={t.events.title}
        subtitle={t.events.subtitle}
        action={
          <Link href="/events/new">
            <Button>
              <Plus size={16} /> {t.common.newEvent}
            </Button>
          </Link>
        }
      />

      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy size={26} />}
          title={t.events.emptyTitle}
          body={t.events.emptyBody}
          action={
            <Link href="/events/new">
              <Button>
                <Plus size={16} /> {t.common.newEvent}
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
