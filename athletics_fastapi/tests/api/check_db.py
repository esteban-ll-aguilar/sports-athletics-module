# import socket
# import os
# import sys
# import time

# def check_db_connection():
#     db_host = os.getenv("DATABASE_HOST", "postgres")
#     try:
#         db_port = int(os.getenv("DATABASE_PORT", 5432))
#     except ValueError:
#         db_port = 5432

#     # Intentar conectar
#     max_retries = 30
#     wait_seconds = 2

#     print(f"Checking database connection at {db_host}:{db_port}...")
    
#     for i in range(max_retries):
#         try:
#             sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#             sock.settimeout(1)
#             result = sock.connect_ex((db_host, db_port))
#             sock.close()
            
#             if result == 0:
#                 print("Database is ready!")
#                 return True
#             else:
#                 print(f"Waiting for database... (attempt {i+1}/{max_retries})")
#                 time.sleep(wait_seconds)
#         except Exception as e:
#             print(f"Error checking database: {e}")
#             time.sleep(wait_seconds)
            
#     return False

# if __name__ == "__main__":
#     if check_db_connection():
#         sys.exit(0)
#     else:
#         print("Could not connect to database after multiple attempts.")
#         sys.exit(1)
