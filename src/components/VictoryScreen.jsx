import React, { useMemo } from 'react';
import { BOARD_SPACES } from '../data/boardData';
import './VictoryScreen.css';

/**
 * VictoryScreen — Full-screen overlay shown when a player wins the game.
 *
 * Props:
 *   winner      – { name, color, money, avatar }
 *   players     – full array of player objects (used for ranking)
 *   ownership   – { [boardSpaceId]: playerIndex }  maps each property to its owner
 *   onPlayAgain – callback fired when the "Jogar Novamente" button is clicked
 */
export default function VictoryScreen({ winner, players, ownership, onPlayAgain }) {
  /* ------------------------------------------------------------------ */
  /*  Calculate total patrimony (money + owned property values) for each */
  /*  player and produce a descending-sorted ranking.                   */
  /* ------------------------------------------------------------------ */
  const ranking = useMemo(() => {
    return players
      .map((player, index) => {
        // Sum the prices of every board space this player owns
        const propertyValue = Object.entries(ownership)
          .filter(([, ownerIndex]) => ownerIndex === index)
          .reduce((sum, [spaceId]) => {
            const space = BOARD_SPACES[Number(spaceId)];
            return sum + (space?.price ?? 0);
          }, 0);

        return {
          ...player,
          propertyValue,
          totalPatrimony: player.money + propertyValue,
        };
      })
      .sort((a, b) => b.totalPatrimony - a.totalPatrimony);
  }, [players, ownership]);

  // Medal emojis for the top 3 positions
  const medals = ['🥇', '🥈', '🥉'];

  // Winner's total patrimony (grab from the ranking to stay consistent)
  const winnerStats = ranking.find((p) => p.name === winner.name) || ranking[0];

  /* ------------------------------------------------------------------ */
  /*  Confetti pieces — 20 small divs with staggered delays & colors    */
  /* ------------------------------------------------------------------ */
  const confettiColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800',
    '#ff5722', '#e040fb', '#00e5ff', '#76ff03',
    '#ffd740', '#ff6e40', '#64ffda', '#b388ff',
  ];

  const confettiPieces = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="victory-confetti-piece"
      style={{
        left: `${Math.random() * 100}%`,
        backgroundColor: confettiColors[i % confettiColors.length],
        animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
        animationDuration: `${(2.5 + Math.random() * 2).toFixed(2)}s`,
        width: `${6 + Math.random() * 6}px`,
        height: `${6 + Math.random() * 6}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  ));

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="victory-overlay">
      {/* Confetti layer */}
      <div className="victory-confetti">{confettiPieces}</div>

      {/* Center card */}
      <div className="victory-card">
        {/* Trophy */}
        <span className="victory-trophy" role="img" aria-label="troféu">
          🏆
        </span>

        {/* Winner avatar */}
        <span className="victory-avatar" role="img" aria-label={winner.name}>
          {winner.avatar}
        </span>

        {/* Title */}
        <h1 className="victory-title">VITÓRIA!</h1>

        {/* Winner name in their color */}
        <h2 className="victory-winner-name" style={{ color: winner.color }}>
          {winner.name}
        </h2>

        {/* Total patrimony */}
        <p className="victory-patrimony">
          Patrimônio total:{' '}
          <strong>R$ {winnerStats.totalPatrimony.toLocaleString('pt-BR')}</strong>
        </p>

        {/* ---- Ranking table ---- */}
        <div className="victory-ranking">
          <h3 className="victory-ranking-title">Classificação</h3>

          <table className="victory-ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>Dinheiro</th>
                <th>Imóveis</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, idx) => (
                <tr key={player.name} className={player.name === winner.name ? 'winner-row' : ''}>
                  <td className="rank-medal">{medals[idx] ?? `${idx + 1}º`}</td>
                  <td className="rank-player">
                    <span className="rank-avatar">{player.avatar}</span>
                    <span style={{ color: player.color }}>{player.name}</span>
                  </td>
                  <td>R$ {player.money.toLocaleString('pt-BR')}</td>
                  <td>R$ {player.propertyValue.toLocaleString('pt-BR')}</td>
                  <td className="rank-total">
                    R$ {player.totalPatrimony.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Play again button */}
        <button className="victory-btn" onClick={onPlayAgain}>
          Jogar Novamente
        </button>
      </div>
    </div>
  );
}
