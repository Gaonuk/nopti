const BACKEND_URL = "http://127.0.0.1:8000";

export const fetchUserContent = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/content`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
