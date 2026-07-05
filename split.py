import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Tách CSS
style_start = html.find('<style>')
if style_start != -1:
    style_end = html.find('</style>', style_start)
    if style_end != -1:
        css = html[style_start+7 : style_end].strip()
        with open('styles.css', 'w', encoding='utf-8') as f:
            f.write(css)
        html = html[:style_start] + '<link rel="stylesheet" href="styles.css">' + html[style_end+8:]
        print("✅ Đã tách CSS sang file styles.css")

# 2. Tách JS
script_start = html.rfind('<script>')
while script_start != -1:
    script_end = html.find('</script>', script_start)
    if script_end != -1:
        js = html[script_start+8 : script_end]
        if 'let apiKey' in js or 'flatQuestions' in js:
            with open('main.js', 'w', encoding='utf-8') as f:
                f.write(js.strip())
            html = html[:script_start] + '<script src="main.js"></script>' + html[script_end+9:]
            print("✅ Đã tách JS sang file main.js")
            break
    script_start = html.rfind('<script>', 0, script_start)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ Đã cập nhật lại file index.html")
