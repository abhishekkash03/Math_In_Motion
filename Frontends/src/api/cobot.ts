const API_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_URL);

export const startPattern = async (pattern: string) => {
  return fetch(`${API_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pattern,
      run: true,
    }),
  });
};