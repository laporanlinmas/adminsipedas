export default function Modals() {
  return (
    <>
      <div className="mov" id="medit">
        <div className="mbox">
          <div className="mhd">
            <h5><i className="fas fa-pen-to-square" style={{color:"var(--blue)"}}></i>Edit Laporan</h5><button className="bx"
              onClick={() => { cm('medit') }}>&times;</button>
          </div>
          <div className="mbd" id="medit-body"></div>
          <div className="mft"><button className="bg2" onClick={() => { cm('medit') }}>Batal</button><button className="bp"
              onClick={() => { submitEdit() }}><i className="fas fa-save"></i> Simpan</button></div>
        </div>
      </div>

      <div className="mov" id="mconf">
        <div className="mbox sm">
          <div className="mhd">
            <h5 style={{color:"var(--red)"}}><i className="fas fa-triangle-exclamation"></i>Konfirmasi Hapus</h5><button className="bx"
              onClick={() => { cm('mconf') }}>&times;</button>
          </div>
          <div className="mbd">
            <p style={{fontSize:".8rem",color:"var(--mid)",lineHeight:"1.6"}} id="mconf-msg">Hapus data ini?</p>
          </div>
          <div className="mft"><button className="bg2" onClick={() => { cm('mconf') }}>Batal</button><button className="bd" id="mbtnhps"><i
                className="fas fa-trash"></i> Hapus</button></div>
        </div>
      </div>

      <div className="mov" id="mslm">
        <div className="mbox sm">
          <div className="mhd">
            <h5 id="mslm-title"><i className="fas fa-user-plus" style={{color:"var(--green)"}}></i>Input Anggota</h5><button
              className="bx" onClick={() => { cm('mslm') }}>&times;</button>
          </div>
          <div className="mbd" id="mslm-body"></div>
          <div className="mft"><button className="bg2" onClick={() => { cm('mslm') }}>Batal</button><button className="bp"
              onClick={() => { submitSlm() }}><i className="fas fa-save"></i> Simpan</button></div>
        </div>
      </div>

      <div className="mov" id="mpdf">
        <div className="mbox xl" style={{maxWidth:"860px",width:"96vw"}}>
          <div className="mhd">
            <h5><i className="fas fa-file-alt" style={{color:"var(--red)"}}></i>Cetak Laporan Monitoring Pedestrian</h5>
            <button className="bx" onClick={() => { cm('mpdf') }}>&times;</button>
          </div>

          <div className="mbd"
            style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:"12px",maxHeight:"82vh",overflowY:"auto"}}>
            
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"10px",padding:"14px"}}>
              <p
                style={{fontSize:".67rem",fontWeight:"800",color:"var(--mid)",marginBottom:"12px",textTransform:"uppercase",letterSpacing:".06em"}}>
                <i className="fas fa-pen-to-square" style={{color:"var(--blue)"}}></i> Isi Laporan
              </p>

              <div className="frow">
                <div className="fcol"><label className="flbl">Hari</label><input className="fctl" id="pdf-hari" /></div>
                <div className="fcol"><label className="flbl">Tanggal Kegiatan</label><input className="fctl" id="pdf-tanggal" /></div>
              </div>

              <div className="frow">
                <div className="fcol" style={{flex:"2"}}><label className="flbl">Tujuan</label><input className="fctl" id="pdf-tujuan" />
                </div>
                <div className="fcol" style={{flex:"2"}}><label className="flbl">Nomor SPT <span
                      style={{fontSize:".55rem",color:"var(--muted)"}}>(default dari Pengaturan)</span></label><input
                    className="fctl" id="pdf-nospt" placeholder="300.1.4 / ARH / 8 / 405.14 / 2026" /></div>
              </div>

              <div className="frow">
                <div className="fcol" style={{flex:"2"}}><label className="flbl">Lokasi</label><input className="fctl" id="pdf-lokasi" />
                </div>
                <div className="fcol" style={{flex:"2"}}><label className="flbl">Anggota</label><input className="fctl" id="pdf-anggota" />
                </div>
                <div className="fcol" style={{flex:"1"}}><label className="flbl">Pukul</label><input className="fctl" id="pdf-pukul" /></div>
              </div>

              <div className="frow" style={{alignItems:"flex-start"}}>
                <div className="fcol">
                  <label className="flbl" style={{color:"var(--red)"}}><i className="fas fa-triangle-exclamation"></i> Identitas
                    Pelanggar</label>
                  <textarea className="fctl" id="pdf-identitas" rows="4"
                    placeholder="Kosongkan jika NIHIL&#10;Contoh:&#10;Nama   : Budi Santoso&#10;Alamat : Jl. Merdeka No.5"></textarea>
                  <div style={{fontSize:".6rem",color:"var(--muted)",marginTop:"3px"}}>Jika diisi, baris Identitas otomatis muncul
                    di tabel.</div>
                </div>
                <div className="fcol">
                  <label className="flbl">Uraian Laporan</label>
                  <textarea className="fctl" id="pdf-uraian" rows="4"
                    placeholder="Otomatis terisi dari Keterangan laporan. Bisa diedit sebelum cetak..."></textarea>
                  <div style={{fontSize:".6rem",color:"var(--muted)",marginTop:"3px"}}><i className="fas fa-info-circle"></i> Otomatis
                    terisi dari kolom <strong>Keterangan</strong>.</div>
                </div>
              </div>

              <div className="frow" style={{alignItems:"flex-start",gap:"10px"}}>
                <div className="fcol">
                  <label className="flbl">Tanggal Surat (di bawah TTD)</label>
                  <input className="fctl" id="pdf-tglsurat" placeholder="Contoh: 7 Maret 2026" />
                </div>
                <div className="fcol" style={{paddingTop:"18px"}}>
                  <button className="bg2" style={{width:"100%",fontSize:".65rem"}} onClick={() => { togglePdfTtd() }}>
                    <i className="fas fa-pen-nib"></i> <span id="pdf-ttd-lbl">Ubah Data Pejabat TTD ▸</span>
                  </button>
                </div>
              </div>

              <div id="pdf-ttd-box" className="pdf-ttd-box">
                <div className="frow">
                  <div className="fcol"><label className="flbl">Jabatan</label><input className="fctl" id="pdf-jabatan"
                      defaultValue="Kepala Bidang SDA dan Linmas" /></div>
                  <div className="fcol"><label className="flbl">Nama</label><input className="fctl" id="pdf-namatd"
                      defaultValue="Erry Setiyoso Birowo, SP" /></div>
                </div>
                <div className="frow">
                  <div className="fcol"><label className="flbl">Pangkat</label><input className="fctl" id="pdf-pangkat" defaultValue="Pembina" />
                  </div>
                  <div className="fcol"><label className="flbl">NIP</label><input className="fctl" id="pdf-nip"
                      defaultValue="19751029 200212 1 008" /></div>
                </div>
                <div style={{fontSize:".6rem",color:"var(--muted)",marginTop:"6px"}}><i className="fas fa-info-circle"></i> Default
                  dari Pengaturan. Ubah di sini jika perlu override untuk cetakan ini.</div>
              </div>

              <button id="btn-ref-pdf" className="bp" style={{width:"100%",marginTop:"4px"}} onClick={() => { refreshPdfPreview() }}>
                <i className="fas fa-sync"></i> Perbarui Preview
              </button>
              <div style={{textAlign:"center",fontSize:".6rem",color:"var(--blue)",marginTop:"6px"}}>
                <i className="fas fa-bolt"></i> Preview re-generates automatically as you type
              </div>
            </div>

            <div style={{border:"1px solid var(--border)",borderRadius:"10px",overflow:"hidden",background:"#e8e8e8",flexShrink:"0"}}>
              <div style={{background:"var(--card)",borderBottom:"1px solid var(--border)",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span
                  style={{fontSize:".67rem",fontWeight:"800",color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em"}}>
                  <i className="fas fa-eye" style={{color:"var(--blue)"}}></i> Preview Dokumen
                </span>
                <button className="bp" style={{fontSize:".65rem",padding:"5px 12px"}} onClick={() => { doPrint('pdfframe') }}>
                  <i className="fas fa-print"></i> Cetak / PDF
                </button>
              </div>
              <iframe id="pdfframe" style={{width:"100%",height:"520px",border:"none",display:"block"}}></iframe>
            </div>

          </div>

          <div className="mft">
            <button className="bg2" onClick={() => { cm('mpdf') }}>Tutup</button>
            <button className="bp" onClick={() => { doPrint('pdfframe') }}><i className="fas fa-print"></i> Cetak / PDF</button>
          </div>
        </div>
      </div>

      <div className="mov" id="mkolektif">
        <div className="mbox xl">
          <div className="mhd">
            <h5><i className="fas fa-print" style={{color:"var(--purple)"}}></i>Cetak Laporan Kolektif</h5><button className="bx"
              onClick={() => { cm('mkolektif') }}>&times;</button>
          </div>
          <div className="mbd" style={{padding:"0"}}>
            <div style={{display:"grid",gridTemplateColumns:"260px 1fr",height:"74vh"}}>
              <div
                style={{padding:"14px",borderRight:"1px solid var(--border)",overflowY:"auto",background:"var(--bg)",display:"flex",flexDirection:"column",gap:"10px"}}>
                <p style={{fontSize:".67rem",fontWeight:"800",color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em"}}>
                  Filter Rentang Tanggal</p>
                <div className="fgrp"><label className="flbl">Dari Tanggal</label><input className="fctl" type="date" id="kol-from"
                    onChange={() => { _kolPreviewDebounced() }} /></div>
                <div className="fgrp"><label className="flbl">Sampai Tanggal</label><input className="fctl" type="date" id="kol-to"
                    onChange={() => { _kolPreviewDebounced() }} /></div>
                <button className="bp" style={{width:"100%"}} onClick={() => { previewKolektif() }}><i className="fas fa-eye"></i> Perbarui
                  Preview</button>
                <div id="kol-info"
                  style={{fontSize:".7rem",color:"var(--mid)",background:"var(--card)",border:"1px solid var(--border)",borderRadius:"7px",padding:"9px",minHeight:"40px"}}>
                </div>
                <div style={{marginTop:"auto"}}>
                  <p style={{fontSize:".63rem",color:"var(--muted)",lineHeight:"1.6"}}><i className="fas fa-info-circle"
                      style={{color:"var(--blue)"}}></i> PDF landscape A4 kop surat resmi.</p>
                </div>
              </div>
              <div style={{background:"#e8e8e8",position:"relative"}}>
                <div id="kol-empty"
                  style={{position:"absolute",inset:"0",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"8px",color:"rgba(0,0,0,.3)"}}>
                  <i className="fas fa-file-lines" style={{fontSize:"2.4rem",opacity:".18"}}></i>
                  <p style={{fontSize:".76rem"}}>Pilih rentang tanggal lalu klik Perbarui Preview</p>
                </div>
                <iframe id="kolframe" style={{width:"100%",height:"100%",border:"none",display:"none"}}></iframe>
              </div>
            </div>
          </div>
          <div className="mft"><button className="bg2" onClick={() => { cm('mkolektif') }}>Tutup</button><button className="bp" id="kol-printbtn"
              onClick={() => { doPrint('kolframe') }} disabled style={{opacity:".5"}}><i className="fas fa-print"></i> Cetak / PDF</button>
          </div>
        </div>
      </div>

      <div className="mov" id="mlayer">
        <div className="mbox xl" style={{maxWidth:"720px"}}>
          <div className="mhd">
            <h5><i className="fas fa-layer-group" style={{color:"var(--teal)"}}></i> Edit Layer Peta Pedestrian</h5>
            <button className="bx" onClick={() => { cm('mlayer') }}>&times;</button>
          </div>
          <div className="mbd" style={{padding:"0"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",height:"68vh",minHeight:"400px"}}>
              <div style={{padding:"12px",borderRight:"1px solid var(--border)",overflowY:"auto",background:"var(--bg)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"9px"}}>
                  <p
                    style={{fontSize:".67rem",fontWeight:"800",color:"var(--mid)",textTransform:"uppercase",letterSpacing:".06em"}}>
                    Daftar Layer</p>
                  <button className="bp" style={{fontSize:".63rem",padding:"5px 10px"}} onClick={() => { openLayerForm(null) }}>
                    <i className="fas fa-plus"></i> Tambah
                  </button>
                </div>
                <div id="layer-list-body">
                  <div className="empty"><i className="fas fa-layer-group"></i>
                    <p>Memuat...</p>
                  </div>
                </div>
              </div>
              <div style={{padding:"12px",overflowY:"auto"}}>
                <div id="layer-form-wrap">
                  <div className="empty" style={{padding:"40px 10px"}}>
                    <i className="fas fa-hand-pointer" style={{fontSize:"1.5rem",opacity:".14",display:"block",marginBottom:"8px"}}></i>
                    <p style={{fontSize:".72rem"}}>Pilih layer di kiri untuk diedit,<br />atau klik Tambah untuk layer baru.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mft">
            <button className="bg2" onClick={() => { cm('mlayer') }}>Tutup</button>
            <button className="bp" onClick={() => { refreshLeaflet() }}>
              <i className="fas fa-sync"></i> Refresh Peta
            </button>
          </div>
        </div>
      </div>

      <div className="mov" id="mconfLayer" style={{zIndex:"100000"}}>
        <div className="mbox sm">
          <div className="mhd">
            <h5 style={{color:"var(--red)"}}><i className="fas fa-triangle-exclamation"></i> Hapus Layer</h5><button className="bx"
              onClick={() => { cm('mconfLayer') }}>&times;</button>
          </div>
          <div className="mbd">
            <p style={{fontSize:".8rem",color:"var(--mid)",lineHeight:"1.6"}}>Hapus layer ini dari peta? Data tidak dapat
              dikembalikan.</p>
          </div>
          <div className="mft"><button className="bg2" onClick={() => { cm('mconfLayer') }}>Batal</button><button className="bd"
              id="mbtnhpsLayer"><i className="fas fa-trash"></i> Hapus</button></div>
        </div>
      </div>
    </>
  );
}
