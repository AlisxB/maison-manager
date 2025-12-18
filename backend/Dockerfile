FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (build-essential for some python packages if needed)
# libpq-dev is often needed for psycopg2/asyncpg build
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8000

# Command to run (using string format for exec form)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
