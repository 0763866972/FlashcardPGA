const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const target = "            const newCacheKey = ${w.word.toLowerCase()}__fc_ + getContextCacheSuffix();\r\n            const fallbackCacheKey = ${w.word.toLowerCase()}__medium;\r\n            const oldCacheKey = ${w.word.toLowerCase()}_medium;\r\n\r\n            let cacheEntry = aiCache[newCacheKey] || aiCache[fallbackCacheKey] || aiCache[oldCacheKey];\r\n            if (!cacheEntry) {\r\n                const legacyNewCacheKey = ${w.word.toLowerCase()}_;\r\n                const legacyOldCacheKey = w.word.toLowerCase();\r\n                cacheEntry = aiCache[legacyNewCacheKey] || aiCache[legacyOldCacheKey];\r\n            }";

const replacement = "            const baseKey = ${w.word.toLowerCase()}_;\r\n            const newCacheKey = ${baseKey}_fc_ + getContextCacheSuffix();\r\n            \r\n            let cacheEntry = aiCache[newCacheKey];\r\n            \r\n            if (!cacheEntry) {\r\n                const allKeys = Object.keys(aiCache);\r\n                const matchingKey = allKeys.find(k => k.startsWith(baseKey + '_')) || allKeys.find(k => k === baseKey) || allKeys.find(k => k.startsWith(w.word.toLowerCase() + '_')) || allKeys.find(k => k === w.word.toLowerCase());\r\n                if (matchingKey) {\r\n                    cacheEntry = aiCache[matchingKey];\r\n                }\r\n            }";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log("Replaced successfully in main.js");
} else {
    console.log("Target not found. Let's try flexible replace.");
    // Flexible regex replace
    const regex = /const newCacheKey = \$\{w\.word\.toLowerCase\(\)\}_\$\{w\.meaning\.toLowerCase\(\)\.replace\(\/\\s\+\/g, ''\)\}_fc_\$\{fcAiLength\} \+ getContextCacheSuffix\(\);\s+const fallbackCacheKey = [^;]+;\s+const oldCacheKey = [^;]+;\s+let cacheEntry = aiCache\[newCacheKey\] \|\| aiCache\[fallbackCacheKey\] \|\| aiCache\[oldCacheKey\];\s+if \(!cacheEntry\) \{\s+const legacyNewCacheKey = [^;]+;\s+const legacyOldCacheKey = [^;]+;\s+cacheEntry = aiCache\[legacyNewCacheKey\] \|\| aiCache\[legacyOldCacheKey\];\s+\}/;
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        console.log("Regex replaced successfully.");
    } else {
        console.log("Regex failed too.");
    }
}

fs.writeFileSync('main.js', content, 'utf8');
