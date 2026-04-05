$emojis = @(
    "✂️", "💈", "🪒", "👤", "👑", "📊", "⏱", "✨", "📅", "🏆", "🚪", "🎉", "🎖️", 
    "⭐", "🧴", "🏠", "💬", "🕯️", "☕", "📱", "📧", "🎯", "👥", "💰", "📈", "🗓️", 
    "📝", "✅", "⛔", "⏳", "⚠️", "🧴", "❤️", "✓", "→"
)

Get-ChildItem -Path "c:\Haircut booking system\frontend" -Recurse -Include *.html, *.js, *.css | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding utf8
    foreach ($emoji in $emojis) {
        $content = $content.Replace($emoji, "")
    }
    # Also handle some character combinations or variations if needed
    # But for now, simple replace is most reliable for exact matches
    Set-Content $_.FullName $content -Encoding utf8
}

Write-Output "Emoji removal complete!"
