$file = $args[0]
$search = $args[1]
$content = [System.IO.File]::ReadAllText($file)
$idx = $content.IndexOf($search)
if ($idx -ge 0) {
    $s = [Math]::Max(0, $idx - 300)
    $e = [Math]::Min($content.Length, $idx + 300)
    Write-Output $content.Substring($s, $e - $s)
} else {
    Write-Output "NOT FOUND"
}
