import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Trophy, Users, Wallet, ShieldCheck, CheckCircle, Lock, Plus, Trash2, Medal, ClipboardList } from 'lucide-react';
import './style.css';

const ENTRY_FEE = 50;
const PIX_KEY = '31388495805';
const ADMIN_PASSWORD = 'copa2026@';

const defaultGames = [
  { id: 1, phase: 'Fase de grupos', date: '11/06/2026 16:00', home: 'México', away: 'A definir', homeScore: '', awayScore: '', locked: false },
  { id: 2, phase: 'Fase de grupos', date: '12/06/2026 16:00', home: 'Canadá', away: 'A definir', homeScore: '', awayScore: '', locked: false },
  { id: 3, phase: 'Fase de grupos', date: '13/06/2026 16:00', home: 'Brasil', away: 'A definir', homeScore: '', awayScore: '', locked: false },
  { id: 4, phase: 'Fase de grupos', date: '14/06/2026 16:00', home: 'Argentina', away: 'A definir', homeScore: '', awayScore: '', locked: false },
];

const initialState = {
  participants: [],
  games: defaultGames,
  guesses: {},
  championGuesses: {},
};

function loadState() {
  try { return JSON.parse(localStorage.getItem('bolao-copa-2026')) || initialState; }
  catch { return initialState; }
}

function saveState(state) { localStorage.setItem('bolao-copa-2026', JSON.stringify(state)); }

function resultOf(a, b) {
  const x = Number(a), y = Number(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  if (x > y) return 'home';
  if (x < y) return 'away';
  return 'draw';
}

function calcPoints(game, guess) {
  if (!guess || game.homeScore === '' || game.awayScore === '') return 0;
  const gh = Number(guess.homeScore), ga = Number(guess.awayScore);
  const rh = Number(game.homeScore), ra = Number(game.awayScore);
  if ([gh, ga, rh, ra].some(Number.isNaN)) return 0;
  const isKnockout = game.phase !== 'Fase de grupos';
  if (gh === rh && ga === ra) return isKnockout ? 7 : 5;
  const real = resultOf(rh, ra);
  const palpite = resultOf(gh, ga);
  if (real === palpite) return isKnockout ? 3 : 3;
  if (gh === rh || ga === ra) return 1;
  return 0;
}

function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('home');
  const [selectedId, setSelectedId] = useState('');
  const [admin, setAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [participantForm, setParticipantForm] = useState({ name: '', phone: '', email: '', pixReceipt: '' });
  const [newGame, setNewGame] = useState({ phase: 'Fase de grupos', date: '', home: '', away: '' });

  useEffect(() => saveState(state), [state]);

  const selected = state.participants.find(p => p.id === selectedId);
  const prize = state.participants.filter(p => p.paid).length * ENTRY_FEE;

  const ranking = useMemo(() => {
    return state.participants.map(p => {
      const total = state.games.reduce((sum, g) => sum + calcPoints(g, state.guesses[`${p.id}-${g.id}`]), 0);
      const exact = state.games.filter(g => {
        const guess = state.guesses[`${p.id}-${g.id}`];
        return guess && g.homeScore !== '' && g.awayScore !== '' && Number(guess.homeScore) === Number(g.homeScore) && Number(guess.awayScore) === Number(g.awayScore);
      }).length;
      return { ...p, total, exact };
    }).sort((a, b) => b.total - a.total || b.exact - a.exact);
  }, [state]);

  function registerParticipant(e) {
    e.preventDefault();
    if (!participantForm.name || !participantForm.phone) return alert('Preencha nome e WhatsApp.');
    const id = crypto.randomUUID();
    const participant = { id, ...participantForm, paid: false, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, participants: [...s.participants, participant] }));
    setSelectedId(id);
    setParticipantForm({ name: '', phone: '', email: '', pixReceipt: '' });
    setTab('payment');
  }

  function updateGuess(gameId, field, value) {
    if (!selected) return alert('Selecione ou cadastre um participante.');
    if (!selected.paid) return alert('Pagamento ainda não confirmado pela administração.');
    const game = state.games.find(g => g.id === gameId);
    if (game.locked) return alert('Palpite bloqueado para este jogo.');
    const key = `${selected.id}-${gameId}`;
    setState(s => ({ ...s, guesses: { ...s.guesses, [key]: { ...(s.guesses[key] || {}), [field]: value } } }));
  }

  function updateGame(id, field, value) {
    setState(s => ({ ...s, games: s.games.map(g => g.id === id ? { ...g, [field]: value } : g) }));
  }

  function addGame() {
    if (!newGame.date || !newGame.home || !newGame.away) return alert('Preencha data, seleção mandante e visitante.');
    setState(s => ({ ...s, games: [...s.games, { id: Date.now(), ...newGame, homeScore: '', awayScore: '', locked: false }] }));
    setNewGame({ phase: 'Fase de grupos', date: '', home: '', away: '' });
  }

  function removeGame(id) { setState(s => ({ ...s, games: s.games.filter(g => g.id !== id) })); }
  function togglePaid(id) { setState(s => ({ ...s, participants: s.participants.map(p => p.id === id ? { ...p, paid: !p.paid } : p) })); }
  function removeParticipant(id) { setState(s => ({ ...s, participants: s.participants.filter(p => p.id !== id) })); }

  return <main>
    <header className="hero">
      <div>
        <p className="eyebrow">Bolão da Copa do Mundo 2026</p>
        <h1>Bolão verde e amarelo, ranking no sangue e palpite na raça.</h1>
        <p className="subtitle">Cadastro com taxa de R$ 50,00, prêmio acumulado, regras claras e painel para controle.</p>
      </div>
      <div className="hero-card">
        <span>Prêmio acumulado</span>
        <strong>{prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        <small>{state.participants.filter(p => p.paid).length} participante(s) confirmado(s)</small>
      </div>
    </header>

    <nav className="tabs">
      {[
        ['home', 'Início'], ['register', 'Cadastro'], ['payment', 'Pagamento'], ['guesses', 'Palpites'], ['ranking', 'Ranking'], ['rules', 'Regras'], ['admin', 'Admin']
      ].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'active' : ''}>{label}</button>)}
    </nav>

    {tab === 'home' && <section className="grid cards">
      <Card icon={<Users/>} title="Cadastro" text="Participante informa nome, WhatsApp e e-mail." />
      <Card icon={<Wallet/>} title="Taxa R$ 50" text="Pagamento via Pix. Admin confirma manualmente." />
      <Card icon={<Trophy/>} title="Prêmio" text="Acumulado vira premiação do bolão." />
      <Card icon={<ShieldCheck/>} title="Regras" text="Pontuação automática por fase e critérios de desempate." />
    </section>}

    {tab === 'register' && <section className="panel narrow">
      <h2>Cadastro do participante</h2>
      <form onSubmit={registerParticipant} className="form">
        <input placeholder="Nome completo" value={participantForm.name} onChange={e => setParticipantForm({...participantForm, name: e.target.value})}/>
        <input placeholder="WhatsApp" value={participantForm.phone} onChange={e => setParticipantForm({...participantForm, phone: e.target.value})}/>
        <input placeholder="E-mail" value={participantForm.email} onChange={e => setParticipantForm({...participantForm, email: e.target.value})}/>
        <button className="primary">Cadastrar e ir para pagamento</button>
      </form>
    </section>}

    {tab === 'payment' && <section className="panel narrow">
      <h2>Pagamento da taxa</h2>
      <p>Valor da entrada: <b>R$ 50,00</b></p>
      <div className="pixbox">Chave Pix: <b>{PIX_KEY}</b></div>
      <p>Após pagar, envie o comprovante para a administradora. O acesso aos palpites será liberado quando o pagamento for confirmado.</p>
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Selecione seu nome</option>
        {state.participants.map(p => <option key={p.id} value={p.id}>{p.name} {p.paid ? '✅' : '⏳'}</option>)}
      </select>
      {selected && <p className={selected.paid ? 'ok' : 'pending'}>{selected.paid ? 'Pagamento confirmado. Pode palpitar!' : 'Pagamento pendente de confirmação.'}</p>}
    </section>}

    {tab === 'guesses' && <section className="panel">
      <div className="section-head"><h2>Palpites</h2><select value={selectedId} onChange={e => setSelectedId(e.target.value)}><option value="">Selecionar participante</option>{state.participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      {!selected && <p>Cadastre ou selecione um participante.</p>}
      {selected && !selected.paid && <p className="pending"><Lock size={16}/> Aguardando confirmação do pagamento para liberar palpites.</p>}
      {selected && <div className="games">{state.games.map(g => {
        const guess = state.guesses[`${selected.id}-${g.id}`] || {};
        return <div className="game" key={g.id}>
          <div><small>{g.phase} · {g.date}</small><strong>{g.home} x {g.away}</strong></div>
          <div className="score"><input type="number" min="0" disabled={!selected.paid || g.locked} value={guess.homeScore || ''} onChange={e => updateGuess(g.id, 'homeScore', e.target.value)}/><span>x</span><input type="number" min="0" disabled={!selected.paid || g.locked} value={guess.awayScore || ''} onChange={e => updateGuess(g.id, 'awayScore', e.target.value)}/></div>
          <b>{calcPoints(g, guess)} pts</b>
        </div>
      })}</div>}
    </section>}

    {tab === 'ranking' && <section className="panel">
      <h2>Ranking geral</h2>
      <div className="ranking">{ranking.map((p, i) => <div className="rank" key={p.id}><span>{i+1}</span><div><b>{p.name}</b><small>{p.exact} placar(es) exato(s)</small></div><strong>{p.total} pts</strong></div>)}</div>
    </section>}

    {tab === 'rules' && <section className="panel rules">
      <h2>Regras oficiais do bolão</h2>
      <ol>
        <li>Taxa única de participação: R$ 50,00.</li>
        <li>Somente participantes com pagamento confirmado poderão registrar palpites.</li>
        <li>Palpites devem ser feitos antes do início de cada jogo.</li>
        <li>Fase de grupos: placar exato 5 pts, vencedor/empate 3 pts, gol de um time 1 pt.</li>
        <li>Mata-mata: placar exato 7 pts, vencedor no tempo normal 3 pts.</li>
        <li>Desempate: mais placares exatos, mais pontos no mata-mata, mais pontos na final e, persistindo empate, divisão do prêmio.</li>
        <li>Premiação sugerida: 70% para 1º lugar, 20% para 2º e 10% para 3º.</li>
        <li>Bolão privado e recreativo, sem finalidade de exploração comercial de apostas.</li>
      </ol>
    </section>}

    {tab === 'admin' && <section className="panel">
      {!admin ? <div className="narrow"><h2>Área admin</h2><input type="password" placeholder="Senha admin" value={adminPass} onChange={e => setAdminPass(e.target.value)}/><button className="primary" onClick={() => adminPass === ADMIN_PASSWORD ? setAdmin(true) : alert('Senha inválida')}>Entrar</button><small>Senha padrão: admin2026. Altere no arquivo src/main.jsx antes de publicar.</small></div> : <AdminPanel state={state} setState={setState} togglePaid={togglePaid} removeParticipant={removeParticipant} updateGame={updateGame} newGame={newGame} setNewGame={setNewGame} addGame={addGame} removeGame={removeGame}/>} 
    </section>}
  </main>;
}

function Card({ icon, title, text }) { return <div className="card">{icon}<h3>{title}</h3><p>{text}</p></div>; }

function AdminPanel({ state, togglePaid, removeParticipant, updateGame, newGame, setNewGame, addGame, removeGame }) {
  return <div className="admin-grid">
    <div><h2><ClipboardList/> Participantes</h2>{state.participants.map(p => <div className="admin-row" key={p.id}><div><b>{p.name}</b><small>{p.phone} · {p.email || 'sem e-mail'}</small></div><button onClick={() => togglePaid(p.id)} className={p.paid ? 'paid' : 'unpaid'}>{p.paid ? 'Pago' : 'Pendente'}</button><button onClick={() => removeParticipant(p.id)}><Trash2 size={16}/></button></div>)}</div>
    <div><h2><Medal/> Jogos e resultados</h2><div className="add-game"><select value={newGame.phase} onChange={e => setNewGame({...newGame, phase: e.target.value})}><option>Fase de grupos</option><option>32 avos de final</option><option>Oitavas</option><option>Quartas</option><option>Semifinal</option><option>Final</option></select><input placeholder="Data e hora" value={newGame.date} onChange={e => setNewGame({...newGame, date: e.target.value})}/><input placeholder="Time 1" value={newGame.home} onChange={e => setNewGame({...newGame, home: e.target.value})}/><input placeholder="Time 2" value={newGame.away} onChange={e => setNewGame({...newGame, away: e.target.value})}/><button className="primary" onClick={addGame}><Plus size={16}/> Add jogo</button></div>{state.games.map(g => <div className="admin-game" key={g.id}><b>{g.home} x {g.away}</b><small>{g.phase} · {g.date}</small><div className="score"><input type="number" min="0" value={g.homeScore} onChange={e => updateGame(g.id, 'homeScore', e.target.value)}/><span>x</span><input type="number" min="0" value={g.awayScore} onChange={e => updateGame(g.id, 'awayScore', e.target.value)}/></div><label><input type="checkbox" checked={g.locked} onChange={e => updateGame(g.id, 'locked', e.target.checked)}/> Bloquear palpites</label><button onClick={() => removeGame(g.id)}>Remover</button></div>)}</div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
