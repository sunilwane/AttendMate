import React, { useEffect, useState } from "react";
import {
    IonApp,
    IonSpinner,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import GlobalNetworkGuard from "./Network/GlobalNetworkGuard";

import { StatusBar, Style } from "@capacitor/status-bar";
import { Device } from "@capacitor/device";

import Login from "./auth/Login";
import HomeTabs from "./routes/Routing";
import LeaveReqPage from "./pages/LeaveReqPage";
import LeaveForm from "./components/Leave-Form";
import HelpSupportPage from "./pages/HelpSupportPage";
import NotificationsPage from "./pages/NotificationsPage";

import { initPushNotifications } from "./Services/PushNotificationSetup";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

setupIonicReact();

const updateStatusBarForInvertedCutout = async () => {
    try {
        const info = await Device.getInfo();
        if (info.platform !== "android" && info.platform !== "ios") return;

        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (isDarkMode) {
            await StatusBar.setBackgroundColor({ color: "#ffffff" });
            await StatusBar.setStyle({ style: Style.Dark });
        } else {
            await StatusBar.setBackgroundColor({ color: "#000000" });
            await StatusBar.setStyle({ style: Style.Light });
        }

        await StatusBar.setOverlaysWebView({ overlay: true });
    } catch (error) {

    }
};

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        updateStatusBarForInvertedCutout();

        const listener = window.matchMedia("(prefers-color-scheme: dark)");
        listener.addEventListener("change", updateStatusBarForInvertedCutout);

        return () => {
            listener.removeEventListener("change", updateStatusBarForInvertedCutout);
        };
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("isLoggedIn");
        setIsLoggedIn(saved === "true");
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            initPushNotifications();
        }
    }, [isLoggedIn]);

    const handleLogin = (email: string) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        setIsLoggedIn(true);
    };

    if (isLoggedIn === null) {
        return (
            <IonApp>
                <div
                    style={{
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#f4f5f8",
                    }}
                >
                    <IonSpinner name="crescent" />
                </div>
            </IonApp>
        );
    }

    return (
        <IonApp>
            <GlobalNetworkGuard>
                <IonReactRouter>
                    <IonRouterOutlet>
                        <Route exact path="/">
                            <Redirect to={isLoggedIn ? "/home" : "/login"} />
                        </Route>

                        <Route exact path="/login">
                            {isLoggedIn ? <Redirect to="/home" /> : <Login onLogin={handleLogin} />}
                        </Route>

                        <Route path="/home">
                            {isLoggedIn ? <HomeTabs /> : <Redirect to="/login" />}
                        </Route>

                        <Route path="/profile">
                            {isLoggedIn ? <HomeTabs /> : <Redirect to="/login" />}
                        </Route>

                        <Route path="/history">
                            {isLoggedIn ? <HomeTabs /> : <Redirect to="/login" />}
                        </Route>

                        <Route path="/leave-form">
                            {isLoggedIn ? <LeaveForm /> : <Redirect to="/login" />}
                        </Route>
                        <Route path="/leave-request">
                            {isLoggedIn ? <LeaveReqPage /> : <Redirect to="/login" />}
                        </Route>
                        <Route path="/help-support">
                            {isLoggedIn ? <HelpSupportPage /> : <Redirect to="/login" />}
                        </Route>
                        <Route path="/notifications">
                            {isLoggedIn ? <NotificationsPage /> : <Redirect to="/login" />}
                        </Route>
                    </IonRouterOutlet>
                </IonReactRouter>
            </GlobalNetworkGuard>
        </IonApp>
    );
};

export default App;