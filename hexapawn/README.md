# Hexapawn — a machine that learns

A self-contained browser demonstration of reinforcement learning through the
3×3 game Hexapawn.

## Run it

Open `index.html` directly, or serve this folder with any small static web
server. No packages, build step, or internet connection are required.

For the complete Hebrew RTL version, open `index-he.html`.

## Learning model

The black player stores a weight for every legal action in every board state it
encounters. It chooses actions with weighted randomness. After a win, the
weights of actions used during the game rise; after a loss, they fall. Memory
and score are kept in the browser's local storage.
