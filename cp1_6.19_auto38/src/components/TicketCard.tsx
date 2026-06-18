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

export default function TicketCard({ booking, exhibitionName, exhibitionImage, isVisible = true }: TicketCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [gradient, setGradient] = useState('linear-gradient(135deg, #D69E2E 0%, #38B2AC 100%)');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const imageSrc = exhibitionImage || booking.exhibitionImage || '';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        try {
          const imageData = ctx.getImageData(0, 0, 100, 100).data;
          const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number; saturation: number } } = {};
          
          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];
            
            if (a < 128) continue;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
            const brightness = (r + g + b) / 3;
            
            if (brightness < 30 || brightness > 230) continue;
            
            const bucketR = Math.floor(r / 20) * 20;
            const bucketG = Math.floor(g / 20) * 20;
            const bucketB = Math.floor(b / 20) * 20;
            const key = `${bucketR},${bucketG},${bucketB}`;
            
            if (!colorBuckets[key]) {
              colorBuckets[key] = { r: 0, g: 0, b: 0, count: 0, saturation: 0 };
            }
            colorBuckets[key].r += r;
            colorBuckets[key].g += g;
            colorBuckets[key].b += b;
            colorBuckets[key].count++;
            colorBuckets[key].saturation += saturation;
          }
          
          let bestColor = { r: 214, g: 158, b: 46 };
          let bestScore = -1;
          
          for (const key in colorBuckets) {
            const bucket = colorBuckets[key];
            const avgR = Math.floor(bucket.r / bucket.count);
            const avgG = Math.floor(bucket.g / bucket.count);
            const avgB = Math.floor(bucket.b / bucket.count);
            const avgSaturation = bucket.saturation / bucket.count;
            
            const score = bucket.count * (1 + avgSaturation / 100);
            
            if (score > bestScore) {
              bestScore = score;
              bestColor = { r: avgR, g: avgG, b: avgB };
            }
          }
          
          let { r, g, b } = bestColor;
          const max = Math.max(r, g, b);
          if (max < 120) {
            r = Math.min(255, r + 60);
            g = Math.min(255, g + 60);
            b = Math.min(255, b + 60);
          }
          
          const r2 = Math.min(255, r + 50);
          const g2 = Math.min(255, g + 70);
          const b2 = Math.min(255, b + 90);
          
          setGradient(`linear-gradient(135deg, rgb(${r},${g},${b}) 0%, rgb(${r2},${g2},${b2}) 100%)`);
        } catch (e) {
          // CORS issue, use default gradient
        }
      }
    };
    img.onerror = () => {
      // Image load failed, keep default gradient
    };
  }, [exhibitionImage, booking.exhibitionImage]);

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
