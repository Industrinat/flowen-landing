'use client';

import { useState } from 'react';
import DemoUpload from './DemoUpload';

interface ProTipCircleProps {
  number: string;
  title: string;
  content: string;
  isActive: boolean;
  onClick: () => void;
}

const ProTipCircle = ({ number, title, content, isActive, onClick }: ProTipCircleProps) => (
  <div 
    className={`pro-tip-circle ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="tip-number">Pro Tip<br/>{number}</span>
  </div>
);

export function EmailWithProTips() {
  const [activeTip, setActiveTip] = useState<number | null>(null);

  const tips = [
    {
      id: 1,
      title: "EU-First GDPR Compliance",
      content: "Built for European businesses with GDPR compliance from day one. EU data centers, privacy by design, and full regulatory compliance.",
      position: "top-left"
    },
    {
      id: 2,
      title: "File sharing with end-to-end encryption", 
      content: "Your files are encrypted before leaving your computer - not even we can read them.",
      position: "top-right"
    },
    {
      id: 3,
      title: "Platform Customization",
      content: "With Flowen we can build your tool exactly as you want it. Adjust design, branding, and functions to match your business needs.",
      position: "left"
    },
    {
      id: 4,
      title: "EU Business Tool Integration",
      content: "Seamless integration with popular European business tools plus global platforms like Slack, Teams, and Google Workspace.",
      position: "right"
    },
    {
      id: 5,
      title: "European Business Pricing",
      content: "Transparent pricing designed for European SMEs. No hidden fees, SEPA payments, and pricing that scales with European business growth.",
      position: "bottom-left"
    },
    {
      id: 6,
      title: "Advanced Security Features",
      content: "Two-factor authentication, IP whitelisting, and advanced encryption. Multiple security layers to protect your sensitive business data.",
      position: "bottom-right"
    }
  ];

  const handleTipClick = (tipId: number) => {
    setActiveTip(activeTip === tipId ? null : tipId);
  };

  const getPopupPosition = (tipId: number) => {
    const positions = {
      1: { top: '8%', left: '8%' },
      2: { top: '8%', right: '8%' },
      3: { top: '40%', left: '3%' },
      4: { top: '40%', right: '3%' },
      5: { bottom: '20%', left: '8%' },
      6: { bottom: '20%', right: '8%' }
    };
    return positions[tipId as keyof typeof positions];
  };

  const activeTipData = tips.find(tip => tip.id === activeTip);

  return (
    <div className="demo-upload-container">
      <div className="main-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          color: 'rgba(255,255,255,0.9)', 
          margin: '0',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          Share files aboslutly free - no credit card needed
        </h2>
      </div>

      <div className="main-demo-box">
        <DemoUpload />
      </div>

      <div className="pro-tips-arms">
        {tips.map((tip) => (
          <div key={tip.id} className={`tip-arm ${tip.position}`}>
            <ProTipCircle
              number={tip.id.toString()}
              title={tip.title}
              content={tip.content}
              isActive={activeTip === tip.id}
              onClick={() => handleTipClick(tip.id)}
            />
          </div>
        ))}
      </div>

      {activeTipData && (
        <div 
          className="inline-tip-popup"
          style={getPopupPosition(activeTipData.id)}
        >
          <div className="popup-content">
            <div className="popup-header">
              <h4>{activeTipData.title}</h4>
              <button
                className="close-btn"
                onClick={() => setActiveTip(null)}
              >
                ×
              </button>
            </div>
            <p>{activeTipData.content}</p>
            <div className="popup-footer">
              <a href="/contact" className="contact-link">Contact us →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}