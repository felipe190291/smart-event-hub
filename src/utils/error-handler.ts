import { sileo } from 'sileo';
import axios from 'axios';

/**
 * Centralized error handler for API calls and general errors.
 * Extracts the message from Axios responses (FastAPI style) or standard Errors.
 * 
 * @param error The error object caught in a catch block
 * @param defaultTitle The title to show in the notification
 * @returns The extracted error message string
 */
export const handleApiError = (error: unknown, defaultTitle = 'Error') => {
  let message = 'Ha ocurrido un error inesperado';

  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.detail || error.response?.data?.message;
    message = serverMessage || error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  sileo.error({
    title: defaultTitle,
    description: message,
    fill: "black"
  });

  return message;
};
