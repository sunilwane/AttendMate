import React, { useState, useEffect } from "react";
import {
  IonToolbar,
  IonPopover,
  IonList,
  IonItem,
  IonSpinner,
  IonIcon,
  IonBadge
} from "@ionic/react";

import { personCircleOutline, notificationsOutline } from "ionicons/icons";

import Logo from "../assets/main_logo.png";
import ProfileIcon from "../assets/user.png";
import LogoutIcon from "../assets/logout.png";

import "../theme/components/AppHeader.css";
import { fetchHeaderUserData } from "../Services/HeaderService";
import ConfirmLogoutPopup from "./ConfirmLogoutPopup";
import Notifications from "./Notifications";
import { fetchNotifications } from "../Services/NotificationService";

const AppHeader: React.FC<{ title?: string }> = ({ title = "AttendMate" }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [profilePopoverEvent, setProfilePopoverEvent] = useState<any>(null);

  const [showNotificationPopover, setShowNotificationPopover] = useState(false);
  const [notificationPopoverEvent, setNotificationPopoverEvent] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) return;

      const data = await fetchHeaderUserData(userEmail);
      setPhotoUrl(data.photo);
      setUserName(data.name);

      setLoadingPhoto(false);
    };

    const loadInitialNotifications = async () => {
      const data = await fetchNotifications();
      setUnreadCount(data.filter(n => !n.isRead).length);
    };

    loadUserData();
    loadInitialNotifications();
  }, [userEmail]);

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  const getInitial = () => {
    if (userName && userName.trim().length > 0) {
      return userName.trim().charAt(0).toUpperCase();
    }
    if (userEmail && userEmail.trim().length > 0) {
      return userEmail.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <IonToolbar className="app-header-toolbar">

      <div slot="start" className="header-left">
        <img src={Logo} alt="Logo" className="app-logo" />
        <h1 className="app-title">{title}</h1>
      </div>

      <div slot="end" className="header-right">
        <div
          className="notification-trigger"
          onClick={(e) => {
            setNotificationPopoverEvent(e.nativeEvent);
            setShowNotificationPopover(true);
          }}
        >
          <IonIcon icon={notificationsOutline} className="notification-icon-header" />
          {unreadCount > 0 && (
            <IonBadge color="danger" className="notification-badge">
              {unreadCount}
            </IonBadge>
          )}
        </div>

        <div
          className="avatar-trigger"
          onClick={(e) => {
            setProfilePopoverEvent(e.nativeEvent);
            setShowProfilePopover(true);
          }}
        >
          {loadingPhoto ? (
            <IonSpinner name="dots" color="medium" className="avatar-size" />
          ) : photoUrl && !photoError ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="avatar-size"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <div className="avatar-fallback">
              {getInitial()}
            </div>
          )}
        </div>
      </div>

      <IonPopover
        isOpen={showNotificationPopover}
        event={notificationPopoverEvent}
        onDidDismiss={() => setShowNotificationPopover(false)}
        backdropDismiss={true}
        className="notifications-popover"
        size="auto"
      >
        <Notifications
          onUnreadCountChange={setUnreadCount}
          onClose={() => setShowNotificationPopover(false)}
        />
      </IonPopover>

      <IonPopover
        isOpen={showProfilePopover}
        event={profilePopoverEvent}
        onDidDismiss={() => setShowProfilePopover(false)}
        backdropDismiss={true}
        showBackdrop={true}
        side="bottom"
        alignment="end"
        className="profile-popover"
        size="auto"
        arrow={false}
      >
        <IonList lines="none">

          <IonItem
            button
            routerLink="/profile"
            detail={false}
            onClick={() => setShowProfilePopover(false)}
          >
            <img src={ProfileIcon} className="menu-icon" />
            View Profile
          </IonItem>

          <IonItem
            button
            detail={false}
            onClick={() => {
              setShowProfilePopover(false);
              setShowLogoutConfirm(true);
            }}
          >
            <img src={LogoutIcon} className="menu-icon" />
            Logout
          </IonItem>

        </IonList>
      </IonPopover>

      <ConfirmLogoutPopup
        isOpen={showLogoutConfirm}
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

    </IonToolbar>
  );
};

export default AppHeader;
