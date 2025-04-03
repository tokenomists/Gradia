import React, { useRef, useEffect, useState } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';

// Simplified linting approach
const createSimpleLinter = (errorChecks) => {
  return linter((view) => {
    const diagnostics = [];
    const content = view.state.doc.toString();
    
    // Run through error checks
    errorChecks.forEach(check => {
      const matches = check(content);
      if (matches) {
        diagnostics.push(...matches);
      }
    });

    return diagnostics;
  });
};

// Language-specific error checks
const LANGUAGE_ERROR_CHECKS = {
  'python': [
    (content) => {
      const errors = [];
      // Simple syntax error checks
      const indentationMatches = content.match(/^(\s+)$/gm);
      if (indentationMatches) {
        indentationMatches.forEach((match, index) => {
          errors.push({
            from: content.indexOf(match),
            to: content.indexOf(match) + match.length,
            severity: 'error',
            message: 'Unnecessary indentation'
          });
        });
      }

      // Check for unclosed parentheses/brackets
      const openParenCount = (content.match(/\(/g) || []).length;
      const closeParenCount = (content.match(/\)/g) || []).length;
      if (openParenCount !== closeParenCount) {
        errors.push({
          from: 0,
          to: content.length,
          severity: 'error',
          message: 'Unbalanced parentheses'
        });
      }

      return errors;
    }
  ],
  'javascript': [
    (content) => {
      const errors = [];
      
      // Check for undeclared variables (very basic)
      const variableDeclarations = content.match(/\b(let|const|var)\s+(\w+)/g) || [];
      const usedVariables = content.match(/\b\w+\b/g) || [];
      
      const declaredVars = variableDeclarations.map(decl => decl.split(/\s+/)[1]);
      const potentialUndeclaredVars = usedVariables.filter(
        variable => !declaredVars.includes(variable) && 
                    !['let', 'const', 'var', 'function', 'if', 'else', 'return'].includes(variable)
      );

      potentialUndeclaredVars.forEach(variable => {
        const index = content.indexOf(variable);
        errors.push({
          from: index,
          to: index + variable.length,
          severity: 'error',
          message: `Possible undeclared variable: ${variable}`
        });
      });

      // Check for mismatched brackets
      const openBracketCount = (content.match(/\{/g) || []).length;
      const closeBracketCount = (content.match(/\}/g) || []).length;
      if (openBracketCount !== closeBracketCount) {
        errors.push({
          from: 0,
          to: content.length,
          severity: 'error',
          message: 'Unbalanced brackets'
        });
      }

      return errors;
    }
  ],
  'java': [
    (content) => {
      const errors = [];
      
      // Check for missing semicolons
      const lines = content.split('\n');
      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.length > 0 && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('//') &&
          !trimmedLine.startsWith('*') &&
          !trimmedLine.startsWith('import') &&
          !trimmedLine.startsWith('package')
        ) {
          const index = content.split('\n').slice(0, lineIndex).join('\n').length + line.indexOf(trimmedLine);
          errors.push({
            from: index,
            to: index + trimmedLine.length,
            severity: 'error',
            message: 'Missing semicolon'
          });
        }
      });

      return errors;
    }
  ],
  'cpp': [
    (content) => {
      const errors = [];
      
      // Check for missing semicolons
      const lines = content.split('\n');
      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.length > 0 && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('//') &&
          !trimmedLine.startsWith('#include')
        ) {
          const index = content.split('\n').slice(0, lineIndex).join('\n').length + line.indexOf(trimmedLine);
          errors.push({
            from: index,
            to: index + trimmedLine.length,
            severity: 'error',
            message: 'Missing semicolon'
          });
        }
      });

      return errors;
    }
  ],
  'default': [() => []]
};

const LANGUAGE_CONFIG = {
  'python': {
    language: python(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['python'])
  },
  'javascript': {
    language: javascript(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['javascript'])
  },
  'java': {
    language: java(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['java'])
  },
  'cpp': {
    language: cpp(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['cpp'])
  },
  'rust': {
    language: rust(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['default'])
  },
  'sql': {
    language: sql(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['default'])
  },
  'html': {
    language: html(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['default'])
  },
  'css': {
    language: css(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['default'])
  }
};

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const languages = Object.keys(LANGUAGE_CONFIG);

  return (
    <div className="absolute bottom-2 right-2 z-10">
      <select 
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-white/80 text-xs text-gray-700 px-2 py-1 rounded-lg border border-[#e2c3ae] focus:ring-2 focus:ring-[#d56c4e] transition-all"
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

const CodeEditor = ({ 
  value, 
  onChange, 
  dispatch, 
  currentQuestionId,
  defaultLanguage = 'python'
}) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // Custom theme to match the existing background
  const customTheme = EditorView.theme({
    '&': {
      backgroundColor: '#fcf9ea',
      height: '12rem',
      borderRadius: '0.5rem',
      border: '2px solid #e2c3ae',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
    },
    '.cm-content': {
      fontFamily: 'monospace',
      padding: '1rem'
    },
    '&.cm-focused': {
      outline: '2px solid #d56c4e'
    },
    // Styling for error markers
    '.cm-lint-error': {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderBottom: '2px solid red'
    },
    '.cm-lint-warning': {
      backgroundColor: 'rgba(255, 165, 0, 0.1)',
      borderBottom: '2px solid orange'
    }
  }, { dark: false });

  useEffect(() => {
    if (!editorRef.current) return;

    // Remove existing editor if any
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Get current language configuration
    const langConfig = LANGUAGE_CONFIG[language];

    // Prepare extensions
    const extensions = [
      basicSetup,
      langConfig.language,
      customTheme,
      // Add linting gutter if a linter is available
      lintGutter(),
      langConfig.linter,
      // Custom keymap to handle tab for indentation
      keymap.of([
        ...defaultKeymap,
        indentWithTab
      ]),
      // Update handler to sync with React state
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          dispatch({
            type: 'SET_ANSWER',
            payload: {
              id: currentQuestionId,
              answer: newValue
            }
          });
        }
      })
    ];

    // Create new CodeMirror editor
    const view = new EditorView({
      doc: value || '',
      extensions,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Cleanup function
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [currentQuestionId, language]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="relative w-full">
      <div 
        ref={editorRef} 
        className="w-full"
      />
      <LanguageSelector 
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
};

export default CodeEditor;