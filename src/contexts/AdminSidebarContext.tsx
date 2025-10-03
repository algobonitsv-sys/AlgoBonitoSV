"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface AdminSidebarContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextValue | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const value = useMemo(
    () => ({ isSidebarOpen, toggleSidebar, setSidebarOpen }),
    [isSidebarOpen, toggleSidebar, setSidebarOpen]
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
  }
  return context;
}
