# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data during build (needed for sentiment analysis)
RUN python -c "import nltk; nltk.download('vader_lexicon', quiet=True); nltk.download('punkt', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True)"

# Copy project
COPY . .

# Create data directories if they don't exist
RUN mkdir -p data/raw data/processed data/cache data/nltk_data

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Default command (will be overridden by docker-compose for different services)
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
