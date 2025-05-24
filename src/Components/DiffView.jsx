import {DiffEditor} from '@monaco-editor/react';

function DiffView() {
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

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <DiffEditor
        height="100%"
        width="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        options={{
          readOnly: false,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderSideBySide: true,
          originalEditable: false
        }}
        original={originalCode}
        modified={modifiedCode}
      />
    </div>
  );
}

export default DiffView;