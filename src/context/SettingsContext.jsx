import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const SettingsContext = createContext({ deliveryFee: 1000 });

export function SettingsProvider({ children }) {
  const { token } = useAuth();
  const [deliveryFee, setDeliveryFee] = useState(1000);

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then((settings) => {
        if (settings.delivery_fee) setDeliveryFee(Number(settings.delivery_fee));
      })
      .catch(() => {}); // on garde la valeur par défaut si ça échoue
  }, [token]);

  return (
    <SettingsContext.Provider value={{ deliveryFee }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
