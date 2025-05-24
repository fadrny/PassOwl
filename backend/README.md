## Prerequisites

- Python 3.11+
- PostgreSQL database (local or cloud)
- pip package manager

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set your database connection:

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
SECRET_KEY=your_very_secret_jwt_key_here
```

### 3. Setup Database

**Manually run the SQL schema script in your PostgreSQL environment:**

```bash
# Connect to your PostgreSQL database and run:
psql -U username -d database_name -f db/schema.sql

# Or if using cloud database (like Neon):
psql "postgresql://username:password@host:port/database?sslmode=require" -f db/schema.sql
```

The schema script will:
- Create all required tables with proper relationships
- Set up indexes for performance
- Create default roles ('user', 'admin')
- Add triggers for automatic timestamp updates

### 4. Start the Server

```bash
python run.py
```

The API will be available at:
- **API Base:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs
- **OpenAPI Schema:** http://localhost:8000/openapi.json