<?php
/*
 * Repasse dos arquivos de resultado do TSE para o painel (versão para hospedagem com PHP / cPanel).
 * Uso pelo painel: tse.php?u=<url de resultados.tse.jus.br>
 *
 * - Só aceita arquivos .json dos servidores de resultados do TSE (não vira proxy aberto).
 * - Guarda cada arquivo por CACHE_SEGUNDOS: com muitos visitantes, o site consulta o TSE
 *   no máximo uma vez por arquivo nesse intervalo.
 */
const CACHE_SEGUNDOS = 15;
const HOSTS_PERMITIDOS = ['resultados.tse.jus.br', 'resultados-sim.tse.jus.br'];

header('X-Proxy-TSE: 1');
header('Cache-Control: no-store');

function responder(int $codigo, string $corpo, string $tipo = 'text/plain; charset=utf-8'): void {
    http_response_code($codigo);
    header('Content-Type: ' . $tipo);
    echo $corpo;
    exit;
}

$url = isset($_GET['u']) ? (string)$_GET['u'] : '';
$p = parse_url($url);
if (!$p || ($p['scheme'] ?? '') !== 'https' || !in_array($p['host'] ?? '', HOSTS_PERMITIDOS, true)
    || !preg_match('#^/[A-Za-z0-9/_.-]+\.json$#', $p['path'] ?? '') || isset($p['user']) || isset($p['port'])) {
    responder(400, 'Endereço não permitido: use um arquivo .json de resultados.tse.jus.br');
}
$url = 'https://' . $p['host'] . $p['path']; // descarta query e fragmento recebidos

$pasta = __DIR__ . '/cache';
if (!is_dir($pasta)) { @mkdir($pasta, 0755, true); }
$arq = $pasta . '/' . sha1($url) . '.json';

if (is_file($arq) && time() - filemtime($arq) < CACHE_SEGUNDOS) {
    responder(200, file_get_contents($arq), 'application/json; charset=utf-8');
}

// trava por arquivo: só um visitante busca no TSE; os outros esperam e usam o resultado
$trava = fopen($arq . '.lock', 'c');
if ($trava) { flock($trava, LOCK_EX); }
if (is_file($arq) && time() - filemtime($arq) < CACHE_SEGUNDOS) {
    responder(200, file_get_contents($arq), 'application/json; charset=utf-8');
}

function baixar(string $url): array {
    $alvo = $url . '?t=' . round(microtime(true) * 1000);
    if (function_exists('curl_init')) {
        $c = curl_init($alvo);
        curl_setopt_array($c, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 20,
            CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_ENCODING => '',
            CURLOPT_HTTPHEADER => ['Cache-Control: no-cache', 'User-Agent: Mozilla/5.0 painel-apuracao'],
        ]);
        $corpo = curl_exec($c);
        $status = (int)curl_getinfo($c, CURLINFO_HTTP_CODE);
        $erro = curl_error($c);
        curl_close($c);
        return [$status, $corpo === false ? '' : $corpo, $erro];
    }
    $ctx = stream_context_create(['http' => ['timeout' => 20, 'ignore_errors' => true,
        'header' => "Cache-Control: no-cache\r\nUser-Agent: Mozilla/5.0 painel-apuracao\r\n"]]);
    $corpo = @file_get_contents($alvo, false, $ctx);
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d+)#', $h, $m)) { $status = (int)$m[1]; }
    }
    return [$status, $corpo === false ? '' : $corpo, $corpo === false ? 'falha de conexão' : ''];
}

[$status, $corpo, $erro] = baixar($url);
if ($status === 200 && json_decode($corpo) !== null) {
    file_put_contents($arq . '.tmp', $corpo);
    rename($arq . '.tmp', $arq);
    responder(200, $corpo, 'application/json; charset=utf-8');
}
// TSE fora do ar ou lento: entrega a última cópia boa, se houver
if (is_file($arq)) {
    responder(200, file_get_contents($arq), 'application/json; charset=utf-8');
}
if ($status === 403 || $status === 404) {
    responder(502, 'arquivo ainda não publicado pelo TSE (HTTP ' . $status . ')');
}
responder(502, $status ? "TSE respondeu HTTP $status" : "sem conexão com o TSE ($erro)");
