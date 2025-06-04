import React, { useRef, useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../hooks/useSocket';

function DiffView() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIds = useRef([]);
  const isRemoteUpdate = useRef(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [hoveredLine, setHoveredLine] = useState(null);
  const [commentInput, setCommentInput] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(true);

  const { send, userId, sessionId, username } = useSocket((msg) => {
    if (msg.userId === userId) return;

    if (msg.type === 'comment') {
      setComments(prev => {
        const line = msg.lineNumber;
        const prevComments = prev[line] || [];
        return {
          ...prev,
          [line]: [...prevComments, { id: msg.id, user: msg.name, text: msg.text, timestamp: msg.timestamp, userId: msg.userId }]
        };
      });
      return;
    }

    if (msg.type === 'delete-comment') {
      setComments(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(line => {
          updated[line] = updated[line].filter(c => c.id !== msg.commentId);
          if (updated[line].length === 0) delete updated[line];
        });
        return updated;
      });
      return;
    }

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

  const handleAddComment = (lineNumber, text) => {
    const timestamp = new Date().toISOString();
    const id = uuidv4();

    send({
      type: 'comment',
      sessionId,
      userId,
      name: username,
      id,
      lineNumber,
      text,
      timestamp
    });

    setComments(prev => {
      const prevComments = prev[lineNumber] || [];
      return {
        ...prev,
        [lineNumber]: [...prevComments, { id, user: username, text, timestamp, userId }]
      };
    });

    setCommentInput({});
  };

  const handleDeleteComment = (commentId) => {
    send({ type: 'delete-comment', commentId });
    setComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(line => {
        updated[line] = updated[line].filter(c => c.id !== commentId);
        if (updated[line].length === 0) delete updated[line];
      });
      return updated;
    });
  };

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

    modifiedEditor.onMouseMove((e) => {
      if (e.target?.position) {
        setHoveredLine(e.target.position.lineNumber);
      } else {
        setHoveredLine(null);
      }
    });

    modifiedEditor.onDidChangeCursorPosition(event => {
      send({ type: 'cursor', userId, sessionId, name: username, position: event.position });
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
        isRemoteUpdate.current = false;
        return;
      }
      send({ type: 'content', userId, sessionId, name: username, content: modifiedEditor.getValue() });
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
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <button onClick={() => setShowComments(!showComments)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 20, background: showComments ? '#f5222d' : '#1890ff', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
        {showComments ? '🙈 Hide Comments' : '👁 Show Comments'}
      </button>

      <DiffEditor
        height="100%"
        width="100%"
        original={originalCode}
        modified={modifiedCode}
        theme="vs-dark"
        language="javascript"
        options={{ readOnly: false, renderSideBySide: true, automaticLayout: true, scrollBeyondLastLine: false, minimap: { enabled: false }, originalEditable: false }}
        onMount={handleEditorDidMount}
      />

      {showComments && hoveredLine && (
        <div style={{ position: 'absolute', top: (hoveredLine - 1) * 19 + 10, left: 'calc(100% - 40px)', zIndex: 10 }}>
          <button onClick={() => setCommentInput({ line: hoveredLine, text: '' })} style={{ background: '#1890ff', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
            💬
          </button>
        </div>
      )}

      {showComments && commentInput.line && (
        <div style={{ position: 'absolute', top: (commentInput.line - 1) * 19 + 30, left: 'calc(100% - 280px)', zIndex: 10, background: '#fff', border: '1px solid #ccc', padding: '8px', width: '220px', borderRadius: '4px' }}>
          <textarea rows="2" style={{ width: '100%' }} value={commentInput.text} onChange={e => setCommentInput({ ...commentInput, text: e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={() => handleAddComment(commentInput.line, commentInput.text)} style={{ background: '#52c41a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}>
              Add
            </button>
          </div>
        </div>
      )}

      {showComments && Object.entries(comments).map(([line, thread]) => (
        <div key={line} style={{ position: 'absolute', top: (parseInt(line) - 1) * 19 + 60, left: 'calc(100% - 280px)', width: '240px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '6px', fontSize: '12px', zIndex: 5 }}>
          <strong>Line {line}</strong>
          {thread.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong style={{ color: '#1890ff' }}>{c.user}:</strong> {c.text}</span>
              {c.userId === userId && (
                <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>🗑</button>
              )}
            </div>
          ))}
        </div>
      ))}
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
