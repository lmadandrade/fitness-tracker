# Fitness Tracker Web App

This is the backend for a Fitness Tracker web application designed to help users:

- Plan weekly workout routines
- Log completed workout performance
- Track progress with personal check-ins (mood, weight, photos)
- Manage a personal or shared exercise library

## Project Structure

- `server.js` – Main server entry point
- `models/` – Mongoose schemas (User, Exercise, Schedule, Workout Log, Check-In Log)
- `.gitignore` – Hides sensitive files like `.env`
- `package.json` – Project metadata and dependencies

## How to Run the Project

### 1. Clone the Repository

git clone https://github.com/lmadandrade/fitness-tracker.git
cd fitness-tracker


### 2. Install Dependencies

npm install


### 3. Add a `.env` File

Create a file named `.env` in the root folder with your MONGO URL: MONGO_URI=your-mongodb-connection-string-here

### 4. Start the Server

npm start