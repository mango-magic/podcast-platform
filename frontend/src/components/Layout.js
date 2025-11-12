import React, { useEffect, useRef } from 'react';
import { Container, Box } from '@mui/material';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const { user, isGuestMode } = useAuth();
  const canvasRef = useRef(null);
  
  // Don't show navigation on auth pages or if not logged in
  const hideNav = !user && !isGuestMode;
  
  // Animated background particles
  useEffect(() => {
    if (hideNav) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [hideNav]);
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background canvas */}
      {!hideNav && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Gradient overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      
      {!hideNav && <Navigation />}
      
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
