$html = [System.IO.File]::ReadAllText("index.html")

# 1. Tách CSS
$styleStart = $html.IndexOf("<style>")
if ($styleStart -ge 0) {
    $styleEnd = $html.IndexOf("</style>", $styleStart)
    if ($styleEnd -ge 0) {
        $css = $html.Substring($styleStart + 7, $styleEnd - $styleStart - 7).Trim()
        [System.IO.File]::WriteAllText("styles.css", $css)
        $html = $html.Substring(0, $styleStart) + "<link rel=`"stylesheet`" href=`"styles.css`">" + $html.Substring($styleEnd + 8)
        Write-Host "✅ Đã tách CSS sang file styles.css"
    }
}

# 2. Tách JS
$scriptStart = $html.LastIndexOf("<script>")
while ($scriptStart -ge 0) {
    $scriptEnd = $html.IndexOf("</script>", $scriptStart)
    if ($scriptEnd -ge 0) {
        $js = $html.Substring($scriptStart + 8, $scriptEnd - $scriptStart - 8)
        if ($js.Contains("let apiKey") -or $js.Contains("flatQuestions")) {
            [System.IO.File]::WriteAllText("main.js", $js.Trim())
            $html = $html.Substring(0, $scriptStart) + "<script src=`"main.js`"></script>" + $html.Substring($scriptEnd + 9)
            Write-Host "✅ Đã tách JS sang file main.js"
            break
        }
    }
    $scriptStart = $html.LastIndexOf("<script>", $scriptStart - 1)
}

[System.IO.File]::WriteAllText("index.html", $html)
Write-Host "✅ Đã cập nhật lại file index.html"
