import React, { useEffect, useState } from "react";
import { IonIcon, IonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  pencilOutline,
  settingsOutline,
  helpCircleOutline,
  calendarOutline,
  logOutOutline,
} from "ionicons/icons";

import Skeleton from "./Skeleton";
import "../theme/components/Profile.css";
import ConfirmLogoutPopup from "./ConfirmLogoutPopup";

import { fetchUserProfile } from "../Services/ProfileService";

interface ProfileComProps {
  onLogout: () => void;
}

const ProfileCom: React.FC<ProfileComProps> = ({ onLogout }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const history = useHistory();

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const loadData = async () => {
      if (!userEmail) return;
      const data = await fetchUserProfile(userEmail);
      setUserData(data);
      setLoading(false);
    };
    loadData();
  }, [userEmail]);

  const getInitial = () => {
    if (userData?.Name?.trim()) {
      return userData.Name.trim().split(" ")[0].charAt(0).toUpperCase();
    }
    if (userData?.Email?.trim()) {
      return userData.Email.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="profile-container">

      {loading ? (
        <div className="skeleton-center">
          <Skeleton width="110px" height="110px" borderRadius="50%" style={{ margin: "0 auto 20px" }} />
          <Skeleton width="160px" height="22px" style={{ margin: "10px auto 2px" }} />
          <Skeleton width="200px" height="15px" style={{ margin: "0 auto 20px" }} />

          <div className="profile-info-box">
            <Skeleton width="80px" height="13px" style={{ margin: "0 auto 6px" }} />
            <Skeleton width="120px" height="15px" style={{ margin: "0 auto" }} />
          </div>

          <div className="profile-options">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="profile-option-item">
                <div className="profile-option-left">
                  <Skeleton width="20px" height="20px" style={{ marginRight: "12px" }} />
                  <Skeleton width="120px" height="15px" />
                </div>
                <Skeleton width="18px" height="18px" />
              </div>
            ))}
          </div>

          <div className="logout-section">
            <div className="logout-left">
              <Skeleton width="20px" height="20px" style={{ marginRight: "10px" }} />
              <Skeleton width="80px" height="15px" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-photo-wrapper">
            {userData?.Photo &&
              !photoError &&
              !userData.Photo.includes("placehold.co") ? (
              <img
                src={userData.Photo}
                alt="Profile"
                className="profile-photo"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <span>{getInitial()}</span>
            )}
          </div>

          <h2 className="profile-name">{userData?.Name || "Unknown User"}</h2>

          <p className="profile-email">
            {userData?.Email || "No email found"}
          </p>

          <div className="profile-info-box">
            <p className="profile-info-title">Date Joined</p>
            <p className="profile-info-value">
              {userData?.DateOfJoining || "Not Available"}
            </p>
          </div>

          <div className="profile-options">
            {[
              { icon: pencilOutline, label: "Edit Profile Details" },
              { icon: calendarOutline, label: "Leave Request" },
              { icon: settingsOutline, label: "Settings" },
              { icon: helpCircleOutline, label: "Help & Support" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="profile-option-item"
                onClick={() => {
                  if (item.label === "Leave Request") {
                    history.push("/leave-request");
                  } else if (item.label === "Help & Support") {
                    history.push("/help-support");
                  } else {
                    alert(`${item.label} (Coming soon...)`);
                  }
                }}
              >
                <div className="profile-option-left">
                  <IonIcon
                    icon={item.icon}
                    className="profile-option-icon"
                  />
                  <span className="profile-option-label">{item.label}</span>
                </div>
                <span className="profile-option-arrow">›</span>
              </div>
            ))}
          </div>

          <div
            className="logout-section"
            onClick={() => setShowLogoutAlert(true)}
          >
            <div className="logout-left">
              <IonIcon icon={logOutOutline} className="logout-icon" />
              <span className="logout-text">Log Out</span>
            </div>
          </div>

          <ConfirmLogoutPopup
            isOpen={showLogoutAlert}
            onConfirm={onLogout}
            onCancel={() => setShowLogoutAlert(false)}
          />
        </>
      )}
    </div>
  );
};

export default ProfileCom;
