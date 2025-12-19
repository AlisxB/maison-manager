import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL is not set in .env file")
    sys.exit(1)

def migrate():
    engine = create_engine(DATABASE_URL)
    
    check_column_sql = text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_notification_check';
    """)
    
    add_column_sql = text("""
        ALTER TABLE users 
        ADD COLUMN last_notification_check TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;
    """)

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check if column exists
            result = conn.execute(check_column_sql).fetchone()
            
            if not result:
                print("Adding 'last_notification_check' column to 'users' table...")
                conn.execute(add_column_sql)
                print("Column added successfully.")
            else:
                print("Column 'last_notification_check' already exists in 'users' table.")
                
            trans.commit()
            print("Migration completed successfully.")
        except Exception as e:
            trans.rollback()
            print(f"Error executing migration: {e}")
            sys.exit(1)

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
