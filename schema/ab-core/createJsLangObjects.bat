@REM Create JavaScript class representations of the JavaScript control .lang files schema\ab-core\lang\ui-control-xx_XX.lang where xx_XX is the locale (e.g., fr_CA)
@REM  This utility takes .lang files made by the translators and turns them into JavaScript files used in rendering
@REM  
@REM  usage: createJsLangObjects [langFileDirectory] [locale]
@REM	the optional arg langFileDirectory defaults to C:\Yalta\apps\archibus\schema\ab-core\lang
@REM	the optional arg locale defaults to produce all locales for which a lang file exists in the lang file directory
@REM   
@REM  
@REM  fileOrDirectory : an optional JavaScript file or directory specifying the location of the lang files schema-xx.lang, core-xx.lang and ui-control-xx_XX.lang
@REM	If this argument is null it is assumed that the lang files are located in C:\Yalta\apps\archibus\schema\ab-core\lang
@REM	Use an absolute path for this argument. 
@REM	For example, from D:\Yalta_5\apps\archibus\schema\ab-core
@REM		D:\Yalta_5\apps\archibus\schema\ab-core> createJsLangObjects D:\Yalta_5\apps\archibus\schema\ab-core\lang
@REM  
@REM    After reading the lang files, the constructed JavaScript file is written to fileOrDirectory\..\controls\lang\ui-controls-lang-xx_XX.js
@REM  
@REM  locale : an optional locale specifying the single target locale for the JavaScript file. 
@REM	Any other lang files in \schema\ab-core\lang are ignored and if the locale's lang file can be found, only one JavaScript file will be written to fileOrDirectory\..\controls\lang
@REM	If this arg is null all lang files of the form ui-control-xx_XX.lang are compiled into JS files
@REM  
@REM  
@REM  
@REM  you may move this script & modify the local vars ARCHIBUS_DIR & WEBINF_DIR below to suit your directory structure
@REM
@REM

echo off

:: top-level dir where archibus web-central code is installed
set ARCHIBUS_DIR=C:\Yalta

:: dir where archibus libs, logs, etc live
set WEBINF_DIR=%ARCHIBUS_DIR%\apps\archibus\WEB-INF

:: where archibus JDK, web server, etc. lives
set TOOLS_DIR=%ARCHIBUS_DIR%\tools

:: where archibus JDK, web server, etc. lives
set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\lib\crimson.jar;%WEBINF_DIR%\classes;%WEBINF_DIR%\lib\archibus.jar

:: holders for the input args
set arg_0=""
set arg_1=""

rem label a point we can return to using goto while processing input args
:startArgLoop
if "%1" == "" goto endArgs
rem echo the first command argument is: %1
rem pause
if %arg_0%=="" (
    set arg_0=%1
    goto processedArg
)
if %arg_1%=="" (
    set arg_1=%1
    goto processedArg
)
echo Read unexpected input arg: %1
echo usage: jsLangObjects [langFileDirectory] [locale]
goto end
:processedArg
rem echo the options are: %options%
rem pause

shift
goto startArgLoop
:endArgs

rem echo source directory or file is %src%
rem pause


rem echo classpath directory is %WEBINF_DIR%\classes

:: call the converter with the proper classpath, option and source args
::
%TOOLS_DIR%\jdk\bin\java  -cp %CLASSPATH_ARG% com.archibus.devtools.localization.LangFileJsCompiler %arg_0% %arg_1%

:end
echo Done
