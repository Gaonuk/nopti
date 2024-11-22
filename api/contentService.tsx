const BACKEND_URL = "https://nopti-ee349d72e62a.herokuapp.com";

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