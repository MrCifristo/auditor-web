"use client";

const TOKEN_KEY = "auditor_web_token";

const isBrowser = () => typeof window !== "undefined";

export function saveToken(token: string) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
}

