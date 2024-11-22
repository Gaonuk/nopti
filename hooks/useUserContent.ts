// src/hooks/useUserContent.js
import { useEffect, useState } from "react";
import { ContentItem } from "../types/Content";
import { fetchUserContent } from "../api/contentService";

interface UserContentResponse {
  news_list: Array<{
    title: string;
    link: string;
    summary: string;
    date: string;
    passed: boolean;
    source: string;
  }>;
}

export const useUserContent = () => {
  const [userContent, setUserContent] = useState<ContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
