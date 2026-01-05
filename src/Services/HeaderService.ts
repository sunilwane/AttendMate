const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";

const getToken = () => localStorage.getItem("employeeToken");

export const fetchHeaderUserData = async (email?: string) => {
  try {
    const token = getToken();
    if (!token) return { photo: null, name: null };

    const res = await fetch(`${API_URL}/employees/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) return { photo: null, name: null };

    const data = await res.json();
    const emp = data.employee || data;

    return {
      photo: emp.image || emp.Photo || emp.profilePicture || emp.avatar || null,
      name: emp.name || emp.Name || null
    };

  } catch (err) {
    console.error("Error fetching header data:", err);
    return { photo: null, name: null };
  }
};
