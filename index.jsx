import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// GLOBAL STYLES & THEME
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Cinzel:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
    
    :root {
      --black: #0a0a0a;
      --charcoal: #111111;
      --charcoal2: #1a1a1a;
      --charcoal3: #222222;
      --gold: #d4af37;
      --gold-light: #f0d060;
      --gold-dark: #a08520;
      --crimson: #8b0000;
      --crimson-light: #c41e1e;
      --neon-blue: #00d4ff;
      --neon-purple: #a855f7;
      --neon-green: #39ff14;
      --text-primary: #f0f0f0;
      --text-secondary: #888;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      background: var(--black);
      color: var(--text-primary);
      font-family: 'Rajdhani', sans-serif;
      overflow-x: hidden;
      min-height: 100vh;
    }

    h1, h2, h3, h4, h5 { font-family: 'Cinzel', serif; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--charcoal); }
    ::-webkit-scrollbar-thumb { background: var(--gold-dark); border-radius: 3px; }

    /* Glow text animation */
    @keyframes glowPulse {
      0%, 100% { text-shadow: 0 0 10px var(--gold), 0 0 40px var(--gold-dark); }
      50% { text-shadow: 0 0 20px var(--gold-light), 0 0 60px var(--gold), 0 0 80px var(--gold-dark); }
    }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes particleDrift {
      0% { transform: translateY(100vh) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100px) translateX(100px); opacity: 0; }
    }
    @keyframes crackle {
      0%,100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    @keyframes borderGlow {
      0%,100% { border-color: rgba(212,175,55,0.3); box-shadow: 0 0 5px rgba(212,175,55,0.2); }
      50% { border-color: rgba(212,175,55,0.7); box-shadow: 0 0 15px rgba(212,175,55,0.4), 0 0 30px rgba(212,175,55,0.1); }
    }
    @keyframes typeCursor { 0%,100%{opacity:1} 50%{opacity:0} }

    .anim-fadeIn { animation: fadeIn 0.6s ease forwards; }
    .anim-slideLeft { animation: slideLeft 0.6s ease forwards; }
    .anim-slideRight { animation: slideRight 0.6s ease forwards; }
    .anim-scaleIn { animation: scaleIn 0.4s ease forwards; }

    /* TOAST */
    .toast-container { position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px; }
    .toast {
      background: linear-gradient(135deg, #1a1a1a, #222);
      border: 1px solid var(--gold-dark);
      border-left: 3px solid var(--gold);
      color: var(--text-primary);
      padding: 14px 20px;
      border-radius: 8px;
      font-family: 'Rajdhani', sans-serif;
      font-size: 15px;
      font-weight: 600;
      max-width: 320px;
      animation: slideRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 10px rgba(212,175,55,0.15);
    }
    .toast.error { border-left-color: var(--crimson-light); border-color: rgba(139,0,0,0.5); }
    .toast.success { border-left-color: var(--neon-green); border-color: rgba(57,255,20,0.3); }
    @keyframes fadeOut { to { opacity:0; transform:translateX(30px); } }
  `}</style>
);

// ============================================================
// PARTICLE BACKGROUND SYSTEM
// ============================================================
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.8 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.life = 0;
        this.color = Math.random() > 0.7 ? '212,175,55' : Math.random() > 0.5 ? '168,85,247' : '0,212,255';
      }
      update() {
        this.life++;
        if (this.life < 30) this.opacity = this.life / 30;
        else if (this.life > 200) this.opacity = Math.max(0, 1 - (this.life - 200) / 50);
        else this.opacity = Math.random() * 0.3 + 0.4;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.life * 0.05) * 0.3;
        if (this.y < -50 || this.life > 260) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity * 0.6})`;
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color},${this.opacity * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    for (let i = 0; i < 80; i++) { const p = new Particle(); p.y = Math.random() * canvas.height; p.life = Math.random() * 200; particles.push(p); }
    
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} />;
};

// ============================================================
// TOAST SYSTEM
// ============================================================
let toastSetter = null;
const showToast = (msg, type = 'info') => { if (toastSetter) toastSetter({ msg, type, id: Date.now() }); };
const ToastManager = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { toastSetter = (t) => setToasts(prev => [...prev, t]); return () => { toastSetter = null; }; }, []);
  useEffect(() => { if (toasts.length) { const t = setTimeout(() => setToasts(p => p.slice(1)), 3000); return () => clearTimeout(t); } }, [toasts]);
  return <div className="toast-container">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>;
};

// ============================================================
// NAVIGATION
// ============================================================
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '⚔️' },
  { id: 'create', label: 'Create', icon: '✦' },
  { id: 'arena', label: 'Arena', icon: '🏟️' },
  { id: 'store', label: 'Armory', icon: '🛡️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const Navbar = ({ page, setPage, user, coins, tokens }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 100%)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(212,175,55,0.2)',
      padding: '0 24px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setPage('home')}>
        <span style={{ fontSize: '28px', animation: 'glowPulse 3s infinite', color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontWeight: 900, letterSpacing: '3px' }}>V</span>
        <span style={{ fontSize: '18px', color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '4px', display: 'none' }} className="desktop-only">VENGERS</span>
      </div>
      
      {/* Desktop Nav */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            background: page === item.id ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(168,85,247,0.1))' : 'transparent',
            border: page === item.id ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
            color: page === item.id ? 'var(--gold)' : 'var(--text-secondary)',
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '14px',
            letterSpacing: '1px', textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { if (page !== item.id) { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'rgba(212,175,55,0.2)'; }}}
            onMouseLeave={e => { if (page !== item.id) { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'transparent'; }}}
          >
            <span style={{ marginRight: '6px' }}>{item.icon}</span>{item.label}
          </button>
        ))}
      </div>

      {/* Currency Display */}
      {user && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212,175,55,0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.25)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '14px' }}>◆</span>
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '14px' }}>{coins.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(168,85,247,0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(168,85,247,0.25)' }}>
            <span style={{ color: 'var(--neon-purple)', fontSize: '14px' }}>⬡</span>
            <span style={{ color: 'var(--neon-purple)', fontWeight: 700, fontSize: '14px' }}>{tokens}</span>
          </div>
        </div>
      )}
      <style>{`@media(min-width:768px){.desktop-only{display:inline!important}}`}</style>
    </nav>
  );
};

// ============================================================
// AUTH PAGE
// ============================================================
const AVATARS = ['⚔️','🛡️','🌙','☄️','💀','🔥','⚡','🌑','👁️','🗡️'];

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.username || !form.password) { setError('Fill in required fields'); return; }
    if (!isLogin && !form.email) { setError('Email is required'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ username: form.username, email: form.email || 'hero@vengers.io', avatar: AVATARS[selectedAvatar] });
      showToast(`Welcome, ${form.username}! Your destiny awaits.`, 'success');
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(145deg, #141414, #1a1a1a)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '420px',
        boxShadow: '0 0 40px rgba(212,175,55,0.08), 0 20px 60px rgba(0,0,0,0.5)',
        animation: 'scaleIn 0.5s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', animation: 'glowPulse 2s infinite', marginBottom: '8px' }}>⚔️</div>
          <h1 style={{ color: 'var(--gold)', fontSize: '28px', letterSpacing: '4px', textTransform: 'uppercase', animation: 'glowPulse 3s infinite' }}>VENGERS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Forge Your Power. Rule Your Destiny.</p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: '#111', borderRadius: '8px', padding: '3px', marginBottom: '28px' }}>
          {['Login', 'Sign Up'].map((label, i) => (
            <button key={label} onClick={() => { setIsLogin(i === 0); setError(''); }} style={{
              flex: 1, padding: '10px', background: (i === 0) === isLogin ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,85,247,0.15))' : 'transparent',
              border: 'none', color: (i === 0) === isLogin ? 'var(--gold)' : 'var(--text-secondary)',
              borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '14px',
              transition: 'all 0.3s ease', letterSpacing: '1px',
            }}>{label}</button>
          ))}
        </div>

        {/* Avatar Selection (Signup only) */}
        {!isLogin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Choose Your Emblem</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVATARS.map((a, i) => (
                <button key={i} onClick={() => setSelectedAvatar(i)} style={{
                  width: '40px', height: '40px', background: selectedAvatar === i ? 'rgba(212,175,55,0.2)' : '#111',
                  border: selectedAvatar === i ? '2px solid var(--gold)' : '1px solid #333',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
                  transition: 'all 0.2s ease', boxShadow: selectedAvatar === i ? '0 0 12px rgba(212,175,55,0.3)' : 'none',
                }}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        {[
          { key: 'username', label: 'Username', placeholder: 'Your warrior name', type: 'text' },
          ...(!isLogin ? [{ key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' }] : []),
          { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', display: 'block' }}>{field.label}</label>
            <input
              type={field.type}
              value={form[field.key]}
              onChange={e => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              style={{
                width: '100%', padding: '12px 16px', background: '#0a0a0a',
                border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                color: 'var(--text-primary)', fontSize: '15px',
                fontFamily: 'Rajdhani, sans-serif', outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        ))}

        {error && <p style={{ color: 'var(--crimson-light)', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <button onClick={handleSubmit} style={{
          width: '100%', padding: '14px', marginTop: '12px',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(168,85,247,0.2))',
          border: '1px solid rgba(212,175,55,0.5)', borderRadius: '8px',
          color: 'var(--gold)', fontSize: '16px', fontWeight: 700, fontFamily: 'Cinzel, serif',
          cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase',
          transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.45), rgba(168,85,247,0.3))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(168,85,247,0.2))'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {loading ? <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span> : (isLogin ? 'Enter the Arena' : 'Become a Venger')}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '20px' }}>
          {isLogin ? "Don't have an account? " : 'Already a Venger? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

// ============================================================
// LANDING PAGE
// ============================================================
const LandingPage = ({ onLogin, setPage }) => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const featuredChars = [
    { name: 'Shadow King', type: 'Villain', power: 9800, element: '🌑', color: 'var(--neon-purple)', desc: 'Master of darkness and dimensional rifts.' },
    { name: 'Iron Overlord', type: 'Anti-Hero', power: 9500, element: '⚡', color: 'var(--gold)', desc: 'Forged in chaos, armed with ancient steel.' },
    { name: 'Crimson Wrath', type: 'Hero', power: 9200, element: '🔥', color: 'var(--crimson-light)', desc: 'The last guardian of the burning realm.' },
    { name: 'Cosmic Tyrant', type: 'Villain', power: 9900, element: '☄️', color: 'var(--neon-blue)', desc: 'Ruler across infinite dimensions.' },
  ];

  const testimonials = [
    { name: 'Shadow King', quote: '"I have conquered a thousand realms. This arena is merely the beginning."', avatar: '🌑' },
    { name: 'Iron Overlord', quote: '"Every sword I forge carries the weight of a dying star."', avatar: '⚡' },
    { name: 'Crimson Wrath', quote: '"Hope is not weakness — it is the sharpest blade."', avatar: '🔥' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* HERO SECTION */}
      <section style={{
        height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(139,0,0,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(0,212,255,0.08) 0%, transparent 40%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Parallax city silhouette */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          transform: `translateY(${scrollY * 0.15}px)`,
          opacity: 0.15,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23d4af37' fill-opacity='0.3' d='M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z'/%3E%3C/svg%3E")`
        }} />

        {/* Main Content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: '0 20px' }}>
          {/* Animated Logo */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '120px', fontFamily: 'Cinzel, serif', fontWeight: 900,
              background: 'linear-gradient(180deg, var(--gold-light), var(--gold), var(--gold-dark))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '16px', lineHeight: 1,
              animation: 'glowPulse 3s infinite',
              filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
            }}>VENGERS</div>
          </div>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Share Tech Mono, monospace' }}>— MULTIVERSE EDITION —</p>
          <p style={{ fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '48px', fontFamily: 'Cinzel, serif', opacity: 0.9 }}>Forge Your Power. Rule Your Destiny.</p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setPage('create'); }} style={{
              padding: '16px 36px', background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.15))',
              border: '2px solid var(--gold)', borderRadius: '8px', color: 'var(--gold)',
              fontSize: '16px', fontFamily: 'Cinzel, serif', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(212,175,55,0.2)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >⚔ Create Your Venger</button>

            <button onClick={() => setPage('arena')} style={{
              padding: '16px 36px', background: 'linear-gradient(135deg, rgba(139,0,0,0.3), rgba(139,0,0,0.15))',
              border: '2px solid var(--crimson-light)', borderRadius: '8px', color: 'var(--crimson-light)',
              fontSize: '16px', fontFamily: 'Cinzel, serif', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(139,0,0,0.2)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(139,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(139,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >🏟 Enter the Arena</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', animation: 'float 2s ease-in-out infinite' }}>
          <div style={{ width: '24px', height: '40px', border: '2px solid rgba(212,175,55,0.4)', borderRadius: '12px', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: '4px', height: '10px', background: 'var(--gold)', borderRadius: '2px', animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, transparent, rgba(26,26,26,0.5))' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '32px', letterSpacing: '3px', marginBottom: '12px', animation: 'glowPulse 3s infinite' }}>HOW IT WORKS</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '60px', fontSize: '15px' }}>Your journey to supreme power begins here</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Create', desc: 'Design your warrior with custom attributes, appearance, and equipment.', icon: '✦', color: 'var(--gold)' },
              { step: '02', title: 'Battle', desc: 'Prove your might in the Arena through mini-games and challenges.', icon: '⚔️', color: 'var(--crimson-light)' },
              { step: '03', title: 'Evolve', desc: 'Unlock legendary characters and upgrade your arsenal.', icon: '⬆', color: 'var(--neon-purple)' },
              { step: '04', title: 'Dominate', desc: 'Rise through ranks and conquer the multiverse.', icon: '👑', color: 'var(--gold)' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #141414, #1a1a1a)', border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '12px', padding: '32px 24px', textAlign: 'center', position: 'relative',
                animation: `fadeIn 0.6s ease ${i * 0.15}s both`,
                transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: '16px', left: '20px', color: item.color, fontSize: '11px', fontFamily: 'Share Tech Mono', opacity: 0.6 }}>{item.step}</div>
                <div style={{ fontSize: '36px', marginBottom: '16px', color: item.color }}>{item.icon}</div>
                <h3 style={{ color: item.color, fontSize: '18px', letterSpacing: '2px', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CHARACTERS */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '32px', letterSpacing: '3px', marginBottom: '12px', animation: 'glowPulse 3s infinite' }}>LEGENDARY VENGERS</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '15px' }}>The most powerful beings across the multiverse</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {featuredChars.map((c, i) => (
              <div key={i} style={{
                background: `linear-gradient(145deg, #141414, #1c1c1c)`, border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s', animation: `fadeIn 0.6s ease ${i * 0.12}s both`,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 0 30px ${c.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Character visual area */}
                <div style={{ background: `linear-gradient(135deg, rgba(26,26,26,1), ${c.color}10)`, padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '64px', display: 'inline-block', animation: 'float 3s ease-in-out infinite', filter: `drop-shadow(0 0 20px ${c.color})` }}>{c.element}</div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', color: c.color, fontWeight: 600, border: `1px solid ${c.color}40` }}>{c.type}</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ color: c.color, fontSize: '17px', fontFamily: 'Cinzel, serif', letterSpacing: '1px', marginBottom: '8px' }}>{c.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5, marginBottom: '14px' }}>{c.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>POWER</span>
                    <span style={{ color: c.color, fontWeight: 700, fontSize: '15px', fontFamily: 'Share Tech Mono' }}>{c.power.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '3px', background: '#222', borderRadius: '2px', marginTop: '8px' }}>
                    <div style={{ height: '100%', width: `${(c.power / 10000) * 100}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}80)`, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, transparent, rgba(26,26,26,0.4), transparent)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '28px', letterSpacing: '3px', marginBottom: '48px' }}>WORDS FROM THE LEGENDS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #141414, #181818)', border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '12px', padding: '28px 32px', display: 'flex', gap: '20px', alignItems: 'flex-start',
                animation: `slideLeft 0.6s ease ${i * 0.2}s both`,
              }}>
                <div style={{ fontSize: '36px', minWidth: '50px', textAlign: 'center' }}>{t.avatar}</div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '10px' }}>{t.quote}</p>
                  <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: 600 }}>— {t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'var(--gold)', fontSize: '36px', letterSpacing: '3px', marginBottom: '16px', animation: 'glowPulse 3s infinite' }}>YOUR DESTINY AWAITS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>Join millions of warriors across the multiverse. Create your legend, conquer the arena, and become unstoppable.</p>
          <button onClick={onLogin} style={{
            padding: '18px 48px', background: 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(168,85,247,0.25))',
            border: '2px solid var(--gold)', borderRadius: '8px', color: 'var(--gold)',
            fontSize: '18px', fontFamily: 'Cinzel, serif', fontWeight: 700, cursor: 'pointer',
            letterSpacing: '3px', textTransform: 'uppercase', transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >Begin Your Journey</button>
        </div>
      </section>
    </div>
  );
};

// ============================================================
// CHARACTER CREATION PAGE
// ============================================================
const CharacterCreationPage = ({ character, setCharacter }) => {
  const [step, setStep] = useState(0);
  const steps = ['Type', 'Attributes', 'Appearance', 'Equipment', 'Weapons', 'Review'];

  const types = [
    { id: 'hero', label: 'Hero', icon: '☀️', color: 'var(--gold)', desc: 'Protectors of light and justice.' },
    { id: 'villain', label: 'Villain', icon: '🌑', color: 'var(--crimson-light)', desc: 'Masters of chaos and domination.' },
    { id: 'antihero', label: 'Anti-Hero', icon: '⚡', color: 'var(--neon-purple)', desc: 'Warriors walking between light and shadow.' },
  ];

  const attrs = ['Strength', 'Intelligence', 'Agility', 'Power', 'Endurance'];
  const skinTones = ['#f5d0a9', '#e8b88a', '#d4a373', '#b8865e', '#7d5a3c', '#4a2f1b'];
  const eyeColors = ['#00d4ff', '#a855f7', '#39ff14', '#d4af37', '#ff4444', '#ffffff'];
  const hairStyles = ['Short', 'Long', 'Buzzcut', 'Mohawk', 'Bald', 'Beard'];
  const helmets = ['None', '⛑️ Steel Cap', '🎩 Dark Hood', '👑 Royal Crown', '🛡️ Full Helm', '🌙 Shadow Mask'];
  const armors = ['None', '🛡️ Chainmail', '⚔️ Plate Armor', '🌙 Shadow Cloak', '⚡ Neon Suit', '🔥 Crimson Mail'];
  const weapons = ['None', '⚔️ Excalibur', '🗡️ Shadow Blade', '🔫 Energy Cannon', '🛡️ Aegis Shield', '☄️ Cosmic Staff', '💎 Mythical Axe'];

  const totalAttrPoints = Object.values(character.attributes || {}).reduce((a, b) => a + b, 0);
  const maxPoints = 100;

  const adjustAttr = (attr, delta) => {
    const current = character.attributes[attr] || 10;
    const newVal = Math.max(5, Math.min(40, current + delta));
    const newTotal = totalAttrPoints - current + newVal;
    if (newTotal <= maxPoints) {
      setCharacter(prev => ({ ...prev, attributes: { ...prev.attributes, [attr]: newVal } }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => { if (i <= step + 1) setStep(i); }}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: i <= step + 1 ? 'pointer' : 'default',
                background: i === step ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(168,85,247,0.2))' : i < step ? 'rgba(212,175,55,0.15)' : '#1a1a1a',
                color: i === step ? 'var(--gold)' : i < step ? 'rgba(212,175,55,0.7)' : 'var(--text-secondary)',
                fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
                border: i === step ? '1px solid rgba(212,175,55,0.5)' : '1px solid transparent',
                transition: 'all 0.3s',
              }}>{i + 1}. {s}</button>
          ))}
        </div>

        {/* Step 0: Character Type */}
        {step === 0 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '8px', letterSpacing: '2px' }}>CHOOSE YOUR PATH</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '14px' }}>What will you become?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {types.map(t => (
                <div key={t.id}
                  onClick={() => setCharacter(prev => ({ ...prev, type: t.id }))}
                  style={{
                    background: character.type === t.id ? `linear-gradient(145deg, rgba(26,26,26,1), ${t.color}15)` : '#141414',
                    border: character.type === t.id ? `2px solid ${t.color}` : '1px solid rgba(212,175,55,0.1)',
                    borderRadius: '12px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.3s', boxShadow: character.type === t.id ? `0 0 30px ${t.color}20` : 'none',
                  }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px', filter: character.type === t.id ? `drop-shadow(0 0 15px ${t.color})` : 'none' }}>{t.icon}</div>
                  <h3 style={{ color: t.color, fontSize: '20px', letterSpacing: '2px', marginBottom: '8px' }}>{t.label}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Attributes */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '8px', letterSpacing: '2px' }}>DEFINE YOUR POWER</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Distribute {maxPoints} attribute points</p>
            <p style={{ textAlign: 'center', color: totalAttrPoints >= maxPoints ? 'var(--crimson-light)' : 'var(--gold)', fontSize: '13px', marginBottom: '32px', fontFamily: 'Share Tech Mono' }}>
              Used: {totalAttrPoints} / {maxPoints}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {attrs.map(attr => {
                const val = character.attributes[attr] || 10;
                const pct = (val / 40) * 100;
                const colors = { Strength: 'var(--crimson-light)', Intelligence: 'var(--neon-blue)', Agility: 'var(--neon-green)', Power: 'var(--neon-purple)', Endurance: 'var(--gold)' };
                return (
                  <div key={attr} style={{ background: '#141414', borderRadius: '10px', padding: '16px 20px', border: '1px solid rgba(212,175,55,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ color: colors[attr], fontWeight: 600, fontSize: '14px', letterSpacing: '1px' }}>{attr.toUpperCase()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => adjustAttr(attr, -5)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#222', border: '1px solid #333', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ color: colors[attr], fontWeight: 700, fontSize: '18px', fontFamily: 'Share Tech Mono', minWidth: '28px', textAlign: 'center' }}>{val}</span>
                        <button onClick={() => adjustAttr(attr, 5)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: '222', border: '1px solid #333', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>+</button>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${colors[attr]}, ${colors[attr]}80)`, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Appearance */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '32px', letterSpacing: '2px' }}>APPEARANCE</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>Character Name</label>
                <input value={character.name || ''} onChange={e => setCharacter(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your warrior's name..."
                  style={{ width: '100%', padding: '12px 16px', background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'Cinzel, serif', outline: 'none' }} />
              </div>
              {/* Skin Tone */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>Skin Tone</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {skinTones.map((s, i) => (
                    <div key={i} onClick={() => setCharacter(prev => ({ ...prev, skinTone: s }))} style={{
                      width: '38px', height: '38px', borderRadius: '50%', background: s, cursor: 'pointer',
                      border: character.skinTone === s ? '3px solid var(--gold)' : '2px solid #333',
                      boxShadow: character.skinTone === s ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
                      transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
              </div>
              {/* Eye Color */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>Eye Glow</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {eyeColors.map((c, i) => (
                    <div key={i} onClick={() => setCharacter(prev => ({ ...prev, eyeColor: c }))} style={{
                      width: '38px', height: '38px', borderRadius: '50%', background: c, cursor: 'pointer',
                      border: character.eyeColor === c ? '3px solid var(--gold)' : '2px solid #333',
                      boxShadow: character.eyeColor === c ? `0 0 12px ${c}60` : 'none',
                      transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
              </div>
              {/* Hair */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>Hair & Face</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {hairStyles.map((h, i) => (
                    <button key={i} onClick={() => setCharacter(prev => ({ ...prev, hair: h }))} style={{
                      padding: '8px 16px', borderRadius: '6px', border: character.hair === h ? '1px solid var(--gold)' : '1px solid #333',
                      background: character.hair === h ? 'rgba(212,175,55,0.15)' : '#141414',
                      color: character.hair === h ? 'var(--gold)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                    }}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Equipment */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '32px', letterSpacing: '2px' }}>EQUIP YOUR ARMOR</h2>
            {[
              { key: 'helmet', label: 'Helmet', options: helmets },
              { key: 'armor', label: 'Armor', options: armors },
            ].map(slot => (
              <div key={slot.key} style={{ marginBottom: '24px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', display: 'block' }}>{slot.label}</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {slot.options.map((o, i) => (
                    <button key={i} onClick={() => setCharacter(prev => ({ ...prev, [slot.key]: o }))} style={{
                      padding: '10px 18px', borderRadius: '8px', border: character[slot.key] === o ? '1px solid var(--gold)' : '1px solid #333',
                      background: character[slot.key] === o ? 'rgba(212,175,55,0.15)' : '#141414',
                      color: character[slot.key] === o ? 'var(--gold)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                    }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Weapons */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '32px', letterSpacing: '2px' }}>CHOOSE YOUR WEAPONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {weapons.map((w, i) => (
                <button key={i} onClick={() => setCharacter(prev => ({ ...prev, weapon: w }))} style={{
                  padding: '24px 16px', borderRadius: '10px', border: character.weapon === w ? '2px solid var(--gold)' : '1px solid #333',
                  background: character.weapon === w ? 'linear-gradient(145deg, rgba(212,175,55,0.15), rgba(168,85,247,0.08))' : '#141414',
                  color: character.weapon === w ? 'var(--gold)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', textAlign: 'center',
                  boxShadow: character.weapon === w ? '0 0 15px rgba(212,175,55,0.15)' : 'none',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{w.split(' ')[0]}</div>
                  {w.split(' ').slice(1).join(' ') || w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '24px', marginBottom: '32px', letterSpacing: '2px' }}>YOUR VENGER</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Character Card */}
              <div style={{
                background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px', padding: '32px', textAlign: 'center',
                boxShadow: '0 0 40px rgba(212,175,55,0.1)', animation: 'borderGlow 3s infinite',
              }}>
                <div style={{ fontSize: '80px', marginBottom: '8px', filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4))' }}>
                  {character.type === 'hero' ? '☀️' : character.type === 'villain' ? '🌑' : '⚡'}
                </div>
                <h3 style={{ color: 'var(--gold)', fontSize: '22px', fontFamily: 'Cinzel, serif', letterSpacing: '2px', marginBottom: '6px' }}>{character.name || 'Unnamed'}</h3>
                <span style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px',
                  background: character.type === 'hero' ? 'rgba(212,175,55,0.2)' : character.type === 'villain' ? 'rgba(139,0,0,0.3)' : 'rgba(168,85,247,0.2)',
                  color: character.type === 'hero' ? 'var(--gold)' : character.type === 'villain' ? 'var(--crimson-light)' : 'var(--neon-purple)',
                  border: `1px solid ${character.type === 'hero' ? 'rgba(212,175,55,0.3)' : character.type === 'villain' ? 'rgba(139,0,0,0.4)' : 'rgba(168,85,247,0.3)'}`,
                }}>{character.type}</span>
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[character.helmet, character.armor, character.weapon].filter(e => e && e !== 'None').map((e, i) => (
                    <span key={i} style={{ fontSize: '24px' }}>{e.split(' ')[0]}</span>
                  ))}
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Character Details</h4>
                {Object.entries(character.attributes).map(([attr, val]) => {
                  const colors = { Strength: 'var(--crimson-light)', Intelligence: 'var(--neon-blue)', Agility: 'var(--neon-green)', Power: 'var(--neon-purple)', Endurance: 'var(--gold)' };
                  return (
                    <div key={attr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{attr}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '80px', height: '4px', background: '#222', borderRadius: '2px' }}>
                          <div style={{ width: `${(val / 40) * 100}%`, height: '100%', background: colors[attr], borderRadius: '2px' }} />
                        </div>
                        <span style={{ color: colors[attr], fontWeight: 700, fontSize: '14px', minWidth: '24px', textAlign: 'right' }}>{val}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', padding: '12px', background: '#141414', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--text-secondary)' }}>Helmet</span><span style={{ color: 'var(--text-primary)' }}>{character.helmet || 'None'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--text-secondary)' }}>Armor</span><span style={{ color: 'var(--text-primary)' }}>{character.armor || 'None'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--text-secondary)' }}>Weapon</span><span style={{ color: 'var(--text-primary)' }}>{character.weapon || 'None'}</span></div>
                </div>
              </div>
            </div>
            {/* Finalize */}
            <button onClick={() => { showToast('Your Venger has been forged! Welcome to the multiverse.', 'success'); }} style={{
              display: 'block', width: '100%', marginTop: '32px', padding: '16px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(168,85,247,0.2))',
              border: '1px solid rgba(212,175,55,0.5)', borderRadius: '10px',
              color: 'var(--gold)', fontSize: '16px', fontFamily: 'Cinzel, serif', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase',
            }}>⚔ Finalize Venger</button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} style={{
            padding: '10px 24px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, opacity: step === 0 ? 0.3 : 1,
          }} disabled={step === 0}>← Back</button>
          {step < steps.length - 1 && (
            <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} style={{
              padding: '10px 28px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(168,85,247,0.15))',
              border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px',
              color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', fontWeight: 700, letterSpacing: '1px',
            }}>Continue →</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ARENA / GAMES PAGE
// ============================================================
const GAMES = [
  { id: 'reflex', name: 'Reflex Strike', icon: '⚡', desc: 'Tap the target before it vanishes!', reward: 50, difficulty: 'Rookie', color: 'var(--neon-green)' },
  { id: 'memory', name: 'Memory Power', icon: '🧠', desc: 'Match pairs to unlock hidden power.', reward: 80, difficulty: 'Warrior', color: 'var(--neon-blue)' },
  { id: 'sequence', name: 'Shadow Sequence', icon: '🌑', desc: 'Memorize and repeat the sequence.', reward: 120, difficulty: 'Legend', color: 'var(--neon-purple)' },
  { id: 'dodge', name: 'Dodge & Strike', icon: '🗡️', desc: 'Dodge attacks and strike the enemy.', reward: 200, difficulty: 'God-Tier', color: 'var(--gold)' },
];

const DIFFICULTY_COLORS = { 'Rookie': 'var(--neon-green)', 'Warrior': 'var(--neon-blue)', 'Legend': 'var(--neon-purple)', 'God-Tier': 'var(--gold)' };

// REFLEX GAME
const ReflexGame = ({ onComplete }) => {
  const [target, setTarget] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const spawnTarget = useCallback(() => {
    if (gameOver) return;
    setTarget({ x: Math.random() * 80 + 5, y: Math.random() * 70 + 10, id: Date.now() });
    timerRef.current = setTimeout(() => {
      setMisses(m => { if (m + 1 >= 3) { setGameOver(true); return m + 1; } return m + 1; });
      setTarget(null);
      spawnTarget();
    }, 1200);
  }, [gameOver]);

  useEffect(() => {
    if (started && !gameOver) spawnTarget();
    return () => clearTimeout(timerRef.current);
  }, [started, gameOver, spawnTarget]);

  const hitTarget = () => {
    clearTimeout(timerRef.current);
    const newScore = score + 1;
    setScore(newScore);
    setTarget(null);
    if (newScore >= 10) { setGameOver(true); onComplete(newScore); return; }
    spawnTarget();
  };

  if (!started) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚡</div>
      <h3 style={{ color: 'var(--gold)', fontSize: '20px', marginBottom: '8px' }}>Reflex Strike</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Tap the glowing targets as fast as you can! 3 misses and you're out.</p>
      <button onClick={() => setStarted(true)} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,255,20,0.1))', border: '1px solid rgba(57,255,20,0.5)', borderRadius: '8px', color: 'var(--neon-green)', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}>Start</button>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)', overflow: 'hidden' }}>
      {/* HUD */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', zIndex: 2, background: 'rgba(0,0,0,0.6)' }}>
        <span style={{ color: 'var(--neon-green)', fontFamily: 'Share Tech Mono', fontSize: '14px' }}>Score: {score}/10</span>
        <span style={{ color: 'var(--crimson-light)', fontFamily: 'Share Tech Mono', fontSize: '14px' }}>Misses: {'❌'.repeat(misses)}{'○'.repeat(3 - misses)}</span>
      </div>
      {/* Target */}
      {target && !gameOver && (
        <div onClick={hitTarget} style={{
          position: 'absolute', left: `${target.x}%`, top: `${target.y}%`,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57,255,20,0.6), rgba(57,255,20,0.1))',
          border: '3px solid var(--neon-green)', cursor: 'pointer',
          boxShadow: '0 0 25px rgba(57,255,20,0.5), 0 0 60px rgba(57,255,20,0.2)',
          animation: 'crackle 0.3s infinite', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)' }} />
        </div>
      )}
      {/* Game Over */}
      {gameOver && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 3 }}>
          <h3 style={{ color: score >= 10 ? 'var(--gold)' : 'var(--crimson-light)', fontSize: '24px', marginBottom: '8px' }}>{score >= 10 ? '🏆 Victory!' : '💀 Defeated'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Score: {score}/10</p>
          <button onClick={() => { setScore(0); setMisses(0); setGameOver(false); setStarted(false); }} style={{ padding: '10px 24px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>Try Again</button>
        </div>
      )}
    </div>
  );
};

// MEMORY GAME
const MemoryGame = ({ onComplete }) => {
  const SYMBOLS = ['⚔️', '🛡️', '🌙', '🔥', '⚡', '💀', '👁️', '☄️'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [started, setStarted] = useState(false);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const deck = [...SYMBOLS.slice(0, 6), ...SYMBOLS.slice(0, 6)].sort(() => Math.random() - 0.5);
    setCards(deck); setFlipped([]); setMatched([]); setMoves(0); setStarted(true);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = flipped;
      if (cards[a] === cards[b]) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        if (newMatched.length === cards.length) { setTimeout(() => onComplete(moves + 1), 600); }
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped]);

  if (!started) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧠</div>
      <h3 style={{ color: 'var(--gold)', fontSize: '20px', marginBottom: '8px' }}>Memory Power</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Match all pairs to unlock hidden power.</p>
      <button onClick={initGame} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))', border: '1px solid rgba(0,212,255,0.5)', borderRadius: '8px', color: 'var(--neon-blue)', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}>Start</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: 'var(--neon-blue)', fontFamily: 'Share Tech Mono', fontSize: '13px' }}>Moves: {moves}</span>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono', fontSize: '13px' }}>Matched: {matched.length / 2}/6</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <div key={i} onClick={() => { if (!isFlipped && flipped.length < 2 && !matched.includes(i)) setFlipped(p => [...p, i]); }}
              style={{
                height: '70px', borderRadius: '8px', cursor: isFlipped ? 'default' : 'pointer',
                border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', transition: 'all 0.3s ease',
                background: isFlipped
                  ? (matched.includes(i) ? 'rgba(57,255,20,0.15)' : 'rgba(0,212,255,0.1)')
                  : 'linear-gradient(145deg, #1a1a1a, #222)',
                borderColor: matched.includes(i) ? 'rgba(57,255,20,0.4)' : isFlipped ? 'rgba(0,212,255,0.4)' : 'rgba(212,175,55,0.15)',
                boxShadow: isFlipped ? '0 0 10px rgba(0,212,255,0.2)' : 'none',
              }}>
              {isFlipped ? card : '?'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SEQUENCE GAME
const SequenceGame = ({ onComplete }) => {
  const COLORS = ['#c41e1e', '#00d4ff', '#a855f7', '#d4af37'];
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle, showing, playing, won, lost
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(0);

  const startGame = () => {
    const newSeq = [Math.floor(Math.random() * 4)];
    setSequence(newSeq); setPlayerSeq([]); setPhase('showing'); setRound(1);
    showSequence(newSeq);
  };

  const showSequence = async (seq) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setActiveColor(seq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(null);
    }
    await new Promise(r => setTimeout(r, 300));
    setPhase('playing');
  };

  const handleClick = (colorIdx) => {
    if (phase !== 'playing') return;
    const newPlayer = [...playerSeq, colorIdx];
    setPlayerSeq(newPlayer);
    setActiveColor(colorIdx);
    setTimeout(() => setActiveColor(null), 200);

    if (newPlayer[newPlayer.length - 1] !== sequence[newPlayer.length - 1]) {
      setPhase('lost'); return;
    }
    if (newPlayer.length === sequence.length) {
      if (sequence.length >= 6) { setPhase('won'); onComplete(sequence.length); return; }
      const newSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSeq); setPlayerSeq([]); setPhase('showing'); setRound(r => r + 1);
      setTimeout(() => showSequence(newSeq), 500);
    }
  };

  if (phase === 'idle') return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌑</div>
      <h3 style={{ color: 'var(--gold)', fontSize: '20px', marginBottom: '8px' }}>Shadow Sequence</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Watch the pattern, then repeat it. Reach round 6 to win!</p>
      <button onClick={startGame} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1))', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px', color: 'var(--neon-purple)', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}>Start</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '0 8px' }}>
        <span style={{ color: 'var(--neon-purple)', fontFamily: 'Share Tech Mono', fontSize: '13px' }}>Round: {round}/6</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{phase === 'showing' ? 'Watch...' : phase === 'playing' ? 'Your turn!' : phase === 'won' ? '🏆 Won!' : '💀 Wrong!'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '260px', margin: '0 auto' }}>
        {COLORS.map((color, i) => (
          <div key={i} onClick={() => handleClick(i)} style={{
            height: '100px', borderRadius: '12px', background: activeColor === i ? color : `${color}30`,
            border: `2px solid ${color}60`, cursor: phase === 'playing' ? 'pointer' : 'default',
            boxShadow: activeColor === i ? `0 0 30px ${color}60` : 'none',
            transition: 'all 0.15s ease',
          }} />
        ))}
      </div>
      {(phase === 'won' || phase === 'lost') && (
        <button onClick={() => { setPhase('idle'); setRound(0); }} style={{ marginTop: '20px', padding: '10px 24px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>Play Again</button>
      )}
    </div>
  );
};

// DODGE GAME
const DodgeGame = ({ onComplete }) => {
  const [playerX, setPlayerX] = useState(50);
  const [enemies, setEnemies] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const animRef = useRef(null);
  const lastSpawn = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => {
    scoreRef.current = score;
    livesRef.current = lives;
  }, [score, lives]);

  useEffect(() => {
    if (!started || gameOver) return;
    const handleKey = (e) => { if (e.type === 'keydown') keysRef.current[e.key] = true; else keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    let px = 50;
    const loop = (time) => {
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) px = Math.max(5, px - 2.5);
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) px = Math.min(95, px + 2.5);
      setPlayerX(px);

      if (time - lastSpawn.current > 1200) {
        setEnemies(prev => [...prev, { x: Math.random() * 85 + 5, y: -5, id: time, speed: 1.5 + Math.random() * 1.5 }]);
        lastSpawn.current = time;
      }

      setEnemies(prev => {
        let newEnemies = prev.map(e => ({ ...e, y: e.y + e.speed })).filter(e => e.y < 110);
        newEnemies.forEach(e => {
          if (Math.abs(e.x - px) < 12 && e.y > 80) {
            newEnemies = newEnemies.filter(en => en.id !== e.id);
            if (livesRef.current <= 1) { setGameOver(true); setLives(0); return; }
            setLives(l => l - 1);
          }
        });
        return newEnemies;
      });

      setScore(s => s + 1);
      if (scoreRef.current >= 500) { setGameOver(true); onComplete(scoreRef.current); return; }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [started, gameOver]);

  // Touch controls
  const touchStart = (dir) => { keysRef.current[dir === 'left' ? 'ArrowLeft' : 'ArrowRight'] = true; };
  const touchEnd = (dir) => { keysRef.current[dir === 'left' ? 'ArrowLeft' : 'ArrowRight'] = false; };

  if (!started) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗡️</div>
      <h3 style={{ color: 'var(--gold)', fontSize: '20px', marginBottom: '8px' }}>Dodge & Strike</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Use ← → arrow keys to dodge enemies. Survive 500 ticks!</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '24px' }}>(Mobile: use the touch buttons below)</p>
      <button onClick={() => { setStarted(true); setGameOver(false); setScore(0); setLives(3); setEnemies([]); lastSpawn.current = 0; }} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}>Start</button>
    </div>
  );

  return (
    <div ref={gameRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: 'var(--gold)', fontFamily: 'Share Tech Mono', fontSize: '13px' }}>Score: {score}/500</span>
        <span style={{ color: 'var(--crimson-light)', fontFamily: 'Share Tech Mono', fontSize: '13px' }}>Lives: {'❤️'.repeat(lives)}</span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: '280px', background: 'linear-gradient(180deg, #0a0a0a, #111)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)', overflow: 'hidden' }}>
        {/* Player */}
        <div style={{ position: 'absolute', bottom: '12px', left: `${playerX}%`, transform: 'translateX(-50%)', fontSize: '28px', transition: 'left 0.05s linear', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.6))' }}>⚔️</div>
        {/* Enemies */}
        {enemies.map(e => (
          <div key={e.id} style={{ position: 'absolute', top: `${e.y}%`, left: `${e.x}%`, transform: 'translateX(-50%)', fontSize: '22px', filter: 'drop-shadow(0 0 6px rgba(139,0,0,0.6))' }}>💀</div>
        ))}
        {gameOver && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 2 }}>
            <h3 style={{ color: score >= 500 ? 'var(--gold)' : 'var(--crimson-light)', fontSize: '22px', marginBottom: '8px' }}>{score >= 500 ? '🏆 Victory!' : '💀 Defeated'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Score: {score}/500</p>
            <button onClick={() => { setStarted(false); setGameOver(false); }} style={{ padding: '10px 24px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>Try Again</button>
          </div>
        )}
      </div>
      {/* Touch Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', gap: '12px' }}>
        <button
          onTouchStart={() => touchStart('left')} onTouchEnd={() => touchEnd('left')}
          onMouseDown={() => touchStart('left')} onMouseUp={() => touchEnd('left')}
          style={{ flex: 1, padding: '20px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: 'var(--gold)', fontSize: '24px', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>←</button>
        <button
          onTouchStart={() => touchStart('right')} onTouchEnd={() => touchEnd('right')}
          onMouseDown={() => touchStart('right')} onMouseUp={() => touchEnd('right')}
          style={{ flex: 1, padding: '20px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: 'var(--gold)', fontSize: '24px', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>→</button>
      </div>
    </div>
  );
};

const ArenaPage = ({ coins, setCoins, tokens }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState({});

  const handleGameComplete = (gameId, performance) => {
    const game = GAMES.find(g => g.id === gameId);
    setCompletedGames(prev => ({ ...prev, [gameId]: (prev[gameId] || 0) + 1 }));
    setCoins(c => c + game.reward);
    showToast(`+${game.reward} coins earned from ${game.name}!`, 'success');
  };

  if (selectedGame) {
    const game = GAMES.find(g => g.id === selectedGame);
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
          <button onClick={() => setSelectedGame(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', fontFamily: 'Rajdhani, sans-serif' }}>← Back to Arena</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--gold)', fontSize: '22px', letterSpacing: '2px' }}>{game.icon} {game.name}</h2>
            <span style={{ color: game.color, fontSize: '12px', padding: '4px 12px', borderRadius: '12px', border: `1px solid ${game.color}40`, background: `${game.color}10` }}>{game.difficulty}</span>
          </div>
          <div style={{ background: '#141414', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)', padding: '24px' }}>
            {selectedGame === 'reflex' && <ReflexGame onComplete={(s) => handleGameComplete('reflex', s)} />}
            {selectedGame === 'memory' && <MemoryGame onComplete={(m) => handleGameComplete('memory', m)} />}
            {selectedGame === 'sequence' && <SequenceGame onComplete={(r) => handleGameComplete('sequence', r)} />}
            {selectedGame === 'dodge' && <DodgeGame onComplete={(s) => handleGameComplete('dodge', s)} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '32px', letterSpacing: '3px', marginBottom: '8px', animation: 'glowPulse 3s infinite' }}>THE ARENA</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '14px' }}>Prove your might. Earn your legend.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {GAMES.map((game, i) => (
            <div key={game.id} onClick={() => setSelectedGame(game.id)} style={{
              background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '14px', padding: '28px', cursor: 'pointer', transition: 'all 0.3s',
              animation: `fadeIn 0.5s ease ${i * 0.1}s both`, position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${game.color}60`; e.currentTarget.style.boxShadow = `0 0 25px ${game.color}15`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '11px', color: game.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '3px 10px', borderRadius: '10px', border: `1px solid ${game.color}30`, background: `${game.color}10` }}>{game.difficulty}</div>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>{game.icon}</div>
              <h3 style={{ color: game.color, fontSize: '18px', fontFamily: 'Cinzel, serif', letterSpacing: '1px', marginBottom: '8px' }}>{game.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>{game.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: 700 }}>◆ +{game.reward} coins</span>
                {completedGames[game.id] && <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Played: {completedGames[game.id]}x</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STORE / ARMORY PAGE
// ============================================================
const STORE_ITEMS = [
  { id: 1, name: 'Excalibur', category: 'weapon', rarity: 'Legendary', price: 500, currency: 'coins', icon: '⚔️', desc: 'The legendary sword of kings.', power: 95 },
  { id: 2, name: 'Shadow Cloak', category: 'armor', rarity: 'Epic', price: 350, currency: 'coins', icon: '🌙', desc: 'Renders the wearer nearly invisible.', power: 78 },
  { id: 3, name: 'Energy Cannon', category: 'weapon', rarity: 'Rare', price: 200, currency: 'coins', icon: '🔫', desc: 'Fires concentrated plasma bolts.', power: 65 },
  { id: 4, name: 'Aegis Shield', category: 'armor', rarity: 'Epic', price: 300, currency: 'coins', icon: '🛡️', desc: 'Divine protection forged in starlight.', power: 82 },
  { id: 5, name: 'Cosmic Staff', category: 'weapon', rarity: 'Legendary', price: 8, currency: 'tokens', icon: '☄️', desc: 'Channels the power of dying stars.', power: 98 },
  { id: 6, name: 'Neon Suit', category: 'armor', rarity: 'Rare', price: 180, currency: 'coins', icon: '⚡', desc: 'Cyberpunk-era adaptive armor.', power: 60 },
  { id: 7, name: 'Mythical Axe', category: 'weapon', rarity: 'Epic', price: 280, currency: 'coins', icon: '💎', desc: 'Carved from a fallen meteor.', power: 75 },
  { id: 8, name: 'Royal Crown', category: 'helmet', rarity: 'Legendary', price: 5, currency: 'tokens', icon: '👑', desc: 'Commands respect across all realms.', power: 70 },
  { id: 9, name: 'Crimson Mail', category: 'armor', rarity: 'Common', price: 80, currency: 'coins', icon: '🔥', desc: 'Heat-resistant battle armor.', power: 35 },
  { id: 10, name: 'Power Boost', category: 'boost', rarity: 'Common', price: 100, currency: 'coins', icon: '💪', desc: '+50 Power for 24 hours.', power: 50 },
  { id: 11, name: 'Ultimate Shield', category: 'armor', rarity: 'Legendary', price: 12, currency: 'tokens', icon: '🛡️', desc: 'Impenetrable defense from another dimension.', power: 99 },
  { id: 12, name: 'Shadow Blade', category: 'weapon', rarity: 'Rare', price: 220, currency: 'coins', icon: '🗡️', desc: 'A blade that cuts through darkness itself.', power: 68 },
];

const RARITY_COLORS = { 'Common': '#aaa', 'Rare': 'var(--neon-blue)', 'Epic': 'var(--neon-purple)', 'Legendary': 'var(--gold)' };

const StorePage = ({ coins, setCoins, tokens, setTokens }) => {
  const [filter, setFilter] = useState('all');
  const [purchased, setPurchased] = useState([]);

  const categories = ['all', 'weapon', 'armor', 'helmet', 'boost'];

  const handlePurchase = (item) => {
    if (item.currency === 'coins' && coins >= item.price) {
      setCoins(c => c - item.price);
      setPurchased(p => [...p, item.id]);
      showToast(`Purchased ${item.name}! +${item.power} power added.`, 'success');
    } else if (item.currency === 'tokens' && tokens >= item.price) {
      setTokens(t => t - item.price);
      setPurchased(p => [...p, item.id]);
      showToast(`Purchased ${item.name}! Premium gear acquired.`, 'success');
    } else {
      showToast(`Insufficient ${item.currency}. Earn more in the Arena!`, 'error');
    }
  };

  const filteredItems = filter === 'all' ? STORE_ITEMS : STORE_ITEMS.filter(i => i.category === filter);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '32px', letterSpacing: '3px', marginBottom: '8px', animation: 'glowPulse 3s infinite' }}>ARMORY</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Equip yourself for greatness</p>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 20px', borderRadius: '20px', border: filter === cat ? '1px solid var(--gold)' : '1px solid #333',
              background: filter === cat ? 'rgba(212,175,55,0.15)' : '#1a1a1a',
              color: filter === cat ? 'var(--gold)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
            }}>{cat === 'all' ? '⚔ All' : cat === 'weapon' ? '🗡 Weapons' : cat === 'armor' ? '🛡 Armor' : cat === 'helmet' ? '⛑ Helmets' : '💪 Boosts'}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
          {filteredItems.map((item, i) => {
            const rarityColor = RARITY_COLORS[item.rarity];
            const owned = purchased.includes(item.id);
            return (
              <div key={item.id} style={{
                background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: `1px solid ${rarityColor}25`,
                borderRadius: '12px', overflow: 'hidden', animation: `fadeIn 0.5s ease ${i * 0.08}s both`,
                transition: 'transform 0.3s, box-shadow 0.3s', opacity: owned ? 0.6 : 1,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 0 20px ${rarityColor}15`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Top accent bar */}
                <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '36px' }}>{item.icon}</span>
                    <span style={{ fontSize: '10px', color: rarityColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '3px 8px', borderRadius: '8px', border: `1px solid ${rarityColor}40`, background: `${rarityColor}10` }}>{item.rarity}</span>
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'Cinzel, serif', marginBottom: '6px' }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5, marginBottom: '14px' }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ color: item.currency === 'coins' ? 'var(--gold)' : 'var(--neon-purple)', fontWeight: 700, fontSize: '15px' }}>
                      {item.currency === 'coins' ? '◆' : '⬡'} {item.price}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>+{item.power} power</span>
                  </div>
                  <button onClick={() => !owned && handlePurchase(item)} style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: 'none', cursor: owned ? 'default' : 'pointer',
                    background: owned ? '#222' : `linear-gradient(135deg, ${rarityColor}25, ${rarityColor}10)`,
                    color: owned ? 'var(--text-secondary)' : rarityColor,
                    fontSize: '13px', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px',
                    transition: 'background 0.2s',
                  }}>{owned ? '✓ OWNED' : 'PURCHASE'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROFILE PAGE
// ============================================================
const ProfilePage = ({ user, character, coins, tokens }) => {
  const level = Math.floor(coins / 100) + 1;
  const xp = coins % 100;
  const rank = level >= 20 ? 'Cosmic Tyrant' : level >= 15 ? 'Shadow King' : level >= 10 ? 'Iron Overlord' : level >= 5 ? 'Dark Knight' : 'Rookie Warrior';
  
  const achievements = [
    { name: 'First Blood', desc: 'Complete your first game', icon: '🥇', unlocked: coins > 0 },
    { name: 'Arena Champion', desc: 'Win 5 arena games', icon: '🏆', unlocked: coins >= 250 },
    { name: 'Gear Master', desc: 'Purchase 3 items', icon: '⚒️', unlocked: coins >= 500 },
    { name: 'Shadow King', desc: 'Reach Level 10', icon: '👑', unlocked: level >= 10 },
    { name: 'Multiverse Walker', desc: 'Reach Level 20', icon: '🌌', unlocked: level >= 20 },
    { name: 'Coin Hoarder', desc: 'Accumulate 1000 coins', icon: '💰', unlocked: coins >= 1000 },
  ];

  const alignmentLight = 60;
  const alignmentDark = 40;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '16px', padding: '40px', marginBottom: '24px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 40px rgba(212,175,55,0.08)',
        }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,85,247,0.15))',
              border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', boxShadow: '0 0 20px rgba(212,175,55,0.2)',
            }}>{user?.avatar || '⚔️'}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: 'var(--gold)', fontSize: '26px', letterSpacing: '2px', marginBottom: '4px' }}>{user?.username || 'Warrior'}</h1>
              <p style={{ color: 'var(--neon-purple)', fontSize: '13px', letterSpacing: '1px' }}>— {rank} —</p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', fontSize: '22px', fontWeight: 700 }}>{level}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>Level</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', fontSize: '22px', fontWeight: 700 }}>{coins.toLocaleString()}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>Coins</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--neon-purple)', fontSize: '22px', fontWeight: 700 }}>{tokens}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>Tokens</div>
              </div>
            </div>
          </div>
          {/* XP Bar */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>XP Progress</span>
              <span style={{ color: 'var(--gold)', fontSize: '12px', fontFamily: 'Share Tech Mono' }}>{xp}/100 XP</span>
            </div>
            <div style={{ height: '8px', background: '#0a0a0a', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${xp}%`, borderRadius: '4px',
                background: 'linear-gradient(90deg, var(--gold), var(--neon-purple))',
                transition: 'width 0.6s ease',
                boxShadow: '0 0 8px rgba(212,175,55,0.4)',
              }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Character Card */}
          <div style={{ background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: 'var(--gold)', fontSize: '15px', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>Your Venger</h3>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '8px' }}>{character.type === 'hero' ? '☀️' : character.type === 'villain' ? '🌑' : '⚡'}</div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', fontFamily: 'Cinzel, serif' }}>{character.name || 'Unnamed'}</h4>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{character.type || 'Unknown'}</span>
            </div>
            {Object.entries(character.attributes).map(([attr, val]) => {
              const colors = { Strength: 'var(--crimson-light)', Intelligence: 'var(--neon-blue)', Agility: 'var(--neon-green)', Power: 'var(--neon-purple)', Endurance: 'var(--gold)' };
              return (
                <div key={attr} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{attr}</span>
                    <span style={{ color: colors[attr], fontSize: '13px', fontWeight: 700 }}>{val}</span>
                  </div>
                  <div style={{ height: '4px', background: '#0a0a0a', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${(val / 40) * 100}%`, background: colors[attr], borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alignment Meter */}
          <div style={{ background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: 'var(--gold)', fontSize: '15px', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>Dark vs Light</h3>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--neon-purple)', fontSize: '12px', fontWeight: 600 }}>🌑 Dark {alignmentDark}%</span>
                <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 600 }}>☀️ Light {alignmentLight}%</span>
              </div>
              <div style={{ height: '12px', background: '#0a0a0a', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: `${alignmentDark}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-purple), rgba(168,85,247,0.5))' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: `${alignmentLight}%`, height: '100%', background: 'linear-gradient(270deg, var(--gold), rgba(212,175,55,0.5))' }} />
              </div>
            </div>
            {/* Titles */}
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Earned Titles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Shadow King', 'Iron Overlord', 'Cosmic Tyrant', 'Dark Knight', 'Rookie Warrior'].map((title, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '6px', background: i < 2 ? 'rgba(212,175,55,0.08)' : '#0a0a0a', border: `1px solid ${i < 2 ? 'rgba(212,175,55,0.2)' : '#1a1a1a'}` }}>
                  <span style={{ fontSize: '16px' }}>{i < 2 ? '👑' : '🔒'}</span>
                  <span style={{ color: i < 2 ? 'var(--gold)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: i < 2 ? 600 : 400 }}>{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ marginTop: '24px', background: 'linear-gradient(145deg, #141414, #1c1c1c)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: 'var(--gold)', fontSize: '15px', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {achievements.map((a, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: '8px', border: `1px solid ${a.unlocked ? 'rgba(212,175,55,0.3)' : '#222'}`,
                background: a.unlocked ? 'rgba(212,175,55,0.08)' : '#0a0a0a', opacity: a.unlocked ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>{a.unlocked ? a.icon : '🔒'}</span>
                  <span style={{ color: a.unlocked ? 'var(--gold)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>{a.name}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', paddingLeft: '30px' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Features */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Guilds', icon: '⚔️', desc: 'Coming Soon' },
            { label: 'PvP Arena', icon: '🏟️', desc: 'Coming Soon' },
            { label: 'Seasonal Events', icon: '🌟', desc: 'Coming Soon' },
            { label: 'Leaderboards', icon: '📊', desc: 'Coming Soon' },
            { label: 'Daily Quests', icon: '📋', desc: 'Coming Soon' },
            { label: 'Lore Chapters', icon: '📖', desc: 'Coming Soon' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '16px', textAlign: 'center', opacity: 0.5 }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>{f.label}</div>
              <div style={{ color: '#444', fontSize: '11px' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [coins, setCoins] = useState(250);
  const [tokens, setTokens] = useState(10);
  const [character, setCharacter] = useState({
    type: 'hero', name: '',
    attributes: { Strength: 20, Intelligence: 20, Agility: 20, Power: 20, Endurance: 20 },
    skinTone: '#e8b88a', eyeColor: '#00d4ff', hair: 'Short',
    helmet: 'None', armor: 'None', weapon: 'None',
  });

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('home');
  };

  const renderPage = () => {
    if (!user && page !== 'landing') return <AuthPage onLogin={handleLogin} />;
    switch (page) {
      case 'landing': return <LandingPage onLogin={() => setPage('auth')} setPage={(p) => { if (!user) { setPage('auth'); } else { setPage(p); }}} />;
      case 'auth': return <AuthPage onLogin={handleLogin} />;
      case 'home': return <LandingPage onLogin={() => {}} setPage={setPage} />;
      case 'create': return <CharacterCreationPage character={character} setCharacter={setCharacter} />;
      case 'arena': return <ArenaPage coins={coins} setCoins={setCoins} tokens={tokens} />;
      case 'store': return <StorePage coins={coins} setCoins={setCoins} tokens={tokens} setTokens={setTokens} />;
      case 'profile': return <ProfilePage user={user} character={character} coins={coins} tokens={tokens} />;
      default: return <LandingPage onLogin={() => setPage('auth')} setPage={setPage} />;
    }
  };

  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <GlobalStyles />
      <ParticleField />
      <ToastManager />
      {user && <Navbar page={page} setPage={setPage} user={user} coins={coins} tokens={tokens} />}
      {!user && page === 'landing' && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(10,10,10,0.8), transparent)' }}>
          <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '22px', letterSpacing: '4px', animation: 'glowPulse 3s infinite' }}>VENGERS</span>
          <button onClick={() => setPage('auth')} style={{ padding: '8px 24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px' }}>LOG IN</button>
        </nav>
      )}
      <div style={{ position: 'relative' }}>{renderPage()}</div>
    </div>
  );
}
