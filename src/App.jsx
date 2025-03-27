import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleQuestionChange = (e) => setQuestion(e.target.value);
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  // Function to copy the output to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(output)
      .then(() => alert("Code copied to clipboard!"))
      .catch((error) => console.error("Failed to copy code:", error));
  };

  // Function to auto-resize the output textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [output]);

  const cleanOutput = (code) => {
    return code
      .replace(/```[a-zA-Z]*\n/g, "")   // Remove language tags like ```javascript
      .replace(/```/g, "")               // Remove remaining backticks
      .trim();
  };

  const handleGenerate = async () => {
    if (!question) {
      alert("Please enter a LeetCode question!");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

      const prompt = `
        Generate only the solution code in ${language} for the following LeetCode question.
        Do NOT include explanations, comments, or additional text. 
        Only return the raw code without backticks or language tags.

        LeetCode Question:
        ${question}
      `;

      const response = await axios.post(endpoint, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      const result =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

      const cleanedCode = cleanOutput(result);
      setOutput(cleanedCode);
    } catch (error) {
      console.error("Error:", error);
      setOutput("Failed to generate solution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="fade-in">LeetCode Solution Generator</h1>

        <div className="input-section">
          <textarea
            value={question}
            onChange={handleQuestionChange}
            placeholder="Enter LeetCode question here..."
            className="slide-in"
          />

          <select value={language} onChange={handleLanguageChange} className="dropdown">
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Go">Go</option>
            <option value="C#">C#</option>
          </select>

          <button onClick={handleGenerate} disabled={loading} className="btn">
            {loading ? "Generating..." : "Generate Solution"}
          </button>
        </div>

        {output && (
          <div className="output-section fade-in">
            <h2>Solution in {language}:</h2>

            <div className="code-output-container">
              <textarea
                ref={textareaRef}
                value={output}
                readOnly
                className="code-textarea no-scroll"
              />
              <button className="copy-btn" onClick={handleCopy}>Copy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
