# Servidor local do painel de apuração para Windows sem Python (usa só o PowerShell).
# Serve o index.html e repassa os arquivos JSON do TSE em /tse?u=<url>.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$porta = 8765
$pasta = Split-Path -Parent $MyInvocation.MyCommand.Path
$hosts = @('resultados.tse.jus.br', 'resultados-sim.tse.jus.br')
Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$porta/")
$listener.Start()
Write-Host "Painel de apuração rodando em http://localhost:$porta/"
Write-Host 'Deixe esta janela aberta durante a apuração. Para encerrar, feche a janela.'
Start-Process "http://localhost:$porta/"

function Responder($ctx, [int]$codigo, [byte[]]$corpo, [string]$tipo) {
    $r = $ctx.Response
    $r.StatusCode = $codigo
    $r.ContentType = $tipo
    $r.Headers.Add('Cache-Control', 'no-store')
    $r.Headers.Add('X-Proxy-TSE', '1')
    $r.ContentLength64 = $corpo.Length
    $r.OutputStream.Write($corpo, 0, $corpo.Length)
    $r.OutputStream.Close()
}
function Texto($ctx, [int]$codigo, [string]$msg) {
    Responder $ctx $codigo ([Text.Encoding]::UTF8.GetBytes($msg)) 'text/plain; charset=utf-8'
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
        $caminho = $ctx.Request.Url.AbsolutePath
        if ($caminho -eq '/tse') {
            $url = [System.Web.HttpUtility]::ParseQueryString($ctx.Request.Url.Query).Get('u')
            $destino = $null
            if (-not [Uri]::TryCreate($url, [UriKind]::Absolute, [ref]$destino) -or $destino.Scheme -ne 'https' -or $hosts -notcontains $destino.Host) {
                Texto $ctx 400 'Endereço não permitido: use um arquivo de resultados.tse.jus.br'
                continue
            }
            $sep = if ($destino.Query) { '&' } else { '?' }
            $wc = New-Object System.Net.WebClient
            $wc.Headers.Add('User-Agent', 'Mozilla/5.0 painel-apuracao')
            $wc.Headers.Add('Cache-Control', 'no-cache')
            try {
                $bytes = $wc.DownloadData("$url$sep" + 't=' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
                Responder $ctx 200 $bytes 'application/json; charset=utf-8'
            } catch [System.Net.WebException] {
                $status = $null
                if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
                if ($status -eq 403 -or $status -eq 404) { Texto $ctx 502 'arquivo ainda não publicado pelo TSE (HTTP 404/403)' }
                elseif ($status) { Texto $ctx 502 "TSE respondeu HTTP $status" }
                else { Texto $ctx 502 ('sem conexão com o TSE (' + $_.Exception.Message + ')') }
            }
        } else {
            $arquivo = Join-Path $pasta 'index.html'
            if ($caminho -eq '/' -or $caminho -eq '/index.html') {
                Responder $ctx 200 ([IO.File]::ReadAllBytes($arquivo)) 'text/html; charset=utf-8'
            } else {
                Texto $ctx 404 'não encontrado'
            }
        }
    } catch {
        try { Texto $ctx 500 $_.Exception.Message } catch {}
    }
}
