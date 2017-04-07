@REM Run the test utility com.archibus.devtools.viewconverter.TestConvNavigatorViews
@REM  
@REM  Fetches all the records from afm_ptasks & afm_psubtasks.
@REM  For each task convert its task_file view (if exists) without writing the conversion to disk.
@REM  Produces a report in C:\Yalta\apps\archibus\WEB-INF\log\nav_task_conversion.log that describes which views can be converted   
@REM  Each new report is appended to the old report, so you may want to delete/rename the existing nav_task_conversion.log before a new run
@REM
@REM
@REM  You may move this script & modify ARCHIBUS_DIR, TOOLS_DIR & WEBINF_DIR to suit your directory structure
@REM  To change the location of the report you may modify TestConvNavigatorViews
@REM  
@REM  @author Steven Meyer
@REM  @created December 14, 2007
@REM

echo off

:: top-level dir where archibus web-central code is installed
set ARCHIBUS_DIR=C:\Yalta

:: dir where archibus libs, logs, etc live
set WEBINF_DIR=%ARCHIBUS_DIR%\apps\archibus\WEB-INF

:: where archibus JDK, web server, etc. lives
set TOOLS_DIR=%ARCHIBUS_DIR%\tools

:: where archibus JDK, web server, etc. lives
set CLASSPATH_ARG=%WEBINF_DIR%\lib\dom4j-full.jar;%WEBINF_DIR%\lib\log4j-1.2.8.jar;%WEBINF_DIR%\lib\crimson.jar;%WEBINF_DIR%\classes;%WEBINF_DIR%\lib\junit.jar
set CLASSPATH_ARG=%CLASSPATH_ARG%;%WEBINF_DIR%\lib\httpunit.jar;%WEBINF_DIR%\lib\jcache.jar;%WEBINF_DIR%\lib\concurrent.jar;%WEBINF_DIR%\lib\xercesImpl.jar;%WEBINF_DIR%\lib\xalan.jar
set CLASSPATH_ARG=%CLASSPATH_ARG%;%WEBINF_DIR%\lib\commons-dbcp.jar;%WEBINF_DIR%\lib\commons-pool-1.3.jar;%WEBINF_DIR%\lib\jconn2.jar;%WEBINF_DIR%\lib\jaxrpc.jar
set CLASSPATH_ARG=%CLASSPATH_ARG%;%WEBINF_DIR%\lib\acegi-security-1.0.5.jar;%WEBINF_DIR%\lib\quartz.jar;%WEBINF_DIR%\lib\commons-logging-1.0.4.jar;%WEBINF_DIR%\lib\servlet-api.jar
set CLASSPATH_ARG=%CLASSPATH_ARG%;%WEBINF_DIR%\lib\jsonrpc-1.0.jar

:: call the converter with the proper classpath, option and source args
::
%TOOLS_DIR%\jdk\bin\java  -cp %CLASSPATH_ARG% com.archibus.devtools.viewconverter.TestConvNavigatorViews

echo Done 
echo Look in C:\Yalta\apps\archibus\WEB-INF\log\nav_task_conversion.log for report
