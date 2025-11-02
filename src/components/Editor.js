import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

// Language mapping for Judge0 and CodeMirror
const LANGUAGES = [
    { name: 'JavaScript', id: 63, mode: { name: 'javascript', json: true } },
    { name: 'Python', id: 71, mode: 'python' },
    { name: 'C', id: 50, mode: 'text/x-csrc' },
    { name: 'C++', id: 54, mode: 'text/x-c++src' },
    { name: 'Java', id: 62, mode: 'text/x-java' },
];

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_API_HEADERS = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.REACT_APP_JUDGE0_API_KEY || '', // Get API key from environment variable
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: language.mode,
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    // Update CodeMirror mode when language changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setOption('mode', language.mode);
        }
    }, [language]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    const runCode = async () => {
        setIsRunning(true);
        const userCode = editorRef.current.getValue();
        setOutput('Running...');
        
        if (language.name === 'JavaScript') {
            try {
                const logs = [];
                const log = console.log;
                console.log = (...args) => logs.push(args.join(' '));
                eval(userCode); // Not safe for production!
                console.log = log; // Restore
                setOutput(logs.join('\n') || 'Code executed successfully');
            } catch (err) {
                setOutput(`Error: ${err.message}`);
            }
        } else {
            // Use Judge0 API
            if (!process.env.REACT_APP_JUDGE0_API_KEY) {
                setOutput('Error: Judge0 API key not configured. Please set REACT_APP_JUDGE0_API_KEY environment variable.');
                setIsRunning(false);
                return;
            }
            try {
                const response = await fetch(JUDGE0_API_URL, {
                    method: 'POST',
                    headers: JUDGE0_API_HEADERS,
                    body: JSON.stringify({
                        source_code: userCode,
                        language_id: language.id,
                    }),
                });
                const data = await response.json();
                if (data.stderr) {
                    setOutput(data.stderr);
                } else if (data.compile_output) {
                    setOutput(data.compile_output);
                } else {
                    setOutput(data.stdout || 'No output');
                }
            } catch (err) {
                setOutput(`Error connecting to Judge0 API: ${err.message}`);
            }
        }
        setIsRunning(false);
    };

    const clearOutput = () => {
        setOutput('');
    };

    const copyCode = async () => {
        try {
            const code = editorRef.current.getValue();
            await navigator.clipboard.writeText(code);
            setOutput('Code copied to clipboard!');
        } catch (err) {
            setOutput('Failed to copy code');
        }
    };

    return (
        <div className="editorContainer">
            {/* Editor Controls Header */}
            <div className="editor-controls-header">
                <div className="language-selector">
                    <label htmlFor="language-select">Language: </label>
                    <select
                        id="language-select"
                        className="language-dropdown"
                        value={language.name}
                        onChange={e => {
                            const lang = LANGUAGES.find(l => l.name === e.target.value);
                            setLanguage(lang);
                        }}
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.name}>
                                {lang.icon} {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="editor-actions">
                    <button 
                        className="btn btn-run" 
                        onClick={runCode}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button onClick={clearOutput} className="btn btn-clear">
                         Clear Output
                    </button>
                    <button onClick={copyCode} className="btn btn-copy">
                        Copy Code
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="code-section">
                <div className="section-header">
                    <h3> Code Editor</h3>
                </div>
                <textarea id="realtimeEditor"></textarea>
            </div>

            {/* Output Display */}
            <div className="output-section">
                <div className="section-header">
                    <h3> Output</h3>
                </div>
                <div className="output-display">
                    <pre>{output || 'Your output will appear here...'}</pre>
                </div>
            </div>
        </div>
    );
};

export default Editor;
