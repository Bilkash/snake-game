import React, {useEffect, useRef, useState} from 'react';
import AppleImg from "./assets/apple.png";
import './App.css';
import {useInterval} from "./hooks/useInterval";
import {DifficultType} from "./types";

const initSnake = [[4, 10], [4,10]]
const initApple = [14, 10]
const scale = 50
const timeDelay = {
  easy: 300,
  medium: 200,
  hard: 100
}

function App() {
  const playAreaRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initSnake);
  const [apple, setApple] = useState(initApple);
  const [ direction, setDirection ] = useState([ 0, -1 ])
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [canvasY, setCanvasY] = useState<number | null>(null);
  const [canvasX, setCanvasX] = useState<number | null>(null);
  const [difficult, setDifficult] = useState<keyof DifficultType>("easy");

  useInterval(() => runGame(), delay);

  const start = () => {
    setSnake(initSnake)
    setApple(initApple)
    setDirection([ 1, 0 ])
    setDelay(timeDelay[difficult])
    setScore(0)
    setGameOver(false)
  }

  const runGame = () => {
    const newSnake = [...snake];
    const newSnakeHead = [newSnake[0][0] + direction[0], newSnake[0][1] + direction[1]];
    newSnake.unshift(newSnakeHead);

    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      handleSetScore();
    }
    if (!appleAte(newSnake)) {
      newSnake.pop()
    }
    setSnake(newSnake);
  }

  const checkCollision = (head: number[]) => {
    const [headX, headY] = head;
    if (canvasY && canvasX) {
      if (headX < 0 || headX >= canvasX / scale || headY < 0 || headY >= canvasY / scale) {
        return true;
      }

      if (headX === -1 && direction[0] === -1) {
        setSnake((prevSnake) => [[canvasX / scale - 1, headY], ...prevSnake.slice(0, -1)]);
      } else if (headX === canvasX / scale && direction[0] === 1) {
        setSnake((prevSnake) => [[0, headY], ...prevSnake.slice(0, -1)]);
      } else if (headY === -1 && direction[1] === -1) {
        setSnake((prevSnake) => [[headX, canvasY / scale - 1], ...prevSnake.slice(0, -1)]);
      } else if (headY === canvasY / scale && direction[1] === 1) {
        setSnake((prevSnake) => [[headX, 0], ...prevSnake.slice(0, -1)]);
      }

      for (const [x, y] of snake.slice(1)) {
        if (headX === x && headY === y) {
          return true;
        }
      }

      return false;
    }
  };

  const appleAte = (newSnake: number[][]) => {
    if (canvasX && canvasY) {
      let maxX = (canvasX / scale) - 1;
      let maxY = (canvasY / scale) - 1;

      let appleCoordinate: number[] = [Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)];

      const isOnSnake = newSnake.some(([x, y]) => x === appleCoordinate[0] && y === appleCoordinate[1]);

      if (isOnSnake) {
        appleCoordinate = [Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY)];
      }

      if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
        let newAppleCoordinate = appleCoordinate;
        setScore(score + 1);
        setApple(newAppleCoordinate);
        return true;
      }

      return false;
    }
  };

  function changeDirection (e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowLeft":
        if (direction[0] !== 1)
          setDirection([-1, 0]);
        break;
      case "ArrowRight":
        if (direction[0] !== -1)
          setDirection([1, 0]);
        break;
      case "ArrowUp":
        if (direction[1] !== 1)
          setDirection([0, -1]);
        break;
      case "ArrowDown":
        if (direction[1] !== -1)
          setDirection([0, 1]);
        break;
    }
  }

  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score))
    }
  }

  const renderPlayArea = () => {
    if (delay) {
      return (
        <div className={"playAreaWrapper"}>
          <canvas
            className="playArea"
            ref={playAreaRef}
            width={`${canvasX}px`}
            height={`${canvasY}px`}
          />
          <div className={"score"}>
            Score: {score}
          </div>
        </div>
      )
    } else {
      return (
        <div className={"startMenu"}>
          <div className="startButton" onClick={() => start()}>Start Game</div>
          <div className={"difficultTitle"}>Choose difficult:</div>
          <div
            className={"difficultItem"}
            onClick={() => setDifficult("easy")}
          >
            {difficult === "easy" ? <img src={AppleImg} alt={"apple"} width={20}/> : null}
            Easy
          </div>
          <div
            className={"difficultItem"}
            onClick={() => setDifficult("medium")}
          >
            {difficult === "medium" ? <img src={AppleImg} alt={"apple"} width={20}/> : null}
            Medium
          </div>
          <div
            className={"difficultItem"}
            onClick={() => setDifficult("hard")}
          >
            {difficult === "hard" ? <img src={AppleImg} alt={"apple"} width={20}/> : null}
            Hard
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    if (playAreaRef.current) {
      setCanvasY(playAreaRef.current?.clientHeight ?? null)
      setCanvasX(playAreaRef.current?.clientWidth - 100 ?? null)
    }
  }, [delay])

  useEffect(() => {
    let treat = document.getElementById("treat") as HTMLCanvasElement;

    if (playAreaRef.current) {
      const canvas = playAreaRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "#008000";
        snake.forEach(([x, y], index) => {
          if (index === 0) {
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(x, y, 1, 1);
            ctx.fillStyle = "#008000";
          } else if (index === snake.length - 1) {
            ctx.fillStyle = "#004400";
            ctx.fillRect(x, y, 1, 1);
            ctx.fillStyle = "#008000";
          } else {
            ctx.fillRect(x, y, 1, 1);
          }
        });
        ctx.drawImage(treat, apple[0], apple[1], 1, 1);
      }
    }
  }, [snake, apple, gameOver])

  return (
    <div
      className="background"
      onKeyDown={(e) => changeDirection(e)}
      tabIndex={0}
    >
      <div className={"hidden"}>
        <img src={AppleImg} alt={"apple"} width={50} id={"treat"}/>
      </div>
      {renderPlayArea()}
      {gameOver &&
          <div className="scoreBox">
              <div>
                  <h1>GameOver</h1>
              </div>
              <div>
                  <h2>Score: {score}</h2>
              </div>
              <div>
                  <h2>High Score: {Number(localStorage.getItem("snakeScore"))}</h2>
              </div>
              <div className="tryAgainButton" onClick={() => setGameOver(false)}>
                  Try Again
              </div>
          </div>
      }

    </div>
  );
}

export default App;
