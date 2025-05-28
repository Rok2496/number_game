import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface SnakeSegment {
  x: number;
  y: number;
}

const MotionBox = motion(Box);

export const SnakeCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [segments, setSegments] = useState<SnakeSegment[]>([]);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const lastMoveTime = useRef(Date.now());
  const isMoving = useRef(false);
  const animationFrame = useRef(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const segmentCount = 20;
    const initialSegments = Array.from({ length: segmentCount }, () => ({
      x: -100,
      y: -100,
    }));
    setSegments(initialSegments);

    const updateSnake = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastMoveTime.current;

      if (timeDiff > 50) {  // Update every 50ms
        setSegments(prevSegments => {
          const newSegments = [...prevSegments];
          // Update each segment to follow the one in front of it
          for (let i = newSegments.length - 1; i > 0; i--) {
            newSegments[i] = { ...newSegments[i - 1] };
          }
          // Head follows the cursor
          newSegments[0] = {
            x: smoothX.get(),
            y: smoothY.get(),
          };
          return newSegments;
        });
        lastMoveTime.current = currentTime;
      }

      animationFrame.current = requestAnimationFrame(updateSnake);
    };

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      isMoving.current = true;
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrame.current = requestAnimationFrame(updateSnake);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <>
      {segments.map((segment, index) => (
        <MotionBox
          key={index}
          style={{
            x: segment.x - (index === 0 ? 8 : 4),
            y: segment.y - (index === 0 ? 8 : 4),
          }}
          position="fixed"
          top={0}
          left={0}
          w={index === 0 ? "16px" : "8px"}
          h={index === 0 ? "16px" : "8px"}
          zIndex={9999}
          pointerEvents="none"
          opacity={isVisible ? (1 - index / segments.length) * 0.8 : 0}
          transition="opacity 0.2s"
        >
          <Box
            position="relative"
            w="full"
            h="full"
            bg={index === 0 ? "red.400" : "blue.400"}
            borderRadius="full"
            boxShadow={index === 0 ? "0 0 20px rgba(245, 101, 101, 0.6)" : "0 0 10px rgba(66, 153, 225, 0.4)"}
            transform={index === 0 ? "scale(1.2)" : "scale(1)"}
          />
        </MotionBox>
      ))}
    </>
  );
}; 