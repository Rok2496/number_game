import { useState } from 'react'
import {
  Container,
  VStack,
  Input,
  Button,
  Heading,
  IconButton,
  useColorMode,
} from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/provider'
import { FaSun, FaMoon } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { Game } from './components/Game'
import { Scoreboard } from './components/Scoreboard'
import { ParticleBackground } from './components/ParticleBackground'
import { SnakeCursor } from './components/SnakeCursor'
import { PredatorSnake } from './components/PredatorSnake'
import theme from './theme'

const MotionContainer = motion(Container)
const MotionVStack = motion(VStack)
const MotionInput = motion(Input)
const MotionButton = motion(Button)
const MotionHeading = motion(Heading)

function App() {
  const [playerName, setPlayerName] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode()

  const handleStartPlaying = () => {
    if (playerName.trim()) {
      setIsPlaying(true)
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <ParticleBackground />
      <SnakeCursor />
      <PredatorSnake />
      <IconButton
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
        onClick={toggleColorMode}
        position="fixed"
        top={4}
        right={4}
        aria-label="Toggle color mode"
        zIndex={2}
        variant="ghost"
        color="white"
        _hover={{ bg: 'whiteAlpha.200' }}
      />
      <MotionContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        centerContent
        py={8}
        position="relative"
        zIndex={1}
      >
        <MotionVStack spacing={8} width="100%">
          <MotionHeading
            initial={{ y: -50, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              textShadow: [
                "0 0 20px rgba(66, 153, 225, 0.5)",
                "0 0 35px rgba(66, 153, 225, 0.8)",
                "0 0 20px rgba(66, 153, 225, 0.5)"
              ]
            }}
            transition={{ 
              duration: 1,
              ease: "easeOut",
              textShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            fontSize="7xl"
            bgGradient="linear(to-r, blue.400, purple.500, blue.400)"
            bgClip="text"
            textAlign="center"
            letterSpacing="tight"
            whileHover={{
              scale: 1.05,
              textShadow: "0 0 40px rgba(66, 153, 225, 0.8)"
            }}
          >
            Number Guessing Game
          </MotionHeading>
          
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              <MotionVStack
                key="input"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                spacing={6}
                width="100%"
                maxW="400px"
              >
                <MotionInput
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  size="lg"
                  autoFocus
                  bg="whiteAlpha.200"
                  color="white"
                  border="none"
                  fontSize="xl"
                  height="70px"
                  _placeholder={{ color: 'whiteAlpha.600' }}
                  _hover={{ bg: 'whiteAlpha.300' }}
                  _focus={{
                    bg: 'whiteAlpha.400',
                    boxShadow: '0 0 20px rgba(66, 153, 225, 0.3)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <MotionButton
                  onClick={handleStartPlaying}
                  isDisabled={!playerName.trim()}
                  size="lg"
                  width="100%"
                  height="70px"
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
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Start Playing
                </MotionButton>
              </MotionVStack>
            ) : (
              <Game
                playerName={playerName}
                onGameComplete={() => setIsPlaying(false)}
              />
            )}
          </AnimatePresence>
          
          <Scoreboard />
        </MotionVStack>
      </MotionContainer>
    </ChakraProvider>
  )
}

export default App
