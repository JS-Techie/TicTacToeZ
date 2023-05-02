import "./App.css";

import classNames from "classnames";

// State types and helpers
import type { GameState, Player } from "./types";
import { useLocalStorage } from "./useLocalStorage";
import { deriveStats, deriveGame } from "./utils";

// Component imports
import Modal from "./components/Modal";
import Menu from "./components/Menu";

const initialState: GameState = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default function App() {
  const [state, setState] = useLocalStorage("game-state-key", initialState);

  // Derived state (updates on every state change)
  const game = deriveGame(state);
  const stats = deriveStats(state);

  const resetGame = (isNewRound: boolean) => {
    setState((prevState) => {
      const stateCopy = structuredClone(prevState);
      // If game is complete, archive it to history object
      if (game.status.isComplete) {
        const { moves, status } = game;
        stateCopy.history.currentRoundGames.push({
          moves,
          status,
        });
      }

      stateCopy.currentGameMoves = [];

      // Must archive current round in addition to resetting current game
      if (isNewRound) {
        stateCopy.history.allGames.push(...stateCopy.history.currentRoundGames);
        stateCopy.history.currentRoundGames = [];
      }

      return stateCopy;
    });
  };

  const handlePlayerMove = (squareId: number, player: Player) => {
    setState((prev) => {
      const { currentGameMoves } = structuredClone(prev);

      currentGameMoves.push({
        player,
        squareId,
      });

      return {
        ...prev,
        currentGameMoves,
      };
    });
  };

  return (
    <div className="mainbody">
      <div className="body">
        <div className="grid">
          <div className="turn" style={{ color: `${game.currentPlayer.colorClass}` }}>
              <i 
                className={`${game.currentPlayer.iconClass}`+"-small"}
              ></i>
            <p style={{marginLeft:"7%", position:"absolute"}}>{game.currentPlayer.name} ... you're up!</p>
          </div>

          <Menu
            onAction={(action) => {
              resetGame(action === "new-round");
            }}
          />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((squareId) => {
            const existingMove = game.moves.find(
              (move) => move.squareId === squareId
            );

            return (
              <div
                key={squareId}
                id={squareId.toString()}
                className="square shadow"
                onClick={() => {
                  // Don't make a move on square if there already is one
                  if (existingMove) return;

                  handlePlayerMove(squareId, game.currentPlayer);
                }}
              >
                {existingMove && (
                  <i
                    className={
                      existingMove.player.iconClass
                    }
                  ></i>
                )}
              </div>
            );
          })}

          <div
            className="score shadow"
            style={{ backgroundColor: "var(--turquoise)" }}
          >
            <p>Player 1</p>
            <span>{stats.playersWithStats[0].wins} Wins</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--light-gray)" }}
          >
            <p>Ties</p>
            <span>{stats.ties}</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--yellow)" }}
          >
            <p>Player 2</p>
            <span>{stats.playersWithStats[1].wins} Wins</span>
          </div>
        </div>
      </div>


      {game.status.isComplete && (
        <Modal
          text={
            game.status.winner ? `${game.status.winner.name} wins!` : "Tie!"
          }
          onClick={() => resetGame(false)}
        />
      )}
    </div>
  );
}
