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
      title: "Admin User Management",
      content: "Take full control of file access. Admins can invite specific users via email verification, set permissions, and manage who has access to sensitive documents.",
      position: "top-left"
    },
    {
      id: 2,
      title: "IP Access Control", 
      content: "Restrict file access to specific locations. Configure your office IP addresses or VPN ranges to ensure files can only be accessed from trusted networks.",
      position: "top-right"
    },
    {
      id: 3,
      title: "Complete Activity Tracking",
      content: "Monitor every file interaction with detailed audit trails. See who accessed what files, when, and from which IP address for complete transparency.",
      position: "left"
    },
    {
      id: 4,
      title: "Two-Factor Authentication",
      content: "Add an extra security layer with 2FA. Support for SMS codes, Google Authenticator, and Microsoft Authenticator to ensure only authorized users gain access.",
      position: "right"
    },
    {
      id: 5,
      title: "IP White-listing Control",
      content: "White-list specific IP addresses for absolute access control. Create a trusted list of IP addresses that can always access files, perfect for key personnel, management, or critical business locations that need guaranteed access.",
      position: "bottom-left"
    },
    {
      id: 6,
      title: "Enterprise Integration",
      content: "Seamless Single Sign-On with Microsoft Azure AD, Google Workspace, and other enterprise systems. Perfect for larger organizations.",
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
          File sharing with full control and enterprise security
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