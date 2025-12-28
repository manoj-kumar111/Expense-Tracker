# Expense Tracker

## Overview
This is a full-stack Expense Tracker application built with React for the frontend and Node.js/Express with MongoDB for the backend. Users can sign up, log in, create, view, update, and manage their expenses securely.

## Live Demo (Production)
[check out the live demo here](https://expense-tracker-teal-delta.vercel.app/)

> The application is fully deployed. The frontend is hosted on Vercel and communicates with a production-ready backend hosted on Render.

## Tech Stack
### Frontend
- React 18 with Vite
- React Query for data fetching
- Tailwind CSS for styling
- Radix UI for components
- Fetch API for requests
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

## Setup Instructions (Local Development)

### Backend
1. Navigate to the Backend directory:
cd BackEnd

markdown
Copy code
2. Install dependencies:
npm install

markdown
Copy code
3. Create a `.env` file in the BackEnd directory:
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

markdown
Copy code
**Note:** Do not commit `.env` to Git; it is ignored via `.gitignore`.

4. Start the backend server:
npm start

markdown
Copy code
The server will run on `http://localhost:3000` with APIs under `/api/v1`.

### Frontend
1. Navigate to the Frontend directory:
cd FrontEnd

markdown
Copy code
2. Install dependencies:
npm install

markdown
Copy code
3. Start the development server:
npm run dev

pgsql
Copy code
The app will run on `http://localhost:5173`.

## Features
- User authentication (Sign Up / Login)
- Create, read, update, and delete expenses
- View expenses in a table
- Secure API with JWT authentication
- Responsive UI with dark mode support

## API Endpoints
- `POST /api/v1/user/register` – Register user
- `POST /api/v1/user/login` – Login user
- `GET /api/v1/user/logout` – Logout user
- `PUT /api/v1/user/password` – Change password (authenticated)
- `GET /api/v1/expense/getall` – Get all expenses (authenticated)
- `POST /api/v1/expense/add` – Create expense
- `PUT /api/v1/expense/update/:id` – Update expense
- `DELETE /api/v1/expense/remove/:id` – Delete expense
- `PUT /api/v1/expense/:id/done` – Mark expense as done/undone

## Running in Production
- The frontend is deployed on **Vercel**
- The backend is deployed on **Render**
- The frontend communicates with the backend using environment variables
- All API calls are routed through the production backend URL

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
MIT License