# linkdle

Initial Project Understanding and design decisions:

Basic wordle game, 5 letter word 6 guesses. Green correct spot, yellow in word wrong spot, gray not in word.

Frontend: React for everything user sees

Backend: Node + express js, either mongoDB or PostgreSQL (Leaning postgreSQL because don't need much flexibility). Backend has to store the answer to the unique game so player can't see

Hosting: Render or AWS, leaning towards render for familiarity

API for probably word list?