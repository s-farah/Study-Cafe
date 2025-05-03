# originally, our 'entries' table only stored content, timestamps, and user info
# we needed a way to favorite journal entries so this script updates the existing tables by adding a favorite column


import sqlite3

# connects to the database
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

try:
    # adds the new column
    cursor.execute("ALTER TABLE entries ADD COLUMN favorite INTEGER DEFAULT 0;")
    print("Column 'favorite' added successfully.")
except sqlite3.OperationalError as e:
    # if it already exists, we raise an error
    print("Column might already exist.\nError:", e)

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            set_name TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    print("Table 'flashcards' created successfully.")
except sqlite3.OperationalError as e:
    print("Table 'flashcards' might already exist.\nError:", e)

conn.commit()
conn.close()
