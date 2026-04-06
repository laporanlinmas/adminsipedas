"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirmOnly?: boolean;
}

interface GalleryState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
}

interface ToastState {
  msg: string;
  type: "ok" | "er";
  visible: boolean;
}

interface UIContextType {
  modal: ModalState;
  showModal: (opts: Omit<ModalState, "isOpen">) => void;
  hideModal: () => void;
  
  gallery: GalleryState;
  showGallery: (images: string[], index?: number) => void;
  hideGallery: () => void;

  toast: (msg: string, type?: "ok" | "er") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: null,
  });

  const [gallery, setGallery] = useState<GalleryState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const [toastState, setToastState] = useState<ToastState>({
    msg: "",
    type: "ok",
    visible: false,
  });

  const showModal = (opts: Omit<ModalState, "isOpen">) => {
    setModal({ ...opts, isOpen: true });
  };

  const hideModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const showGallery = (images: string[], index = 0) => {
    setGallery({ isOpen: true, images, currentIndex: index });
  };

  const hideGallery = () => {
    setGallery((prev) => ({ ...prev, isOpen: false }));
  };

  const toast = (msg: string, type: "ok" | "er" = "ok") => {
    setToastState({ msg, type, visible: true });
  };

  useEffect(() => {
    if (toastState.visible) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastState.visible]);

  return (
    <UIContext.Provider value={{ modal, showModal, hideModal, gallery, showGallery, hideGallery, toast }}>
      {children}
      
      {/* Global Modal Render */}
      {modal.isOpen && (
        <div className="mov on" onClick={(e) => e.target === e.currentTarget && hideModal()}>
          <div className="mbox sm">
            <div className="mhd">
              <h5 style={{ fontSize: "1rem", fontWeight: 800 }}>{modal.title}</h5>
              <button className="bx" onClick={hideModal}>&times;</button>
            </div>
            <div className="mbd" style={{ fontSize: ".85rem", color: "var(--mid)" }}>{modal.content}</div>
            <div className="mft">
              {!modal.isConfirmOnly && (
                <button className="bg2" onClick={hideModal}>
                  {modal.cancelLabel || "Batal"}
                </button>
              )}
              <button
                className="bp"
                onClick={() => {
                  if (modal.onConfirm) modal.onConfirm();
                  hideModal();
                }}
              >
                {modal.confirmLabel || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Gallery Render */}
      {gallery.isOpen && (
        <div className="gov on" onClick={(e) => e.target === e.currentTarget && hideGallery()}>
          <button className="gov-close" onClick={hideGallery}>&times;</button>
          <div className="gov-inner">
             {gallery.images.length > 0 && (
               <img 
                 src={gallery.images[gallery.currentIndex]} 
                 alt="Gallery" 
                 style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain" }} 
               />
             )}
          </div>
          {gallery.images.length > 1 && (
            <div className="gov-nav">
               <button 
                 disabled={gallery.currentIndex === 0}
                 onClick={() => setGallery(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }))}
               >
                 <i className="fas fa-chevron-left" />
               </button>
               <span>{gallery.currentIndex + 1} / {gallery.images.length}</span>
               <button 
                 disabled={gallery.currentIndex === gallery.images.length - 1}
                 onClick={() => setGallery(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }))}
               >
                 <i className="fas fa-chevron-right" />
               </button>
            </div>
          )}
        </div>
      )}

      {/* Global Toast Render */}
      {toastState.visible && (
        <div 
          className={`toast on ${toastState.type === "er" ? "er" : ""}`}
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: toastState.type === "er" ? "var(--red)" : "var(--blue)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "50px",
            fontSize: ".85rem",
            fontWeight: 800,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "toastIn 0.3s ease-out forwards"
          }}
        >
          <i className={`fas fa-${toastState.type === "er" ? "circle-xmark" : "circle-check"}`} />
          {toastState.msg}
        </div>
      )}

      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
