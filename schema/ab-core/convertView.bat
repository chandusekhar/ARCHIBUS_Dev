@REM Convert 16.3 View or Directory to Yalta 5 Format
@REM  
@REM  usage convertView [-logVerbose] [-reportBrief] [-noWrite]  [-passJS] fileOrDirectory [WEB_INF_DIR] 
@REM  
@REM  you may move this script & modify the local vars WEBINF_DIR & CURRENT_DIR below to suit your directory structure
@REM  you must uncomment the appropriate CLASSPATH_ARG if you use a distribution jar
@REM  
@REM  
@REM  
@REM  During conversion, an internal XML document logs the status at many points of the conversion. 
@REM	The optional switches -logVerbose & -reportBrief control how much 
@REM	of that report is written to stdOut and WEB_INF\log\conversion.log, respectively
@REM  
@REM  [-logVerbose] : default is to write in a brief manner to stdOut. Use this switch to produce more details to the console.
@REM  
@REM  [-reportBrief] : default is to write in a verbose manner to the conversion report file. 
@REM	Use this switch to produce less detail to WEB_INF\log\conversion.log.
@REM  
@REM  [-noWrite] : default is to write the converted view to disk if the conversion succeeds, backing up the original view, 'foo.axvw', to 'foo.bak'. 
@REM	Use this switch to prevent writing the converted view while producing the requested reports.
@REM  
@REM  [-passJS] : default is to fail conversion when view includes a JavaScript file since the JavaScript requires manual conversion.
@REM	Use this switch to allow the conversion to succeed even when the view includes a JavaScript file so that you can convert it manually 
@REM	and test the JavaScript with a V2 view
@REM  
@REM  fileOrDirectory : the view or directory to be converted. If this argument ends in '.axvw' only that single view will be converted. 
@REM	Otherwise its assumed that the arg is a directory and all views in the directory plus all subdirectories will be converted.
@REM	Use a relative path for this argument. 
@REM	For example, from C:\Yalta\apps\archibus\schema\ab-products\workplace to convert the assets app
@REM		C:\Yalta\apps\archibus\schema\ab-products\workplace> viewConverter -logVerbose assets
@REM	From C:\Yalta\apps\archibus\schema\ab-products\workplace to convert one of assets app's view
@REM		C:\Yalta\apps\archibus\schema\ab-products\workplace> viewConverter -logVerbose assets\ab-eq-edit.axvw
@REM  
@REM  [WEB_INF_DIR] : If your current directory structure does not place the Java libraries at C:\Yalta\apps\archibus\WEB-INF\lib, 
@REM	the log file at C:\Yalta\apps\archibus\WEB-INF\log and the application classes at C:\Yalta\apps\archibus\WEB-INF\classes, 
@REM	use this arg, or modify the local var below, to correct this path argument
@REM  
@REM  The log file is written to %WEBINF_DIR%\log\conversion.log
@REM  
@REM  switches ([-logVerbose] [-reportBrief] [-noWrite]  [-passJS]) are optional
@REM  second arg (WEB_INF_DIR) is either null or a file or directory name
@REM
@REM	The bat file 'setPath.bat' in this directory can be used to add this directory to your PATH environment variable 
@REM	so that this bat file can be called from other directories
@REM

echo off

:: top-level dir where archibus web-central code is installed
set ARCHIBUS_DIR=C:\Yalta

:: dir where archibus libs, logs, etc live
set WEBINF_DIR=%ARCHIBUS_DIR%\apps\archibus\WEB-INF


:: where archibus JDK, web server, etc. lives
set TOOLS_DIR=%ARCHIBUS_DIR%\tools

:: where archibus JDK, web server, etc. lives
:: uncomment the set statement below depending on whether you build your own classes or use the distribution archibus.jar
set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\lib\crimson.jar;%WEBINF_DIR%\classes
@REM set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\lib\crimson.jar;%WEBINF_DIR%\lib\archibus.jar

:: string of input switches 
set options=

:: file or directory that should be converted. starting from current directory
set src=""


@REM label a point we can return to using goto while processing input args
:startArgLoop
if "%1" == "" goto endArgs
@REM echo the first command argument is: %1
@REM echo the source argument is: %src%
@REM pause
if "%1"=="-logVerbose"  (
    set options=%options% -logVerbose
    goto processedArg
)
if "%1"=="-noWrite"  (
    set options=%options% -noWrite
    goto processedArg
)
if "%1"=="-reportBrief"  (
    set options=%options% -reportBrief
    goto processedArg
)
if "%1"=="-passJS"  (
    set options=%options% -passJS
    goto processedArg
)
if %src%=="" (
    set src=%1
    goto processedArg
)
echo Read unexpected input arg: %1
goto end
:processedArg
@REM echo the options are: %options%
@REM pause

shift
goto startArgLoop
:endArgs


:: if source file/dir arg has no value exit
if %src%=="" (
    echo No conversion target
    goto end
)

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
ECHO. current directory=%cd%

rem echo classpath directory is %WEBINF_DIR%\classes

:: call the converter with the proper classpath, option and source args
::
%TOOLS_DIR%\jdk\bin\java  -cp %CLASSPATH_ARG% com.archibus.devtools.viewconverter.ViewConverter %options% %cd%\%src% %WEBINF_DIR%\

:end
echo Done
