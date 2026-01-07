const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://attendmate-backend-femy.onrender.com/api");

const getToken = (): string | null => localStorage.getItem("employeeToken");

const getLoggedInEmployeeId = (): string | number | null => {
  const employeeDataStr = localStorage.getItem("employeeData");
  if (!employeeDataStr) {
   
    return null;
  }
  try {
    const employeeData = JSON.parse(employeeDataStr);
    const id =
      employeeData?.employeeId ||
      employeeData?.EmployeeID ||
      employeeData?.employee_id ||
      employeeData?.id ||
      employeeData?._id ||
      null;
    return id;
  } catch (e) {
   
    return null;
  }
};

const getEmployeeData = () => {
  const data = localStorage.getItem("employeeData");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const fetchEmployeeId = async (_email: string) => {
  return getLoggedInEmployeeId();
};

export const submitLeaveRequest = async (data: any) => {
  try {
    const token = getToken();
    if (!token) {
    
      return { success: false, message: "Not authorized" };
    }

    const empId = await fetchEmployeeId("");
    if (!empId) {
    
      return { success: false, message: "Employee ID missing" };
    }

    const cleanStart = data.startDate ? data.startDate.split("T")[0] : "";
    const cleanEnd = data.endDate ? data.endDate.split("T")[0] : "";

    const payload = {
      employeeId: empId,
      leaveType: data.leaveType,
      fromDate: cleanStart, // Per backend schema
      toDate: cleanEnd,     // Per backend schema
      reason: data.reason || "",
    };

   

    // Try multiple possible endpoints
    const endpoints = [
      `${API_URL}/leaves/request`,
      `${API_URL}/leave/request`,
      `http://localhost:5000/api/leaves/request`,
      `http://localhost:5000/api/leave/request`
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
          const result = await res.json();
       
          return { success: true };
        } else if (res.status !== 404) {
          const err = await res.json();
        
          return { success: false, error: err.message };
        }
      } catch (e) {
        lastError = e;
       
      }
    }

    return { success: false, error: "Failed to connect to server" };
  } catch (err) {
   
    return { success: false };
  }
};

export const fetchMyLeaveRequestsFromApi = async (_email?: string) => {
  try {
    const token = getToken();
    if (!token) return [];

    const empId = getLoggedInEmployeeId();
    if (!empId) {
     
      return [];
    }

    // Try multiple possible endpoints
    const endpoints = [
      `${API_URL}/leaves/employee/${empId}`,
      `${API_URL}/leave/employee/${empId}`,
      `http://localhost:5000/api/leaves/employee/${empId}`,
      `http://localhost:5000/api/leave/employee/${empId}`
    ];

    let rawData = null;
    for (const url of endpoints) {
      try {
      
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          rawData = await res.json();
          
          break;
        }
      } catch (e) {
       
      }
    }

    if (!rawData) return [];

    // Flattening grouped data: [{ date: "...", employees: [...] }]
    let flattened: any[] = [];
    if (Array.isArray(rawData)) {
      rawData.forEach((group: any) => {
        if (group.employees && Array.isArray(group.employees)) {
          // Add the date from parent if child doesn't have it (fallback)
          group.employees.forEach((emp: any) => {
            flattened.push({ ...emp, parentDate: group.date });
          });
        } else if (group.employeeId) {
          flattened.push(group);
        }
      });
    } else if (rawData?.leaves || rawData?.data) {
      flattened = rawData.leaves || rawData.data;
    }

    
    const mapped = flattened.map((req: any) => {
      const startDate = req.fromDate || req.startDate || req.parentDate || "";
      const endDate = req.toDate || req.endDate || startDate || "";

      const cleanStart = typeof startDate === "string" ? startDate.split("T")[0] : "";
      const cleanEnd = typeof endDate === "string" ? endDate.split("T")[0] : "";

      let totalDays = req.totalDays || req.days || 0;
      if (!totalDays && cleanStart && cleanEnd) {
        const d1 = new Date(cleanStart);
        const d2 = new Date(cleanEnd);
        totalDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (isNaN(totalDays)) totalDays = 0;
      }

      return {
        id: req._id || req.id || `${cleanStart}-${cleanEnd}-${Math.random()}`,
        leaveType: req.leaveType || "Leave",
        startDate: cleanStart,
        endDate: cleanEnd,
        totalDays: totalDays,
        status: req.status || "Pending",
        reason: req.reason || "",
      };
    });

    
    return mapped;
  } catch (err) {
   
    return [];
  }
};

export const getMyLeaveRequests = async (email: string) => {
  return fetchMyLeaveRequestsFromApi(email);
};

export const listenToMyLeaveRequests = (
  email: string,
  callback: (data: any[]) => void
) => {
  let cancelled = false;

  const run = async () => {
    try {
      const list = await fetchMyLeaveRequestsFromApi(email);
      if (cancelled) return;
      callback(list);
    } catch {
      if (cancelled) return;
      callback([]);
    }
  };

  void run();
  const id = window.setInterval(run, 30000);

  return () => {
    cancelled = true;
    window.clearInterval(id);
  };
};
