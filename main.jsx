import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{
      background: '#0b3d0b',
      minHeight: '100vh',
      color: 'white',
      padding: '30px',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ color: '#FFD700' }}>
        🏆 Bolão da Copa 2026
      </h1>

      <p>
        Taxa de participação: <b>R$ 50,00</b>
      </p>

      <p>
        Faça o pagamento via PIX:
      </p>

      <div style={{
        background: '#1c1c1c',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '10px'
      }}>
        31388495805
      </div>

      <h2 style={{ marginTop: '40px', color: '#FFD700' }}>
        Regras do Bolão
      </h2>

      <ul>
        <li>Acertou vencedor → 3 pontos</li>
        <li>Acertou placar exato → 5 pontos</li>
        <li>Maior pontuação ganha o prêmio acumulado</li>
        <li>Empate no ranking divide o prêmio</li>
      </ul>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
