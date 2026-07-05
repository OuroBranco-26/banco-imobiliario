import React, { memo } from 'react';
import { BOARD_SPACES, BOARD_COLORS } from '../data/boardData';
import { motion } from 'framer-motion';
import './BoardStyle.css';

const BoardSpace = memo(({ space, owner, playersHere, buildingCount, isMortgaged, visualEffects }) => {
  let top = 'auto';
  let left = 'auto';
  let right = 'auto';
  let bottom = 'auto';
  let spaceClass = 'space ';
  
  const step = 100 / 11; // Porcentagem exata
  
  if (space.id >= 20 && space.id <= 30) {
    top = '0%';
    left = `${(space.id - 20) * step}%`;
    spaceClass += 'top';
  } else if (space.id >= 31 && space.id <= 39) {
    top = `${(space.id - 30) * step}%`;
    right = '0%';
    spaceClass += 'right';
  } else if (space.id >= 0 && space.id <= 10) {
    bottom = '0%';
    left = `${(10 - space.id) * step}%`;
    spaceClass += 'bottom';
  } else if (space.id >= 11 && space.id <= 19) {
    top = `${(20 - space.id) * step}%`;
    left = '0%';
    spaceClass += 'left';
  }

  if (space.id === 20) spaceClass += ' corner top-left';
  else if (space.id === 30) spaceClass += ' corner top-right';
  else if (space.id === 0) spaceClass += ' corner bottom-right';
  else if (space.id === 10) spaceClass += ' corner bottom-left';
  
  if (isMortgaged) spaceClass += ' mortgaged';
  
  const renderBuildings = () => {
    if (buildingCount === 0) return null;
    if (buildingCount === 5) {
      return (
        <div className="buildings-container">
          <div className="building hotel" title="Hotel">🏨</div>
        </div>
      );
    }
    return (
      <div className="buildings-container">
        {Array.from({ length: buildingCount }).map((_, i) => (
          <div key={i} className="building house" title={`Casa ${i + 1}`}>🏠</div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={spaceClass} 
      style={{ top, left, right, bottom }}
    >
      {visualEffects.map(e => (
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
      {space.type === 'property' && renderBuildings()}
      
      <div className="space-content">
        <span className="space-name">{space.name}</span>
        {space.price && <span className="space-price">${space.price}</span>}
      </div>
      
      {playersHere.length > 0 && (
        <div className="players-container">
          {playersHere.map(p => (
            <motion.div 
              key={p.id} 
              id={`token-${p.id}`}
              layoutId={`token-${p.id}`}
              className="player-token" 
              style={{ backgroundColor: p.color, zIndex: 100 }}
              title={p.name}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {p.avatar || ''}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  if (prevProps.buildingCount !== nextProps.buildingCount) return false;
  if (prevProps.isMortgaged !== nextProps.isMortgaged) return false;
  
  if ((prevProps.owner?.id) !== (nextProps.owner?.id)) return false;
  if (prevProps.visualEffects.length !== nextProps.visualEffects.length) return false;
  
  if (prevProps.playersHere.length !== nextProps.playersHere.length) return false;
  for (let i = 0; i < prevProps.playersHere.length; i++) {
    if (prevProps.playersHere[i].id !== nextProps.playersHere[i].id) return false;
    if (prevProps.playersHere[i].position !== nextProps.playersHere[i].position) return false;
  }
  
  return true;
});

const Board = ({ players, ownership, buildings = {}, mortgaged = {}, visualEffects = [] }) => {
  return (
    <div className="board">
      <div className="board-center">
        <h1 className="board-logo">BANCO<br/>IMOBILIÁRIO</h1>
      </div>
      {BOARD_SPACES.map(space => {
        const ownerId = ownership[space.id];
        const owner = ownerId ? players.find(p => p.id === ownerId) : null;
        const playersHere = players.filter(p => p.position === space.id);
        const buildingCount = buildings[space.id] || 0;
        const isMortgaged = mortgaged[space.id] || false;
        const spaceEffects = visualEffects.filter(e => e.spaceId === space.id);

        return (
          <BoardSpace
            key={space.id}
            space={space}
            owner={owner}
            playersHere={playersHere}
            buildingCount={buildingCount}
            isMortgaged={isMortgaged}
            visualEffects={spaceEffects}
          />
        );
      })}
    </div>
  );
};

export default Board;
