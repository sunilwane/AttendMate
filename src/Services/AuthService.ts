
const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";

export const loginEmployee = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/employees/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
           
            localStorage.setItem("employeeToken", data.token);
            localStorage.setItem("employeeData", JSON.stringify(data.employee));
            localStorage.setItem("userEmail", data.employee.email);
            localStorage.setItem("isLoggedIn", "true");

            return { success: true, data };
        } else {
            return {
                success: false,
                message: data.message || "Invalid email or password"
            };
        }
    } catch (error: any) {
        console.error("Login service error:", error);
        let errorMessage = "Login failed. Please check your connection.";

        if (error instanceof TypeError) {
            if (error.message.includes("fetch")) {
                errorMessage = "Failed to connect to the server. Please check if the backend is running and accessible.";
            } else if (error.message.includes("NetworkError")) {
                errorMessage = "Network error. Please check your internet connection.";
            }
        } else if (error.message) {
            errorMessage = `Login error: ${error.message}`;
        }

        return { success: false, message: errorMessage };
    }
};

export const logoutEmployee = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeData");
    localStorage.removeItem("userEmail");
    localStorage.setItem("isLoggedIn", "false");
  
};

export const isAuthenticated = (): boolean => {
    return localStorage.getItem("isLoggedIn") === "true" && !!localStorage.getItem("employeeToken");
};
