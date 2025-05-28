import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';

interface SmokeParticle {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
  color: string;
  z: number;
}

const MotionBox = motion(Box);

const bloodOverlay = `
  @keyframes bloodRiver {
    0% { transform: scale(1); opacity: 0; filter: blur(2px); }
    20% { transform: scale(1.1); opacity: 0.9; filter: blur(4px); }
    100% { transform: scale(1.05); opacity: 1; filter: blur(8px); }
  }
  
  @keyframes bloodWave {
    0% { transform: translateY(-100%) rotate(0deg); }
    100% { transform: translateY(0%) rotate(1deg); }
  }

  @keyframes bloodDrip {
    0% { transform: scaleY(0); opacity: 0.8; }
    100% { transform: scaleY(1); opacity: 1; }
  }

  @keyframes welcomeText {
    0% { transform: translateY(-50px); opacity: 0; filter: blur(10px); }
    50% { transform: translateY(0); opacity: 1; filter: blur(0px); }
    100% { transform: translateY(50px); opacity: 0; filter: blur(10px); }
  }

  @keyframes screenShake {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-15px, -15px) rotate(-1deg); }
    50% { transform: translate(15px, 15px) rotate(1deg); }
    75% { transform: translate(-15px, 15px) rotate(-0.5deg); }
    100% { transform: translate(15px, -15px) rotate(0.5deg); }
  }
`;

const smokeEffect = `
  @keyframes smoke {
    0% { transform: scale(1) translate(0, 0) rotate(0deg); filter: blur(2px); opacity: 0.3; }
    50% { transform: scale(1.3) translate(var(--moveX), var(--moveY)) rotate(var(--rot)); filter: blur(4px); opacity: 0.15; }
    100% { transform: scale(1.6) translate(calc(var(--moveX) * 2), calc(var(--moveY) * 2)) rotate(calc(var(--rot) * 2)); filter: blur(6px); opacity: 0; }
  }
`;

const reapingAnimation = `
  @keyframes reaping {
    0% { transform: rotate(-30deg) scale(1.2) perspective(1000px) rotateX(0deg) rotateY(0deg); filter: drop-shadow(0 0 20px rgba(255,0,0,0.3)); }
    25% { transform: rotate(0deg) scale(1.3) perspective(1000px) rotateX(10deg) rotateY(-10deg); filter: drop-shadow(0 0 30px rgba(255,0,0,0.4)); }
    50% { transform: rotate(45deg) scale(1.5) perspective(1000px) rotateX(20deg) rotateY(0deg); filter: drop-shadow(0 0 40px rgba(255,0,0,0.6)); }
    75% { transform: rotate(0deg) scale(1.3) perspective(1000px) rotateX(10deg) rotateY(10deg); filter: drop-shadow(0 0 30px rgba(255,0,0,0.4)); }
    100% { transform: rotate(-30deg) scale(1.2) perspective(1000px) rotateX(0deg) rotateY(0deg); filter: drop-shadow(0 0 20px rgba(255,0,0,0.3)); }
  }
  
  @keyframes axeGlow {
    0% { filter: drop-shadow(0 0 15px rgba(255,0,0,0.5)) brightness(1.2); }
    50% { filter: drop-shadow(0 0 30px rgba(255,0,0,0.8)) brightness(1.8); }
    100% { filter: drop-shadow(0 0 15px rgba(255,0,0,0.5)) brightness(1.2); }
  }

  @keyframes ghostFloat {
    0% { transform: translateY(0px) scale(1) rotate(var(--baseRotation)); filter: brightness(0.8); }
    50% { transform: translateY(-20px) scale(1.05) rotate(calc(var(--baseRotation) + 3deg)); filter: brightness(1); }
    100% { transform: translateY(0px) scale(1) rotate(var(--baseRotation)); filter: brightness(0.8); }
  }

  @keyframes eyeGlow {
    0% { filter: drop-shadow(0 0 10px rgba(255,0,0,0.7)) brightness(1.2); }
    50% { filter: drop-shadow(0 0 20px rgba(255,0,0,1)) brightness(1.8); }
    100% { filter: drop-shadow(0 0 10px rgba(255,0,0,0.7)) brightness(1.2); }
  }
`;

export const PredatorSnake = () => {
  const [particles, setParticles] = useState<SmokeParticle[]>([]);
  const [isHunting, setIsHunting] = useState(false);
  const [showBloodOverlay, setShowBloodOverlay] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const targetX = useRef(-100);
  const targetY = useRef(-100);
  const lastMoveTime = useRef(Date.now());
  const lastCursorMoveTime = useRef(Date.now());
  const isEating = useRef(false);
  const animationFrame = useRef(0);
  const controls = useAnimation();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullBlood, setIsFullBlood] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = bloodOverlay + smokeEffect + reapingAnimation;
    document.head.appendChild(style);

    const particleCount = 15;
    const initialParticles = Array.from({ length: particleCount }, () => ({
      x: -100,
      y: -100,
      scale: 1,
      opacity: 0.3,
      rotation: 0,
      color: 'rgba(30, 30, 40, 0.5)',
      z: 0
    }));
    setParticles(initialParticles);

    const startHunting = () => {
      if (!isHunting) {
        setIsHunting(true);
        document.body.style.cursor = 'none';
        setShowBloodOverlay(true);
        
        // Start the full blood sequence after 3 seconds of hunting
        setTimeout(() => {
          setIsFullBlood(true);
          document.body.style.animation = 'screenShake 0.3s infinite';
        }, 3000);

        controls.start({
          scale: [1, 2, 1.5],
          rotateY: [0, 360],
          z: [0, 50, 0],
          transition: { duration: 2, ease: "easeInOut" }
        });
      }
    };

    const stopHunting = () => {
      setIsHunting(false);
      setIsFullBlood(false);
      document.body.style.cursor = 'auto';
      document.body.style.animation = 'none';
      setShowBloodOverlay(false);
      
      // Show welcome back message
      setShowWelcomeBack(true);
      setTimeout(() => setShowWelcomeBack(false), 3000);
    };

    const updateGhostPosition = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastMoveTime.current;
      const cursorStillTime = currentTime - lastCursorMoveTime.current;

      // Start hunting if cursor is still for 8 seconds
      if (cursorStillTime > 8000 && !isEating.current) {
        startHunting();
        isEating.current = true;
      }

      if (timeDiff > 16) {
        setParticles(prevParticles => {
          const newParticles = [...prevParticles];
          
          // Natural floating movement when not hunting
          if (!isHunting) {
            const time = currentTime * 0.001;
            const floatX = Math.sin(time * 0.5) * 30;
            const floatY = Math.cos(time * 0.3) * 20;
            
            newParticles[0] = {
              ...newParticles[0],
              x: newParticles[0].x + (floatX - newParticles[0].x) * 0.02,
              y: newParticles[0].y + (floatY - newParticles[0].y) * 0.02,
              rotation: Math.sin(time) * 10,
              z: Math.sin(time * 0.7) * 20
            };
          } else {
            // Aggressive hunting movement
            const dx = targetX.current - newParticles[0].x;
            const dy = targetY.current - newParticles[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
              const angle = Math.atan2(dy, dx);
              const speed = isHunting ? 20 : 2;
              const huntingOffset = Math.sin(currentTime * 0.01) * 30;
              
              newParticles[0] = {
                ...newParticles[0],
                x: newParticles[0].x + Math.cos(angle) * speed + huntingOffset,
                y: newParticles[0].y + Math.sin(angle) * speed,
                scale: isHunting ? 1.5 + Math.sin(currentTime * 0.005) * 0.2 : 1,
                opacity: 0.8,
                rotation: angle * (180 / Math.PI) + Math.sin(currentTime * 0.01) * 20,
                z: Math.sin(currentTime * 0.003) * 40
              };
            }
          }

          // Update smoke particles with 3D effect
          for (let i = 1; i < newParticles.length; i++) {
            const prevParticle = newParticles[i - 1];
            const time = currentTime * 0.001;
            const zOffset = Math.sin((time + i) * 0.5) * 20;
            
            newParticles[i] = {
              x: prevParticle.x + Math.sin((time + i) * 0.5) * 5,
              y: prevParticle.y + Math.cos((time + i) * 0.5) * 5,
              scale: 1 - (i / newParticles.length) * 0.3,
              opacity: 0.3 - (i / newParticles.length) * 0.2,
              rotation: prevParticle.rotation + Math.sin(time + i) * 5,
              color: isHunting 
                ? `rgba(40, 0, 0, ${0.5 - (i / newParticles.length) * 0.3})`
                : `rgba(30, 30, 40, ${0.5 - (i / newParticles.length) * 0.3})`,
              z: prevParticle.z + zOffset
            };
          }

          return newParticles;
        });
        lastMoveTime.current = currentTime;
      }

      animationFrame.current = requestAnimationFrame(updateGhostPosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      setCursorPosition({ x: e.clientX, y: e.clientY });
      lastCursorMoveTime.current = Date.now();
      
      if (isHunting || isFullBlood) {
        stopHunting();
        setShowWelcomeBack(true);
        
        setTimeout(() => {
          setShowWelcomeBack(false);
          setParticles(prevParticles => {
            const newParticles = [...prevParticles];
            newParticles[0] = {
              ...newParticles[0],
              x: -100,
              y: -100,
              scale: 1,
              opacity: 0.3,
            };
            return newParticles;
          });
        }, 3000);
      }

      // Clear and reset idle timer
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
      idleTimer.current = setTimeout(() => {
        const currentTime = Date.now();
        const idleTime = currentTime - lastCursorMoveTime.current;
        
        // Only start hunting if cursor has been idle for 15 seconds
        if (idleTime >= 15000 && !isHunting && !isFullBlood) {
          startHunting();
        }
      }, 15000); // Set to 15 seconds
    };

    // Initial idle timer setup
    idleTimer.current = setTimeout(() => {
      const currentTime = Date.now();
      const idleTime = currentTime - lastCursorMoveTime.current;
      
      if (idleTime >= 15000 && !isHunting && !isFullBlood) {
        startHunting();
      }
    }, 15000);

    window.addEventListener('mousemove', handleMouseMove);
    animationFrame.current = requestAnimationFrame(updateGhostPosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame.current);
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
      document.head.removeChild(style);
      document.body.style.cursor = 'auto';
      document.body.style.animation = 'none';
    };
  }, [isHunting, isFullBlood]);

  return (
    <>
      {/* Blood River System */}
      {showBloodOverlay && (
        <>
          {/* Base blood layer with faster transition */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={isFullBlood ? "darkred" : "rgba(139, 0, 0, 0.2)"}
            zIndex={9997}
            animation={isFullBlood ? "bloodRiver 2s forwards" : "bloodPulse 3s infinite"}
            pointerEvents="none"
            style={{
              transition: "all 0.5s ease-out", // Faster transition
            }}
          />

          {/* Blood waves */}
          {isFullBlood && Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={`wave-${i}`}
              position="fixed"
              top={0}
              left={0}
              right={0}
              height="200vh"
              zIndex={9997 + i}
              pointerEvents="none"
              style={{
                background: `linear-gradient(180deg, 
                  rgba(139, 0, 0, ${0.9 - i * 0.1}) ${i * 10}%, 
                  rgba(80, 0, 0, ${0.7 - i * 0.1}) ${50 + i * 10}%, 
                  rgba(40, 0, 0, ${0.5 - i * 0.1}) 100%)`,
                animation: `bloodWave ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                transformOrigin: "center",
                filter: "blur(4px)",
              }}
            />
          ))}

          {/* Blood drips */}
          {!isFullBlood && Array.from({ length: 8 }).map((_, i) => (
            <Box
              key={`drip-${i}`}
              position="fixed"
              top={0}
              left={`${i * 12.5}%`}
              width="12.5%"
              height="100vh"
              background="linear-gradient(180deg, rgba(139, 0, 0, 0.8) 0%, rgba(80, 0, 0, 0.2) 100%)"
              zIndex={9997}
              animation="bloodDrip 3s infinite"
              style={{
                animationDelay: `${i * 0.2}s`,
                transformOrigin: "top",
              }}
              pointerEvents="none"
            />
          ))}

          {/* Radial blood splash */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={9998}
            pointerEvents="none"
            style={{
              '--x': `${cursorPosition.x}px`,
              '--y': `${cursorPosition.y}px`,
              background: isFullBlood 
                ? 'radial-gradient(circle at var(--x) var(--y), rgba(139, 0, 0, 1), rgba(80, 0, 0, 0.8))'
                : 'radial-gradient(circle at var(--x) var(--y), rgba(139, 0, 0, 0.8), rgba(80, 0, 0, 0.3))',
              animation: 'bloodSplatter 1s forwards',
              backdropFilter: 'blur(8px)',
              transition: 'background 2s',
            } as React.CSSProperties}
          />
        </>
      )}

      {/* Welcome Back Message */}
      {showWelcomeBack && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={9999}
          textAlign="center"
          color="white"
          pointerEvents="none"
        >
          <MotionBox
            fontSize="7xl"
            fontWeight="bold"
            style={{
              animation: 'welcomeText 3s forwards',
              textShadow: '0 0 20px rgba(255,255,255,0.5)',
              background: 'linear-gradient(180deg, #ffffff 0%, #a0a0a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome Back to Earth
          </MotionBox>
          <MotionBox
            fontSize="2xl"
            color="gray.300"
            mt={4}
            style={{
              animation: 'welcomeText 3s forwards',
              animationDelay: '0.5s',
            }}
          >
            You escaped the reaper... for now
          </MotionBox>
        </Box>
      )}

      {/* Ghost and Smoke System */}
      {!isFullBlood && particles.map((particle, index) => (
        <MotionBox
          key={index}
          style={{
            x: particle.x - (index === 0 ? 25 : 15),
            y: particle.y - (index === 0 ? 25 : 15),
            scale: particle.scale || 1,
            opacity: particle.opacity || 0.3,
            rotate: particle.rotation || 0,
            z: particle.z || 0,
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
          position="fixed"
          top={0}
          left={0}
          zIndex={9998}
          pointerEvents="none"
          animate={index === 0 ? controls : undefined}
        >
          {index === 0 ? (
            // Main Ghost Body with 3D effects
            <Box
              w="60px"
              h="80px"
              position="relative"
              transform={`rotate(${particle.rotation}deg) translateZ(${particle.z}px)`}
              style={{
                animation: 'ghostFloat 4s infinite ease-in-out',
                '--baseRotation': `${particle.rotation}deg`,
              } as React.CSSProperties}
            >
              {/* Hood and Cloak with 3D lighting */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={isHunting ? "rgba(20, 0, 0, 0.95)" : "rgba(20, 20, 25, 0.85)"}
                borderRadius="45% 45% 0 0"
                boxShadow={isHunting 
                  ? "0 0 40px rgba(255, 0, 0, 0.4), inset 0 0 30px rgba(255, 0, 0, 0.3)"
                  : "0 0 30px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)"}
                style={{
                  transform: `perspective(1000px) rotateX(${Math.sin(Date.now() * 0.002) * 15}deg)`,
                }}
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "-30%",
                  right: "-30%",
                  bottom: "-40%",
                  background: isHunting ? "rgba(20, 0, 0, 0.95)" : "rgba(20, 20, 25, 0.85)",
                  clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
                  zIndex: -1,
                  filter: "blur(3px)",
                  transform: "perspective(500px) rotateX(30deg)",
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)",
                  borderRadius: "inherit",
                  opacity: 0.8,
                }}
              />

              {/* Enhanced Face Shadow */}
              <Box
                position="absolute"
                top="20%"
                left="15%"
                right="15%"
                bottom="35%"
                bg="black"
                borderRadius="40%"
                opacity={0.95}
                style={{
                  transform: 'translateZ(8px)',
                  filter: 'blur(2px)',
                }}
              />

              {/* Glowing Eyes with enhanced 3D effect */}
              <Box
                position="absolute"
                top="35%"
                left="25%"
                w="15%"
                h="15%"
                bg={isHunting ? "#ff0000" : "#ff2200"}
                borderRadius="full"
                style={{
                  transform: 'translateZ(12px)',
                  animation: 'eyeGlow 2s infinite',
                }}
              />
              <Box
                position="absolute"
                top="35%"
                right="25%"
                w="15%"
                h="15%"
                bg={isHunting ? "#ff0000" : "#ff2200"}
                borderRadius="full"
                style={{
                  transform: 'translateZ(12px)',
                  animation: 'eyeGlow 2s infinite',
                  animationDelay: '0.5s',
                }}
              />

              {/* Enhanced Scythe with 3D effects */}
              {isHunting && (
                <>
                  {/* Hand holding the axe */}
                  <Box
                    position="absolute"
                    top="40%"
                    right="-10px"
                    width="20px"
                    height="30px"
                    bg={isHunting ? "rgba(20, 0, 0, 0.95)" : "rgba(20, 20, 25, 0.85)"}
                    borderRadius="40%"
                    transform="rotate(-45deg)"
                    zIndex={2}
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: "-5px",
                      left: "50%",
                      width: "15px",
                      height: "20px",
                      background: "inherit",
                      borderRadius: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />

                  {/* Main Axe Container */}
                  <Box
                    position="absolute"
                    top="35%"
                    right="-50px"
                    width="120px"
                    height="120px"
                    animation="reaping 2.5s infinite ease-in-out"
                    transformOrigin="20% 50%"
                    style={{
                      transform: 'translateZ(25px)',
                    }}
                  >
                    {/* Handle with metallic effect */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="0"
                      w="100px"
                      h="8px"
                      bg="linear-gradient(90deg, #000000 0%, #2a2a2a 50%, #000000 100%)"
                      borderRadius="full"
                      transform="rotate(-45deg)"
                      style={{
                        backgroundSize: '200% 100%',
                      }}
                      _before={{
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                        filter: "blur(1px)",
                        borderRadius: "inherit",
                      }}
                      _after={{
                        content: '""',
                        position: "absolute",
                        top: "-1px",
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                        filter: "blur(0.5px)",
                      }}
                    />

                    {/* Enhanced Blade */}
                    <Box
                      position="absolute"
                      right="-10px"
                      top="-40px"
                      w="80px"
                      h="80px"
                      animation="axeGlow 2s infinite"
                      style={{
                        clipPath: 'path("M 0 80 C 20 60, 40 40, 80 0 L 80 60 C 60 70, 40 75, 0 80 Z")',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                      }}
                      _before={{
                        content: '""',
                        position: "absolute",
                        inset: "2px",
                        background: "linear-gradient(135deg, transparent 0%, rgba(255,0,0,0.2) 50%, transparent 100%)",
                        filter: "blur(2px)",
                      }}
                      _after={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "2px",
                        height: "100%",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,0,0,0.5))",
                        boxShadow: "0 0 20px rgba(255,0,0,0.6), -2px 0 10px rgba(255,255,255,0.3)",
                        filter: "blur(1px)",
                      }}
                    >
                      {/* Blade Edge Highlight */}
                      <Box
                        position="absolute"
                        top="0"
                        right="0"
                        width="100%"
                        height="100%"
                        style={{
                          clipPath: 'path("M 0 80 C 20 60, 40 40, 80 0 L 80 10 C 60 40, 40 60, 0 75 Z")',
                          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 100%)',
                        }}
                        filter="blur(1px)"
                      />
                      
                      {/* Blade Inner Glow */}
                      <Box
                        position="absolute"
                        inset="5px"
                        style={{
                          clipPath: 'path("M 0 75 C 20 55, 40 35, 75 0 L 75 50 C 55 60, 35 65, 0 75 Z")',
                          background: 'radial-gradient(circle at 70% 30%, rgba(255,0,0,0.2), transparent 70%)',
                        }}
                        filter="blur(3px)"
                      />
                    </Box>

                    {/* Energy Effect around the blade */}
                    <Box
                      position="absolute"
                      right="-15px"
                      top="-45px"
                      w="90px"
                      h="90px"
                      opacity={0.6}
                      style={{
                        clipPath: 'path("M 0 90 C 20 70, 40 50, 90 0 L 90 70 C 70 80, 50 85, 0 90 Z")',
                        background: 'radial-gradient(circle at 60% 40%, rgba(255,0,0,0.3), transparent 70%)',
                      }}
                      filter="blur(8px)"
                      animation="axeGlow 2s infinite"
                    />
                  </Box>
                </>
              )}
            </Box>
          ) : (
            // Enhanced Smoke particles with 3D effect
            <Box
              w="35px"
              h="35px"
              bg={particle.color}
              borderRadius="40%"
              opacity={particle.opacity}
              style={{
                animation: 'smoke 2.5s infinite',
                '--moveX': `${Math.sin(index * 0.5) * 25}px`,
                '--moveY': `${Math.cos(index * 0.5) * 25}px`,
                '--rot': `${Math.sin(index) * 180}deg`,
                transform: `translateZ(${particle.z}px)`,
                filter: 'blur(2px)',
              } as React.CSSProperties}
              _before={{
                content: '""',
                position: "absolute",
                inset: "-50%",
                background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                opacity: 0.4,
                filter: 'blur(3px)',
              }}
            />
          )}
        </MotionBox>
      ))}

      {/* Death Message */}
      {isFullBlood && (
        <MotionBox
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize="9xl"
          fontWeight="bold"
          color="white"
          textShadow="0 0 30px rgba(255, 0, 0, 0.8)"
          style={{
            animation: 'bloodPulse 2s infinite',
            WebkitTextStroke: '2px rgba(0,0,0,0.5)',
          }}
          zIndex={9999}
          letterSpacing="wider"
        >
          YOUR SOUL IS MINE! 💀
        </MotionBox>
      )}
    </>
  );
}; 