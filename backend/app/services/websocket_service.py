from typing import List, Dict, Any
from fastapi import WebSocket
from loguru import logger
import json

class ConnectionManager:
    """Manages active WebSocket connections to push real-time alerts."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a JSON message to all connected clients."""
        logger.info(f"Broadcasting message to {len(self.active_connections)} clients: {message.get('type')}")
        message_str = json.dumps(message)
        
        # We need to copy the list because connections might be removed during iteration
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error broadcasting to a websocket: {e}")
                self.disconnect(connection)


# Global instance
websocket_manager = ConnectionManager()
