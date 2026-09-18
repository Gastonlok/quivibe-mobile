import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { onlineManager, useQueryClient } from "@tanstack/react-query";
import { users } from "../services/api/users";
import { configureSession } from "../services/api/client";
import type { User } from "../types/api";
const key = "quivibe.session.v1";
const Context = createContext<{
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
} | null>(null);
export function SessionProvider({ children }: PropsWithChildren) {
  const cache = useQueryClient(),
    currentToken = useRef<string | null>(null),
    generation = useRef(0);
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false);
  function expire() {
    generation.current++;
    currentToken.current = null;
    configureSession(null);
    setUser(null);
    cache.clear();
    if (Platform.OS !== "web")
      void SecureStore.deleteItemAsync(key).catch(() => {});
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token =
          Platform.OS === "web" ? null : await SecureStore.getItemAsync(key);
        if (!active || !token) return;
        currentToken.current = token;
        configureSession(token, expire);
        setReady(true);
        const version = generation.current;
        const session = await users.session();
        if (active && generation.current === version) setUser(session.user);
      } catch {
        /* A network failure must not erase a persisted session. */
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
    // Provider initializes once. Session callbacks intentionally use setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function login(email: string, password: string) {
    generation.current++;
    const session = await users.login({ email, password });
    if (Platform.OS !== "web")
      await SecureStore.setItemAsync(key, session.token);
    await cache.cancelQueries();
    cache.clear();
    currentToken.current = session.token;
    configureSession(session.token, expire);
    setUser(session.user);
  }
  async function logout() {
    try {
      await users.logout();
    } finally {
      await cache.cancelQueries();
      expire();
    }
  }
  async function refresh() {
    if (!currentToken.current) return;
    const version = generation.current;
    const session = await users.session();
    if (generation.current === version) setUser(session.user);
  }
  useEffect(
    () =>
      onlineManager.subscribe((online) => {
        if (online && currentToken.current) void refresh().catch(() => {});
      }),
    [],
  );
  return (
    <Context.Provider value={{ user, ready, login, logout, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error("SessionProvider absent");
  return value;
}
