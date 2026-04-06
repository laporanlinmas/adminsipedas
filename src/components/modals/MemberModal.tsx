"use client";

import React, { useState, useEffect } from "react";

interface Member {
  _ri?: number;
  nama: string;
  tglLahir: string;
  unit: string;
  wa: string;
  usia?: number | string;
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  member?: Member | null;
  isSaving: boolean;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  member,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Member>({
    nama: "",
    tglLahir: "",
    unit: "",
    wa: "",
  });

  const [agePrev, setAgePrev] = useState("");

  useEffect(() => {
    if (member) {
      setFormData(member);
      calculateAge(member.tglLahir);
    } else {
      setFormData({ nama: "", tglLahir: "", unit: "", wa: "" });
      setAgePrev("");
    }
  }, [member, isOpen]);

  const calculateAge = (dateStr: string) => {
    if (!dateStr) {
      setAgePrev("");
      return;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      setAgePrev("");
      return;
    }
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    setAgePrev(age >= 0 ? `Usia: ${age} tahun` : "");
  };

  if (!isOpen) return null;

  const unitOptions = [
    "Satpol PP",
    "Satlinmas Desa/Kelurahan",
    "Satgas Linmas Pedestrian",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert("Nama wajib diisi.");
      return;
    }
    await onSave(formData);
  };

  return (
    <div className={`mov on`}>
      <div className="mbox sm">
        <div className="mhd">
          <h5>
            <i
              className={`fas ${member ? "fa-user-pen" : "fa-user-plus"}`}
              style={{ color: member ? "var(--blue)" : "var(--green)" }}
            />{" "}
            {member ? "Edit Anggota" : "Tambah Anggota"}
          </h5>
          <button className="bx" onClick={onClose} disabled={isSaving}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mbd">
            <div className="fgrp">
              <label className="flbl">
                Nama Lengkap <span className="req">*</span>
              </label>
              <input
                className="fctl"
                placeholder="Nama lengkap"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                disabled={isSaving}
                autoFocus
              />
            </div>
            <div className="frow">
              <div className="fcol">
                <label className="flbl">Tanggal Lahir</label>
                <input
                  className="fctl"
                  type="date"
                  value={formData.tglLahir}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, tglLahir: val });
                    calculateAge(val);
                  }}
                  disabled={isSaving}
                />
                <div
                  style={{
                    fontSize: ".63rem",
                    color: "var(--blue)",
                    marginTop: "3px",
                    fontWeight: 700,
                    minHeight: "15px",
                  }}
                >
                  {agePrev}
                </div>
              </div>
              <div className="fcol">
                <label className="flbl">Unit</label>
                <select
                  className="fctl"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  disabled={isSaving}
                >
                  <option value="">-- Pilih Unit --</option>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fgrp">
              <label className="flbl">Nomor WhatsApp</label>
              <input
                className="fctl"
                placeholder="08xxxxxxxxxx"
                value={formData.wa}
                onChange={(e) => setFormData({ ...formData, wa: e.target.value })}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="mft">
            <button type="button" className="bg2" onClick={onClose} disabled={isSaving}>
              Batal
            </button>
            <button type="submit" className="bp" disabled={isSaving}>
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save" /> Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
