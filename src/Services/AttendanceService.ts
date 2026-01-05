import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";
const SOCKET_URL = API_URL.replace("/api", "");

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

const getToken = (): string | null => localStorage.getItem("employeeToken");

const getEmployeeData = () => {
  const data = localStorage.getItem("employeeData");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const fetchEmployeeId = async (): Promise<string | null> => {
  const employeeData = getEmployeeData();
  if (!employeeData) return null;
  return (
    employeeData.employeeId ||
    employeeData.EmployeeID ||
    employeeData.employee_id ||
    employeeData.id ||
    null
  );
};

export const fetchTodayRecord = async (today: string, empId: string) => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const res = await fetch(`${API_URL}/attendance?date=${today}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to fetch");

  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;

  const emp = data[0].employees?.find((e: any) => e.employeeId === empId);
  if (!emp) return null;

  return {
    CheckIn: emp.checkInTime ? { toDate: () => new Date(emp.checkInTime) } : null,
    CheckOut: emp.checkOutTime ? { toDate: () => new Date(emp.checkOutTime) } : null
  };
};


export const saveCheckIn = async (_today: string, empId: string): Promise<Date> => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const res = await fetch(`${API_URL}/attendance/check-in`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ employeeId: empId })
  });

  if (!res.ok) throw new Error("Check-in failed");
  return new Date();
};

export const saveCheckOut = async (_today: string, empId: string): Promise<Date> => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const res = await fetch(`${API_URL}/attendance/check-out`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ employeeId: empId })
  });

  if (!res.ok) throw new Error("Check-out failed");
  return new Date();
};


export const listenToAttendance = (today: string, empId: string, callback: Function) => {

  socket.emit("subscribeToAttendance", today);

  const handler = async ({ date, employeeId }: any) => {
    if (date === today && employeeId === empId) {
      try {
        const data = await fetchTodayRecord(today, empId);
        callback(data);
      } catch (err) {
        console.error("Error handling socket update:", err);
      }
    }
  };

  socket.on("attendanceUpdated", handler);

  return () => {
    socket.off("attendanceUpdated", handler);
  };
};
