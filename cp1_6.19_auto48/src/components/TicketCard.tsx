import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Booking {
  exhibitionName: string;
  date: string;
  seatNumber: string;
  verificationCode: string;
  id: string | number;
}

interface TicketCardProps {
  booking: Booking;
  coverImage?: string;
}

const TicketCard: React.FC<TicketCardProps> = ({ booking, coverImage }) => {
  return (
    <div
      className="ticket-card"
      style={{
        background: 'linear-gradient(135deg, rgba(214, 158, 46, 0.85) 0%, rgba(56, 178, 172, 0.85) 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {coverImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 20px 0',
            textAlign: 'center',
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          电子门票
        </h2>

        <div className="ticket-content">
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <QRCodeSVG
              value={String(booking.id)}
              size={140}
              level="H"
              includeMargin={false}
            />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <h3 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 600, margin: "0 0 12px 0", textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)" }}>
                {booking.exhibitionName}
              </h3>

              <div style={{ marginBottom: "8px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "14px" }}>日期：</span>
                <span style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 500 }}>{booking.date}</span>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "14px" }}>座位号：</span>
                <span style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 500 }}>{booking.seatNumber}</span>
              </div>

              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "8px", padding: "12px 16px", backdropFilter: "blur(4px)" }}>
                <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "12px", marginBottom: "4px", letterSpacing: "1px" }}>唯一验证码</div>
                <div style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: 700, letterSpacing: "6px", fontFamily: "monospace", textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}>
                  {booking.verificationCode.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(255, 255, 255, 0.4)", textAlign: "center" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "12px", letterSpacing: "0.5px" }}>凭此二维码入场，一人一票</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
