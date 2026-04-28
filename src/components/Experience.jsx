import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Experience = ({ onEnter }) => {
  const { scrollYProgress } = useScroll();
  
  // Fade out intro text
  const introOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // Fade in the Enter App button at the end of the scroll
  const buttonOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const buttonY = useTransform(scrollYProgress, [0.8, 1], [50, 0]);

  // Prevent button from being clickable until it's visible
  const pointerEvents = useTransform(scrollYProgress, [0.8, 1], ['none', 'auto']);

  const canvasRef = React.useRef(null);
  const FRAME_COUNT = 200;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    
    canvas.width = 1920;
    canvas.height = 1080;

    const images = [];
    let loadedImages = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${import.meta.env.BASE_URL}frames/ezgif-frame-${paddedIndex}.jpg`;
      images.push(img);

      img.onload = () => {
        loadedImages++;
        if (loadedImages === 1 && i === 1) {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }

    const unsubscribe = scrollYProgress.onChange((progress) => {
      let frameIndex = Math.floor(progress * (FRAME_COUNT - 1));
      if (frameIndex < 0) frameIndex = 0;
      if (frameIndex >= FRAME_COUNT) frameIndex = FRAME_COUNT - 1;
      
      const img = images[frameIndex];
      if (img && img.complete) {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div style={{ height: '300vh', background: 'black', color: 'white' }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6,
            zIndex: 0
          }}
        />

        <motion.div style={{ opacity: introOpacity, y: introY, textAlign: 'center', position: 'absolute', zIndex: 1 }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'var(--heading-font)' }}>
            Welcome to Scarlet Nova
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>Scroll down to experience...</p>
        </motion.div>

        <motion.div 
          style={{ 
            opacity: buttonOpacity, 
            y: buttonY, 
            pointerEvents,
            position: 'absolute'
          }}
        >
          <button 
            className="btn btn-primary" 
            onClick={onEnter}
            style={{ 
              padding: '1.2rem 3rem', 
              fontSize: '1.3rem', 
              boxShadow: '0 0 30px rgba(255, 51, 102, 0.5)' 
            }}
          >
            Enter App
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Experience;
