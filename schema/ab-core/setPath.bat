@REM  Set Path utility
@REM  
@REM  Find the current directory and append it to the current path setting
@REM  

@echo off

@rem echo path = %path%

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

set path=%path%;%cd%

@rem echo Set path to %path%


