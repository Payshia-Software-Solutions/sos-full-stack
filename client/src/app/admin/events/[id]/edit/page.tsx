"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LMS_API_URL } from "@/lib/config";
import EventForm, { EventFormData } from "@/components/admin/events/EventForm";

export default function EditEventPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [initialData, setInitialData] = useState<EventFormData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${LMS_API_URL}/api/events/id/${id}`);
                const data = await res.json();
                if (!data.success) {
                    setError(data.message || "Event not found");
                    return;
                }
                const e = data.event;
                setInitialData({
                    title: e.title ?? "",
                    slug: e.slug ?? "",
                    event_date: e.event_date ? String(e.event_date).slice(0, 10) : "",
                    start_time: e.start_time ? String(e.start_time).slice(0, 5) : "",
                    end_time: e.end_time ? String(e.end_time).slice(0, 5) : "",
                    location: e.location ?? "",
                    summary: e.summary ?? "",
                    description: e.description ?? "",
                    image_url: e.image_url ?? "",
                    registration_url: e.registration_url ?? "",
                    status: e.status ?? "published",
                });
            } catch (err) {
                console.error("Failed to load event:", err);
                setError("Failed to load event");
            }
        };
        load();
    }, [id]);

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }
    if (!initialData) {
        return <div className="p-6 text-gray-500">Loading event...</div>;
    }
    return <EventForm mode="edit" eventId={id} initialData={initialData} />;
}
