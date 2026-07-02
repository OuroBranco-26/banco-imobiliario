import React, { useState } from 'react';
import './TutorialModal.css';

const TutorialModal = ({ onClose }) => {
  const [tab, setTab] = useState(0);

  const tabs = [
    {
      title: "Objetivo",
      icon: "🎯",
      content: "O objetivo do Banco Imobiliário é simples: Falir todos os seus oponentes! Compre propriedades, construa casas e cobre aluguel de quem cair nos seus terrenos."
    },
    {
      title: "Como Jogar",
      icon: "🎲",
      content: "No seu turno, role os dados para andar pelo tabuleiro. Se cair numa propriedade vazia, você pode comprá-la. Se decidir não comprar, ela vai a leilão para todos os jogadores!"
    },
    {
      title: "Casas e Hotéis",
      icon: "🏠",
      content: "Se você comprar todas as propriedades de uma mesma cor (um Monopólio), você poderá construir Casas e Hotéis nelas para multiplicar o valor do aluguel cobrado!"
    },
    {
      title: "Speed Mode (Timer)",
      icon: "⏱️",
      content: "Para o jogo não ficar lento, após o 1º jogador rolar os dados, o Speed Mode é ativado! Você terá 10s para rolar o dado, 5s para decidir compras e 7s para ler cartas. Seja rápido!"
    }
  ];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal glass-panel">
        <div className="tutorial-header">
          <h2>Bem-vindo ao Banco Imobiliário!</h2>
          <p>Leia rapidinho para não fazer feio na partida.</p>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-tabs">
            {tabs.map((t, i) => (
              <button 
                key={i} 
                className={`tutorial-tab ${tab === i ? 'active' : ''}`}
                onClick={() => setTab(i)}
              >
                {t.icon} {t.title}
              </button>
            ))}
          </div>

          <div className="tutorial-body">
            <div className="tutorial-icon-large">{tabs[tab].icon}</div>
            <p className="tutorial-text">{tabs[tab].content}</p>
          </div>
        </div>

        <div className="tutorial-footer">
          <button className="tutorial-btn" onClick={onClose}>
            Entendi, Bora Jogar! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
