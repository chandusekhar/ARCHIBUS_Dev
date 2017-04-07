@REM Create a template lang file for localization of display strings in JavaScript controls
@REM  The template file is for translators to copy and create locale-specific .lang 
@REM  
@REM  usage: createLangTemplate  [fileOrDirectory]
@REM	the optional arg defaults to C:\Yalta\apps\archibus\schema\ab-core\controls
@REM  
@REM  
@REM  fileOrDirectory : an optional JavaScript file or directory targeted for string extraction. 
@REM	If this arg is null, it is assumed that the JavaScript control files are located below C:\Yalta\apps\archibus\schema\ab-core\controls and all JS files will be searched.
@REM	if the arg is not null, the resulting lang file will contain only strings from this file or directory - any existing ui-control.lang file will be backed up to ui-control_lang.bak
@REM	If this argument ends in '.js' only the strings in that single file will be extracted. 
@REM	Otherwise it is assumed that the arg is a directory and all javaScript files in the directory plus all subdirectories will be read.
@REM	Use an absolute path for this argument. 
@REM	For example, from C:\Yalta\apps\archibus\schema\ab-core to collect all the strings in the JS files below ab-core\controls\grid 
@REM		C:\Yalta\apps\archibus\schema\ab-core> createLangTemplate C:\Yalta\apps\archibus\schema\ab-core\controls\grid 
@REM  
@REM	If this argument is not null, it is used to deduce the controls' directory path and uses this path to decide where to place the produced lang file.
@REM    After reading the JavaScript files, the constructed internal XML document is written to archibus\schema\ab-core\lang\ui-control.lang
@REM  
@REM  
@REM  The utility reads through a set of JavaScript files searching for blocks of localizable display strings delimited by a pair of comments
@REM  // @begin_translatable & // @begin_translatable.
@REM  
@REM  For example, in ab-miniconsole.js you will find four strings declared between the comments
@REM	// @begin_translatable
@REM	z_TITLE_CLEAR: 'Clear',
@REM	z_TITLE_FILTER: 'Filter',
@REM	z_TOOLTIP_COLLAPSE: 'Collapse',
@REM	z_TOOLTIP_EXPAND: 'Expand'
@REM	// @end_translatable
@REM
@REM  The strings declared in each such block are added to a lang file for use by translators constructing lang files for localization to specific languages
@REM
@REM  
@REM  
@REM  you may move this script & modify the local vars ARCHIBUS_DIR & WEBINF_DIR below to suit your directory structure
@REM  the lone arg is either null or a file or directory name
@REM
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
set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\classes;%WEBINF_DIR%\lib\archibus.jar


:: file or directory that should be converted. starting from current directory
set src=""


rem label a point we can return to using goto while processing input args
:startArgLoop
if "%1" == "" goto endArgs
rem echo the first command argument is: %1
rem pause
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

rem echo source directory or file is %src%
rem pause


rem echo classpath directory is %WEBINF_DIR%\classes

:: call the converter with the proper classpath, option and source args
::
%TOOLS_DIR%\jdk\bin\java  -cp %CLASSPATH_ARG% com.archibus.devtools.localization.JSControlLangFileWriter %src% 

:end
echo Done
