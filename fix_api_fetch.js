const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const regex = /const selectedModel = document\.getElementById\('aiModelSelect'\)\.value \|\| "gemini-2\.5-flash";\s+const url = `https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/\$\{selectedModel\}:generateContent\?key=\$\{apiKey\}`;/g;

let matchCount = 0;
content = content.replace(regex, (match) => {
    matchCount++;
    return `const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
            const isGroq = !selectedModel.includes('gemini');
            const url = isGroq 
                ? 'https://api.groq.com/openai/v1/chat/completions' 
                : \`https://generativelanguage.googleapis.com/v1beta/models/\${selectedModel}:generateContent?key=\${apiKey}\`;`;
});

// Now we need to update the payload and fetch call for toggleWritingMode
const toggleWritingPayloadRegex = /const payload = {\s+contents: \[\{ parts: \[\{ text: prompt \}\] \}\],\s+generationConfig: {\s+temperature: 0\.2,\s+responseMimeType: "application\/json"\s+}\s+};\s+const response = await fetch\(url, {\s+method: "POST",\s+headers: \{ "Content-Type": "application\/json" \},\s+body: JSON\.stringify\(payload\)\s+}\);\s+if \(!response\.ok\) throw new Error\("Lỗi kết nối đến Gemini API\."\);\s+const data = await response\.json\(\);\s+let jsonStr = data\.candidates\[0\]\.content\.parts\[0\]\.text;/;

content = content.replace(toggleWritingPayloadRegex, `let payload, response, data, jsonStr;
            
            if (isGroq) {
                payload = {
                    model: selectedModel,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                    response_format: { type: "json_object" }
                };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${apiKey}\` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Groq API"); }
                data = await response.json();
                jsonStr = data.choices[0].message.content;
            } else {
                payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: "application/json"
                    }
                };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Gemini API"); }
                data = await response.json();
                jsonStr = data.candidates[0].content.parts[0].text;
            }`);

// Now update the payload for submitPgaGrammarWriting
const submitWritingPayloadRegex = /const payload = {\s+contents: \[\{ parts: \[\{ text: userPrompt \}\] \}\],\s+systemInstruction: \{ parts: \[\{ text: systemPrompt \}\] \},\s+generationConfig: \{ temperature: 0\.2 \}\s+};\s+const response = await fetch\(url, {\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(payload\)\s+}\);\s+if \(!response\.ok\) throw new Error\("API Error"\);\s+const data = await response\.json\(\);\s+let feedbackHtml = data\.candidates\[0\]\.content\.parts\[0\]\.text;/;

content = content.replace(submitWritingPayloadRegex, `let payload, response, data, feedbackHtml;

        if (isGroq) {
            payload = {
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2
            };
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${apiKey}\` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi Groq API"); }
            data = await response.json();
            feedbackHtml = data.choices[0].message.content;
        } else {
            payload = {
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.2 }
            };
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi Gemini API"); }
            data = await response.json();
            feedbackHtml = data.candidates[0].content.parts[0].text;
        }`);

fs.writeFileSync('pga.html', content);
console.log("Updated API fetching logic for both APIs!");
