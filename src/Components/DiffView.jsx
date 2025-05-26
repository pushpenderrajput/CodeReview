import React, { useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';

function DiffView() {
  const editorRef = useRef(null);

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

    if (!modifiedEditor) {
      console.error('Modified editor not available.');
      return;
    }

    // Log cursor movement
    modifiedEditor.onDidChangeCursorPosition(event => {
      console.log('[Cursor Move]', {
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      });
    });

    // Log selection changes
    modifiedEditor.onDidChangeCursorSelection(event => {
      const selection = event.selection;
      console.log('[Text Selected]', {
        startLine: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLine: selection.endLineNumber,
        endColumn: selection.endColumn,
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
