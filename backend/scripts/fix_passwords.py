"""
Fix dummy user passwords by hashing them correctly.
"""

import asyncio
from app.config.database import connect_to_mongodb, close_mongodb_connection
from app.models.user import User
from app.middleware.security import hash_password

async def main():
    await connect_to_mongodb()
    
    users = await User.find_all().to_list()
    for user in users:
        # Set all passwords to 'password123'
        user.password = hash_password("password123")
        await user.save()
        
    print("Passwords updated successfully to 'password123'")
    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(main())
