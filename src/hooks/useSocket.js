import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSocket(onMessage) {
  const socketRef = useRef(null);
  const userIdRef = useRef(uuidv4());
  const sessionIdRef = useRef(getSessionId());

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      socket.send(JSON.stringify({
        type: 'join',
        sessionId: sessionIdRef.current,
        userId: userIdRef.current
      }));
    };

    socket.onmessage = async (event) => {
      try {
        let data;
        if (event.data instanceof Blob) {
          // Handle Blob data
          data = await event.data.text();
        } else {
          // Handle plain text data
          data = event.data;
        }
        const msg = JSON.parse(data);
        onMessage?.(msg);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => socket.close();
  }, [onMessage]);

  function send(data) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }

  return {
    send,
    userId: userIdRef.current,
    sessionId: sessionIdRef.current
  };
}

function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  let sessionId = params.get('session');
  if (!sessionId) {
    sessionId = uuidv4();
    window.history.replaceState({}, '', `?session=${sessionId}`);
  }
  return sessionId;
}