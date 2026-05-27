## ST0503 Backend Development – CA2

### Wellness Challenge & Detective Gamification App

This project is a **Node.js + Express + MySQL** backend with a bundled **HTML/JS frontend** for **ST0503 Backend Development (CA2)**.  
It combines a wellness challenge system with a **detective-style mystery game** where players complete wellness tasks, earn points, unlock clues, and accuse a culprit to unlock different endings and compete on a leaderboard.

---

## Project Structure

```text
src/
├── app.js             // Express app wiring, routes, middleware, static files
├── index.js           // Server entry (listens on port 3000)
├── services/
│   └── db.js          // MySQL connection pool
├── configs/
│   ├── createSchema.js // Create database if missing
│   └── initTables.js   // Create tables + seed sample data
├── middlewares/       // JWT + bcrypt helpers
│   ├── jwtMiddleware.js
│   └── bcryptMiddleware.js
├── routes/            // Route groups mounted under /api
├── controllers/       // Request handlers / middleware chains
└── models/            // SQL helpers for each feature

public/
├── index.html         // Landing, login, register
├── home.html          // Post-login dashboard
├── wellness.html      // Wellness challenges
├── leaderboard.html   // Rankings
├── investigation.html // Narrative intro
├── clues.html         // Evidence board
├── casefile.html      // Case file hub
├── case-1.html        // Detailed case file
├── accusation.html    // Final accusation
├── ending.html        // Show ending
├── profile.html       // Basic profile view
├── js/                // Frontend logic (uses fetchMethod + JWT)
└── css/               // Styling
```

**Detailed file list**

- **Controllers (`src/controllers/`)**
  - `usersController.js`
  - `userLoginController.js`
  - `challengesController.js`
  - `userCompletionController.js`
  - `storyboxController.js`
  - `inventoryController.js`
  - `itemsController.js`
  - `accusationController.js`
  - `endingController.js`
  - `progressController.js`
  - `suspectsController.js`
  - `leaderboardController.js`

- **Models (`src/models/`)**
  - `usersModel.js`
  - `userLoginModel.js`
  - `challengesModel.js`
  - `userCompletionModel.js`
  - `storyboxModel.js`
  - `inventoryModel.js`
  - `itemsModel.js`
  - `accusationModel.js`
  - `endingModel.js`
  - `progressModel.js`
  - `suspectsModel.js`
  - `leaderboardModel.js`

- **Routes (`src/routes/`)**
  - `mainRoutes.js`
  - `usersRoutes.js`
  - `challengesRoutes.js`
  - `userCompletionRoutes.js`
  - `storyboxRoutes.js`
  - `inventoryRoutes.js`
  - `itemsRoutes.js`
  - `accusationRoutes.js`
  - `endingRoutes.js`
  - `progressRoutes.js`
  - `suspectsRoutes.js`
  - `leaderboardRoutes.js`

- **Middlewares (`src/middlewares/`)**
  - `jwtMiddleware.js`
  - `bcryptMiddleware.js`

- **Configs (`src/configs/`)**
  - `createSchema.js`
  - `initTables.js`

- **Services (`src/services/`)**
  - `db.js`

- **Frontend HTML (`public/`)**
  - `index.html`
  - `home.html`
  - `wellness.html`
  - `leaderboard.html`
  - `investigation.html`
  - `clues.html`
  - `casefile.html`
  - `case-1.html`
  - `accusation.html`
  - `ending.html`
  - `profile.html`

- **Frontend JS (`public/js/`)**
  - `auth.js`
  - `home.js`
  - `home-page.js`
  - `wellness.js`
  - `leaderboard.js`
  - `investigation.js`
  - `clues.js`
  - `casefile-hub.js`
  - `casefile.js`
  - `accusation.js`
  - `ending.js`
  - `profile.js`
  - `getCurrentURL.js`
  - `queryCmds.js`

- **Frontend CSS (`public/css/`)**
  - `index.css`
  - `home.css`
  - `wellness.css`
  - `leaderboard.css`
  - `profile.css`
  - `casefile.css`
  - `game.css`

---

## Tech Stack

- Node.js, Express.js, MySQL (`mysql2`)
- `dotenv`, `nodemon`
- **JWT** (`jsonwebtoken`) for authentication
- **bcrypt** for password hashing

---

## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/ST0503-BED/bed-ca2-chonghaoooi.git
cd bed-ca2-chonghaoooi
```

2. **Install dependencies**

```bash
npm install nodemon express mysql2 dotenv bcrypt jsonwebtoken
```

3. **Create a `.env` file**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=wellness_db
DB_SSL_REJECT_AUTHORISE=false

JWT_SECRET_KEY=replace-with-a-long-random-string
JWT_EXPIRES_IN=15m
JWT_ALGORITHM=HS256
```

4. **Create the database and tables**

```bash
npm run init_tables
```

5. **Start the server**

```bash
# Dev mode with auto-restart
npm run dev

# Or plain Node
npm start
```

Server runs at `http://localhost:3000`. Static frontend is served from `/`, JSON API from `/api`.

---

## Frontend Overview

The frontend is served from the `public/` folder and includes:

- **`index.html`** – Landing page with overview, login, and register. On success, a JWT is stored and the user is redirected to `home.html`.
- **`home.html`** – Post-login dashboard that shows username, points, brief story context, and navigation to other pages.
- **`wellness.html`** – Manage wellness challenges (list, create, edit, delete, complete). All mutating actions require `Authorization: Bearer <token>`.
- **`leaderboard.html`** – Shows correct-culprit and wrong-culprit leaderboards.
- **`investigation.html`, `clues.html`, `casefile.html`, `case-1.html`** – Narrative, evidence board, and detailed case file views.
- **`accusation.html`** – Lets the user make a final accusation based on collected clues.
- **`ending.html`** – Displays the player’s current ending.
- **`profile.html`** – Simple profile view for username and points.

Authentication-aware pages check for a JWT in `localStorage`; if missing, they redirect back to `index.html`.

---

## Core Features

- **Wellness challenges**
  - Register/login with secure password hashing.
  - Create, update, delete, and list challenges (JWT required for mutations).
  - Record challenge completions and reward points.

- **Detective game**
  - Spend points to open storyboxes that grant random, non-duplicate clues.
  - Maintain an inventory of collected clues.
  - Track progress (points, clues, accused/ending flags).
  - Allow a final accusation which grants an ending.
  - Show leaderboards for correct vs wrong culprits.
  - Allow full detective progress reset per user.

---

## Mapping to CA2 Requirements

- **Registration & Login pages**
  - `index.html` provides user-friendly login and registration forms.
  - `auth.js` wires both forms to `POST /api/login` and `POST /api/register` and stores a JWT on success.

- **Authentication flow (JWT + bcrypt)**
  - Passwords are hashed with **bcrypt** in `bcryptMiddleware.js` during registration and verified during login.
  - **JWT** tokens are generated on successful login/registration and stored in `localStorage`.
  - Protected pages (`home.html`, `wellness.html`, `leaderboard.html`, `investigation.html`, `clues.html`, `casefile.html`, `case-1.html`, `accusation.html`, `ending.html`, `profile.html`) check for a valid token and redirect to `index.html` if missing/invalid.

- **Wellness challenge management**
  - Backend: `challengesController.js` + `userCompletionController.js` manage CRUD for wellness challenges and completions.
  - Frontend: `wellness.html` + `wellness.js` let users create, edit, delete, and complete challenges, with friendly validation and inline error states.
  - Completing challenges awards points that are reflected in the user profile and used in the detective game.

- **Gamification features (quests, badges, endings, leaderboard)**
  - Storyboxes and clues: `storyboxController.js`, `itemsController.js`, `inventoryController.js` and corresponding frontend (`casefile.html`, `clues.html`, `casefile.js`, `clues.js`) let users spend points to unlock random, non-duplicate clues.
  - Progress: `progressController.js` exposes high-level story progress (points, clues collected, can-accuse flag, ending state) to the frontend.
  - Accusation and endings: `accusationController.js`, `endingController.js`, `accusation.html`, `ending.html`, `accusation.js`, `ending.js` let users make a final accusation and view the resulting ending.
  - Leaderboard: `leaderboardController.js`, `leaderboard.html`, and `leaderboard.js` show fastest correct and wrong-culprit completions.

- **Frontend–backend integration**
  - All pages use `fetchMethod` (from `queryCmds.js`) plus `currentUrl` (`getCurrentURL.js`) to call the backend.
  - Mutating actions (e.g. creating challenges, completing them, opening storyboxes, resetting inventory, making accusations) send `Authorization: Bearer <token>` headers and handle error states gracefully.

## Game Overview – The Detective Case

The detective game is a **single-player mystery experience** layered on top of the wellness challenge system.  
Users complete wellness challenges to earn points, then spend points to open **storyboxes** and collect clues.  
Once enough clues are gathered, the player makes a **final accusation**. Each suspect leads to a different ending; only one is the true culprit. Correctly solving the case and doing it quickly qualifies the player for the **leaderboard**.

---

## API Overview

Protected routes require `Authorization: Bearer <JWT>`. The backend uses the token’s `userId` (stored in `res.locals.userId`) for user-specific actions instead of trusting client-supplied `user_id`.

- **Auth**
  - `POST /api/register`
  - `POST /api/login`

- **Users**
  - `GET /api/users/:user_id` (JWT, own profile only)
  - `PUT /api/users/:user_id` (JWT, own profile only)

- **Challenges**
  - `GET /api/challenges`
  - `POST /api/challenges` (JWT)
  - `PUT /api/challenges/:challenge_id` (JWT, owner only)
  - `DELETE /api/challenges/:challenge_id` (JWT, owner only)
  - `POST /api/challenges/:challenge_id` (JWT, mark a challenge as completed)
  - `GET /api/challenges/:challenge_id` (list all user attempts)

- **Storybox & Items**
  - `POST /api/storybox/open` (JWT)
  - `GET /api/items`

- **Inventory**
  - `GET /api/inventory/:user_id` (JWT)
  - `DELETE /api/inventory/:user_id` (JWT – delete endings, accusation, and inventory)

- **Progress**
  - `GET /api/progress/:user_id` (JWT)

- **Suspects**
  - `GET /api/suspects`

- **Accusation & Ending**
  - `POST /api/accusation` (JWT; body: `{ "suspect_id": number }`)
  - `GET /api/ending/:user_id` (JWT)

- **Leaderboard**
  - `GET /api/leaderboard`
  - `GET /api/leaderboard/unsolved`

---

## Design Notes

- **Architecture**: `routes` → `controllers` → `models` (clear separation of concerns).
- **JWT**: Protected routes use `jwtMiddleware.verifyToken`; controllers and models use `res.locals.userId`.
- **Passwords**: Hashed with **bcrypt** when registering; compared securely when logging in.
- **SQL safety**: `mysql2` parameterized queries (`?` placeholders) are used to avoid injection.
- **Error handling**: Global error handler in `app.js` logs errors and returns a JSON 500 response.

---

## Testing

- **API testing**: Use Postman to exercise `/api` endpoints with and without JWTs.
- **Frontend testing**: Run through login, challenge flows, opening storyboxes, making an accusation, viewing endings, and checking leaderboards in the browser.

---

---

## Author

- **Name**: Ooi Chong Hao
- **Class**: DIT/FT/1B/04
- **Module**: ST0503 Backend Development
