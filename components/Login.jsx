'use client';

export default function Login() {
  return (
    <div 
      id="lp" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-tl from-[#081428] via-[#0e2246] to-[#142d5e] bg-[length:400%_400%] animate-[bgMove_15s_ease_infinite] before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_68%_56%_at_72%_12%,rgba(30,111,217,0.28)_0%,transparent_68%),radial-gradient(ellipse_50%_48%_at_12%_88%,rgba(30,111,217,0.14)_0%,transparent_60%),radial-gradient(ellipse_38%_40%_at_86%_78%,rgba(201,149,15,0.10)_0%,transparent_55%)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] after:bg-[length:44px_44px]"
    >
      <div className="relative z-[1] bg-white/[0.058] border border-white/10 backdrop-blur-[22px] rounded-[24px] pt-[42px] px-[36px] pb-[34px] w-full max-w-[400px] shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
        
        <div className="flex flex-col items-center mb-[26px]">
          <img src="assets/icon-full.png" alt="Logo Linmas" className="w-[62px] h-[62px] object-contain drop-shadow-[0_4px_12px_rgba(201,149,15,0.44)] mb-[14px]" />
          <div className="flex flex-col items-center gap-2 mb-1.5">
            <div className="text-[1.6rem] font-black tracking-[0.40em] indent-[0.40em] uppercase bg-gradient-to-br from-[#ffd84d] via-[#ffb020] to-[#ff4d1a] bg-clip-text text-transparent m-0 text-center leading-none drop-shadow-[0_2px_10px_rgba(255,150,30,0.5)] animate-[sipedasPulse_4s_ease-in-out_infinite]">SI-PEDAS</div>
            <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent m-0"></div>
          </div>
          <div className="text-[0.66rem] text-white/40 tracking-[0.04em] text-center leading-[1.65] mt-0.5">
            Dashboard Monitoring<br /><strong className="text-white/60 font-bold">SISTEM INFORMASI PEDESTRIAN SATLINMAS</strong>
          </div>
        </div>

        <div id="lerr" className="hidden bg-[#c0392b]/15 border border-[#c0392b]/25 rounded-lg py-2 px-3 text-[#ffacac] text-[0.71rem] text-center mb-2.5 [&.on]:block">
          <i className="fas fa-circle-exclamation"></i> <span id="lerrmsg"></span>
        </div>

        <label className="text-[0.62rem] font-extrabold tracking-[0.07em] uppercase text-white/45 mb-1.5 block">Username</label>
        <div className="relative mb-[11px]">
          <i className="fas fa-user absolute left-[11px] top-1/2 -translate-y-1/2 text-white/25 text-[0.76rem]"></i>
          <input 
            id="iu" 
            className="w-full py-2.5 pr-3 pl-[32px] bg-white/[0.072] border border-white/10 rounded-lg text-white text-[0.82rem] transition-all duration-150 outline-none placeholder:text-white/20 focus:border-sblue focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(26,107,209,0.2)]" 
            type="text"
            placeholder="Masukkan username" 
            autoComplete="username"
            onKeyDown={(event) => { if(event.nativeEvent.key==='Enter') document.getElementById('ip').focus() }} 
          />
        </div>

        <label className="text-[0.62rem] font-extrabold tracking-[0.07em] uppercase text-white/45 mb-1.5 block">Password</label>
        <div className="relative mb-[11px]">
          <i className="fas fa-lock absolute left-[11px] top-1/2 -translate-y-1/2 text-white/25 text-[0.76rem]"></i>
          <input 
            id="ip" 
            className="w-full py-2.5 pr-[38px] pl-[32px] bg-white/[0.072] border border-white/10 rounded-lg text-white text-[0.82rem] transition-all duration-150 outline-none placeholder:text-white/20 focus:border-sblue focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(26,107,209,0.2)]" 
            type="password"
            placeholder="Masukkan password" 
            autoComplete="current-password"
            onKeyDown={(event) => { if(event.nativeEvent.key==='Enter' && typeof window !== 'undefined' && window.doLogin) window.doLogin() }} 
          />
          <button 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-white/25 text-[0.76rem] p-0 transition-colors duration-150 hover:text-white" 
            onClick={() => { if(typeof window !== 'undefined' && window.toggleEye) window.toggleEye() }}
          >
            <i className="fas fa-eye" id="eyeico"></i>
          </button>
        </div>

        <button 
          className="w-full p-[13px] bg-gradient-to-br from-sblue to-sblue-2 border-none rounded-xl text-white text-[0.86rem] font-extrabold tracking-[0.05em] transition-all duration-200 shadow-[0_8px_25px_rgba(30,111,217,0.35),inset_0_1px_rgba(255,255,255,0.2)] mt-2.5 flex items-center justify-center gap-2 cursor-pointer hover:from-sblue-h hover:to-sblue-h hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(30,111,217,0.5)] hover:brightness-110 active:translate-y-0 active:shadow-[0_4px_12px_rgba(30,111,217,0.4)]" 
          onClick={() => { if(typeof window !== 'undefined' && window.doLogin) window.doLogin() }} 
          id="lbtn"
        >
          <i className="fas fa-right-to-bracket"></i> Masuk
        </button>

        <p className="text-center text-[0.57rem] text-white/10 mt-4">© 2026 Bidang SDA dan Linmas</p>
      </div>
    </div>
  );
}
