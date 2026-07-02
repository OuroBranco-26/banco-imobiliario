import './NewsCardModal.css';

const NewsCardModal = ({ card, playerName, onClose }) => {
  if (!card) return null;

  // Replace {player} placeholder with actual player name
  const cardText = card.text.replace(/\{player\}/g, playerName || 'Jogador');

  return (
    <div className="news-overlay">
      <div className="news-card-modal" onClick={e => e.stopPropagation()}>
        <div className="news-card-header">
          <span className="news-icon">📰</span>
          <h3>Cartas de Notícias</h3>
        </div>
        <div className="news-card-body">
          <p className="news-text">{cardText}</p>
        </div>
        {onClose && (
          <button className="news-close-btn" onClick={onClose}>
            Continuar
          </button>
        )}
        {!onClose && (
          <p className="news-wait">Aguardando o jogador...</p>
        )}
      </div>
    </div>
  );
};

export default NewsCardModal;
