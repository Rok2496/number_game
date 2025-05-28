import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface Score {
  name: string;
  attempts: number;
}

export const startGame = async (name: string) => {
  const response = await axios.post(`${API_URL}/start_game`, { name });
  return response.data;
};

export const makeGuess = async (name: string, guess: number) => {
  const response = await axios.post(`${API_URL}/guess`, { name, guess });
  return response.data;
};

export const getScoreboard = async (): Promise<Score[]> => {
  const response = await axios.get(`${API_URL}/scoreboard`);
  return response.data;
}; 