const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

const target = `<option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                    <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>`;

const replacement = `<option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
                    <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('pga.html', html);
    console.log('Successfully updated the dropdown in pga.html!');
} else {
    // try a more generic replacement
    const regex = /<option value="gemini-3\.1-flash-lite">Gemini 3\.1 Flash Lite<\/option>\s*<option value="openai\/gpt-oss-120b">GPT-OSS 120B \(Groq\)<\/option>/;
    if (html.match(regex)) {
        html = html.replace(regex, `<option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>\n                    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>\n                    <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>`);
        fs.writeFileSync('pga.html', html);
        console.log('Successfully updated the dropdown in pga.html using Regex!');
    } else {
        console.log('Could not find the target block in pga.html.');
    }
}
