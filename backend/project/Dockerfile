# Use the official lightweight Python image
FROM python:3.10-slim

# Install system dependencies (including Tesseract OCR)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files into the container
COPY . .

# Collect static files (standard for Django on Render)
RUN python manage.py collectstatic --no-input

# Run the Django application using Gunicorn for production
# (Render dynamically assigns the PORT environment variable)
CMD gunicorn project.wsgi:application --bind 0.0.0.0:${PORT:-8000}
