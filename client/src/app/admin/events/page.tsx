"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import { eventImageUrl } from "@/components/admin/events/EventForm";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${LMS_API_URL}/api/events`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const deleteEvent = async (id: number) => {
        if (!confirm("Delete this event? This cannot be undone.")) return;
        try {
            const res = await fetch(`${LMS_API_URL}/api/events/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setEvents(events.filter((e) => e.id !== id));
            } else {
                alert(data.message || "Failed to delete");
            }
        } catch (error) {
            console.error("Failed to delete event:", error);
        }
    };

    const formatDate = (value: string) =>
        value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-";

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Events</h1>
                    <p className="text-sm text-muted-foreground">Upcoming events shown on the website.</p>
                </div>
                <Link href="/admin/events/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Create Event
                    </Button>
                </Link>
            </div>

            <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Event Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading events...</TableCell>
                            </TableRow>
                        ) : events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">No events yet. Create your first event!</TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">
                                        {event.image_url && (
                                            <img src={eventImageUrl(event.image_url)} alt={event.title} className="w-12 h-12 rounded object-cover mb-2" />
                                        )}
                                        {event.title}
                                    </TableCell>
                                    <TableCell>{formatDate(event.event_date)}</TableCell>
                                    <TableCell>
                                        {event.start_time ? event.start_time.slice(0, 5) : "-"}
                                        {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ""}
                                    </TableCell>
                                    <TableCell>{event.location || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.status === "published" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                                            {event.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/events/${event.id}/edit`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
