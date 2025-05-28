import React, { useRef, useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';

const defaultOriginalCode = `function calculate(a, b) {
  return a + b;
}

console.log(calculate(2, 3));`;

const defaultModifiedCode = `function calculate(a, b, c = 0) {
  return a + b + c;
}

console.log(calculate(2, 3));   
console.log(calculate(2, 3, 4));`;

function DiffView() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIds = useRef([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [modifiedCode, setModifiedCode] = useState(defaultModifiedCode);

  const { send, userId, sessionId } = useSocket((msg) => {
    if (msg.userId === userId) return;

    if (msg.type === 'content') {
      setModifiedCode(msg.content);
    } else {
      setRemoteUsers(prev => ({
        ...prev,
        [msg.userId]: {
          ...prev[msg.userId],
          color: prev[msg.userId]?.color || getRandomColor(),
          position: msg.position || prev[msg.userId]?.position,
          selection: msg.selection || prev[msg.userId]?.selection,
        }
      }));
    }
  });

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const modifiedEditor = editor.getModifiedEditor();

    // Broadcast cursor movement
    modifiedEditor.onDidChangeCursorPosition((event) => {
      send({
        type: 'cursor',
        userId,
        sessionId,
        position: event.position
      });
    });

    // Broadcast selection changes
    modifiedEditor.onDidChangeCursorSelection((event) => {
      send({
        type: 'selection',
        userId,
        sessionId,
        selection: event.selection
      });
    });

    // Broadcast content changes
    modifiedEditor.onDidChangeModelContent(() => {
      send({
        type: 'content',
        userId,
        sessionId,
        content: modifiedEditor.getValue()
      });
    });
  };

  useEffect(() => {
    const editor = editorRef.current?.getModifiedEditor();
    const monaco = monacoRef.current;

    if (!editor || !monaco) return;

    // Clear previous decorations
    decorationIds.current = editor.deltaDecorations(decorationIds.current, []);

    // Create new decorations for each remote user
    const newDecorations = Object.entries(remoteUsers).flatMap(([uid, user]) => {
      const decorations = [];
      
      // Cursor decoration (always visible)
      if (user.position) {
        decorations.push({
          range: new monaco.Range(
            user.position.lineNumber,
            user.position.column,
            user.position.lineNumber,
            user.position.column + 1 // Makes the cursor more visible
          ),
          options: {
            isWholeLine: false,
            className: 'remote-cursor',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: `remote-cursor-${uid}`
          }
        });
      }

      // Selection decoration
      if (user.selection) {
        decorations.push({
          range: new monaco.Range(
            user.selection.startLineNumber,
            user.selection.startColumn,
            user.selection.endLineNumber,
            user.selection.endColumn
          ),
          options: {
            className: 'remote-selection',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: `remote-selection-${uid}`
          }
        });
      }

      return decorations;
    });

    decorationIds.current = editor.deltaDecorations(decorationIds.current, newDecorations);
    injectUserStyles(remoteUsers);
  }, [remoteUsers]);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DiffEditor
        height="100%"
        width="100%"
        original={defaultOriginalCode}
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

function injectUserStyles(users) {
  const style = document.getElementById('remote-user-styles') || document.createElement('style');
  style.id = 'remote-user-styles';

  let styles = '';
  for (const [uid, { color }] of Object.entries(users)) {
    // Cursor style - more visible
    styles += `
      .monaco-editor .remote-cursor-${uid} {
        background-color: ${color};
        width: 2px !important;
        margin-left: -1px;
      }
    `;
    
    // Selection style
    styles += `
      .monaco-editor .remote-selection-${uid} {
        background-color: ${color}33;
      }
    `;
  }

  document.head.appendChild(style);
  style.innerHTML = styles;
}