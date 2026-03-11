import * as SecureStore from "expo-secure-store";
import type { User } from "@qr/types";

const RESIDENT_SESSION_KEY = "resident-app-session";

type ResidentSession = {
  token: string;
  user: User;
};

export async function saveResidentSession(session: ResidentSession) {
  await SecureStore.setItemAsync(RESIDENT_SESSION_KEY, JSON.stringify(session));
}

export async function loadResidentSession() {
  const storedValue = await SecureStore.getItemAsync(RESIDENT_SESSION_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as ResidentSession;
  } catch {
    await SecureStore.deleteItemAsync(RESIDENT_SESSION_KEY);
    return null;
  }
}

export async function clearResidentSession() {
  await SecureStore.deleteItemAsync(RESIDENT_SESSION_KEY);
}
