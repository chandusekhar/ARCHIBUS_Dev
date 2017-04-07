localization_readme.txt

This file is to assist both JavaScript control developers and translation team members in localization of displayable control strings

Two utilities are provided for making the resource bundle used by the JavaScript controls. The resource bundle is created from a .lang file 
that uses a standard Archibus .lang file structure. One utility creates a .lang file template for use by the translation team, and the 
other utility reads the locale-specific .lang files and turns it into a JavaScript resource bundle that is used by Web Central at runtime.

The process of localization involves the control developer running the first utility, createLangTemplate, any time they have added a new 
localizable string to a new or existing control, or any time they have changed the name or key for an existing localizable string. The 
createLangTemplate utility takes an optional argument described below, but in its default setting it reads all the JavaScript files below 
\schema\ab-core\controls and creates a .lang file template in \schema\ab-core\lang\ui-controls.lang. 

The utility createLangTemplate reads through a set of JavaScript files searching for blocks of localizable display strings 
delimited by a pair of comments
  // @begin_translatable & // @begin_translatable.
  
For example, in ab-miniconsole.js you will find four strings declared between the comments
	// @begin_translatable
	z_TITLE_CLEAR: 'Clear',
	z_TITLE_FILTER: 'Filter',
	z_TOOLTIP_COLLAPSE: 'Collapse',
	z_TOOLTIP_EXPAND: 'Expand'
	// @end_translatable

 The strings declared in each such block are added to a lang file for use by translators constructing lang files for localization to 
 specific languages


This template should be copied and the copy renamed for each target locale. For example, the template should be copied and the copy 
"Copy of ui-controls.lang" should be renamed to "ui-controls-es_ES.lang" for a Spanish language file specific to Spain, or to 
"ui-controls-fr_CA.lang" for a French language file specific to Canada. This copied template requires two types of changes to be made 
specific to the locale. First, the locale element, which begins as '<locale name="en_US">' must have its name attribute changed to the 
target locale matching the locale part fo the filename, for example '<locale name="fr_CA">'. Second, each string element must have its 
value attribute changed to the locale-specific translation of key3. In the template each value attribute has the same text as the key3 
attribute - the English text - and this must be changed to the localized text.


After all the locale-specific .lang files have been finished by the translation team the second utility, createJsLangObjects, must be 
run by the development team to produce the JavaScript resource bundle used at runtime.

Each of the utilities may be run without arguments to use the default settings. This is appropriate if the development team uses the 
standard directory structure, wants to produce a complete set of controls' displayable strings and wants a complete set of locale-specific 
resource bundles. However, if this is not the case, the utilities can be used with optional arguments as follows:

createLangTemplate optional arguments

  usage: createLangTemplate  [fileOrDirectory]
	the optional arg defaults to C:\Yalta\apps\archibus\schema\ab-core\controls
  

  fileOrDirectory: an optional JavaScript file or directory targeted for string extraction.

	If this arg is null, it is assumed that the JavaScript control files are located below C:\Yalta\apps\archibus\schema\ab-core\controls, 
	and all JS files will be searched.
	If the arg is not null, the resulting lang file will contain only strings from this file or directory - any existing ui-control.lang file 
	will be backed up to ui-control_lang.bak
	If this argument ends in '.js' only the strings in that single JavaScript file will be extracted and ui-control.lang will contain only 
	those strings. 
	Otherwise it is assumed that the arg is a directory and all JavaScript files in the directory plus all subdirectories will be read.
	After reading the JavaScript files, the constructed internal XML document is written to \schema\ab-core\lang\ui-control.lang

	Use an absolute path for this argument. 
	For example, from C:\Yalta\apps\archibus\schema\ab-core to collect all the strings in the JS files below ab-core\controls\grid 
		C:\Yalta\apps\archibus\schema\ab-core> createLangTemplate C:\Yalta\apps\archibus\schema\ab-core\controls\grid 
  
	If this argument is not null, it is used to deduce the controls' path and uses this path to decide where to place the lang file.
	If your \schema directory is not in C:\Yalta\apps\archibus, use this argument to declare its location.
	For example, if you've locate your Web Central code on your D: drive, the schema directory is D:\Archibus\Yalta5\apps\archibus\schema 
	and you want to read all control files
		D:\Archibus\Yalta5\apps\archibus\schema\ab-core> createLangTemplate D:\Archibus\Yalta5\apps\archibus\schema\ab-core\controls\
	This will place the lang file template in D:\Archibus\Yalta5\apps\archibus\schema\ab-core\lang\ui-controls.lang

	After reading the JavaScript files, the constructed internal XML document is written to \schema\ab-core\lang\ui-control.lang
  



createJsLangObjects optional arguments

  usage: createJsLangObjects [langFileDirectory] [locale]
	the optional arg langFileDirectory defaults to C:\Yalta\apps\archibus\schema\ab-core\lang
	the optional arg locale defaults to produce all locales for which a lang file exists in the lang file directory  
  
  fileOrDirectory: an optional JavaScript file or directory specifying the location of the lang files schema-xx.lang, core-xx.lang and ui-control-xx_XX.lang
	If this argument is null it is assumed that the lang files are located in C:\Yalta\apps\archibus\schema\ab-core\lang
	Use an absolute path for this argument. 
	For example, from D:\Yalta_5\apps\archibus\schema\ab-core
		D:\Yalta_5\apps\archibus\schema\ab-core> createJsLangObjects D:\Yalta_5\apps\archibus\schema\ab-core\lang
  
	After reading the lang files, the constructed JavaScript file is written to fileOrDirectory\..\controls\lang\ui-controls-lang-xx_XX.js
  
  locale: an optional locale specifying the single target locale for the JavaScript file. 
	Any other lang files in \schema\ab-core\lang are ignored and if the locale's lang file can be found, only one JavaScript file will be written to 
	fileOrDirectory\..\controls\lang
	If this arg is null all lang files of the form ui-control-xx_XX.lang are compiled into individual JS files
  
  
