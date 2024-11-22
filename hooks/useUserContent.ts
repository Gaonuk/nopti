// src/hooks/useUserContent.js
import { useEffect, useState } from 'react';

import { fetchUserContent } from '../api/contentService';

export const useUserContent = () => {
  const [userContent, setUserContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchUserContent();
        setUserContent(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { userContent, loading, error };
};
