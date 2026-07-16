# Use the official Python 3.11 slim image
FROM python:3.11-slim

# Create a non-root user (Hugging Face Spaces requires user 1000)
RUN useradd -m -u 1000 user

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Install system dependencies needed for OpenCV, PyTorch, etc.
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create the uploads directory and give permissions to the non-root user
RUN mkdir -p /app/uploads && chown -R user:user /app

# Switch to the non-root user
USER user

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Command to run the application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
