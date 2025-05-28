import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { getScoreboard } from '../services/api';
import type { Score } from '../services/api';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <FaTrophy color="gold" size="1.5em" />;
    case 2:
      return <FaMedal color="silver" size="1.5em" />;
    case 3:
      return <FaMedal color="#cd7f32" size="1.5em" />;
    default:
      return null;
  }
};

export const Scoreboard = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await getScoreboard();
        setScores(data);
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      width="100%"
      maxW="600px"
      bg="whiteAlpha.100"
      borderColor="whiteAlpha.200"
      boxShadow="0 0 20px rgba(66, 153, 225, 0.1)"
      backdropFilter="blur(10px)"
      color="white"
    >
      <VStack spacing={6}>
        <Heading
          size="lg"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          textShadow="0 0 20px rgba(66, 153, 225, 0.3)"
        >
          High Scores 🏆
        </Heading>
        <Box width="100%">
          <Grid
            templateColumns="repeat(3, 1fr)"
            mb={4}
            p={3}
            fontWeight="bold"
            color="whiteAlpha.900"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
          >
            <GridItem>Rank</GridItem>
            <GridItem>Player</GridItem>
            <GridItem textAlign="right">Attempts</GridItem>
          </Grid>
          <AnimatePresence>
            {scores.map((score, index) => (
              <MotionGrid
                key={`${score.name}-${index}`}
                templateColumns="repeat(3, 1fr)"
                p={3}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                _hover={{
                  bg: "whiteAlpha.100",
                  transform: "translateX(10px)",
                }}
                borderRadius="md"
                style={{ transition: "all 0.2s ease" }}
              >
                <GridItem>
                  <Box display="flex" alignItems="center" gap={2}>
                    {getRankIcon(index + 1)}
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {index + 1}
                    </motion.span>
                  </Box>
                </GridItem>
                <GridItem color="whiteAlpha.900">{score.name}</GridItem>
                <GridItem
                  textAlign="right"
                  color="blue.300"
                  fontWeight="bold"
                >
                  {score.attempts}
                </GridItem>
              </MotionGrid>
            ))}
          </AnimatePresence>
        </Box>
      </VStack>
    </MotionBox>
  );
}; 