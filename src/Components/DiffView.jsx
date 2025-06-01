import React, { useRef, useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';

function DiffView() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIds = useRef([]);
  const isRemoteUpdate = useRef(false);
  const [remoteUsers, setRemoteUsers] = useState({});

  const { send, userId, sessionId, username } = useSocket((msg) => {
    if (msg.userId === userId) return;

    if (msg.type === 'content') {
      const editor = editorRef.current?.getModifiedEditor();
      if (!editor) return;
      const currentValue = editor.getValue();
      if (currentValue !== msg.content) {
        isRemoteUpdate.current = true;
        editor.setValue(msg.content);
      }
      return;
    }

    setRemoteUsers(prev => ({
      ...prev,
      [msg.userId]: {
        ...prev[msg.userId],
        name: msg.name || prev[msg.userId]?.name,
        color: prev[msg.userId]?.color || getRandomColor(),
        position: msg.hasOwnProperty("position") ? msg.position : prev[msg.userId]?.position,
        selection: msg.hasOwnProperty("selection") ? msg.selection : prev[msg.userId]?.selection,
      }
    }));
  });

  const originalCode = `
function calculate(a, b) {
  return a + b;
}

console.log(calculate(2, 3)); 
`;

  const modifiedCode = `
function calculate(a, b, c = 0) {
  return a + b + c;
}

console.log(calculate(2, 3));   
console.log(calculate(2, 3, 4)); 
`;

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const modifiedEditor = editor.getModifiedEditor();
    if (!modifiedEditor) return;

    modifiedEditor.onDidChangeCursorPosition(event => {
      send({
        type: 'cursor',
        userId,
        sessionId,
        name: username,
        position: event.position,
      });
    });

    modifiedEditor.onDidChangeCursorSelection(event => {
      const s = event.selection;
      send({
        type: 'selection',
        userId,
        sessionId,
        name: username,
        selection: {
          startLineNumber: s.startLineNumber,
          startColumn: s.startColumn,
          endLineNumber: s.endLineNumber,
          endColumn: s.endColumn
        }
      });
    });

    modifiedEditor.onDidChangeModelContent(() => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false; // Don't broadcast remote updates
        return;
      }

      send({
        type: 'content',
        userId,
        sessionId,
        name: username,
        content: modifiedEditor.getValue()
      });
    });
  };

  useEffect(() => {
    const editor = editorRef.current?.getModifiedEditor();
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const decorations = Object.entries(remoteUsers).flatMap(([uid, user]) => {
      if (!user.position) return [];

      return [
        {
          range: new monaco.Range(
            user.position.lineNumber,
            user.position.column,
            user.position.lineNumber,
            user.position.column
          ),
          options: {
            afterContentClassName: `remote-cursor-${uid}`,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          }
        }
      ];
    });

    decorationIds.current = editor.deltaDecorations(decorationIds.current, decorations);
    injectUserCursorStyles(remoteUsers);
  }, [remoteUsers]);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DiffEditor
        height="100%"
        width="100%"
        original={originalCode}
        modified={modifiedCode}
        theme="vs-dark"
        language="javascript"
        options={{
          readOnly: false,
          renderSideBySide: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          originalEditable: false,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default DiffView;

function getRandomColor() {
  const palette = ['#f5222d', '#fa8c16', '#1890ff', '#52c41a', '#722ed1'];
  return palette[Math.floor(Math.random() * palette.length)];
}

function injectUserCursorStyles(users) {
  const style = document.getElementById('remote-cursor-style') || document.createElement('style');
  style.id = 'remote-cursor-style';

  let styles = '';
  for (const [uid, { color, name }] of Object.entries(users)) {
    styles += `
      .monaco-editor .remote-cursor-${uid}::after {
        content: '${name}';
        position: absolute;
        background: ${color};
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        transform: translateY(-100%);
        margin-left: 6px;
        white-space: nowrap;
        z-index: 1000;
      }
      .monaco-editor .remote-cursor-${uid} {
        border-left: 2px solid ${color};
        margin-left: -1px;
        pointer-events: none;
      }
    `;
  }

  style.innerHTML = styles;
  document.head.appendChild(style);
}