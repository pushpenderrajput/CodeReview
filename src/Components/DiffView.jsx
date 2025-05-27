import React, { useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';
function DiffView() {
  const editorRef = useRef(null);
  const { send, userId, sessionId } = useSocket((msg) => {
    if (msg.type === 'cursor' && msg.userId !== userId) {
      console.log(`[Remote Cursor]`, msg);
      // Later: update remote cursor on UI
    }
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

    const modifiedEditor = editor.getModifiedEditor();
    if (!modifiedEditor) return;

    modifiedEditor.onDidChangeCursorPosition(event => {
      send({
        type: 'cursor',
        userId,
        sessionId,
        position: event.position
      });
    });

    modifiedEditor.onDidChangeCursorSelection(event => {
      const s = event.selection;
      send({
        type: 'selection',
        userId,
        sessionId,
        selection: {
          startLineNumber: s.startLineNumber,
          startColumn: s.startColumn,
          endLineNumber: s.endLineNumber,
          endColumn: s.endColumn
        }
      });
    });
  };


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
