import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const PLACEHOLDER_CODE = {
  javascript: `// Paste your JavaScript code here
function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] === arr[j] && i !== j) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

console.log(findDuplicates([1, 2, 3, 2, 4, 3]));`,

  python: `# Paste your Python code here
def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(len(lst)):
            if lst[i] == lst[j] and i != j:
                duplicates.append(lst[i])
    return duplicates

print(find_duplicates([1, 2, 3, 2, 4, 3]))`,

  java: `// Paste your Java code here
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static List<Integer> findDuplicates(int[] arr) {
        List<Integer> duplicates = new ArrayList<>();
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
                if (arr[i] == arr[j] && i != j) {
                    duplicates.add(arr[i]);
                }
            }
        }
        return duplicates;
    }
}`,

  typescript: `// Paste your TypeScript code here
function findDuplicates(arr: number[]): number[] {
  let duplicates: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] === arr[j] && i !== j) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}`,

  c: `// Paste your C code here
#include <stdio.h>

void findDuplicates(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] == arr[j]) {
                printf("%d ", arr[i]);
            }
        }
    }
}

int main() {
    int arr[] = {1, 2, 3, 2, 4, 3};
    findDuplicates(arr, 6);
    return 0;
}`,

  cpp: `// Paste your C++ code here
#include <vector>

std::vector<int> findDuplicates(std::vector<int>& arr) {
    std::vector<int> duplicates;
    for (int i = 0; i < arr.size(); i++) {
        for (int j = 0; j < arr.size(); j++) {
            if (arr[i] == arr[j] && i != j) {
                duplicates.push_back(arr[i]);
            }
        }
    }
    return duplicates;
}`,

  go: `// Paste your Go code here
package main

func findDuplicates(arr []int) []int {
    duplicates := []int{}
    for i := 0; i < len(arr); i++ {
        for j := 0; j < len(arr); j++ {
            if arr[i] == arr[j] && i != j {
                duplicates = append(duplicates, arr[i])
            }
        }
    }
    return duplicates
}`,

  rust: `// Paste your Rust code here
fn find_duplicates(arr: &[i32]) -> Vec<i32> {
    let mut duplicates = Vec::new();
    for i in 0..arr.len() {
        for j in 0..arr.len() {
            if arr[i] == arr[j] && i != j {
                duplicates.push(arr[i]);
            }
        }
    }
    duplicates
}`,
};

const MONACO_LANG = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  typescript: 'typescript',
  c: 'c',
  cpp: 'cpp',
  go: 'go',
  rust: 'rust',
};

const EXT_MAP = {
  javascript: 'js', typescript: 'ts', python: 'py',
  java: 'java', c: 'c', cpp: 'cpp', go: 'go', rust: 'rs',
};

const CodeEditor = ({ value, onChange, language }) => {
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = (val) => {
    onChange(val || '');
  };

  const displayValue = value || PLACEHOLDER_CODE[language] || '';

  return (
    <div style={styles.container}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, background: '#f87171' }} />
          <span style={{ ...styles.dot, background: '#fbbf24' }} />
          <span style={{ ...styles.dot, background: '#4ade80' }} />
        </div>
        <span style={styles.filename}>
          editor.{EXT_MAP[language] || 'js'}
        </span>
        <div style={styles.lineCount}>
          {displayValue.split('\n').length} lines
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="calc(100% - 38px)"
        language={MONACO_LANG[language]}
        value={displayValue}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 13.5,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'gutter',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 14, bottom: 14 },
          tabSize: 2,
          automaticLayout: true,
          lineDecorationsWidth: 0,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#1e1e2e',
    borderRight: '1px solid var(--border)',
    overflow: 'hidden',
  },
  toolbar: {
    height: 38,
    background: '#181825',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    gap: 10,
    flexShrink: 0,
  },
  dots: {
    display: 'flex',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    opacity: 0.8,
  },
  filename: {
    flex: 1,
    textAlign: 'center',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-code)',
    color: 'var(--text-muted)',
  },
  lineCount: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-code)',
    color: 'var(--text-muted)',
  },
};

export { PLACEHOLDER_CODE };
export default CodeEditor;
