import { useContext } from 'react';
import { JourneyContext } from '../context/JourneyContextObject';

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
