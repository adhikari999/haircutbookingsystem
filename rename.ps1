Get-ChildItem 'c:\Haircut booking system\frontend' -Recurse -Include '*.html','*.js','*.css' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $content = $content -replace 'SharpCuts', 'EasyCut'
        $content = $content -replace 'Sharp<span>Cuts</span>', 'Easy<span>Cut</span>'
        $content = $content -replace 'Sharp\r?\n\s*<span>Cuts</span>', 'Easy<span>Cut</span>'
        $content = $content -replace '\$([0-9])', 'Rs $1'
        Set-Content $_.FullName $content -NoNewline
    }
}
Write-Host "Done!"
