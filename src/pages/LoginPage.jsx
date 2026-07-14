import { useState, useRef, useEffect, useCallback } from 'react';

const PROFILES = [
  { id: 'coordenadora', label: 'Coordenadora', code: '111111' },
  { id: 'chefe_sala',   label: 'Chefe de Sala', code: '222222' },
  { id: 'catering',     label: 'Catering',      code: '333333' },
  { id: 'decoracao',    label: 'Decoração',      code: '444444' },
  { id: 'admin',        label: 'Administrador',  code: '999999' },
];

// Which tabs each profile can see
export const ROLE_PERMISSIONS = {
  coordenadora: ['overview', 'timeline', 'financial', 'seating', 'decor', 'contacts', 'journey'],
  chefe_sala:   ['overview', 'timeline', 'seating'],
  catering:     ['overview', 'timeline'],
  decoracao:    ['overview', 'decor'],
  admin:        ['overview', 'timeline', 'financial', 'seating', 'decor', 'contacts', 'journey'],
};

export default function LoginPage({ onLogin }) {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first digit when profile is selected
  useEffect(() => {
    if (selectedProfile) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [selectedProfile]);

  const handleDigit = useCallback((idx, value) => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value.toUpperCase();
    setDigits(next);
    setError('');

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, [digits]);

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i].toUpperCase();
    setDigits(next);
    if (text.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[text.length]?.focus();
    }
  }, []);

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < 6) {
      setError('Introduza o código completo de 6 dígitos.');
      return;
    }
    if (!selectedProfile) {
      setError('Selecione o seu perfil.');
      return;
    }

    const profile = PROFILES.find(p => p.id === selectedProfile);
    if (profile && profile.code === code) {
      setLoading(true);
      setTimeout(() => onLogin(selectedProfile), 600);
    } else {
      setShake(true);
      setError('Código inválido. Tente novamente.');
      setTimeout(() => {
        setShake(false);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 400);
    }
  };

  const selectedProfileData = PROFILES.find(p => p.id === selectedProfile);

  return (
    <div className="ldv-login-wrap">
      <div className="ldv-login-box">
        {/* Logo */}
        <div className="ldv-login-logo">
          <div className="ldv-logo-text">LDV</div>
        </div>
        <div className="ldv-login-title">Wedding CRM</div>
        <div className="ldv-login-sub">Selecione o perfil e introduza o código de acesso</div>

        {/* Profile selector */}
        <div className="ldv-form-group">
          <label className="ldv-label">Perfil</label>
          <select
            className="ldv-select"
            value={selectedProfile}
            onChange={e => setSelectedProfile(e.target.value)}
          >
            <option value="">— Selecionar perfil —</option>
            {PROFILES.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* 6-digit code */}
        {selectedProfile && (
          <div className="ldv-form-group">
            <label className="ldv-label">Código de Acesso</label>
            <div className="ldv-code-row">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`ldv-digit${shake ? ' shake' : ''}`}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="ldv-login-err">{error}</div>}

        {/* Hint */}
        {selectedProfile && (
          <div className="ldv-hint">
            Código de demo para <strong>{selectedProfileData?.label}</strong>: <strong>{selectedProfileData?.code}</strong>
          </div>
        )}

        {/* Submit */}
        <button
          className="ldv-btn-login"
          onClick={handleSubmit}
          disabled={loading || !selectedProfile || digits.join('').length < 6}
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
