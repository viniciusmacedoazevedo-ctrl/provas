@echo off
chcp 65001 >nul
title Painel de apuracao - TSE ao vivo
cd /d "%~dp0"
rem Usa o Python se estiver instalado; senao usa o PowerShell (ja vem no Windows).
py -3 --version >nul 2>nul && (py -3 servidor.py & goto :fim)
python --version >nul 2>nul && (python servidor.py & goto :fim)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
:fim
pause
