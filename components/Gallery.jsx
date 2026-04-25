export default function Gallery() {
  return (
    <div id="gov">
      <button id="gcl" onClick={() => { galClose() }}>&times;</button>
      <div id="gcnt">1 / 1</div>
      <div id="gloaderOverlay"><i className="fas fa-spinner fa-spin"></i> Memuat...</div>
      <div className="gmw">
        <button className="gnav" id="gpv" onClick={() => { galNav(-1) }}><i className="fas fa-chevron-left"></i></button>
        <img id="gimg" src="" alt="" onError={(e) => { const _this = e.target; galImgErr(_this) }} onLoad={(e) => { const _this = e.target; galImgLoad(_this) }} />
        <button className="gnav" id="gnx" onClick={() => { galNav(1) }}><i className="fas fa-chevron-right"></i></button>
      </div>
      <div id="gths"></div>
      <div id="gdrvlink"><a href="#" id="gdrvhref" target="_blank" rel="noopener"><i className="fab fa-google-drive"></i> Buka
          di Google Drive</a></div>
    </div>
  );
}
