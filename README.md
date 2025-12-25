# Expense Tracker

## Overview
This is a full-stack Expense Tracker application built with React for the frontend and Node.js/Express with MongoDB for the backend. Users can sign up, log in, create, view, update, and manage their expenses securely.

## Tech Stack
### Frontend
- React 19 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Radix UI for components
- Axios for API requests
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

## Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

## Setup Instructions

### Backend
1. Navigate to the Backend directory:
   ```
   cd BackEnd
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the BackEnd directory with the following:
   ```
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   ```
   **Note:** Do not commit `.env` to Git; it's ignored via `.gitignore`.
4. Connect to the database and start the server:
   ```
   npm start
   ```
   The server will run on `http://localhost:5000`.

### Frontend
1. Navigate to the Frontend directory:
   ```
   cd FrontEnd
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   The app will run on `http://localhost:5173`.

## Features
- User authentication (Sign Up / Login)
- Create, read, update, and delete expenses
- View expenses in a table
- Responsive UI with dark mode support

## API Endpoints
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/expenses` - Get all expenses (authenticated)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Running in Production
- Backend: Use `npm run build` if needed, deploy to Heroku/Vercel with MongoDB Atlas.
- Frontend: Build with `npm run build` and serve the dist folder.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License
MIT License
