const fs = require('fs');
let indexContent = fs.readFileSync('index.html', 'utf8');

// Find the end of the new modal (we know it's a valid structure)
const garbageStartString = '<span class="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors"><i class="fa-solid fa-sitemap mr-1"></i>';
const garbageStartIndex = indexContent.indexOf(garbageStartString);

if (garbageStartIndex !== -1) {
    const bodyTagIndex = indexContent.indexOf('</body>', garbageStartIndex);
    
    if (bodyTagIndex !== -1) {
        // We will remove everything from right before the garbage up to </body>
        // But wait, there might be spaces/newlines before <span.
        // Let's just find the last </div> before garbageStartIndex, actually it's easier to just find the exact string.
        
        let beforeGarbage = indexContent.substring(0, garbageStartIndex);
        let afterGarbage = indexContent.substring(bodyTagIndex);
        
        // Remove the dangling `</label>` or whitespaces if they exist before garbageStartIndex
        // Let's just strip trailing whitespace from beforeGarbage
        beforeGarbage = beforeGarbage.trimRight();
        
        indexContent = beforeGarbage + '\n' + afterGarbage;
        fs.writeFileSync('index.html', indexContent);
        console.log("Successfully removed the garbage code from the bottom of index.html!");
    } else {
        console.log("Could not find </body>");
    }
} else {
    console.log("Could not find the garbage start string.");
}
