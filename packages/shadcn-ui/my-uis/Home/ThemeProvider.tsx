"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  currentTheme: ThemeType;
  setCurrentTheme: React.Dispatch<React.SetStateAction<ThemeType>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("light");
  const [page, setPage] = useState<number>(1);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        page,
        setPage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeProvider = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
