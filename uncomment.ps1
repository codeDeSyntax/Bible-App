$content = Get-Content 'electron\main\projectionManager.ts' -Raw
$content = $content -replace '(?m)^// ', ''
$content | Set-Content 'electron\main\projectionManager.ts' -NoNewline
Write-Host "File uncommented successfully!"
