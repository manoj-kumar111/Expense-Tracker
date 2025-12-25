import { useState, useEffect } from 'react';

interface ExchangeRates {
  USD_TO_INR: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

const FALLBACK_RATE = 83.5; // Fallback rate if API fails
const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function useCurrencyRate() {
  const [rates, setRates] = useState<ExchangeRates>({
    USD_TO_INR: FALLBACK_RATE,
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRates = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rate, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRates({
            USD_TO_INR: rate,
            lastUpdated: new Date(timestamp),
            isLoading: false,
            error: null,
          });
          return;
        }
      }

      try {
        const response = await fetch(
          'https://api.frankfurter.app/latest?from=USD&to=INR'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        const rate = data.rates.INR;
        const timestamp = Date.now();

        // Cache the rate
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp }));

        setRates({
          USD_TO_INR: rate,
          lastUpdated: new Date(timestamp),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Currency rate fetch error:', error);
        setRates(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch live rates, using fallback',
        }));
      }
    };

    fetchRates();
  }, []);

  const formatUSD = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatINR = (amountUSD: number) => {
    const inrAmount = amountUSD * rates.USD_TO_INR;
    return `₹${inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return {
    ...rates,
    formatUSD,
    formatINR,
  };
}
