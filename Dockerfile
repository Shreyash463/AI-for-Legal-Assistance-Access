# Production Multi-Stage Dockerfile for ClarifyLaw AI
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production \
    PORT=8000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and sample files
COPY backend/ ./backend/
COPY samples/ ./samples/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

# Start FastAPI production server
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
