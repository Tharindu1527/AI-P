import { useState } from "react";
import { format } from "date-fns";

function LecturerCalendar() {
    const [events, setEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleAddEvent = () => {
        if (!eventTitle || !eventDate) {
            alert("Please enter event title and date.");
            return;
        }

        const newEvent = { id: Date.now(), title: eventTitle, date: eventDate };
        setEvents([...events, newEvent]);

        // Show success message
        setSuccessMessage("Event added successfully!");

        // Reset fields
        setEventTitle("");
        setEventDate("");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleDeleteEvent = (id) => {
        setEvents(events.filter(event => event.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Lecturer Calendar</h3>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">
                    {successMessage}
                </div>
            )}

            {/* Event Form */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Event Title"
                    className="border rounded p-2 w-full mb-2"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                    type="date"
                    className="border rounded p-2 w-full mb-2"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                />
                <button
                    onClick={handleAddEvent}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Event
                </button>
            </div>

            {/* Event List */}
            <div>
                <h4 className="text-lg font-medium mb-2">Upcoming Events</h4>
                {events.length === 0 ? (
                    <p className="text-gray-500">No upcoming events.</p>
                ) : (
                    <ul className="space-y-2">
                        {events.map((event) => (
                            <li key={event.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <span className="text-gray-700 font-medium">
                                    {event.title} - {format(new Date(event.date), "PPP")}
                                </span>
                                <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✖
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default LecturerCalendar;