@echo off
chcp 65001 >nul
title Painel de apuracao - TSE ao vivo
rem Baixa a versao mais recente do painel do GitHub, instala em Documentos e abre.
rem Pode rodar de novo a qualquer momento para atualizar.
set "DEST=%USERPROFILE%\Documents\painel-apuracao"
echo.
echo  Baixando a versao mais recente do painel de apuracao...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $z=Join-Path $env:TEMP 'painel-apuracao.zip'; $t=Join-Path $env:TEMP 'painel-apuracao-x'; Invoke-WebRequest -UseBasicParsing 'https://github.com/viniciusmacedoazevedo-ctrl/provas/archive/refs/heads/main.zip' -OutFile $z; if (Test-Path $t) { Remove-Item $t -Recurse -Force }; Expand-Archive -Path $z -DestinationPath $t -Force; $src=Join-Path $t 'provas-main\apuracao-2turno'; New-Item -ItemType Directory -Force -Path '%DEST%' | Out-Null; Copy-Item -Path (Join-Path $src '*') -Destination '%DEST%' -Recurse -Force"
if errorlevel 1 (
  echo.
  echo  Nao consegui baixar o painel. Confira a internet e tente de novo.
  pause
  exit /b 1
)
echo  Painel instalado em %DEST%
echo  Abrindo... deixe esta janela aberta durante a apuracao.
echo.
call "%DEST%\painel-ao-vivo\iniciar-windows.bat"
