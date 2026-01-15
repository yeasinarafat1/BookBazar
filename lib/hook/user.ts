'use client';

import { useState, useEffect } from "react";
import { getLoggedInUser } from "@/lib/action/user"; // Ensure this path matches your file structure
import { User } from "@/db/Schemas/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await getLoggedInUser();
        if (res.isAuthenticated && res.user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}