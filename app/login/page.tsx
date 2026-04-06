"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, user, isLoading } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError("Username & password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await login(username, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message || "Login gagal.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div id="app-wrap">
      <div id="lp">
        <form className="lcard" onSubmit={handleSubmit}>
          <div className="llgo">
            <img src="/assets/icon-full.png" alt="Logo Linmas" />
            <div className="lsipedas-wrap">
              <div className="lsipedas">SI-PEDAS</div>
              <div className="lsipedas-hr" />
            </div>
            <div className="lsubtitle">
              Dashboard Monitoring
              <br />
              <strong>SISTEM INFORMASI PEDESTRIAN SATLINMAS</strong>
            </div>
          </div>

          <div id="lerr" className={error ? "on" : ""}>
            <i className="fas fa-circle-exclamation" /> <span>{error}</span>
          </div>

          <label className="llbl">Username</label>
          <div className="liwrap">
            <i className="fas fa-user" />
            <input
              className="linp"
              type="text"
              placeholder="Masukkan username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("ip")?.focus()}
            />
          </div>

          <label className="llbl">Password</label>
          <div className="liwrap">
            <i className="fas fa-lock" />
            <input
              id="ip"
              className="linp"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eyetog"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>

          <button className="lbtn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Memeriksa...
              </>
            ) : (
              <>
                <i className="fas fa-right-to-bracket" /> Masuk
              </>
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: ".57rem", color: "rgba(255,255,255,.11)", marginTop: 16 }}>
            © 2026 Bidang SDA dan Linmas
          </p>
        </form>
      </div>
    </div>
  );
}
