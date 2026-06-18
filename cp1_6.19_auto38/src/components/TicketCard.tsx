import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '../types';

interface TicketCardProps {
  booking: Booking;
  exhibitionName: string;
  exhibitionImage: string;
  isVisible?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function TicketCard({ booking, exhibitionName, isVisible = true }: TicketCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [gradient, setGradient] = useState('linear-gradient(135deg, #D69E2E 0%, #38B2AC 100%)');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = booking.exhibitionImage || '';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        try {
          const imageData = ctx.getImageData(0, 0, 50, 50).data;
          let r = 0, g = 0, b = 0;
          let count = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
          }
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const r2 = Math.min(255, r + 40);
          const g2 = Math.min(255, g + 60);
          const b2 = Math.min(255, b + 80);
          
          setGradient(`linear-gradient(135deg, rgb(${r},${g},${b}) 0%, rgb(${r2},${g2},${b2}) 100%)`);
        } catch (e) {
          // CORS issue, use default
        }
      }
    };
  }, [booking.exhibitionImage]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsFlipped(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      ref={cardRef}
      style={{
        perspective: '1000px',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        {/* 门票正面 */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            position: 'relative',
          }}
        >
          {/* 渐变背景头部 */}
          <div
            style={{
              background: gradient,
              padding: '24px',
              color: 'white',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: '12px',
              opacity: '0.9',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              电子门票
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {exhibitionName}
            </h2>
            <div style={{
              fontSize: '14px',
              opacity: '0.95',
            }}>
              {formatDate(booking.date)}
            </div>
            
            {/* 装饰圆 */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '60%',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }} />
          </div>

          {/* 分隔线带半圆缺口 */}
          <div style={{
            position: 'relative',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-primary)',
            }} />
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-primary)',
            }} />
            <div style={{
              borderTop: '2px dashed var(--border-color)',
              margin: '0 16px',
            }} />
          </div>

          {/* 门票信息 */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
            }}>
              {/* 二维码 */}
              <div style={{
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '8px',
                flexShrink: 0,
              }}>
                <QRCodeSVG
                  value={`ticket-${booking.id}-${booking.verificationCode}`}
                  size={100}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* 信息 */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}>
                    持票人
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                  }}>
                    {booking.name}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}>
                    座位号
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--accent-teal)',
                    fontWeight: '500',
                  }}>
                    {booking.seatNumber}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}>
                    票数
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}>
                    {booking.count} 张
                  </div>
                </div>
              </div>
            </div>

            {/* 验证码 */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                验证码
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--accent-amber)',
                letterSpacing: '4px',
                fontFamily: 'monospace',
              }}>
                {booking.verificationCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
