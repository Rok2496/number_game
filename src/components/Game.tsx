import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  useToast,
  Heading,
  keyframes,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { startGame, makeGuess } from '../services/api';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionInput = motion(Input);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);

const glow = keyframes`
  0% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.3) }
  50% { box-shadow: 0 0 30px rgba(66, 153, 225, 0.6) }
  100% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.3) }
`;

const welcomeText = keyframes`
  0% { transform: translateY(-50px); opacity: 0; filter: blur(10px); }
  50% { transform: translateY(0); opacity: 1; filter: blur(0px); }
  100% { transform: translateY(50px); opacity: 0; filter: blur(10px); }
`;

const bloodPulse = keyframes`
  0% { background: rgba(139, 0, 0, 0.2); }
  50% { background: rgba(139, 0, 0, 0.4); }
  100% { background: rgba(139, 0, 0, 0.2); }
`;

interface GameProps {
  playerName: string;
  onGameComplete: () => void;
}

export const Game = ({ playerName, onGameComplete }: GameProps) => {
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showBloodOverlay, setShowBloodOverlay] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const toast = useToast();

  useEffect(() => {
    handleStartGame();
  }, []);

  // Add blood overlay effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBloodOverlay(true);
    }, 5000);

    const handleMouseMove = () => {
      if (showBloodOverlay) {
        setShowBloodOverlay(false);
        handleWelcomeBack();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showBloodOverlay]);

  // Add welcome back effect
  const handleWelcomeBack = () => {
    setShowWelcomeBack(true);
    setTimeout(() => setShowWelcomeBack(false), 3000);
  };

  const handleStartGame = async () => {
    try {
      await startGame(playerName);
      setIsGameStarted(true);
      setMessage('Game started! Make your guess between 1 and 100');
      setAttempts(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    if (!isGameStarted) {
      await handleStartGame();
      return;
    }

    const numGuess = parseInt(guess);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Please enter a valid number between 1 and 100');
      return;
    }

    try {
      const result = await makeGuess(playerName, numGuess);
      
      if (result.error) {
        if (result.error === "Start a game first!") {
          await handleStartGame();
          const retryResult = await makeGuess(playerName, numGuess);
          handleGuessResult(retryResult);
        } else {
          setMessage(result.error);
        }
      } else {
        handleGuessResult(result);
      }
    } catch (error) {
      console.error('Error making guess:', error);
      setMessage('Error occurred while making guess. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to submit guess. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setGuess('');
    setAttempts(prev => prev + 1);
  };

  const handleGuessResult = (result: any) => {
    let hintMessage = result.result;
    let hintEmoji = "";

    if (result.result === "Too low!") {
      hintMessage = "Too Low";
      hintEmoji = "📈";
    } else if (result.result === "Too high!") {
      hintMessage = "Too High";
      hintEmoji = "📉";
    } else if (result.result === "Correct!") {
      hintMessage = "Correct!";
      hintEmoji = "🎉";
      setIsCorrect(true);
      setShowConfetti(true);
      toast({
        title: 'Congratulations! 🎉',
        description: `You won in ${result.attempts} attempts!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        setShowConfetti(false);
        setIsCorrect(false);
        setIsGameStarted(false);
        onGameComplete();
      }, 5000);
    }

    setMessage(`${hintEmoji} ${hintMessage}`);
  };

  return (
    <>
      {showBloodOverlay && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(139, 0, 0, 0.2)"
          zIndex={9997}
          animation={`${bloodPulse} 3s infinite`}
          pointerEvents="none"
        />
      )}

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
            css={{
              animation: `${welcomeText} 3s forwards`,
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
            css={{
              animation: `${welcomeText} 3s forwards`,
              animationDelay: '0.5s',
            }}
          >
            You escaped the reaper... for now
          </MotionBox>
        </Box>
      )}

      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
      <MotionVStack
        spacing={8}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <MotionHeading
          as="h2"
          fontSize="4xl"
          bgGradient="linear(to-r, blue.400, purple.500, blue.400)"
          bgClip="text"
          textAlign="center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          Welcome, {playerName}! 👋
        </MotionHeading>

        <MotionBox
          fontSize="2xl"
          color="blue.400"
          textAlign="center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Attempts: {attempts}
        </MotionBox>

        <MotionVStack
          spacing={6}
          width="100%"
          maxW="400px"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MotionInput
            placeholder="Enter your guess (1-100)"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            size="lg"
            height="70px"
            fontSize="xl"
            type="number"
            min={1}
            max={100}
            bg="whiteAlpha.200"
            color="white"
            border="none"
            _placeholder={{ color: 'whiteAlpha.600' }}
            _hover={{ bg: 'whiteAlpha.300' }}
            _focus={{
              bg: 'whiteAlpha.400',
              boxShadow: '0 0 30px rgba(66, 153, 225, 0.4)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />

          <MotionButton
            onClick={handleSubmit}
            isDisabled={!guess || isCorrect}
            size="lg"
            height="70px"
            width="100%"
            fontSize="2xl"
            bgGradient="linear(to-r, blue.400, purple.500)"
            color="white"
            _hover={{
              bgGradient: "linear(to-r, blue.500, purple.600)",
            }}
            _disabled={{
              opacity: 0.5,
              cursor: "not-allowed"
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(66, 153, 225, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Submit Guess
          </MotionButton>

          <AnimatePresence mode="wait">
            {message && (
              <MotionBox
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                padding={6}
                bg={isCorrect ? "green.500" : message.includes("Too High") ? "purple.400" : message.includes("Too Low") ? "orange.400" : "blue.500"}
                color="white"
                borderRadius="2xl"
                width="100%"
                textAlign="center"
                boxShadow="0 0 30px rgba(66, 153, 225, 0.4)"
                fontSize="2xl"
                fontWeight="bold"
                css={{
                  animation: `${glow} 2s ease-in-out infinite`
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(66, 153, 225, 0.6)"
                }}
              >
                {message}
              </MotionBox>
            )}
          </AnimatePresence>
        </MotionVStack>
      </MotionVStack>
    </>
  );
}; 