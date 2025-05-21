// contexts/CardContext.js
import { createContext, useContext, useState } from 'react';

const CardContext = createContext();

export const CardProvider = ({ children }) => {
  const [selectedCardId, setSelectedCardId] = useState(null);

  return (
    <CardContext.Provider value={{ selectedCardId, setSelectedCardId }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => useContext(CardContext);
