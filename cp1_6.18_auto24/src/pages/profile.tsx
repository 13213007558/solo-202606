import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserProfile, UserProfile, UserBadge, JoinedActivity } from "../api/events";
import { useApp } from "./main";

interface BadgeModalProps {
  open: boolean;
  badge: { name: string; icon: string; description: string; earnedAt: string } | null;
  onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ open, badge, onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
    }
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 240);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open || !badge) return null;


  return (
    <div
      className={"modal-overlay " + (closing ? "closing" : "")}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26, 46, 31, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: closing ? "modalFadeOut 250ms ease-in forwards" : "fadeIn 300ms ease-out",
      }}
    >
      <div
        className={"modal-content " + (closing ? "closing" : "")}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 24,
          padding: 40,
          maxWidth: 440,
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: closing ? "modalZoomOut 250ms ease-in forwards" : "modalZoomIn 300ms ease-out",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 120, lineHeight: 1, marginBottom: 20 }}>{badge.icon}</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#2D6B3B", marginBottom: 8 }}>{badge.name}</h2>
          <div style={{ fontSize: 13, color: "#8FA094", marginBottom: 24 }}>
            获得于 {new Date(badge.earnedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #F5E6CC 0%, #E8C89A 100%)",
              padding: 16,
              borderRadius: 12,
              marginBottom: 28,
              color: "#5A4A3A",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {badge.description}
          </div>
          <button className="btn btn-outline btn-lg" onClick={handleClose}>
            关闭
          </button>
        </div>
      </div>
      <style>{"@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } } @keyframes modalZoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } } @keyframes modalZoomOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.85); } }"}</style>
    </div>
  );
};

interface ProgressRingProps {
  totalHours: number;
  targetHours: number;
};

const ProgressRing: React.FC<ProgressRingProps> = ({ totalHours, targetHours }) => {
  const [displayHours, setDisplayHours] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayHours(0);
    startTimeRef.current = null;

    const duration = 1200;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayHours(Math.round(totalHours * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [totalHours]);

  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totalHours / targetHours, 1);
  const offset = circumference * (1 - progress);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 4px 20px rgba(45, 107, 59, 0.1)",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F5E6CC"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#warmGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={"rotate(-90 " + (size / 2) + " " + (size / 2) + ")"}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <defs>
            <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4A76A" />
              <stop offset="100%" stopColor="#B8905A" />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 800, color: "#2D6B3B" }}>
            {displayHours}
          </div>
          <div style={{ fontSize: 13, color: "#5A6B5F", fontWeight: 500 }}>
            小时
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, color: "#5A6B5F", marginBottom: 6 }}>
          目标：{targetHours} 小时
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#D4A76A",
            fontWeight: 600,
          }}
        >
          已完成 {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
};

interface BadgesGridProps {
  badges: UserBadge[];
  onBadgeClick: (badge: UserBadge) => void;
};

const BadgesGrid: React.FC<BadgesGridProps> = ({ badges, onBadgeClick }) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 4px 20px rgba(45, 107, 59, 0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A2E1F" }}>获得的徽章</h3>
        <span style={{ fontSize: 13, color: "#D4A76A", fontWeight: 600, background: "#F5E6CC", padding: "4px 12px", borderRadius: 999 }}>{badges.length} 个</span>
      </div>
      {badges.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8FA094", fontSize: 14 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>暂无徽章</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="badges-grid">
          {badges.map((badge) => (
            <div key={badge.badgeId} onClick={() => onBadgeClick(badge)} style={{ perspective: "1000px", cursor: "pointer", aspectRatio: "1 / 1" }}>
              <div style={{ position: "relative", width: "100%", height: "100%", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)", transformStyle: "preserve-3d" }} className="badge-inner">
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 16, background: "linear-gradient(135deg, #F5F7F2 0%, #E8F5E9 100%)", border: "2px solid #E0E8E1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 6 }}>{badge.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1A2E1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{badge.name}</div>
                </div>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 16, background: "linear-gradient(135deg, #D4A76A 0%, #B8905A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center", boxShadow: "0 4px 16px rgba(212, 167, 106, 0.3)" }}>
                  <div style={{ fontSize: 11, color: "white", fontWeight: 500, lineHeight: 1.5 }}>{badge.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{".badges-grid .badge-inner:hover { transform: rotateY(180deg); } @media (max-width: 768px) { .badges-grid { grid-template-columns: repeat(3, 1fr) !important; } } @media (max-width: 480px) { .badges-grid { grid-template-columns: repeat(2, 1fr) !important; } }"}</style>
    </div>
  );
};

const activityEmojis = ["🌳", "🌿", "♻️", "🌊", "🚴", "🌱", "🐝", "🏞️", "🌍", "💧"];

const ActivityList: React.FC<{ activities: JoinedActivity[] }> = ({ activities }) => {
  const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(45, 107, 59, 0.1)", marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A2E1F" }}>已参加活动</h3>
        <span style={{ fontSize: 13, color: "#2D6B3B", fontWeight: 600, background: "#E8F5E9", padding: "4px 12px", borderRadius: 999 }}>{activities.length} 次</span>
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8FA094", fontSize: 14 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>还没有参加活动</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((activity, index) => (
            <div key={activity.activityId} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 14, background: "linear-gradient(135deg, #FAFCF9 0%, #F5F7F2 100%)", border: "1px solid #E0E8E1" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #4A8C5A 0%, #2D6B3B 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{activityEmojis[index % activityEmojis.length]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1A2E1F", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.name}</div>
                <div style={{ fontSize: 13, color: "#8FA094" }}>{new Date(activity.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</div>
              </div>
              <div style={{ background: "linear-gradient(135deg, #D4A76A 0%, #B8905A 100%)", color: "white", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{activity.hours}h</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile(id);
        setProfile(data);
      } catch (err: any) {
        const msg = err?.response?.data?.message || "加载用户档案失败";
        setError(msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, showToast]);

  const handleBadgeClick = (badge: UserBadge) => {
    setSelectedBadge(badge);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBadge(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ height: 280, borderRadius: 24, background: "linear-gradient(135deg, #E8C89A, #D4A76A)", marginBottom: 32 }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1A2E1F", marginBottom: 12 }}>加载失败</h2>
          <p style={{ color: "#5A6B5F", marginBottom: 24, fontSize: 14 }}>{error || "未找到用户信息"}</p>
        </div>
      </div>
    );
  }

  const targetHours = 100;
  const stats = [
    { label: "已参加活动", value: profile.joinedActivities.length, color: "#2D6B3B" },
    { label: "获得徽章", value: profile.badges.length, color: "#D4A76A" },
    { label: "总时长", value: profile.totalHours + "h", color: "#4A8C5A" },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: "linear-gradient(135deg, #D4A76A 0%, #B8905A 100%)", padding: "48px 32px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", color: "white" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={profile.avatar} alt={profile.username} style={{ width: 140, height: 140, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.35)", objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", background: "#F5E6CC" }} />
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6 }}>{profile.username}</h1>
              <div style={{ fontSize: 16, opacity: 0.95, marginBottom: 20 }}>环保行动者 · ID: {profile.id}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 24px", minWidth: 140, border: "1px solid rgba(255,255,255,0.25)" }}>
                    <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", marginTop: -48, position: "relative", zIndex: 3 }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }} className="profile-layout">
          <div>
            <ProgressRing totalHours={profile.totalHours} targetHours={targetHours} />
          </div>
          <div>
            <BadgesGrid badges={profile.badges} onBadgeClick={handleBadgeClick} />
            <ActivityList activities={profile.joinedActivities} />
          </div>
        </div>
      </div>

      <BadgeModal open={modalOpen} badge={selectedBadge ? { name: selectedBadge.name, icon: selectedBadge.icon, description: selectedBadge.description, earnedAt: selectedBadge.earnedAt } : null} onClose={handleModalClose} />

      <style>{"@media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr !important; } }"}</style>
    </div>
  );
};

export default ProfilePage;
