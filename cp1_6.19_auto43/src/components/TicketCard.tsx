import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { Booking, Exhibition } from '../types';
import './TicketCard.css';

interface Props {
  booking: Booking;
  exhibition: Exhibition;
  visible: boolean;
}

const TicketCard = ({ booking, exhibition, visible }: Props) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [gradient, setGradient] = useState('linear-gradient(135deg, #D69E2E, #B7791F)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(
          JSON.stringify({
            code: booking.verificationCode,
            name: booking.name,
            exhibition: exhibition.name,
            date: booking.date
          }),
          {
            width: 160,
            margin: 2,
            color: {
              dark: '#1A202C',
              light: '#ffffff'
            }
          }
        );
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };
    
    generateQR();
  }, [booking.verificationCode, booking.name, exhibition.name, booking.date]);

  useEffect(() => {
    const extractColor = () => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = exhibition.coverImage;
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let r = 0, g = 0, b = 0;
          let count = 0;
          
          for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const r2 = Math.min(255, r + 40);
          const g2 = Math.min(255, g + 30);
          const b2 = Math.min(255, b + 20);
          
          setGradient(`linear-gradient(135deg, rgb(${r2}, ${g2}, ${b2}), rgb(${r}, ${g}, ${b}))`);
        } catch (e) {
          console.log('Color extraction fallback');
        }
      };
      
      img.onerror = () => {
        console.log('Image load failed, using default gradient');
      };
    };
    
    extractColor();
  }, [exhibition.coverImage]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className={`ticket-card-wrapper ${visible ? 'visible' : ''}`}>
        <div className="ticket-card" style={{ background: gradient }}>
          <div className="ticket-left">
            <div className="ticket-header">
              <span className="ticket-badge">电子门票</span>
              <span className="ticket-status">{booking.status === 'confirmed' ? '已确认' : '待确认'}</span>
            </div>
            
            <h3 className="ticket-title">{exhibition.name}</h3>
            
            <div className="ticket-info">
              <div className="info-item">
                <span className="info-label">参观日期</span>
                <span className="info-value">{formatDate(booking.date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">座位号</span>
                <span className="info-value">{booking.seatNumbers.join(', ')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">预约人</span>
                <span className="info-value">{booking.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">票数</span>
                <span className="info-value">{booking.tickets} 张</span>
              </div>
            </div>
            
            <div className="ticket-code">
              <span className="code-label">验证码</span>
              <span className="code-value">{booking.verificationCode}</span>
            </div>
          </div>
          
          <div className="ticket-divider">
            <div className="divider-circle top"></div>
            <div className="divider-line"></div>
            <div className="divider-circle bottom"></div>
          </div>
          
          <div className="ticket-right">
            <div className="qr-wrapper">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="二维码" className="qr-code" />
              ) : (
                <div className="qr-placeholder">
                  <div className="spinner small"></div>
                </div>
              )}
            </div>
            <p className="qr-tip">扫码入场</p>
          </div>
        </div>
        
        <div className="ticket-shadow"></div>
      </div>
    </>
  );
};

export default TicketCard;
