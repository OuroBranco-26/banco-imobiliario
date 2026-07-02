import React, { useState, useEffect, useRef } from 'react';
import './GameLog.css';

/**
 * Returns a human-readable relative time string in Portuguese.
 * @param {number} timestamp - Unix-epoch milliseconds
 */
function timeAgo(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return 'agora';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  return `${Math.floor(diff / 3600)}h`;
}

/**
 * GameLog – a collapsible history panel that displays recent game events.
 *
 * Props:
 *  - logs: Array<{ id: string|number, icon: string, message: string, timestamp: number }>
 *
 * Behaviour:
 *  - Starts collapsed by default.
 *  - Shows up to the last 30 entries in a scrollable list.
 *  - Auto-scrolls to the newest entry whenever `logs` changes.
 *  - Each entry fades/slides in from the left.
 */
export default function GameLog({ logs = [] }) {
  const [expanded, setExpanded] = useState(false);
  const listEndRef = useRef(null);

  // Keep only the 30 most recent entries.
  const recentLogs = logs.slice(-30);

  // Auto-scroll to the bottom whenever new logs arrive and panel is open.
  useEffect(() => {
    if (expanded && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, expanded]);

  return (
    <div className={`game-log ${expanded ? 'game-log--expanded' : ''}`}>
      {/* ── Header ── */}
      <button
        className="game-log__header"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="game-log__title">📜 Histórico</span>
        <span className={`game-log__chevron ${expanded ? 'game-log__chevron--open' : ''}`}>
          ▾
        </span>
      </button>

      {/* ── Collapsible body ── */}
      <div className="game-log__body">
        {recentLogs.length === 0 ? (
          <p className="game-log__empty">Nenhum evento registrado.</p>
        ) : (
          <ul className="game-log__list">
            {recentLogs.map((entry) => (
              <li key={entry.id} className="game-log__entry">
                <span className="game-log__icon">{entry.icon}</span>
                <span className="game-log__message">{entry.message}</span>
                <span className="game-log__time">{timeAgo(entry.timestamp)}</span>
              </li>
            ))}
            {/* Invisible anchor used for auto-scroll */}
            <li ref={listEndRef} aria-hidden="true" />
          </ul>
        )}
      </div>
    </div>
  );
}
