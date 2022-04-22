echo off
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

if '%errorlevel%' NEQ '0' (
    echo Run as Administrator...
    goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
 
    "%temp%\getadmin.vbs"
    rem del "%temp%\getadmin.vbs"
    exit /B
:gotAdmin

	pushd "%CD%"
    CD /D "%~dp0"
	set HOME=%CD%
	goto startInstallation

:: only gets called when we have admin priviliges
:startInstallation
	echo Installing service
	:: Set your service name and its description here
	set SERVICE_NAME=ai-middleware
	set SERVICE_DESCRIPTION=diorco

	nssm stop %SERVICE_NAME%
	nssm remove %SERVICE_NAME% confirm

	:: replace with the absolute path where node.exe can be found 
	nssm install %SERVICE_NAME% "C:\Program Files\nodejs\node.exe"
	nssm set %SERVICE_NAME% Description "%SERVICE_DESCRIPTION%"
	nssm set %SERVICE_NAME% AppDirectory "%HOME%"

	:: replace index.js with the name of your script
	nssm set %SERVICE_NAME% AppParameters "index.js"

	:: optionally set the out.log and error.log paths which will be used for stdouts and sterr messages
	:: better use a logging framework like winston
	nssm set %SERVICE_NAME% AppStdout "%HOME%\out.log" 
	nssm set %SERVICE_NAME% AppStderr "%HOME%\error.log"

	:: Start the service
	nssm start %SERVICE_NAME%
	echo Successfully installed and started service %SERVICE_NAME%
	pause
