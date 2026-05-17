<div align="center">
  <img src="frontend/Nexus.png" alt="Nexus ALPR Logo" width="120" />
  
  # 🚙 Nexus ALPR - Enterprise Smart Parking System

  **A High-Performance, AI-Driven Automatic License Plate Recognition System.** *Built for scalability, accuracy, and real-time security management.*

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![YOLOv8](https://img.shields.io/badge/YOLOv8-FF1493?style=for-the-badge&logo=ultralytics&logoColor=white)](https://ultralytics.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  
  ---
</div>

## 🌟 Executive Summary

**Nexus ALPR** is an end-to-end Smart Parking and Security solution. It leverages state-of-the-art Computer Vision (YOLOv8) to detect and recognize Egyptian license plates in real-time, coupled with a robust FastAPI backend and a responsive React frontend dashboard.

### ✨ Key Features
- **🚗 High-Accuracy OCR:** Custom-trained YOLOv8 model optimized specifically for Egyptian Arabic license plates.
- **⚡ Real-Time Processing:** WebSocket integration for live camera feeds with sub-second inference latency.
- **🛡️ Security & Access Control:** Automated Blacklist detection with instant security alerts.
- **👑 VIP Management:** Automated gate access and fee waivers for registered subscribers.
- **📊 Business Intelligence:** Comprehensive analytics dashboard tracking revenue, peak hours, and dwell times.
- **☁️ Cloud-Native Database:** Fully managed PostgreSQL integration via Neon Cloud.

---

## 🏗️ System Architecture

Nexus ALPR follows a modern, decoupled microservices architecture.

```mermaid
graph TD
    A[React/Vite Frontend] -->|REST & WebSockets| B(FastAPI Backend)
    B -->|Inference| C{YOLOv8 Models}
    B -->|CRUD| D[(Neon PostgreSQL)]
    C --> E[Vehicle Detection]
    C --> F[Plate Extraction & OCR]
```

### 📂 Directory Structure
```text
nexus-alpr/
├── api/                  # FastAPI Backend Services
│   ├── main.py           # Core Application & Endpoints
│   ├── database.py       # PostgreSQL ORM & Schema Logic
│   └── .env              # Backend Secrets (Not Committed)
├── frontend/             # React/Vite Admin Dashboard
│   ├── src/              # UI Components & Context
│   └── package.json      # Node Dependencies
├── models/               # Pre-trained ONNX/PyTorch Weights
│   ├── plate_model.onnx
│   └── ocr_model.onnx
├── notebooks/            # Jupyter/Colab Training Pipelines
├── Dockerfile            # Containerization Configuration
├── requirements.txt      # Python Dependencies
└── README.md             # Project Documentation
```

---

## 🚀 Live Demos & Deployment

The system is fully containerized and deployed across premier cloud platforms:

- **🖥️ Admin Dashboard (Frontend):** [View on Netlify](https://darling-scone-206bbc.netlify.app/)
- **⚙️ AI Inference API (Backend):** [View on Hugging Face Spaces](https://huggingface.co/spaces/abdelkareem1/nexus-alpr-api/)
- **💾 Database:** Hosted securely on **Neon Cloud (PostgreSQL)**.

> *Note: Initial API requests may take ~30 seconds to wake up the Hugging Face Space if it has been idle.*

---

## 🛠️ Local Development Setup

To run Nexus ALPR locally for development or testing:

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database (Local or Cloud URL)

### 2. Backend Setup
```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/nexus-alpr.git](https://github.com/YOUR_USERNAME/nexus-alpr.git)
cd nexus-alpr

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in the root directory and add:
# DATABASE_URL="postgresql://user:password@host/dbname"

# Run the FastAPI server
uvicorn main:app --reload --port 7860
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env.local file in the frontend directory and add:
# VITE_API_URL="http://localhost:7860"

# Start the React development server
npm run dev
```

---

## 🐳 Docker Deployment

Nexus ALPR is fully Dockerized for production parity.

```bash
# Build the Docker Image
docker build -t nexus-alpr-api .

# Run the Containerized Server
docker run -p 7860:7860 --env-file .env nexus-alpr-api
```

---

## 📡 API Reference (Core Endpoints)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/process_vehicle` | Process static image via Form Data |
| `WS` | `/ws/live_camera/{gate}` | Live WebSocket inference feed |
| `GET` | `/live_status` | Retrieve active occupancy and alerts |
| `GET` | `/analytics/dashboard` | Fetch comprehensive BI metrics |
| `POST` | `/add_to_blacklist` | Flag a plate number for security |

*Detailed interactive documentation is available at `/docs` when running the backend.*

---

## 🎯 Project Vision
Nexus ALPR was engineered to demonstrate a complete, production-ready AI pipeline. It showcases the seamless integration of computer vision models with scalable web technologies, reflecting industry best practices in System Architecture, MLOps, and Full-Stack Software Engineering.

---
<div align="center">
  <i>Engineered with precision for real-world impact.</i>
</div>
