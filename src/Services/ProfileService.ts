

const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";


const getToken = (): string | null => {
  return localStorage.getItem("employeeToken");
};

export const fetchUserProfile = async (email: string) => {
  try {
    const token = getToken();

    if (!token) {

      return null;
    }

    const response = await fetch(`${API_URL}/employees/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {

      return null;
    }

    const data = await response.json();

    if (data.employee) {
      return {
        Name: data.employee.name,
        Email: data.employee.email,
        Phone: data.employee.phone,
        Department: data.employee.department,
        Designation: data.employee.designation,
        DateOfJoining: data.employee.joiningDate
          ? new Date(data.employee.joiningDate).toLocaleDateString()
          : "Not Available",
        Photo: data.employee.image || "",
        EmployeeId: data.employee.employeeId,
        Address: data.employee.address,
      };
    }

    return null;
  } catch (error) {

    return null;
  }
};