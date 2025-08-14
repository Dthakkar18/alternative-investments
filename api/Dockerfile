# api/Dockerfile
FROM python:3.12-slim

# --- Python runtime hygiene ---
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# --- System deps (for psycopg etc.) ---
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential libpq-dev \
	&& rm -rf /var/lib/apt/lists/*

# --- Workdir ---
WORKDIR /app

# --- Install Python deps first (better layer caching) ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Copy project source ---
 COPY src/ /app/

# --- Expose Django port ---
EXPOSE 8000

 # --- Default: production server (override in compose for dev) ---
# NOTE: change 'core.wsgi' if your project package name is different
CMD ["sh", "-c", "python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3"]

