const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

// Replace Groq payload 1 (vocab scanner)
html = html.replace(/temperature: 0\.1,\s*response_format: { type: "json_object" }\s*};/g, 'temperature: 0.1,\n                                      max_tokens: 4096,\n                                      response_format: { type: "json_object" }\n                                  };');

// Replace Groq payload 2 (split sentences)
html = html.replace(/temperature: 0\.2,\s*response_format: { type: "json_object" }\s*};/g, 'temperature: 0.2,\n                      max_tokens: 4096,\n                      response_format: { type: "json_object" }\n                  };');

// Replace Groq payload 3 (grammar feedback)
html = html.replace(/temperature: 0\.2\s*};/g, 'temperature: 0.2,\n                  max_tokens: 4096\n              };');

fs.writeFileSync('pga.html', html);
console.log('Successfully updated max_tokens in pga.html!');
