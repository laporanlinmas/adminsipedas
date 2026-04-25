'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // activePage encodes both module and sub-page e.g. 'main', 'pedestrian:dashboard', 'poskamling:data'
  const [activePage, setActivePage] = useState('main');

  useEffect(() => {
    const savedDark = localStorage.getItem('_slmdark');
    if (savedDark === '1') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    const checkResponsive = () => {
      const mobile = window.innerWidth <= 840;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        document.body.classList.add('sb-off');
        document.body.classList.add('mode-phone');
      } else {
        setIsSidebarOpen(true);
        document.body.classList.remove('sb-off');
        document.body.classList.remove('mode-phone');
      }
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      if (next) document.body.classList.remove('sb-off');
      else document.body.classList.add('sb-off');
      return next;
    });
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.add('sb-off');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('_slmdark', '1');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('_slmdark', '0');
      }
      return next;
    });
  };

  const navigateTo = (page) => {
    setActivePage(page);
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.add('sb-off');
    }
  };

  return (
    <UIContext.Provider value={{
      isSidebarOpen, toggleSidebar, closeSidebar,
      isDarkMode, toggleDarkMode,
      isMobile,
      activePage, setActivePage,
      navigateTo
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
