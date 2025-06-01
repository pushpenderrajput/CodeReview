import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSocket(onMessage) {
  const socketRef = useRef(null);
  const userIdRef = useRef(uuidv4());
  const sessionIdRef = useRef(getSessionId());
  const usernameRef = useRef(getRandomName());
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      socket.send(JSON.stringify({
        type: 'join',
        sessionId: sessionIdRef.current,
        userId: userIdRef.current,
        name: usernameRef.current,
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = event.data instanceof Blob ? await event.data.text() : event.data;
        const msg = JSON.parse(data);
        onMessageRef.current?.(msg);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => socket.close();
  }, []);

  function send(data) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }

  return {
    send,
    userId: userIdRef.current,
    sessionId: sessionIdRef.current,
    username: usernameRef.current
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

function getRandomName() {
  const names = ['Pushpender', 'Anshul', 'Kajal', 'Deepu', 'Navjot', 'Aadi', 'Ravi'];
  return names[Math.floor(Math.random() * names.length)];
}
