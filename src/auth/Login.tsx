import React, { useState, useRef, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonToast,
    IonSpinner,
    IonIcon,
    IonButton,
    IonAlert,
} from "@ionic/react";
import {
    eyeOutline,
    eyeOffOutline,
    mailOutline,
    lockClosedOutline,
} from "ionicons/icons";
import "../theme/components/Login.css";
import Logo from "../assets/main_logo.png";

interface LoginProps {
    onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState<"danger" | "success">("danger");
    const [showToast, setShowToast] = useState(false);

    const [showDiagAlert, setShowDiagAlert] = useState(false);
    const [diagHeader, setDiagHeader] = useState("");
    const [diagMessage, setDiagMessage] = useState("");

    const emailRef = useRef(email);
    const passwordRef = useRef(password);
    const contentRef = useRef<HTMLIonContentElement>(null);


    const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend-femy.onrender.com/api";


    const scrollUpForPassword = () => {
        setTimeout(() => {
            contentRef.current?.scrollToPoint(0, 220, 300);
        }, 100);
    };

    useEffect(() => {
        const handleKeyboardShow = () => {
            setTimeout(() => {
                contentRef.current?.scrollToPoint(0, 100, 300);
            }, 100);
        };

        const handleKeyboardHide = () => {
            contentRef.current?.scrollToTop(300);
        };

        window.addEventListener("keyboardWillShow", handleKeyboardShow);
        window.addEventListener("keyboardWillHide", handleKeyboardHide);

        return () => {
            window.removeEventListener("keyboardWillShow", handleKeyboardShow);
            window.removeEventListener("keyboardWillHide", handleKeyboardHide);
        };
    }, []);

    const runDiagnostics = async () => {
        setLoading(true);
        setDiagHeader("Running Diagnostics...");
        setDiagMessage("Testing connections, please wait...");
        setShowDiagAlert(true);

        const results = [];

        // 1. Test Public API
        try {
            const start = Date.now();
            const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
            const duration = Date.now() - start;
            results.push(`✅ Public API (JsonPlaceholder): OK (${duration}ms)`);
        } catch (err: any) {
            results.push(`❌ Public API: FAILED (${err.message})`);
        }

        // 2. Test Backend Health (Root)
        try {
            const baseUrl = API_URL.replace("/api", "");
            const start = Date.now();
            const res = await fetch(baseUrl);
            const duration = Date.now() - start;
            results.push(`✅ Backend Root: OK (${duration}ms) - Status: ${res.status}`);
        } catch (err: any) {
            results.push(`❌ Backend Root: FAILED (${err.message})`);
        }

        // 3. Test Backend API Endpoint
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/employees/login`, { method: "GET" });
            const duration = Date.now() - start;
            results.push(`✅ Backend /api/employees/login: OK (${duration}ms) - Status: ${res.status}`);
        } catch (err: any) {
            results.push(`❌ Backend API: FAILED (${err.message}). This usually means CORS is blocking the request from the app.`);
        }

        setLoading(false);
        setDiagHeader("Diagnostic Results");
        setDiagMessage(results.join("\n\n"));
    };

    const handleLogin = async () => {

        const trimmedEmail = emailRef.current.trim();
        const trimmedPassword = passwordRef.current.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setToastMessage("Please enter email and password");
            setToastColor("danger");
            setShowToast(true);
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(`${API_URL}/employees/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password: trimmedPassword,
                }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem("employeeToken", data.token);
                localStorage.setItem("employeeData", JSON.stringify(data.employee));
                localStorage.setItem("userEmail", data.employee.email);
                localStorage.setItem("isLoggedIn", "true");


                setToastMessage("Login successful!");
                setToastColor("success");
                setShowToast(true);

                setTimeout(() => {
                    setLoading(false);
                    onLogin(data.employee.email);
                    window.location.href = "/home";
                }, 800);
            } else {
                setToastMessage(data.message || "Invalid email or password");
                setToastColor("danger");
                setShowToast(true);
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Login error:", error);
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

            setToastMessage(errorMessage);
            setToastColor("danger");
            setShowToast(true);
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent ref={contentRef} fullscreen className="page-bg" scrollY={true}>
                <div className="card">
                    <div className="logo-box">
                        <img src={Logo} alt="Logo" className="logo-image" />
                    </div>

                    <h1 className="welcome">AttendMate</h1>
                    <p className="subtext">Scalar TechHub</p>

                    <label className="field-label">Email Address</label>
                    <div className="field-wrapper">
                        <IonIcon icon={mailOutline} className="field-icon" />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="field-input"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                emailRef.current = e.target.value;
                            }}
                        />
                    </div>

                    <label className="field-label">Password</label>
                    <div className="field-wrapper">
                        <IonIcon icon={lockClosedOutline} className="field-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="field-input"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                passwordRef.current = e.target.value;
                            }}
                            onFocus={scrollUpForPassword}
                        />
                        <IonIcon
                            icon={showPassword ? eyeOffOutline : eyeOutline}
                            onClick={() => setShowPassword(!showPassword)}
                            className="eye-toggle"
                        />
                    </div>

                    <div className="forgot-container">
                        <span className="forgot-link">Forgot Password?</span>
                    </div>

                    <IonButton
                        expand="block"
                        onClick={handleLogin}
                        disabled={loading}
                        className="signin-btn"
                    >
                        {loading ? <IonSpinner name="crescent" /> : "Sign In"}
                    </IonButton>

                    <p className="signup-text">
                        Don't have an account?
                        <span
                            className="signup-link"
                            onClick={() => {
                                window.location.href = "mailto:hr@scalartechhub.com";
                            }}
                        >
                            Contact HR
                        </span>
                    </p>

                    <IonToast
                        isOpen={showToast}
                        message={toastMessage}
                        duration={2000}
                        position="top"
                        color={toastColor}
                        onDidDismiss={() => setShowToast(false)}
                        style={{ "--border-radius": "10px" }}
                    />

                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <IonButton
                            fill="clear"
                            size="small"
                            color="medium"
                            onClick={runDiagnostics}
                            style={{ "--opacity": "0.6", fontSize: "12px" }}
                        >
                            Run Connection Diagnostics
                        </IonButton>
                    </div>

                    <IonAlert
                        isOpen={showDiagAlert}
                        onDidDismiss={() => setShowDiagAlert(false)}
                        header={diagHeader}
                        message={diagMessage}
                        buttons={["OK"]}
                        cssClass="diag-alert"
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
