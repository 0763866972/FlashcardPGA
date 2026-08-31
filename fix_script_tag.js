const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// The file has a literal backslash followed by n followed by </script>
// which is represented in js string as '\\n</script>'
const badString = '\\n</script>';
const goodString = '\n</script>';

if (content.includes(badString)) {
    content = content.replace(badString, goodString);
    fs.writeFileSync('pga.html', content);
    console.log("Fixed the syntax error!");
} else {
    console.log("Not found.");
}
