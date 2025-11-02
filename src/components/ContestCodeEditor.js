import React, { useState, useEffect } from 'react';
import './ContestCodeEditor.css';

const ContestCodeEditor = ({ code, onChange, language, height = '300px' }) => {
    const [localCode, setLocalCode] = useState(code || '');

    useEffect(() => {
        setLocalCode(code || '');
    }, [code]);

    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setLocalCode(newCode);
        onChange(newCode);
    };

    const getLanguageTemplate = (lang) => {
        const templates = {
            python: `# Python Solution
def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()`,
            
            java: `// Java Solution
import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Write your solution here
        
        sc.close();
    }
}`,
            
            cpp: `// C++ Solution
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
            
            javascript: `// JavaScript Solution
function solve() {
    // Write your solution here
}

// Read input and call solve
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    solve();
    rl.close();
});`
        };
        
        return templates[lang] || templates.python;
    };

    const insertTemplate = () => {
        const template = getLanguageTemplate(language);
        setLocalCode(template);
        onChange(template);
    };

    const clearCode = () => {
        setLocalCode('');
        onChange('');
    };

    const getLanguageDisplayName = (lang) => {
        const names = {
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            javascript: 'JavaScript'
        };
        return names[lang] || lang;
    };

    const getLineNumbers = () => {
        const lines = localCode.split('\n');
        return lines.map((_, index) => index + 1);
    };

    return (
        <div className="contest-code-editor" style={{ height }}>
            <div className="editor-header">
                <div className="editor-info">
                    <span className="language-badge">
                        {getLanguageDisplayName(language)}
                    </span>
                    <span className="line-count">
                        {localCode.split('\n').length} lines
                    </span>
                </div>
                <div className="editor-actions">
                    <button 
                        className="btn-template"
                        onClick={insertTemplate}
                        title="Insert template"
                    >
                        📝 Template
                    </button>
                    <button 
                        className="btn-clear"
                        onClick={clearCode}
                        title="Clear code"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>
            
            <div className="editor-container">
                <div className="line-numbers">
                    {getLineNumbers().map(lineNum => (
                        <div key={lineNum} className="line-number">
                            {lineNum}
                        </div>
                    ))}
                </div>
                
                <div className="code-area">
                    <textarea
                        value={localCode}
                        onChange={handleCodeChange}
                        className="code-textarea"
                        placeholder={`Write your ${getLanguageDisplayName(language)} solution here...`}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                    />
                </div>
            </div>
            
            <div className="editor-footer">
                <div className="editor-stats">
                    <span>Characters: {localCode.length}</span>
                    <span>Words: {localCode.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
                <div className="editor-tips">
                    <span>💡 Tip: Use Ctrl+A to select all, Tab for indentation</span>
                </div>
            </div>
        </div>
    );
};

export default ContestCodeEditor;
