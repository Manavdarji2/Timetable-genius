import os
import mysql.connector
from dotenv import load_dotenv

def update_schema():
    # Load environment variables from website/.env
    # We might need to adjust the path depending on where the script is run
    env_path = os.path.join('website', '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()

    print("Connecting to database...")
    try:
        conn = mysql.connector.connect(
            host=os.environ.get("DB_HOST"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            database=os.environ.get("DB_NAME")
        )
        cursor = conn.cursor()
        
        print("Checking for reset_token and token_expiry columns in 'users' table...")
        
        # Check if reset_token column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'reset_token'")
        if not cursor.fetchone():
            print("Adding 'reset_token' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL")
        else:
            print("'reset_token' column already exists.")
            
        # Check if token_expiry column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'token_expiry'")
        if not cursor.fetchone():
            print("Adding 'token_expiry' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN token_expiry DATETIME DEFAULT NULL")
        else:
            print("'token_expiry' column already exists.")
            
        conn.commit()
        print("Success: Database schema updated.")
        
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    update_schema()
