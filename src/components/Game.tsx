import React, { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import "./Game.css";
import SideInfo from "./SideInfo";
import { useGamba } from "gamba/react";
import { lamportsToSol, solToLamports } from "gamba";
import { toast } from "react-toastify";
import * as Tone from "tone";

const sounds = {
  oy: ["/sounds/oy1.mp3", "/sounds/oy2.mp3", "/sounds/oy3.mp3"],
  scream: ["/sounds/scream1.mp3", "/sounds/scream2.mp3", "/sounds/scream3.mp3"],
  hehe: ["/sounds/hehe1.mp3", "/sounds/hehe2.mp3", "/sounds/hehe3.mp3"],
  falling: ["/sounds/falling.mp3"],
  win: ["/sounds/win1.mp3", "/sounds/win2.mp3", "/sounds/win3.mp3"],
};

let soundPlayers = {};

// Create a Tone.Player for each sound file
for (let category in sounds) {
  soundPlayers[category] = sounds[category].map((soundPath) =>
    new Tone.Player(soundPath).toDestination()
  );
}

const playRandomSound = (category) => {
  if (!soundPlayers[category])
    throw new Error(`Category ${category} not found`);

  // Choose a random sound player from the category
  const playerIndex = Math.floor(Math.random() * soundPlayers[category].length);
  const player = soundPlayers[category][playerIndex];

  // Play the sound
  if (player.state !== "started") {
    player.start();
  } else {
    player.restart();
  }
};

const GameState = {
  AWAITING: "AWAITING",
  SMASHING: "SMASHING",
  WON: "WON",
  LOST: "LOST",
};

const Game = () => {
  const [avocadoAmount, setAvocadoAmount] = useState(2);
  const [selectedAvocado, setSelectedAvocado] = useState(-1);
  const [isSmashing, setIsSmashing] = useState(false);
  const [betAmount, setBetAmount] = useState(0.1);
  const [gameResult, setGameResult] = useState(null);
  const [gameState, setGameState] = useState(GameState.AWAITING);
  const [runOnRest, setRunOnRest] = useState(false);

  const gamba = useGamba();

  const smashStyle = useSpring({
    from: { transform: "translate3d(0,-1000px,0)" },
    to: {
      transform: isSmashing ? "translate3d(0,0,0)" : "translate3d(0,-1000px,0)",
    },
    config: { duration: 2000 },
    onRest: () => {
      if (runOnRest) {
        setIsSmashing(false);
        if (gameResult) {
          const win = gameResult.payout > 0;
          setGameState(win ? GameState.WON : GameState.LOST);
          toast(getToast(gameResult), {
            isLoading: false,
            draggable: true,
            autoClose: 5000,
            icon: win ? "🎉" : "💀",
          });
          if (win) {
            playRandomSound("win");
          } else {
            setTimeout(() => playRandomSound("hehe"), 1000);
          }
        }
        setRunOnRest(false);
      }
    },
  });

  const shadowStyle = useSpring({
    from: { transform: "scale(0)" },
    to: { transform: isSmashing ? "scale(1)" : "scale(0)" },
    config: { duration: 2000 },
  });

  const getBetAmounts = (avocadoAmount) => {
    if (avocadoAmount >= 4) {
      return [0.1, 0.25, 0.5, 1];
    }
    if (avocadoAmount === 3) {
      return [0.1, 0.25, 0.5, 1, 2];
    }
    if (avocadoAmount === 2) {
      return [0.1, 0.25, 0.5, 1, 2, 3];
    }
    return [];
  };

  const setAvocadoAmountAndCheckBet = (newAvocadoAmount) => {
    const maxBetForNewAmount = Math.max(...getBetAmounts(newAvocadoAmount));

    if (betAmount > maxBetForNewAmount) {
      setBetAmount(maxBetForNewAmount);
    }

    setAvocadoAmount(newAvocadoAmount);
  };

  const handleAvocadoClick = (index) => {
    playRandomSound("oy");
    setSelectedAvocado(selectedAvocado === index ? -1 : index);
  };

  const getToast = (result) => {
    if (result.payout > 0) {
      return (
        <span>
          You won{" "}
          <b>{parseFloat(lamportsToSol(result.payout).toFixed(4))} SOL</b>
        </span>
      );
    }
    return <span>You lost</span>;
  };

  const handleReset = () => {
    setSelectedAvocado(-1);
    setIsSmashing(false);
    setGameResult(null);
    setGameState(GameState.AWAITING);
  };

  useEffect(() => {
    if (gameResult) {
      setIsSmashing(true);
      setGameState(GameState.SMASHING);
      setRunOnRest(true);
    }
  }, [gameResult]);

  useEffect(() => {
    if (isSmashing) {
      playRandomSound("falling");
      // Delay the falling sound effect by a half second
      setTimeout(() => playRandomSound("scream"), 500);
    }
  }, [isSmashing]);

  const handleSmashClick = async () => {
    if (selectedAvocado >= 0) {
      const wager = solToLamports(betAmount);
      // Create the array with the required structure
      let array = new Array(avocadoAmount).fill(0);
      array[0] = avocadoAmount;

      try {
        const req = await gamba.play(array, wager);
        const result = await req.result();

        // Set the game result
        setGameResult(result);
      } catch (err: any) {
        // Show an error message
        toast(err.message, { type: "error" });
        console.error(err);
      } finally {
      }
    }
  };

  return (
    <div className="game">
      <SideInfo betAmount={betAmount} avocadoAmount={avocadoAmount} />
      <div>Select an avocado to SMASH:</div>
      <div className={`avocados-container avocados-${avocadoAmount}`}>
        {Array(avocadoAmount)
          .fill(0)
          .map((_, index) => (
            <div
              className="avocado-container"
              onClick={() => handleAvocadoClick(index)}
            >
              <img
                src={
                  selectedAvocado === index
                    ? gameState === GameState.SMASHING
                      ? "/guac-screaming.png"
                      : gameState === GameState.WON
                      ? "/guac-dead.png"
                      : gameState === GameState.LOST
                      ? "/guac-angry.png"
                      : "/guac-nervous.png"
                    : "/guac-happy.png"
                }
                alt="avocado"
                className={`avocado ${selectedAvocado === index ? 'clicked' : ''}`}
              />

              {selectedAvocado === index && gameState === GameState.WON && (
                <div className="payout-text">
                  {parseFloat(lamportsToSol(gameResult.payout).toFixed(4))} SOL
                </div>
              )}

              {selectedAvocado === index && (
                <>
                  <animated.div className="cube" style={smashStyle} />
                  <animated.div className="shadow" style={shadowStyle} />
                </>
              )}
            </div>
          ))}
      </div>
      <div className="actionBar">
        {gameState === GameState.WON || gameState === GameState.LOST ? (
          <button className="button" onClick={handleReset}>
            Play Again
          </button>
        ) : (
          <>
            <div className="dropdown">
              <button className="dropbtn">{betAmount} SOL</button>
              <div className="dropdown-content">
                {getBetAmounts(avocadoAmount)
                  .reverse()
                  .map((amount) => (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setBetAmount(amount);
                      }}
                    >
                      {amount}
                    </a>
                  ))}
              </div>
            </div>

            <div className="dropdown">
              <button className="dropbtn">{avocadoAmount} Avocados</button>
              <div className="dropdown-content">
                {[2, 3, 4, 5, 6].reverse().map((amount) => (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAvocadoAmountAndCheckBet(amount);
                    }}
                  >
                    {amount}
                  </a>
                ))}
              </div>
            </div>

            <button className="button" onClick={handleSmashClick}>
              Smash
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
