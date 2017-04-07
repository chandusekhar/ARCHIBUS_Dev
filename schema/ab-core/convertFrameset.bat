@REM Convert 16.3 View or Directory to Yalta 5 Format
@REM  you may move this script & modify WEBINF_DIR & CURRENT_DIR to suit your directory structure
@REM  first arg is either '-verbose', or a file or directory name
@REM  second arg is either null or a file or directory name
@REM

echo off

:: top-level dir where archibus web-central code is installed
set ARCHIBUS_DIR=C:\Yalta

:: dir where archibus libs, logs, etc live
set WEBINF_DIR=%ARCHIBUS_DIR%\apps\archibus\WEB-INF


:: where archibus JDK, web server, etc. lives
set TOOLS_DIR=%ARCHIBUS_DIR%\tools

:: where archibus JDK, web server, etc. lives
set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\lib\crimson.jar;%WEBINF_DIR%\classes

:: string of input switches 
set options=

:: file or directory that should be converted. starting from current directory
set src=""



rem label a point we can return to using goto while processing input args
:startArgLoop
if "%1" == "" goto endArgs
rem echo the first command argument is: %1
rem pause
if "%1"=="-logVerbose"  (
    set options=%options% -logVerbose
    goto processedArg
)
if "%1"=="-noWrite"  (
    set options=%options%  -noWrite
    goto processedArg
)
if "%1"=="-reportBrief"  (
    set options=%options%  -reportBrief
    goto processedArg
)
if %src%=="" (
    set src=%1
    goto processedArg
)
echo Read unexpected input arg: %1
goto end
:processedArg
rem echo the options are: %options%
rem pause

shift
goto startArgLoop
:endArgs


:: if source file/dir arg has no value exit
if "%src%"=="" goto end

rem echo source directory or file is %src%
rem pause

 :: get current directpry to prepend to given source arg
 :: curdir.bat
@SET cd=
@SET promp$=%prompt%
@PROMPT SET cd$Q$P
@CALL>%temp%.\setdir.bat
@
% do not delete this line %
@ECHO off
PROMPT %promp$%
FOR %%c IN (CALL DEL) DO %%c %temp%.\setdir.bat
@rem ECHO. current directory=%cd%

rem echo classpath directory is %WEBINF_DIR%\classes

:: call the converter with the proper classpath, option and source args
::
%TOOLS_DIR%\jdk\bin\java  -cp %CLASSPATH_ARG% com.archibus.devtools.viewconverter.FramesetConverter %option% %cd%\%src% %WEBINF_DIR%\

:end
echo Done

