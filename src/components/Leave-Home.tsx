import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from "@ionic/react";
import {
    calendarOutline,
    medkitOutline,
    personOutline,
    addOutline,
} from "ionicons/icons";
import "../theme/components/Leave-Home.css";
import { listenToMyLeaveRequests } from "../Services/LeaveService";

const LeaveHome: React.FC = () => {
    const history = useHistory();
    const [selectedSegment, setSelectedSegment] = useState("pending");
    const [historyFilter, setHistoryFilter] = useState("All");
    const userEmail = localStorage.getItem("userEmail");
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getStatusClass = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "approved") return "approved-status";
        if (s === "rejected") return "rejected-status";
        if (s === "cancelled") return "rejected-status";
        return "pending-status";
    };

    const getIconClass = (type: string) => {
        const t = (type || "").toLowerCase();
        if (t.includes("sick")) return "sick-icon";
        if (t.includes("personal")) return "personal-icon";
        return "annual-icon";
    };

    const getIcon = (type: string) => {
        const t = (type || "").toLowerCase();
        if (t.includes("sick")) return medkitOutline;
        if (t.includes("personal")) return personOutline;
        return calendarOutline;
    };

    useEffect(() => {
        if (!userEmail) return;
        setLoading(true);

        const unsubscribe = listenToMyLeaveRequests(userEmail, (data: any[]) => {
          
            setLeaveRequests(data);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [userEmail]);

    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const today = getTodayDateString();

    // Derived lists
    const sortedAll = [...leaveRequests].sort((a, b) =>
        String(a.startDate || "").localeCompare(String(b.startDate || ""))
    );

    const upcoming = sortedAll.filter((l) => {
        const dateToCompare = l.endDate || l.startDate;
        return dateToCompare && dateToCompare >= today;
    });

    const historyList = sortedAll.filter((l) => {
        const dateToCompare = l.endDate || l.startDate;
        return !dateToCompare || dateToCompare < today;
    }).reverse();

    

    const filteredHistory =
        historyFilter === "All"
            ? historyList
            : historyList.filter(
                (req) =>
                    req.status?.toLowerCase() === historyFilter.toLowerCase()
            );

    const SkeletonCard = () => (
        <div className="skeleton-card">
            <div className="skeleton-icon"></div>
            <div className="skeleton-lines">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
            </div>
            <div className="skeleton-status"></div>
        </div>
    );

    return (
        <div className="leave-container-fixed">
            <div className="leave-fixed-header">
                <h2 className="leave-section-title">My Requests</h2>
                <IonSegment
                    value={selectedSegment}
                    onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
                    className="leave-segment"
                >
                    <IonSegmentButton value="pending">
                        <IonLabel>Upcoming</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="history">
                        <IonLabel>History</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {selectedSegment === "history" && (
                    <div className="history-filter">
                        {["All", "Approved", "Rejected"].map(
                            (f) => (
                                <button
                                    key={f}
                                    className={`filter-btn ${historyFilter === f ? "active" : ""
                                        }`}
                                    onClick={() => setHistoryFilter(f)}
                                >
                                    {f}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="records-scroll-area">
                <div className="leave-requests">
                    {selectedSegment === "pending" &&
                        (loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : upcoming.length === 0 ? (
                            <p className="no-data">You don't have any upcoming requests.</p>
                        ) : (
                            upcoming.map((req, idx) => (
                                <IonCard className="request-card" key={req.id || idx}>
                                    <IonCardContent className="request-content">
                                        <div className={`request-icon-wrapper ${getIconClass(req.leaveType)}`}>
                                            <IonIcon icon={getIcon(req.leaveType)} />
                                        </div>
                                        <div className="request-info">
                                            <p className="request-title">{req.leaveType} Leave</p>
                                            <p className="request-date">
                                                {req.startDate} - {req.endDate} ({req.totalDays} Days)
                                            </p>
                                        </div>
                                        <div className={`request-status ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))
                        ))}

                    {selectedSegment === "history" &&
                        (loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : filteredHistory.length === 0 ? (
                            <p className="no-data">You don't have any past requests.</p>
                        ) : (
                            filteredHistory.map((req, idx) => (
                                <IonCard className="request-card" key={req.id || idx}>
                                    <IonCardContent className="request-content">
                                        <div className={`request-icon-wrapper ${getIconClass(req.leaveType)}`}>
                                            <IonIcon icon={getIcon(req.leaveType)} />
                                        </div>
                                        <div className="request-info">
                                            <p className="request-title">{req.leaveType} Leave</p>
                                            <p className="request-date">
                                                {req.startDate} - {req.endDate} ({req.totalDays} Days)
                                            </p>
                                        </div>
                                        <div className={`request-status ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))
                        ))}
                </div>
            </div>

            <IonFab vertical="bottom" horizontal="end" slot="fixed" className="fab-wrapper">
                <IonFabButton className="fab-button" onClick={() => history.push("/leave-form")}>
                    <IonIcon icon={addOutline} />
                </IonFabButton>
            </IonFab>
        </div>
    );
};

export default LeaveHome;
