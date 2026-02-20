import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import API from "../../api/api";

interface Booking {
  id: number;
  nomor_rumah: string;
  nama_blok: string;
  user_name: string;
  tanggal_kunjungan: string | null;
  kontak: string;
  catatan: string;
  status: "menunggu" | "dikonfirmasi" | "dibatalkan" | "terjual";
}

interface CalendarEvent extends EventInput {
  extendedProps: any;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await API.get<Booking[]>("/booking");

      const formattedEvents: CalendarEvent[] = res.data
        .filter((b) => b.tanggal_kunjungan !== null)
        .map((b) => ({
          id: b.id.toString(),
          title: `${b.nama_blok} - ${b.nomor_rumah}`,
          start: b.tanggal_kunjungan!,
          allDay: true,
          extendedProps: {
            calendar:
              b.status === "dibatalkan"
                ? "Danger"
                : b.status === "terjual"
                ? "Success"
                : b.status === "dikonfirmasi"
                ? "Primary"
                : "Warning",
            ...b,
          },
        }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Gagal load booking", error);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event as unknown as CalendarEvent);
    openModal();
  };

  return (
    <>
      <PageMeta
        title="Calendar Booking"
        description="Kalender Booking Rumah"
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
          />
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-8"
      >
        {selectedEvent && (
          <div className="flex flex-col overflow-y-auto">
            <h5 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              Detail Booking
            </h5>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Rumah:</strong>{" "}
                {selectedEvent.extendedProps.nama_blok} -{" "}
                {selectedEvent.extendedProps.nomor_rumah}
              </p>

              <p>
                <strong>Tanggal:</strong>{" "}
                {new Date(
                  selectedEvent.extendedProps.tanggal_kunjungan
                ).toLocaleDateString("id-ID")}
              </p>

              <p>
                <strong>Nama Pemesan:</strong>{" "}
                {selectedEvent.extendedProps.user_name}
              </p>

              <p>
                <strong>Kontak:</strong>{" "}
                {selectedEvent.extendedProps.kontak}
              </p>

              <p>
                <strong>Catatan:</strong>{" "}
                {selectedEvent.extendedProps.catatan || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedEvent.extendedProps.status.toUpperCase()}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;

  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;