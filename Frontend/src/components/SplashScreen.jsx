import React, { useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 6500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-container">
      <video 
        autoPlay 
        muted 
        playsInline 
        className="splash-video"
      >
        <source src="/FTS_Logo_Reveal_Animation.mp4" type="video/mp4" />
        <source src="/FTS_Logo_Reveal_Animation.webm" type="video/webm" />
        <source src="/FTS_Logo_Reveal_Animation.ogv" type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SplashScreen;