import { renderToStaticMarkup } from 'react-dom/server';
import { NotFound } from './components/not-found';
import { App } from './components/app';
import { health } from 'well-known-health';
import { PropsWithChildren } from 'react';
import { Pixel } from './components/pixel';

const Shell: React.FC<PropsWithChildren> = ({ children }) => (
  <App title="Clicker" description="An idle clicking game">
    {children}
  </App>
);

// Global state
let score = 0;
let highScore = 0;
let gameOver = false;

const HighScore = () => (
  <div className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 mb-2">
    High Score: {highScore}
  </div>
);

const GameOver = () => (
  <>
    <div className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-red-500 mb-2">
      Game Over
    </div>
  </>
);

const randomItem = <T extends unknown>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const Game: React.FC = () => {
  if (gameOver) return <GameOver />;
  return (
    <>
      <input name="score" value={score} hidden readOnly />
      <div className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 mb-2">
        {score}
      </div>
      <div className="flex flex-cols cols-2 gap-2">
        <button
          type="button"
          className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
          hx-post="/up"
          hx-swap="innerHTML"
          hx-target="form"
        >
          🔺
        </button>
        <button
          type="button"
          className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
          hx-post={'/' + randomItem(['up', 'down', 'reset'])}
          hx-swap="innerHTML"
          hx-target="form"
        >
          👀
        </button>
        <button
          type="button"
          className="inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
          hx-post="/down"
          hx-swap="innerHTML"
          hx-target="form"
        >
          🔻
        </button>
      </div>
    </>
  );
};

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(request) {
    const response = health(request);
    if (response) return response;

    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response(
        '<!doctype html>' +
          renderToStaticMarkup(
            <Shell>
              <form className="flex flex-col items-center container w-fit mx-auto p-5">
                <HighScore />
                <Game />
              </form>
            </Shell>,
          ),
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      );
    }

    if (url.pathname === '/up') {
      // Increment the score by n where n is the columns for example 10 would be 1 and 100 would be 2
      score += Math.ceil(Math.log10(score + 1)) || 1;

      // Increment the high score
      if (score > highScore) {
        highScore = score;
      }

      return new Response(
        '<!doctype html>' +
          renderToStaticMarkup(
            <>
              <HighScore />
              <Game />
              <Pixel />
            </>,
          ),
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      );
    }

    if (url.pathname === '/down') {
      // Increment the score
      score--;
      if (score < 0) {
        gameOver = true;
      }
      return new Response(
        '<!doctype html>' +
          renderToStaticMarkup(
            <>
              <HighScore />
              <Game />
              <Pixel />
            </>,
          ),
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      );
    }

    if (url.pathname === '/reset') {
      // Increment the score
      score = 0;
      return new Response(
        '<!doctype html>' +
          renderToStaticMarkup(
            <>
              <HighScore />
              <Game />
              <Pixel />
            </>,
          ),
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      );
    }

    return new Response(
      '<!doctype html>' +
        renderToStaticMarkup(
          <Shell>
            <NotFound />
          </Shell>,
        ),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  },
});

console.info(`Server started at http://localhost:${server.port}`);
