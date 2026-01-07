const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";

const getToken = (): string | null => localStorage.getItem("employeeToken");

const getEmployeeId = (): string | null => {
    const data = localStorage.getItem("employeeData");
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        return parsed.employeeId || parsed.EmployeeID || parsed.employee_id || parsed.id || null;
    } catch {
        return null;
    }
};

// ============================
// TYPES
// ============================
export interface Ticket {
    _id: string;
    employeeId: string;
    employeeName?: string;
    employeeEmail?: string;
    issueType: string; // Backend uses issueType, not category
    description: string;
    status: "Open" | "In Progress" | "Resolved";
    priority?: "Low" | "Medium" | "High";
    replies?: Reply[];
    createdAt: string;
    updatedAt: string;
}

export interface Reply {
    _id?: string;
    message: string;
    repliedBy: string;
    repliedAt: string;
}

export interface CreateTicketData {
    issueType: string; // Changed from category to match backend
    description: string;
    priority?: "Low" | "Medium" | "High";
}

// ============================
// CREATE TICKET
// ============================
export const createTicket = async (data: CreateTicketData): Promise<{ success: boolean; ticket?: Ticket; error?: string }> => {
    try {
        const token = getToken();
        if (!token) {
            return { success: false, error: "Not authorized" };
        }

        const empId = getEmployeeId();
        if (!empId) {
            return { success: false, error: "Employee ID not found" };
        }

        const payload = {
            employeeId: empId,
            issueType: data.issueType,
            description: data.description,
            priority: data.priority || "Medium",
        };

        // Try multiple possible endpoints
        const endpoints = [
            `${API_URL}/help/tickets`,
            `${API_URL}/support/tickets`,
        ];

        let lastError = null;

        for (const url of endpoints) {
            try {


                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });



                if (res.ok) {
                    const ticket = await res.json();

                    return { success: true, ticket };
                } else if (res.status !== 404) {
                    // If it's not a 404, it means the route exists but there's another error
                    const error = await res.json();
                    return { success: false, error: error.message || "Failed to create ticket" };
                }

                lastError = { status: res.status, url };
            } catch (e) {
                console.error(`❌ Error with ${url}:`, e);
                lastError = e;
            }
        }

        console.error("❌ All endpoints failed. Last error:", lastError);
        return { success: false, error: "Help & Support API not available. Please contact your administrator." };
    } catch (err) {
        console.error("Error creating ticket:", err);
        return { success: false, error: "Network error" };
    }
};

// ============================
// GET EMPLOYEE TICKETS
// ============================
export const getEmployeeTickets = async (): Promise<Ticket[]> => {
    try {
        const token = getToken();
        if (!token) return [];

        const empId = getEmployeeId();
        if (!empId) return [];

        const res = await fetch(`${API_URL}/help/tickets/employee/${empId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            const tickets = await res.json();
            return Array.isArray(tickets) ? tickets : [];
        }
        return [];
    } catch (err) {
        console.error("Error fetching employee tickets:", err);
        return [];
    }
};

// ============================
// GET TICKET BY ID
// ============================
export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
    try {
        const token = getToken();
        if (!token) return null;

        const res = await fetch(`${API_URL}/help/tickets/${ticketId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            const ticket = await res.json();
            return ticket;
        }
        return null;
    } catch (err) {
        console.error("Error fetching ticket:", err);
        return null;
    }
};

// ============================
// ADD REPLY TO TICKET
// ============================
export const addReply = async (ticketId: string, message: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const token = getToken();
        if (!token) {
            return { success: false, error: "Not authorized" };
        }

        const endpoints = [
            `${API_URL}/help/tickets/${ticketId}/reply`,
        ];

        let lastError = null;

        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message }),
                });

                if (res.ok) {
                    return { success: true };
                } else if (res.status !== 404) {
                    const error = await res.json();
                    return { success: false, error: error.message || "Failed to add reply" };
                }
                lastError = { status: res.status, url };
            } catch (e) {
                lastError = e;
            }
        }

        return { success: false, error: "Help & Support API not available." };
    } catch (err) {
        console.error("Error adding reply:", err);
        return { success: false, error: "Network error" };
    }
};

// ============================
// GET ALL TICKETS (Admin Only)
// ============================
export const getAllTickets = async (): Promise<Ticket[]> => {
    try {
        const token = getToken();
        if (!token) return [];

        const res = await fetch(`${API_URL}/help/tickets`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            const tickets = await res.json();
            return Array.isArray(tickets) ? tickets : [];
        }
        return [];
    } catch (err) {
        console.error("Error fetching all tickets:", err);
        return [];
    }
};

// ============================
// UPDATE TICKET STATUS (Admin Only)
// ============================
export const updateTicketStatus = async (
    ticketId: string,
    status: "Open" | "In Progress" | "Resolved" | "Closed"
): Promise<{ success: boolean; error?: string }> => {
    try {
        const token = getToken();
        if (!token) {
            return { success: false, error: "Not authorized" };
        }

        const res = await fetch(`${API_URL}/help/tickets/${ticketId}/status`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (res.ok) {
            return { success: true };
        } else {
            const error = await res.json();
            return { success: false, error: error.message || "Failed to update status" };
        }
    } catch (err) {
        console.error("Error updating ticket status:", err);
        return { success: false, error: "Network error" };
    }
};
