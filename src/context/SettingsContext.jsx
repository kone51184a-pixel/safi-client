import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const SettingsContext = createContext({
  deliveryFee: 1000,
  tvaRate: 18,
  orangeMoneyNumber: '',
  waveNumber: '',
});

export function SettingsProvider({ children }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    deliveryFee: 1000,
    tvaRate: 18,
    orangeMoneyNumber: '',
    waveNumber: '',
  });

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then((data) => {
        setSettings({
          deliveryFee: data.delivery_fee ? Number(data.delivery_fee) : 1000,
          tvaRate: data.tva_rate ? Number(data.tva_rate) : 18,
          orangeMoneyNumber: data.orange_money_number || '',
          waveNumber: data.wave_number || '',
        });
      })
      .catch(() => {});
  }, [token]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
