param([switch] $RestartApi)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $project '.local'
$envFile = Join-Path $runtime 'app.env'
$mysqlConfig = Join-Path $runtime 'mysql.ini'
$mysql = Join-Path $runtime 'mysql-8.4.13-winx64/bin/mysqld.exe'
$python = Join-Path $project '.venv/Scripts/python.exe'
$consoleUrl = 'http://127.0.0.1:18000/'

foreach ($file in @($envFile, $mysqlConfig, $mysql, $python)) {
    if (!(Test-Path -LiteralPath $file)) { throw "Missing local development file: $file" }
}

foreach ($file in @((Join-Path $project '.env'), $envFile)) {
    if (!(Test-Path -LiteralPath $file)) { continue }
    foreach ($line in Get-Content -LiteralPath $file -Encoding utf8) {
        if ($line -notmatch '^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$') { continue }
        $name = $Matches[1]
        $value = $Matches[2]
        if ($value.Length -ge 2 -and $value[0] -eq $value[-1] -and ($value[0] -eq '"' -or $value[0] -eq "'")) {
            $value = $value.Substring(1, $value.Length - 2)
        } else {
            $value = $value -replace '\s+#.*$', ''
        }
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Test-Listening([int] $Port) {
    $connection = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection.Connect('127.0.0.1', $Port)
        return $true
    } catch [System.Net.Sockets.SocketException] {
        return $false
    } finally {
        $connection.Dispose()
    }
}

if (!(Test-Listening 13306)) {
    Start-Process -FilePath $mysql -WindowStyle Hidden -ArgumentList "--defaults-file=`"$mysqlConfig`""
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if (Test-Listening 13306) { break }
        Start-Sleep -Milliseconds 500
    }
}
if (!(Test-Listening 13306)) { throw 'MySQL did not start. See .local/mysql-error.log.' }

if (Test-Listening 18000) {
    $health = Invoke-RestMethod "${consoleUrl}health" -TimeoutSec 3
    if ($health.service -ne 'voken-dataservice') { throw 'Port 18000 is already used by another service.' }
    if (!$RestartApi) {
        Write-Output $consoleUrl
        return
    }

    $listener = Get-NetTCPConnection -State Listen -LocalAddress '127.0.0.1' -LocalPort 18000
    $apiProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    if ($apiProcess.CommandLine -notmatch 'uvicorn\s+app\.main:app\b') { throw 'Cannot verify the local API process.' }
    Stop-Process -Id $listener.OwningProcess -ErrorAction Stop
    for ($attempt = 0; $attempt -lt 20 -and (Test-Listening 18000); $attempt++) {
        Start-Sleep -Milliseconds 250
    }
    if (Test-Listening 18000) { throw 'Previous API process is still listening.' }
}

Push-Location $project
try {
    & $python -B -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }
} finally {
    Pop-Location
}

$server = Start-Process -FilePath $python -WindowStyle Hidden -WorkingDirectory $project -PassThru `
    -ArgumentList @('-B', '-m', 'uvicorn', 'app.main:app', '--workers', '1', '--host', '127.0.0.1', '--port', '18000') `
    -RedirectStandardOutput (Join-Path $runtime 'api.out.log') `
    -RedirectStandardError (Join-Path $runtime 'api.err.log')
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if ($server.HasExited) { break }
    try {
        $health = Invoke-RestMethod "${consoleUrl}health" -TimeoutSec 2
        if ($health.service -eq 'voken-dataservice') {
            Write-Output $consoleUrl
            return
        }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}
throw 'FastAPI did not start. See .local/api.err.log.'
