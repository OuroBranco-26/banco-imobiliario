import { BOARD_SPACES, BOARD_COLORS } from '../data/boardData';
import './BoardStyle.css';

const Board = ({ players, ownership, buildings = {}, mortgaged = {}, visualEffects = [] }) => {
  
  const renderBuildings = (spaceId) => {
    const count = buildings[spaceId] || 0;
    if (count === 0) return null;
    
    if (count === 5) {
      return (
        <div className="buildings-container">
          <div className="building hotel" title="Hotel">🏨</div>
        </div>
      );
    }
    
    return (
      <div className="buildings-container">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="building house" title={`Casa ${i + 1}`}>🏠</div>
        ))}
      </div>
    );
  };

  const renderSpace = (space) => {
    let gridRow = 1;
    let gridColumn = 1;
    let spaceClass = 'space ';
    
    if (space.id >= 20 && space.id <= 30) {
      gridRow = 1;
      gridColumn = space.id - 19;
      spaceClass += 'top';
    } else if (space.id >= 31 && space.id <= 39) {
      gridRow = space.id - 29;
      gridColumn = 11;
      spaceClass += 'right';
    } else if (space.id >= 0 && space.id <= 10) {
      gridRow = 11;
      gridColumn = 11 - space.id;
      spaceClass += 'bottom';
    } else if (space.id >= 11 && space.id <= 19) {
      gridRow = 21 - space.id;
      gridColumn = 1;
      spaceClass += 'left';
    }

    if (space.id % 10 === 0) spaceClass += ' corner';
    if (mortgaged[space.id]) spaceClass += ' mortgaged';
    
    const ownerId = ownership[space.id];
    const owner = ownerId ? players.find(p => p.id === ownerId) : null;
    
    const playersHere = players.filter(p => p.position === space.id);

    return (
      <div 
        key={space.id} 
        className={spaceClass} 
        style={{ gridRow, gridColumn }}
        onClick={() => handleSpaceClick(space.id)}
      >
        {visualEffects.filter(e => e.spaceId === space.id).map(e => (
          <div key={e.id} className="effect-container">
            {e.type === 'build-dust' && <span className="effect-dust">💨</span>}
          </div>
        ))}
        {space.color && <div className="color-bar" style={{ backgroundColor: BOARD_COLORS[space.color] }}></div>}
        {space.type === 'chance' && <div className="color-bar" style={{ backgroundColor: '#ffffff' }}></div>}
        {!space.color && space.type !== 'chance' && space.id % 10 !== 0 && (
          <div className="color-bar" style={{ backgroundColor: 
            space.name === 'Receita Federal' ? '#9333ea' :
            space.name === 'Imposto Renda' ? '#06b6d4' :
            '#111111'
          }}></div>
        )}
        
        {/* Owner dot */}
        {owner && (
          <div className="owner-dot" style={{ backgroundColor: owner.color }} title={`Dono: ${owner.name}`}></div>
        )}
        
        {/* Buildings */}
        {space.type === 'property' && renderBuildings(space.id)}
        
        <div className="space-content">
          <span className="space-name">{space.name}</span>
          {space.price && <span className="space-price">${space.price}</span>}
        </div>
        
        {playersHere.length > 0 && (
          <div className="players-container">
            {playersHere.map(p => (
              <div 
                key={p.id} 
                id={`token-${p.id}`}
                className="player-token" 
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {p.avatar || ''}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="board">
      <div className="board-center">
        <h1 className="board-logo">BANCO<br/>IMOBILIÁRIO<div style={{fontSize: '14px', color: 'red'}}>VER 3.0</div></h1>
      </div>
      {BOARD_SPACES.map(renderSpace)}
    </div>
  );
};

export default Board;
