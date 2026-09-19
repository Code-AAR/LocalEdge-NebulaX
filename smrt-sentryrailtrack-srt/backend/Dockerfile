# For Hugging Face Spaces (Docker) or any container host
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
# Bind to the port the host provides ($PORT on Render), fall back to 7860 (HF Spaces / local).
# Shell form so ${PORT} is expanded at runtime.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}
