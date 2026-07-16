import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MOCK_WEDDINGS } from './data/mockData';
import Sidebar from './components/Sidebar';
import LoginPage, { ROLE_PERMISSIONS } from './pages/LoginPage';
import WeddingListPage from './pages/WeddingListPage';
import WeddingDetailLayout from './pages/WeddingDetailLayout';
import WeddingOverview from './pages/tabs/WeddingOverview';
import WeddingCateringTimeline from './pages/tabs/WeddingCateringTimeline';
import WeddingFinancial from './pages/tabs/WeddingFinancial';
import WeddingSeating from './pages/tabs/WeddingSeating';
import WeddingDecor from './pages/tabs/WeddingDecor';
import WeddingContacts from './pages/tabs/WeddingContacts';
import WeddingJourney from './pages/tabs/WeddingJourney';
import WeddingIntakeForm from './pages/tabs/WeddingIntakeForm';
import WeddingActionItems from './pages/tabs/WeddingActionItems';
import PrintSeating from './pages/print/PrintSeating';
import PrintDecor from './pages/print/PrintDecor';
import PrintDecorItems from './pages/print/PrintDecorItems';
import PrintTimeline from './pages/print/PrintTimeline';
import PublicSeatingPlan from './pages/public/PublicSeatingPlan';
import PublicTimeline from './pages/public/PublicTimeline';
import './App.css';

const ROLE_LABELS = {
  coordenadora: 'Coordenadora',
  chefe_sala: 'Chefe de Sala',
  catering: 'Catering',
  decoracao: 'Decoração',
  admin: 'Admin',
};

function Header({ onLogout, role }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const [clock, setClock] = useState('');

  // Live clock — updates every second
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(n.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark-theme');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark-theme');
      setIsDark(true);
    }
  };

  const loc = useLocation();
  const match = loc.pathname.match(/\/wedding\/(w\d+)/);
  const weddingId = match ? match[1] : null;
  const wedding = weddingId ? MOCK_WEDDINGS.find(w => w.id === weddingId) : null;

  return (
    <header className="ldv-topbar">
      {/* Left: logo + breadcrumb */}
      <div className="ldv-topbar-left">
        <div className="ldv-topbar-logo">LDV</div>
        {wedding ? (
          <>
            <div className="ldv-topbar-sep" />
            <div className="ldv-topbar-ev">
              <div className="ldv-ev-name">{wedding.bride} &amp; {wedding.groom}</div>
              <div className="ldv-ev-pax">
                {wedding.guests_adult} adultos · {wedding.guests_child_4_9} crianças
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="ldv-topbar-sep" />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>CRM de Gestão de Casamentos</div>
          </>
        )}
      </div>

      {/* Right: LIVE + Clock + Role + Actions */}
      <div className="ldv-topbar-right">
        {/* LIVE indicator */}
        <div className="ldv-live">
          <span className="ldv-live-dot" />
          LIVE
        </div>
        {/* Clock */}
        <div className="ldv-clock">{clock}</div>

        <div className="ldv-topbar-sep" />

        <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Alternar tema" style={{ padding: 6, fontSize: 16 }}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="ldv-topbar-sep" />
        <span className="ldv-role-badge">{ROLE_LABELS[role] || role}</span>
        <button className="btn btn-ghost btn-sm" onClick={onLogout} title="Sair" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem('ldv-role'));
  const navigate = useNavigate();

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('ldv-role', selectedRole);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('ldv-role');
    navigate('/login');
  };

  const loc = useLocation();

  // Rotas públicas — sem login, tal como no original (window.location.pathname.startsWith(...)).
  // Têm de vir ANTES do gate de autenticação.
  if (loc.pathname.startsWith('/public/')) {
    return (
      <Routes>
        <Route path="/public/seating/:id" element={<PublicSeatingPlan />} />
        <Route path="/public/timeline/:id/:column" element={<PublicTimeline />} />
      </Routes>
    );
  }

  if (!role) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Bypass layout for print views
  if (loc.pathname.includes('/print')) {
    return (
      <Routes>
        <Route path="/wedding/:id/seating/print" element={<PrintSeating />} />
        <Route path="/wedding/:id/decor/print" element={<PrintDecor />} />
        <Route path="/wedding/:id/decor-items/print" element={<PrintDecorItems />} />
        <Route path="/wedding/:id/timeline/print/planning" element={<PrintTimeline />} />
      </Routes>
    );
  }

  // Get allowed tabs for this role
  const allowedTabs = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.admin;

  return (
    <div className="ldv-layout">
      <Header onLogout={handleLogout} role={role} />
      <div className="ldv-main-wrapper">
        <Sidebar role={role} />
        <main className="ldv-content">
          <Routes>
            <Route path="/dashboard" element={<WeddingListPage />} />
            <Route path="/calendar" element={<WeddingListPage defaultView="calendar" />} />
            <Route path="/wedding/:id" element={<WeddingDetailLayout role={role} allowedTabs={allowedTabs} />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<WeddingOverview />} />
              {allowedTabs.includes('timeline') && (
                <Route path="timeline" element={<WeddingCateringTimeline />} />
              )}
              {allowedTabs.includes('financial') && (
                <Route path="financial" element={<WeddingFinancial />} />
              )}
              {allowedTabs.includes('seating') && (
                <Route path="seating" element={<WeddingSeating />} />
              )}
              {allowedTabs.includes('decor') && (
                <Route path="decor" element={<WeddingDecor />} />
              )}
              {allowedTabs.includes('contacts') && (
                <Route path="contacts" element={<WeddingContacts />} />
              )}
              {allowedTabs.includes('journey') && (
                <Route path="journey" element={<WeddingJourney />} />
              )}
              {allowedTabs.includes('intake') && (
                <Route path="intake" element={<WeddingIntakeForm />} />
              )}
              {allowedTabs.includes('actions') && (
                <Route path="actions" element={<WeddingActionItems />} />
              )}
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
