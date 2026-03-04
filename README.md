# SMAS (Smart Attendance Management System)

A full-stack application for managing attendance using facial recognition and automated SMS notifications.

## 🚀 Features
- **Facial Recognition**: Automatically marks attendance by recognizing students' faces using their webcam via `face-api.js`.
- **Manual Attendance**: Options to manually mark presence if facial recognition fails.
- **SMS Notifications**: Parents receive instantaneous text messages regarding their child's attendance via the Twilio API.
- **Dashboard & Analytics**: Real-time charts and data visualization of attendance records.
- **Interactive Map**: Visualize data/locations using Leaflet maps.

## 🛠️ Technology Stack
### Frontend
- **React.js 19** with **TypeScript** and **Vite**
- **Tailwind CSS** for styling, with `framer-motion` for animations
- **face-api.js** for browser-based facial recognition
- **chart.js** & **react-chartjs-2** for analytics

### Backend
- **Python 3** with **Flask**
- **Twilio SDK** for handling SMS notifications

## 📋 Prerequisites
To run this application, you must have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 20.x or higher)
- [Python 3](https://www.python.org/downloads/)
- A [Twilio](https://www.twilio.com/) Account (for SMS routing)

## ⚙️ Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Attendance
   ```

2. **Frontend Setup (Node.js)**
   Install the necessary React packages:
   ```bash
   npm install
   ```

3. **Backend Setup (Python)**
   Create a virtual environment, activate it, and install references from `requirements.txt`:
   ```bash
   python -m venv venv
   
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   This project relies on Twilio for sending text messages. 
   - Rename `.env.example` to `.env` (or configure your system environment variables directly).
   - Enter your actual Twilio Account SID, Auth Token, and Twilio phone number.

## 🏃‍♂️ Running the Application

### The Easy Way (Windows Only)
Simply double-click the `start_app.bat` file in the root directory. This script will automatically launch both the Python backend and the Vite frontend in separate terminal windows.

### Manual Startup (Any OS)
If you prefer to start them manually or are on Mac/Linux:

**1. Start the Python Backend**
Ensure your virtual environment is activated, then run:
```bash
python server.py
```
*The server will start on `http://127.0.0.1:5000`*

**2. Start the React Frontend**
Open a new terminal, navigate to the project directory, and run:
```bash
npm run dev
```
*The application should now be accessible at `http://localhost:5173`*

## 📁 Repository Structure
- `/src`: Contains the React frontend logic, components, contexts, and UI.
- `/public/models`: Pre-trained neural network models used by `face-api.js`.
- `server.py`: The Python Flask application handling business logic and the Twilio SMS integration.
- `start_app.bat`: A quick-start script for Windows users.
