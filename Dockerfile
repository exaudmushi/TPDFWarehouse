# Use official Python slim image
FROM python:3.13-slim-bullseye


# Set the working directory inside the container
WORKDIR /app

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POETRY_VERSION=1.8.2
ENV POETRY_HOME=/opt/poetry
ENV PATH="${POETRY_HOME}/bin:${PATH}"


# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libpq-dev \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*


RUN apt-get clean && apt-get update && apt-get install -y \
    build-essential \
    unixodbc \
    unixodbc-dev \
    libodbc1 \
    && rm -rf /var/lib/apt/lists/*
# Set working directory
WORKDIR /app

# Copy requirements file and install Python dependencies
COPY ./backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# Copy full project (including Django app, Celery tasks, etc.)
# Copy the Django project to the container
COPY . /app/

ENV PYTHONPATH=/app

# Expose port for Gunicorn
EXPOSE 8000

# Default command (overridden by Compose for Celery workers)
CMD ["gunicorn", "warehouse.wsgi:application", "--bind", "0.0.0.0:8000"]
