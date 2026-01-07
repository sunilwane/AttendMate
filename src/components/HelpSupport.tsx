import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonTextarea,
    IonLoading,
    IonToast,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonCard,
    IonCardContent,
} from "@ionic/react";
import {
    closeOutline,
    chevronForwardOutline,
    sendOutline,
    checkmarkCircleOutline,
    timeOutline,
    alertCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";

import "../theme/components/HelpSupport.css";
import { createTicket, getEmployeeTickets, addReply, getTicketById, type Ticket } from "../Services/HelpSupportService";

const HelpSupport: React.FC = () => {
    const history = useHistory();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState<"success" | "danger">("success");
    const [view, setView] = useState<"categories" | "form" | "tickets" | "detail">("categories");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const categories = [
        "Clock In / Clock Out Problem",
        "Leave Request Issues",
        "Missing or Incorrect Hours",
        "Cannot Access My Account",
        "Error in Attendance Reports",
        "Other",
    ];

    useEffect(() => {
        if (view === "tickets") {
            loadTickets();
        }
    }, [view]);

    const loadTickets = async () => {
        setLoadingTickets(true);
        const data = await getEmployeeTickets();
        setTickets(data);
        setLoadingTickets(false);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setView("form");
    };

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setView("detail");
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;

        setSendingReply(true);
        const result = await addReply(selectedTicket._id, replyText.trim());
        setSendingReply(false);

        if (result.success) {
            setReplyText("");
            // Refresh ticket data to show new reply
            const updatedTicket = await getTicketById(selectedTicket._id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
                // Also update in list
                setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
            }
        } else {
            setToastMessage(result.error || "Failed to send reply");
            setToastColor("danger");
            setShowToast(true);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCategory || !description.trim()) {
            setToastMessage("Please provide a description");
            setToastColor("danger");
            setShowToast(true);
            return;
        }

        setLoading(true);
        const result = await createTicket({
            issueType: selectedCategory,
            description: description.trim(),
            priority: "Medium",
        });

        setLoading(false);

        if (result.success) {
            setToastMessage("Ticket created successfully!");
            setToastColor("success");
            setShowToast(true);
            setDescription("");
            setSelectedCategory(null);
            setView("categories");
        } else {
            setToastMessage(result.error || "Failed to create ticket");
            setToastColor("danger");
            setShowToast(true);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Resolved":
            case "Closed":
                return checkmarkCircleOutline;
            case "In Progress":
                return timeOutline;
            default:
                return alertCircleOutline;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Resolved":
            case "Closed":
                return "success";
            case "In Progress":
                return "warning";
            default:
                return "primary";
        }
    };

    return (
        <IonPage>
            <IonHeader className="help-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Get Help</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="help-content">
                <IonSegment
                    value={view === "form" ? "categories" : view}
                    onIonChange={(e) => setView(e.detail.value as any)}
                    style={{ margin: "16px" }}
                >
                    <IonSegmentButton value="categories">
                        <IonLabel>Report Issue</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="tickets">
                        <IonLabel>My Tickets</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {view === "categories" && (
                    <div className="help-box">
                        <h2>Report Attendance Issue</h2>
                        <p>
                            Browse common attendance-related issues and get in touch with our
                            Support team below.
                        </p>

                        <IonList lines="full">
                            {categories.map((item, index) => (
                                <IonItem key={index} button onClick={() => handleCategorySelect(item)}>
                                    <IonLabel>{item}</IonLabel>
                                    <IonIcon icon={chevronForwardOutline} slot="end" />
                                </IonItem>
                            ))}
                        </IonList>
                    </div>
                )}

                {view === "form" && (
                    <div className="help-box">
                        <h2>{selectedCategory}</h2>
                        <p>Please describe your issue in detail:</p>

                        <IonTextarea
                            value={description}
                            onIonInput={(e) => setDescription(e.detail.value || "")}
                            placeholder="Describe your issue here..."
                            rows={6}
                            style={{
                                background: "#f5f5f5",
                                borderRadius: "12px",
                                padding: "12px",
                                marginTop: "12px",
                            }}
                        />

                        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={() => {
                                    setView("categories");
                                    setSelectedCategory(null);
                                    setDescription("");
                                }}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </IonButton>
                            <IonButton
                                expand="block"
                                onClick={handleSubmit}
                                disabled={!description.trim()}
                                style={{ flex: 1 }}
                            >
                                <IonIcon icon={sendOutline} slot="start" />
                                Submit
                            </IonButton>
                        </div>
                    </div>
                )}

                {view === "tickets" && (
                    <div className="help-box">
                        <h2>My Support Tickets</h2>
                        <p>View the status of your submitted tickets</p>

                        {loadingTickets ? (
                            <div style={{ textAlign: "center", padding: "40px" }}>
                                <IonLoading isOpen={loadingTickets} message="Loading tickets..." />
                            </div>
                        ) : tickets.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>
                                No tickets found
                            </p>
                        ) : (
                            <IonList>
                                {tickets.map((ticket) => (
                                    <IonCard key={ticket._id} style={{ margin: "12px 0" }} button onClick={() => handleTicketClick(ticket)}>
                                        <IonCardContent>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
                                                        {ticket.issueType}
                                                    </h3>
                                                    <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                                                        {ticket.description}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <IonBadge color={getStatusColor(ticket.status)} style={{ marginLeft: "12px" }}>
                                                    <IonIcon icon={getStatusIcon(ticket.status)} style={{ marginRight: "4px" }} />
                                                    {ticket.status}
                                                </IonBadge>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                ))}
                            </IonList>
                        )}
                    </div>
                )}

                {view === "detail" && selectedTicket && (
                    <div className="help-box" style={{ paddingBottom: "20px" }}>
                        <IonButton fill="clear" onClick={() => setView("tickets")} style={{ marginLeft: "-16px" }}>
                            <IonIcon icon={chevronForwardOutline} style={{ transform: "rotate(180deg)" }} slot="start" />
                            Back to Tickets
                        </IonButton>

                        <div style={{ marginTop: "16px" }}>
                            <IonBadge color={getStatusColor(selectedTicket.status)} className="ticket-status-badge">
                                <IonIcon icon={getStatusIcon(selectedTicket.status)} style={{ marginRight: "4px" }} />
                                {selectedTicket.status}
                            </IonBadge>
                            <h2>{selectedTicket.issueType}</h2>
                            <p style={{ color: "#333", fontSize: "16px", marginBottom: "20px" }}>
                                {selectedTicket.description}
                            </p>

                            <div style={{ borderTop: "1px solid #eee", paddingTop: "16px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#999", marginBottom: "16px" }}>
                                    TICKET HISTORY & REPLIES
                                </h3>

                                <div className="replies-container">
                                    {/* Initial description as first "message" */}
                                    <div className="reply-bubble employee">
                                        <span className="reply-header">You</span>
                                        {selectedTicket.description}
                                        <span className="reply-time">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>

                                    {/* Dynamic replies from HR or User */}
                                    {selectedTicket.replies && selectedTicket.replies.map((reply, idx) => (
                                        <div key={idx} className={`reply-bubble ${reply.repliedBy === "HR" ? "hr" : "employee"}`}>
                                            <span className="reply-header">{reply.repliedBy}</span>
                                            {reply.message}
                                            <span className="reply-time">
                                                {new Date(reply.repliedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}

                                    {selectedTicket.status === "Resolved" && (
                                        <div style={{ textAlign: "center", padding: "12px", background: "#f8f9fa", borderRadius: "8px", marginTop: "12px" }}>
                                            <p style={{ margin: 0, color: "#28a745", fontWeight: "600" }}>
                                                ✅ This ticket has been marked as Resolved
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {selectedTicket.status !== "Resolved" && (
                                    <div style={{ borderTop: "1px solid #eee", paddingTop: "20px", marginTop: "20px" }}>
                                        <IonTextarea
                                            value={replyText}
                                            onIonInput={(e) => setReplyText(e.detail.value || "")}
                                            placeholder="Type your reply..."
                                            rows={3}
                                            style={{
                                                background: "#fdfdfd",
                                                border: "1px solid #ddd",
                                                borderRadius: "12px",
                                                padding: "12px",
                                            }}
                                        />
                                        <IonButton
                                            expand="block"
                                            onClick={handleSendReply}
                                            disabled={sendingReply || !replyText.trim()}
                                            style={{ marginTop: "12px" }}
                                        >
                                            {sendingReply ? "Sending..." : "Send Reply"}
                                        </IonButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </IonContent>

            <IonLoading isOpen={loading} message="Creating ticket..." />
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={3000}
                color={toastColor}
            />
        </IonPage>
    );
};

export default HelpSupport;

