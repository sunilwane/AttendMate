const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";

// 🔐 Get token from localStorage
const getToken = () => localStorage.getItem("employeeToken");

// ============================
// TYPES
// ============================
export interface EventData {
  id: string | number;
  event_title: string;
  event_date: string;
  event_theme: string;
}

export interface EmployeeData {
  id: string | number;
  Name: string;
  Photo: string;
  dateOfBirth?: string; // Added dateOfBirth
}

// ============================
// FETCH EVENTS
// ============================
export const fetchEvents = async () => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/events`, {
    method: "GET",
    headers: headers,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch events");
  }

  const rawData = await res.json();

  // Map backend fields to frontend interface
  return rawData.map((event: any) => ({
    id: event._id,
    event_title: event.title,
    event_date: event.start, // Map 'start' to 'event_date'
    event_theme: mapTypeToTheme(event.type), // Helper to map type to color theme
  }));
};

// Helper function to map backend 'type' to frontend 'event_theme' colors
const mapTypeToTheme = (type: string) => {
  switch (type) {
    case "Holiday": return "red";
    case "Meeting": return "yellow";
    case "Event": return "green"; // or blue
    default: return "blue";
  }
};


export const fetchEmployees = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");


  const res = await fetch(`${API_URL}/employees`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch employees");
  }

  const data = await res.json();

  // Map backend data to EmployeeData interface
  // Adjust property names based on actual API response
  return data.map((emp: any) => ({
    id: emp._id || emp.id,
    Name: emp.name || emp.Name,
    Photo: emp.image || emp.Photo || "",
    dateOfBirth: emp.dob || emp.dateOfBirth || emp.DateOfBirth
  }));
};


export const fetchBirthdays = fetchEmployees;
