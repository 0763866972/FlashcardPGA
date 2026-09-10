const fs = require('fs');

// Update pga.html
let pgaHtml = fs.readFileSync('pga.html', 'utf8');
const pgaTarget = `<option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>`;
const pgaReplacement = `<option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>\n                      <option value="meta-llama/llama-prompt-guard-2-86m">Llama Prompt Guard 86M</option>`;

if (pgaHtml.includes(pgaTarget)) {
    pgaHtml = pgaHtml.replace(pgaTarget, pgaReplacement);
    fs.writeFileSync('pga.html', pgaHtml);
    console.log('Added Prompt Guard to pga.html');
}

// Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
const indexTarget = `<option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>`;
const indexReplacement = `<option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>\n                  <option value="meta-llama/llama-prompt-guard-2-86m">Llama Prompt Guard 86M</option>`;

if (indexHtml.includes(indexTarget)) {
    indexHtml = indexHtml.replace(indexTarget, indexReplacement);
    fs.writeFileSync('index.html', indexHtml);
    console.log('Added Prompt Guard to index.html');
}

