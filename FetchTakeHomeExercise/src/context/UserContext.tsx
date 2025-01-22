import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });

  // Update localStorage whenever userName changes
  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName);
    } else {
      localStorage.removeItem("userName");
    }
  }, [userName]);

  const handleSetUserName = (name: string) => {
    setUserName(name);
  };

  return (
    <UserContext.Provider value={{ userName, setUserName: handleSetUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
