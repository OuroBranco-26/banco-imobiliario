import React, { useEffect, useState } from 'react';
import { BOARD_SPACES, BOARD_COLORS } from '../data/boardData';
import './AuctionModal.css';

export default function AuctionModal({ auction, players, myId, isLocalMode, onBid, onWithdraw }) {
  const [localTime, setLocalTime] = useState(auction.timeLeft);

  useEffect(() => {
    setLocalTime(auction.timeLeft);
    const interval = setInterval(() => {
      setLocalTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [auction.timeLeft]);

  const space = BOARD_SPACES.find(s => s.id === auction.spaceId);
  const highestBidder = players.find(p => p.id === auction.highestBidderId);
  const myPlayer = players.find(p => p.id === myId);
  
  const amIActive = auction.participants.includes(myId);
  const isWinning = auction.highestBidderId === myId;
  const canAfford = (amount) => myPlayer && myPlayer.money >= (auction.highestBid + amount);

  const handleBid = (amount) => {
    if (canAfford(amount) && amIActive) {
      onBid(auction.highestBid + amount);
    }
  };

  const activePlayers = players.filter(p => auction.participants.includes(p.id));

  return (
    <div className="auction-overlay">
      <div className="auction-card">
        <div className="auction-header">
          <h2>🔨 Leilão</h2>
          <div className={`auction-timer ${localTime <= 3 ? 'hurry' : ''}`}>
            ⏱️ {localTime}s
          </div>
        </div>

        <div className="auction-content">
          <div className="auction-property" style={{ borderColor: BOARD_COLORS[space.color] || '#ccc' }}>
            {space.color && (
              <div className="property-color" style={{ backgroundColor: BOARD_COLORS[space.color] }}></div>
            )}
            <h3>{space.name}</h3>
            <span className="property-price">Valor: ${space.price}</span>
          </div>

          <div className="auction-status">
            <span className="bid-label">Maior Lance Atual:</span>
            <span className="bid-amount">${auction.highestBid}</span>
            <div className="bid-leader">
              {highestBidder ? (
                <span className="leader-name" style={{ color: highestBidder.color }}>
                  {highestBidder.avatar} {highestBidder.name}
                </span>
              ) : (
                <span className="no-bids">Nenhum lance ainda...</span>
              )}
            </div>
          </div>
        </div>

        <div className="auction-actions">
          {isLocalMode ? (
            <div className="local-bidders-list">
              {activePlayers.map(p => {
                const canAffordLocal = p.money >= auction.highestBid + 10;
                const isWinningLocal = auction.highestBidderId === p.id;
                return (
                  <div key={p.id} className="local-bidder-row">
                    <span className="bidder-info" style={{ color: p.color }}>
                      {p.avatar} {p.name} <small>(${p.money})</small>
                    </span>
                    <div className="bidder-controls">
                      <button 
                        className="btn-bid small" 
                        disabled={isWinningLocal || !canAffordLocal}
                        onClick={() => onBid(auction.highestBid + 10, p.id)}
                      >
                        +$10
                      </button>
                      <button 
                        className="btn-bid small" 
                        disabled={isWinningLocal || p.money < auction.highestBid + 50}
                        onClick={() => onBid(auction.highestBid + 50, p.id)}
                      >
                        +$50
                      </button>
                      <button className="btn-withdraw small" onClick={() => onWithdraw(p.id)}>
                        Sair
                      </button>
                    </div>
                  </div>
                )
              })}
              {activePlayers.length === 0 && <p className="withdrawn-msg">Todos saíram.</p>}
            </div>
          ) : (
            amIActive ? (
              <>
                <div className="bid-buttons">
                  <button className="btn-bid" disabled={isWinning || !canAfford(10)} onClick={() => handleBid(10)}>+$10</button>
                  <button className="btn-bid" disabled={isWinning || !canAfford(50)} onClick={() => handleBid(50)}>+$50</button>
                  <button className="btn-bid" disabled={isWinning || !canAfford(100)} onClick={() => handleBid(100)}>+$100</button>
                </div>
                <button className="btn-withdraw" onClick={onWithdraw}>Sair do Leilão</button>
                {isWinning && <p className="winning-msg">Você está vencendo!</p>}
                {!canAfford(10) && !isWinning && <p className="broke-msg">Sem saldo.</p>}
              </>
            ) : (
              <p className="withdrawn-msg">Você saiu deste leilão.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
