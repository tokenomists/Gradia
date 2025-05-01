import React, { useRef, useEffect, useState } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';

const createSimpleLinter = (errorChecks) => {
  return linter((view) => {
    const diagnostics = [];
    const content = view.state.doc.toString();
    
    errorChecks.forEach(check => {
      const matches = check(content);
      if (matches) {
        diagnostics.push(...matches);
      }
    });

    return diagnostics;
  });
};

const LANGUAGE_ERROR_CHECKS = {
  'python': [
    (content) => {
      const errors = [];
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
  'default': [() => []]
};

const LANGUAGE_CONFIG = {
  'python3': {
    language: python(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['python'])
  },
  'javascript': {
    language: javascript(),
    linter: createSimpleLinter(LANGUAGE_ERROR_CHECKS['javascript'])
  }
};

const LanguageSelector = ({ currentLanguage, onLanguageChange, allowedLanguage }) => {
  const languages = (allowedLanguage && allowedLanguage !== 'Any Language')
    ? [allowedLanguage]
    : Object.keys(LANGUAGE_CONFIG);

  const displayName = lang =>
    lang.charAt(0).toUpperCase() + lang.slice(1);

  return (
    <div className="absolute bottom-2 right-2 z-10">
      {languages.length > 1 ? (
        <select 
          value={currentLanguage}
          onChange={e => onLanguageChange(e.target.value)}
          className="bg-white/80 text-xs text-gray-700 px-2 py-1 rounded-lg border border-[#e2c3ae] focus:ring-2 focus:ring-[#d56c4e] transition-all"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>
              {displayName(lang)}
            </option>
          ))}
        </select>
      ) : (
        <span className="bg-white/80 text-xs text-gray-700 px-2 py-1 rounded-lg border border-[#e2c3ae]">
          {displayName(currentLanguage)}
        </span>
      )}
    </div>
  );
};

const CodeEditor = ({ 
  value, 
  onChange, 
  dispatch, 
  currentQuestionId,
  defaultLanguage = 'python3',
  allowedLanguage
}) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const editorRef = useRef(null);
  const viewRef = useRef(null);

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
    if (allowedLanguage && LANGUAGE_CONFIG[allowedLanguage]) {
      setLanguage(allowedLanguage);
      dispatch({
        type: 'SET_LANGUAGE',
        payload: { id: currentQuestionId, language: allowedLanguage }
      });
    } else {
      dispatch({
        type: 'SET_LANGUAGE',
        payload: { id: currentQuestionId, language: defaultLanguage }
      });
    }
  }, [allowedLanguage]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const langConfig = LANGUAGE_CONFIG[language];

    const extensions = [
      basicSetup,
      langConfig.language,
      customTheme,
      lintGutter(),
      langConfig.linter,
      keymap.of([
        ...defaultKeymap,
        indentWithTab
      ]),
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

    const view = new EditorView({
      doc: value || '',
      extensions,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [currentQuestionId, language]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    dispatch({
      type: 'SET_LANGUAGE',
      payload: { id: currentQuestionId, language: newLanguage }
    });
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
        allowedLanguage={allowedLanguage} 
      />
    </div>
  );
};

export default CodeEditor;