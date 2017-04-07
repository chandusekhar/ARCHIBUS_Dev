var tabsFrame = View.getView('parent').panels.get('tabsFrame');
var view = tabsFrame.newView;
var pattern = String(tabsFrame.patternRestriction);
var isPaginated = false;

/**
 * Used in the conversion portion of the VDW.  Reads in the file contents as a string and converts to
 * a view object.  Then apply the view properties to selected pattern.
 *
 * @param 	fileToConvert 	String containing file contents of the file to be converted
 * @return	None
 *
 */
function convertFilePerform(fileToConvert){
    var myView = convertToViewDefObj();
    try {
        applyPatternToCreateAXVW(myView, fileToConvert);
    } 
    catch (e) {
    	alert(e.message);
    }
}

/**
 * Used in both conversion and new view portion of VDW.  Apply view properties to selected pattern.
 * Save file and update file confirmation.
 *
 * @param	myView			Object holding view contents
 * @param	fileToConvert	String containing file contents.  For new views, the value is "None"
 * @return	None
 *
 */
function applyPatternToCreateAXVW(myView, fileToConvert){
    var tabsFrame = View.getView('parent').panels.get('tabsFrame');
    if($('advancedEditingTD')){
    	$('advancedEditingTD').innerHTML = (!isMiniWizard()) ? $('advancedEditingTD').innerHTML : '';
  	}
    var viewType = String(tabsFrame.typeRestriction);
    var pattern = String(tabsFrame.patternRestriction);
    var patterntgrps = Number(tabsFrame.tablegroupsRestriction);
    var uniqueFilename = tabsFrame.uniqueFilename;
    var numberOfTableGroups = myView.tableGroups.length;
    // get the user-selected view pattern and the number of required tablegroups, and feed in the input as parameters		
    var myPattern = new Ab.ViewDef.Pattern(myView, viewType, pattern, numberOfTableGroups, patterntgrps);
    
    // apply the pattern	
    myPattern.applyPattern();
    var convertedFileContents = myPattern.getConvertedView();
  
    // specially handle the case of a console   
    if (pattern == 'ab-viewdef-editform-drilldown-console') {
    
        // replace fields in different data types
        convertedFileContents = replaceConsole(myView, convertedFileContents);
    }
    
	/*
    // specially handle the case of a drilldown edit form with a popup
    if (pattern == 'ab-viewdef-editform-drilldown-popup') {
    
        // replace drilldown popup
        // convertedFileContents = replacePopupDrillDown(myView, convertedFileContents);
		
    // read/get view contents for popup (a secondary file)		
    var parameters = {
        'fileName': 'ab-viewdef-editform-drilldown-popup-details.axvw',
        'fileType': 'Pattern'
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-getViewContents', parameters);
    var ddDetailsPattern = result.message;
    
    // the datasource in the popup (secondary file) is the same as the last tablegroup in primary file, so get the datasource from the view def object
    var detailsDataSource = myView.listTableGroupAsDataSourceXml((myView.tableGroups.length - 1), pattern);
    
    // replace any references with the secondary references (primarily for unique datasource naming convention)       
    detailsDataSource = detailsDataSource.replace(convertToCamelCase(pattern), convertToCamelCase(pattern + "-Details"));
    
    // replace the datasource in pattern template with view's datasource
    var objregexPattern = /(\<\!--ViewDef-DataTgrp-DataSource-Begin-->)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-DataTgrp-DataSource-End-->)/gi;
    var template = ddDetailsPattern.replace(objregexPattern, detailsDataSource);
    
    // replace view title
    var objregexViewTitle = /Viewdef-View-Title/gi;
    template = template.replace(objregexViewTitle, myView.tableGroups[myView.tableGroups.length - 1].title);
    
    // write the secondary file as temp file   	  
    var parameters = {
		'viewType': viewType,
        'fileExt': "-details.axvw",
        'fileContents': template
    };
    var result2 = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-writeViewContents', parameters);
    var secondaryFilePath = result2.message;
    
    // store filename in tabs frame
    tabsFrame.secondaryFilePath = secondaryFilePath;
    
    // replace these lines:  <command type="openDialog" viewName="ab-viewdef-editform-drilldown-popup-details.axvw"/>
    //													$1																		$2 popup view	$3
    // or:      <command type="openDialog" newRecord="true" applyParentRestriction="false" clearRestriction="true" viewName="ab-viewdef-editform-drilldown-popup-details.axvw" />   
    var secondaryFileName = secondaryFilePath.match(/(.*)[\/\\]([^\/\\]+\.\w+)$/);
    var objregexPattern = /(<command\stype\=\"openDialog\".*viewName\=\")(.*)(\".*\/\>)/gi;
    convertedFileContents = convertedFileContents.replace(objregexPattern, "$1" + secondaryFileName[2] + "$3");
    
    }
    */

    // specially handle summary patterns
    if (pattern.match(/summary/gi)) {
    
        // set chart properties
        convertedFileContents = replaceChartProperties(convertedFileContents);
        
        // set chart drilldown (if exists)
        convertedFileContents = replaceChartDrillDown(convertedFileContents);
    }
    
	// unique ds
	if (isAlterWizard()){
		var patternCamelCase = convertToCamelCase(pattern);
		var fileNameCamelCase = convertToCamelCase(tabsFrame.fileToConvert);
		var regExp = new RegExp(patternCamelCase, "g")
		convertedFileContents = convertedFileContents.replace(regExp, fileNameCamelCase);
	}

    // attempt to write contents of view into a file
    var parameters = {
		'viewType': viewType,
        'fileExt': ".axvw",
        'fileContents': convertedFileContents
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-writeViewContents', parameters);
    var convertedFilePath = result.message;
    // if not successful (ie. no file name was returned, display alert)
    var temp = convertedFilePath.match(/(.*)[\/\\]([^\/\\]+)\.\w+$/);
    if (temp == null) {
        alert(getMessage("notWritten"));
    }
    else {
    
        // otherwise, display appropriate buttons and text
        var convertedFileName = temp[2];
        tabsFrame.uniqueFileName = convertedFileName;

		if (!isAlterWizard()) {
			// if a file was converted, display file path.  if not, leave empty
			if ((fileToConvert != null) && (fileToConvert != "") && (fileToConvert != "None")) {
				$('fileToConvert').innerHTML = '<font color="red">' + getMessage('fileConvert') + ' ' + fileToConvert + '</font>';
			}
			else {
				$('fileToConvert').innerHTML = '';
			}
			
			// update the save status confirmation with path of newly saved file
			$('status').innerHTML = '<font color="red">' + getMessage("newFileWritten") + ' ' + convertedFilePath + ' <br/></a></font>';
			
			// add display view button and include name of newly saved file
			$('displayButtonDiv').innerHTML = '<input type="button" value="' + getMessage("displayView") + '" style="width:150" onclick="displayView(' + "'" + convertedFileName + ".axvw'" + ');" />';
			
			//show the instructions text and code 
			$('showMsg').style.display = "";
			$('advancedEditing').style.display = "";
			//$('advancedEditingTD').style.display = (tabsFrame.mini == false) ? '' : 'none';
			
			$('viewdefcode').value = convertedFileContents;
			
			// show or hide code and "Save Changes" button based on previous status
			showAdvancedEditingStatus();
		}
    }
}

/**
 *`Used in summary patterns. Set chart properties. Returns string of file contents with chart properties.
 *
 * @param	convertedFileContents	String holding file contents
 * @return	convertedFileContents	String holding file contents with chart properties set
 *
 */
function replaceChartProperties(convertedFileContents){
    var chartProperties = view.chartProperties;
    
    // get the panel tag template     
    var chartPanelPattern = /(\<panel type="chart" (.*?)>)/gi;
    var chartPanelSettings = String(convertedFileContents.match(chartPanelPattern));
    
    // loop through each chart property in the view object and insert only properties that belong to the panel
    for (var i in chartProperties) {
		if (chartProperties.hasOwnProperty(i)) {
			if (i.match(/controlType/)) {
				// default controlType should be columnChart, but in core the default is pieChart
				var regex = new RegExp(i + '\="(.*?)"');
				chartPanelSettings = chartPanelSettings.replace(regex, i + '="' + chartProperties[i] + '"');
			}
			else if (i.match(/width|height|showLegendOnLoad|showDataTips|backgroundColor|fillType|fillColor|percentGradientChange|percentTransparency/i)){ 
					chartPanelSettings = chartPanelSettings.replace('>', ' ' + i + '="' + chartProperties[i] + '">');
			}	
		}
    }
    
    // replace panel tag template with selected chart properties
    convertedFileContents = convertedFileContents.replace(chartPanelPattern, chartPanelSettings);

    // if more than one measure, clear the fillColor chart property
    if ((view.tableGroups[0].measures) && (view.tableGroups[0].measures.length > 1)) {
        var fillRegEx = /fillColor\=\"(.*?)\" /gi;
        convertedFileContents = convertedFileContents.replace(fillRegEx, "");
    }
    
    // if controlType is a barChart, columnChart, or pieChart, clear the labelPosition
    var controlType = view.chartProperties['controlType'];
    var regEx = /^barChart$|^columnChart$|^pieChart$/;
    if ((controlType != null) && (!controlType.match(regEx))) {
        var controlTypeRegEx = / labelPosition\=\"(.*?)\"/gi;
        convertedFileContents = convertedFileContents.replace(controlTypeRegEx, "");
    }
    
    return convertedFileContents;
}

/**
 *`Used in console pattern.  Obtains fieldsproperties for fields in the console tablegroup
 * and applies appropriate pattern.  Returns string of new file contents.
 *
 * @param	myView					Object (view def)
 * @param	convertedFileContents	String holding file contents
 * @return	convertedFileContents	String holding file contents with new console fields and properties
 *
 */
function replaceConsole(myView, convertedFileContents){

    // get entire section of js filtering code, which holds various templates for filtering	different data types					
    var filterobregex = /\/\*--Filter-Template-Begin--\*\/([\S|\s]*?)\/\*--Filter-Template-End--\*\//gi;
    var filterPattern = String(convertedFileContents.match(filterobregex, "$2"));
    
    // get .js template for creating a drop down box for enum fields during onload of consoles
    var enumloadregex = /(\/\*--EnumList-Onload-Template-Begin--\*\/)([\S|\s]*?)(\/\*--EnumList-Onload-Template-End--\*\/)/gi;
    var enumLoadPattern = String(convertedFileContents.match(enumloadregex, "$2"));
    
    // get .js template for filtering character fields
    var charfilterregex = /(\/\*--Char-Filter-Template-Begin--\*\/)([\S|\s]*?)(\/\*--Char-Filter-Template-End--\*\/)/gi;
    var charFilterPattern = String(convertedFileContents.match(charfilterregex, "$2"));
    
    // get .js template for filtering numeric fields
    var numericfilterregex = /(\/\*--Numeric-Filter-Template-Begin--\*\/)([\S|\s]*?)(\/\*--Numeric-Filter-Template-End--\*\/)/gi;
    var numericFilterPattern = String(convertedFileContents.match(numericfilterregex, "$2"));
    
    // get .js template for filtering enum fields
    var enumfilterregex = /(\/\*--EnumList-Filter-Template-Begin--\*\/)([\S|\s]*?)(\/\*--EnumList-Filter-Template-End--\*\/)/gi;
    var enumFilterPattern = String(convertedFileContents.match(enumfilterregex, "$2"));
    
    // get .js template for filtering data fields
    var datefilterregex = /(\/\*--Date-Filter-Template-Begin--\*\/)([\S|\s]*?)(\/\*--Date-Filter-Template-End--\*\/)/gi;
    var dateFilterPattern = String(convertedFileContents.match(datefilterregex, "$2"));
    
    // get .js template for filtering memo fields
    var memofilterregex = /(\/\*--Memo-Filter-Template-Begin--\*\/)([\S|\s]*?)(\/\*--Memo-Filter-Template-End--\*\/)/gi;
    var memoFilterPattern = String(convertedFileContents.match(memofilterregex, "$2"));
    
    // get xml template for data field
    var datepanelregex = /(\<\!--ViewDef-ConsoleTgrp-PanelFields-DateField-Begin-->)([\S|\s]*?)(\<\!--ViewDef-ConsoleTgrp-PanelFields-DateField-End-->)/gi;
    var datePanelPattern = String(convertedFileContents.match(datepanelregex, "$2"));
    
    // get entire section of xml for specifying fields in the console panel
    var consolepanelobregex = /(\<\!--ViewDef-ConsoleTgrp-PanelFields-Begin-->)([\S|\s]*?)(\<\!--ViewDef-ConsoleTgrp-PanelFields-End-->)/gi;
    var consolePanelPattern = String(convertedFileContents.match(consolepanelobregex, "$2"));
    
    //	get entire section of datasource in console tablegroup			
    var consoledatasourceobregex = /(\<\!--ViewDef-ConsoleTgrp-DataSource-Begin-->)([\S|\s]*?)(\<\!--ViewDef-ConsoleTgrp-DataSource-End-->)/gi;
    var consoleDataSourcePattern = String(convertedFileContents.match(consoledatasourceobregex, "$2"));
    
    // get the field pattern within the data datasource pattern (ensure that only 1 field is used)
    var fieldpanelregex = /(\s)([\s]*?\<field [\S|\s]*?\/>)([\s]*?)/;
    var fieldPanelPattern = consolePanelPattern.match(fieldpanelregex, "$1$2$3");
    fieldPanelPattern = fieldPanelPattern[0];
    
    // for each field in the console tablegroup of view object, find the type of field (memo field, enum list, date field, char, varchar, integer,etc) and apply the relevant pattern for that particular field			
    var tgrp = myView.tableGroups[0];
    var onloadContents = "";
    var filterContents = "";
    var panelContents = "";
    
    // loop through each field in the console tablegroup of the view object
    for (j = 0; j < tgrp.fields.length; j++) {
    
        // run standard wf rule to search through the afm_flds table, and obtain a list of field properties for the table
        var parameters = {
            tableName: 'afm_flds',
            fieldNames: toJSON(['afm_flds.field_name', 'afm_flds.ml_heading', 'afm_flds.enum_list', 'afm_flds.data_type', 'afm_flds.afm_type', 'afm_flds.string_format']),
            restriction: '{"afm_flds.table_name":' + tgrp.fields[j].table_name + '}'
        };
        var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
        
        // if wf successful, apply appropriate pattern and store.  if not, warn
        if (result.code == 'executed') {
        
            // loop through the returned list
            for (var i = 0; i < result.data.records.length; i++) {
                var record = result.data.records[i];
                
                // the field name matches
                if (record['afm_flds.field_name'] == tgrp.fields[j].field_name) {
                
                    // check if enum_list field.  if so, apply patterns and store
                    if (record['afm_flds.enum_list'] != '') {
                        onloadContents += applyConsolePattern(enumLoadPattern, enumloadregex, "status", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                        filterContents += applyConsolePattern(enumFilterPattern, enumfilterregex, "status", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                        panelContents += applyConsolePattern(fieldPanelPattern, fieldpanelregex, "wr_id", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                    }
                    else 
                        if (record['afm_flds.data_type'] == 'Date') {
                        
                            // otherwise, check if date field. if so, apply patterns and store
                            filterContents += applyConsolePattern(dateFilterPattern, datefilterregex, "date_requested", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                            
                            var titleregex = /(\<title translatable\=\"true\">)(Requested)(\<\/title>)/gi;
                            var temp = applyConsolePattern(datePanelPattern, datepanelregex, "date_requested", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                            panelContents += String(temp.replace("Requested", record['afm_flds.ml_heading']));
                            
                        }
                        else 
                            if (record['afm_flds.string_format'] == 'Memo') {
                            
                                // otherwise, check if memo field.  if so, apply pattern and store
                                filterContents += applyConsolePattern(memoFilterPattern, memofilterregex, "description", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                                panelContents += applyConsolePattern(fieldPanelPattern, fieldpanelregex, "wr_id", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                                
                            }
                            else 
                                if ((record['afm_flds.data_type'] == 'Char') || (record['afm_flds.data_type'] == 'Varchar') || (record['afm_flds.data_type'] == 'Time')) {
                                
                                    // otherwise, check if char, varchar, or time field.  if so, apply pattern and store 
                                    filterContents += applyConsolePattern(charFilterPattern, charfilterregex, "location", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                                    panelContents += applyConsolePattern(fieldPanelPattern, fieldpanelregex, "wr_id", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name);
                                }
                                else {
                                
                                    // otherwise, apply numeric pattern and store                           
                                    filterContents += applyConsolePattern2Filter(numericFilterPattern, numericfilterregex, "wr_id", "wr", tgrp.fields[j].field_name, tgrp.fields[j].table_name );
                                    panelContents += applyConsolePattern2Panel(fieldPanelPattern, fieldpanelregex, "wr_id", "wr",  tgrp.fields[j].field_name, tgrp.fields[j].table_name);       
                                }
                }
            }
        }
        else {
            Ab.workflow.Workflow.handleError(result);
        }
    }
    
    // replaced pattern template with previously stored sections
    convertedFileContents = convertedFileContents.replace(filterobregex, filterContents);
    convertedFileContents = convertedFileContents.replace(enumloadregex, onloadContents);
    convertedFileContents = convertedFileContents.replace(consolepanelobregex, panelContents);
    var pattern = String(tabsFrame.patternRestriction);
    convertedFileContents = convertedFileContents.replace(consoledatasourceobregex, myView.listTableGroupAsDataSourceXml(0, pattern));
    
    return convertedFileContents;
}

/**
 * Replace table and field names in pattern with the ones specified in view object
 *
 * @param	pattern			String containing the pattern
 * @param	regExpObj		Object for regular expression
 * @param	fieldToReplace	String of field name to be replaced
 * @param	tableToReplace	String of table name to be replaced
 * @param	field			String of field name to replace	 with
 * @param	table			String of table name to replace with
 * @return 	newContents		String containing pattern with replaced fields and tables
 *
 */
function applyConsolePattern(template, regExpObj, fieldToReplace, tableToReplace, field, table){
    var fldRegExpObj = new RegExp(fieldToReplace, 'g');
    var tblRegExpObj = new RegExp(tableToReplace, 'g');
    
    // apply pattern
    var newContents = String(template.replace(regExpObj, '$2'));

    // replace field name
    newContents = newContents.replace(fldRegExpObj, field);
  
    // replace table name
    newContents = newContents.replace(tblRegExpObj, table);
    
    return newContents;
}

// #3036748 hwr.wr_id 
function applyConsolePattern2Filter(template, regExpObj, fieldToReplace, tableToReplace, field, table){    
    // apply pattern
    var newContents = String(template.replace(regExpObj, '$2'));

    // replace table name
    newContents = newContents.replace(new RegExp(tableToReplace + "[\.]{1}" ,"g"), table +'.');

    // replace field name
    newContents = newContents.replace(new RegExp(fieldToReplace, "g"), field);

    return newContents;
}

// #3036748  hwr.wr_id
function applyConsolePattern2Panel(template, regExpObj, fieldToReplace, tableToReplace, field, table){    
    // apply pattern
    var newContents = String(template.replace(regExpObj, '$2'));

    // replace field name
    newContents = newContents.replace(fieldToReplace, field);
  
    // replace table name
    newContents = newContents.replace('"' + tableToReplace + '"', '"' + table + '"');
    
    return newContents;
}


/**
 *`Used in summary patterns.  If enableChartDrillDown is set to true, replace with applicable
 * tables and fields.  If not, clear the drilldown section.  Return string of new file contents.
 *
 * @param	convertedFileContents	String holding file contents
 * @return	convertedFileContents	String holding file contents with/without drilldown
 *
 */
function replaceChartDrillDown(convertedFileContents){
    // get patterns for chart popup
    var chartPopupPattern = /([\s]*)(\<\!--ViewDef-Chart-Popup-Begin-->)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-Chart-Popup-End-->)/gi;
    var chartPopupEventPattern = /([\s]*\<\!--ViewDef-Chart-Popup-Event-Begin-->)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-Chart-Popup-Event-End-->)[\s]*/gi;
    // var chartPopupDatasourcePattern = /(\<\!--ViewDef-ChartPopup-DataSource-Begin-->)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-ChartPopup-DataSource-End-->)[\s]*/gi;
    var chartPopupDatasourcePattern = /(\<\!--ViewDef-ChartPopup-DataSource-Begin-->)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-ChartPopup-DataSource-End-->)/gi;    
    // detect whether to enable drilldown for chart
    var enableChartDrilldown = view.enableChartDrilldown;
    
    // if enable     
    if (enableChartDrilldown == true) {
    
        // get the chart popup datasource template
        var chartPopupDatasource = String(convertedFileContents.match(chartPopupDatasourcePattern));
        
        // for each table in last tablegroup of view object, create a <table ... /> tag
        var tables = view.tableGroups[view.tableGroups.length - 1].tables;
        var tablesList = "";
        if (tables) {
            for (var i = 0; i < tables.length; i++) {
                tablesList += '<table name="' + tables[i].table_name + '" role="' + tables[i].role + '" />\n    ';
            }
        }
        
        // for each field in last tablegroup of view object, create a <table ... /> tag
        var fields = view.tableGroups[view.tableGroups.length - 1].fields;
        var fieldsList = "";
        if (fields) {
            for (var i = 0; i < fields.length; i++) {
                fieldsList += '    <field table="' + fields[i].table_name + '" name="' + fields[i].field_name + '"/>';
                if (i <= fields.length-1){
                 	 fieldsList += '\n    ';
                } 
            }
        }

        var restrictionsArr = view.tableGroups[view.tableGroups.length - 1].parsedRestrictionClauses;
        var restrictionList = createParsedRestrictionSyntax(restrictionsArr, 8);
        
        // replace the table and field tags into the datasource template
        convertedFileContents = convertedFileContents.replace(chartPopupDatasourcePattern, tablesList + fieldsList + '\n' + restrictionList);
        
        // place the new datasource into the datasource section
        convertedFileContents = convertedFileContents.replace(chartPopupPattern, "\n$1$2$3$4");
        
        // place the into drilldown section
        convertedFileContents = convertedFileContents.replace(chartPopupEventPattern, "\n$2");
    }
    else {
    
        // enable was not selected, clear the entire chart popup section
        convertedFileContents = convertedFileContents.replace(chartPopupPattern, "\n        ");
        convertedFileContents = convertedFileContents.replace(chartPopupEventPattern, "\n        ");
    }
    
    return convertedFileContents;
}

/**
 *`Called when the "Save Changes" butotn is pressed.  Writes changes to a new a temporary file.
 * Delete the old temporary file.  Update the save confirmation text and display button with the
 * new file path.
 *
 * @param	None
 * @return	None
 *
 */
function saveChanges(){
    var uniqueFileName = tabsFrame.uniqueFileName;
    newFileContents = $('viewdefcode').value;
    tabsFrame.fileContents = newFileContents;
    var viewType = tabsFrame.typeRestriction;
	    
    // write a new temp file
    var parameters = {
		'viewType': viewType,
        'fileExt': ".axvw",
        'fileContents': newFileContents
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-writeViewContents', parameters);
    var convertedFilePath = result.message;
    
    // delete old temp file
    var parameters = {
        'fileName': uniqueFileName + ".axvw"
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-deleteFile', parameters);
    
    // find and store the new temporary file name in the tabs frame
    var temp = convertedFilePath.match(/(.*)[\/\\]([^\/\\]+)\.\w+$/);
    var convertedFileName = temp[2];
    tabsFrame.uniqueFileName = convertedFileName;
    
    // if there was a file conversion, display the file name in the confirmation text
    var fileToConvert = tabsFrame.fileToConvert;
    if ((fileToConvert != undefined) && (fileToConvert != "") && (fileToConvert != "None")) {
        $('fileToConvert').innerHTML = '<font color="red">' + getMessage('fileConvert') + ' ' + fileToConvert + '</font>';
    }
    else {
        $('fileToConvert').innerHTML = '';
    }
    
    // update paths and display button
    $('status').innerHTML = '<font color="red">' + getMessage("newFileWritten") + ' ' + convertedFilePath + ' <br/></a></font>';
    $('displayButtonDiv').innerHTML = '<input type="button" value="' + getMessage("displayView") + '" style="width:150" onclick="displayView(' + "'" + convertedFileName + ".axvw'" + ');" />';
    $('showCode').style.display = "block";
}

/**
 * Convert the  view object properties into a series of javascript statements and define a
 * view object in Javascript memory
 *
 * @param 	None
 * @return 	myView	Object of view properties
 *
 */
function convertToViewDefObj(){
	var view = tabsFrame.newView;
	var pattern = String(tabsFrame.patternRestriction);
    var patterntgrps = Number(tabsFrame.tablegroupsRestriction);
    var uniqueFilename = tabsFrame.uniqueFilename;
    var viewToCreate = "";
	
	if (pattern.match(/paginated/g)){
		isPaginated = true;
	}
    	
    // pattern
    viewToCreate += 'myView.addPattern( "' + view.pattern + '"); \n';
    
    // if a title was specified, add it.  otherwise, use "Title for View" as the title
    if (view.title != undefined) {
        viewToCreate += 'myView.addTitle( "' + view.title + '"); \n';
    }
    else {
        viewToCreate += 'myView.addTitle( "' + 'Title for View' + '"); \n';
    }
    
    // loop through each tablegroup...
    for (var i = 0; i < view.tableGroups.length; i++) {
        var curTgrp = view.tableGroups[i];
        var isDrawingHighlightTgrp = false;
		var isDrawingLabelTgrp = false;
		
		if (pattern.match(/paginated-highlight/gi) && (i==1)){
			isDrawingLabelTgrp = true;
		}

		if (pattern.match(/paginated-highlight-thematic/gi) && (i==0)) {
			isDrawingHighlightTgrp = true;
		}
						
        // add any tables and specify the table's role (main or standard)
        var tables = curTgrp.tables;
        if (tables != undefined) {
            for (x = 0; x < tables.length; x++) {
                if (tables[x].role == "main") {
                    viewToCreate += 'myView.addTable( "' + tables[x].table_name + '", Ab.ViewDef.Table.MAIN_TABLE, ' + "'AXVW' ); \n";
                }
                if (tables[x].role == "standard") {
                    viewToCreate += 'myView.addTable( "' + tables[x].table_name + '", Ab.ViewDef.Table.STANDARD_TABLE, ' + "'AXVW' ); \n";
                }
            }
        }
        
        // add the table title if exists
        if ((curTgrp.tables[0].table_name != undefined) && (curTgrp.tables[0].table_name != "") && (curTgrp.title != undefined)) {
            viewToCreate += 'myView.addTableTitle( "' + curTgrp.tables[0].table_name + '", "' + curTgrp.title + '"); \n';
        }
        
        // add any fields.  if none exists, prompt and navigate to "Set Characteristics"
        if (curTgrp.fields != undefined) {
            var fields = curTgrp.fields;

            if ( (fields.length == 0) && (!isDrawingLabelTgrp) && !pattern.match(/highlight-thematic/gi)) {
                alert(getMessage("noFields") + " '" + curTgrp.tables[0].table_name + "' " + getMessage("noFields2"));
                tabsFrame.selectTab('page4');
                return;
            }
            else {
            	var indexFieldNum = 1000;    // random assignment, there shouldn't be 1000 primary keys
            	
                for (j = 0; j < fields.length; j++) {
					var field = fields[j];
                    viewToCreate += 'myView.addField( "' + field.field_name + '", "' + field.table_name + '", "AXVW", false, false, "' + field.afm_type + '"';
					if (field.hasOwnProperty('restriction_parameter')) {
						viewToCreate += ', "' + field.restriction_parameter + '" '; 
					}
					else {
						viewToCreate += ', ""'; 
					}
					// viewToCreate += ', "' + field.ml_heading.replace(/[\n|\r]/gi, " ") + '" , "' + field.primary_key + '" , "' + field.data_type + '"';
					viewToCreate += ', "' + field.ml_heading.replace(/[\n|\r]/gi, " ") + '" ,'; 
					viewToCreate += ' "' + field.ml_heading_english.replace(/[\n|\r]/gi, " ") + '" ,'; 
					viewToCreate += ' "' + field.primary_key + '" , "' + field.data_type + '"';
					if (field.hasOwnProperty('showSelectValueAction')) {
						viewToCreate += ', ' + field.showSelectValueAction + ' '; 
					}
					else {
						viewToCreate += ', ""'; 
					}
					viewToCreate += ', ' + field.is_virtual;

					if(typeof(field.sql) == 'string'){
						viewToCreate += ', ' + "'" + field.sql + "'";
					} else {
						viewToCreate += ', ' + toJSON(field.sql);
					}
					
					// rowspan
					viewToCreate += ', ';
					viewToCreate += (field.hasOwnProperty('rowspan')) ? field['rowspan'] : null;

					// colspan
					viewToCreate += ', ';
					viewToCreate += (field.hasOwnProperty('colspan')) ? field['colspan'] : null;
					
					// custom field title
					viewToCreate += ', "' + field.ml_heading_english_original.replace(/[\n|\r]/gi, '') + '"';
					// viewToCreate += (field.ml_heading_english.replace('\r\n', ' ') != field.ml_heading_english_original.replace('\r\n', ' ')) ? field.ml_heading_english : null;
					
					//viewToCreate += ', ' + eval('(' + field.sql + ')');
					viewToCreate += ' ); \n';

					// store index field
					var numTgrps = view.tableGroups.length;
					if(indexPattern()){	
						if (pattern.match(/editform/gi) &&	!pattern.match(/popup/gi) && (i == numTgrps-1)){						
						  	// remove index for panel type="form"
						  	delete curTgrp.indexField;				
						} else if ((field.primary_key > 0) && (field.primary_key < indexFieldNum)){
							curTgrp.indexField = field;
							indexFieldNum = field.primary_key;
						}	
					} 									
                }
            }
        }
        else if (!isDrawingLabelTgrp && !pattern.match(/highlight-thematic/gi)) {
            alert(getMessage("noFields") + " '" + curTgrp.tables[0].table_name + "' " + getMessage("noFields2"));
            tabsFrame.selectTab('page4');
            return;
        }
        
        // add sorts
		var sortFields = curTgrp.sortFields;
        if ((sortFields != undefined) && (sortFields != '')) {
			for (m = 0; m < sortFields.length; m++) {
				//viewToCreate += 'myView.addSortField( "' + sortFields[m].table_name + '", "' + sortFields[m].field_name + '",  "' + sortFields[m].ml_heading.replace(/[\n|\r]/gi, " ") + '", "AXVW",' + sortFields[m].isAscending + ', "' + sortFields[m].groupByDate + '") ; \n';
				viewToCreate += 'myView.addSortField( "' + sortFields[m].table_name + '", "' + sortFields[m].field_name + '",  "' + sortFields[m].ml_heading.replace(/[\n|\r]/gi, " ") + '",  "' + sortFields[m].ml_heading_english.replace(/[\n|\r]/gi, " ") + '", "AXVW",' + sortFields[m].isAscending + ', "' + sortFields[m].groupByDate + '") ; \n';
			}
		// } else if (isDrawingHighlightTgrp){
		// } else if ((pattern.match(/summary/gi) && (i == view.tableGroups.length - 1)) || (pattern.match(/paginated-highlight/gi) && ((i == 2) || (i == 0)) ) || ((pattern.match(/paginated/gi) && hasSummarizeBySortOrder(curTgrp) && !pattern.match(/paginated-stats-data/gi))) || (pattern.match(/paginated-stats-data/gi) && (i==0))) {
		} else if ((pattern.match(/summary/gi) && (i == view.tableGroups.length - 1)) || (pattern.match(/paginated-highlight/gi) && ((i == 2) || (i == 0)) ) || ((pattern.match(/paginated/gi) && hasSummarizeBySortOrder(curTgrp) && !pattern.match(/paginated-stats-data/gi)))) {		 	
			alert(getMessage('noSort'));			
			tabsFrame.selectTab('page4');
			return;
		}
		
		if (curTgrp.hasOwnProperty('indexField')){
			var indexField = curTgrp.indexField;
			viewToCreate += "myView.addIndexField( '" + indexField.table_name + "', '" + indexField.field_name + "' ) ; \n";
		}
 						       
        // add restrictions
        if ((curTgrp.parsedRestrictionClauses != undefined) && (curTgrp.parsedRestrictionClauses != '')){
            var restrictions = curTgrp.parsedRestrictionClauses;
            for (p = 0; p < restrictions.length; p++) {
                var table_name = restrictions[p].table_name;
                var field_name = restrictions[p].field_name;
                viewToCreate += "myView.addParsedRestrictionClause( '" + restrictions[p].relop + "', " + '"' + table_name + '", "' + field_name + '", "' + restrictions[p].op + '", "' + restrictions[p].value + '" ) ; \n';
            }
        } else if (pattern.match(/paginated-highlight-restriction/gi) && ((i==0) || (i==2))){
			alert(getMessage('noRestriction'));
			tabsFrame.selectTab('page4');
			return;
		}
		
		var paramRestrictions = curTgrp.parameterRestrictionClauses;
		if ((isPaginated) && (paramRestrictions != undefined)){
            for (var q = 0; q < paramRestrictions.length; q++) {
				var paramRest = paramRestrictions[q];
				viewToCreate += "myView.addParamRestrictionClause( 'AND', " + '"' +  paramRest.table_name + '", "' + paramRest.field_name + '", "=", "' + "${parameters['" + paramRest.value + "']}" + '" ) ; \n';
			}
		}
		
		var parameters = curTgrp.parameters;
		if ((isPaginated) && (parameters != undefined)) {
			for (var q = 0; q < parameters.length; q++) {
				var parameter = parameters[q];
				viewToCreate += "myView.addParameter( '" + parameter.name + "', '" + parameter.value + "', '" + parameter.dataType + "' ) ; \n";
			}
		}			

        // add sql restrictions
        if ((curTgrp.sqlRestriction != undefined) && (curTgrp.sqlRestriction != '')) {
            var sqlRest = curTgrp.sqlRestriction;
            viewToCreate += 'myView.addSqlRestriction( "' + sqlRest.table_name + '", "' + sqlRest.sql + '"); \n';
        }

		// add measures
        if ((curTgrp.measures != undefined) && (curTgrp.measures != '')) {
			var measures = curTgrp.measures;
			for (var r = 0; r < measures.length; r++) {
				var measure = measures[r];
				for(var s=0; s<measure.stats.length; s++){	
					// handle translated headings such as activity_log.cond_value and cond_priority
					if(measure.ml_heading){
						viewToCreate += 'myView.addMeasure( "' + measure.field_name + '", "' + measure.stats[s] + '", "' + measure.name + '", "' + measure.ml_heading.replace(/[\n|\r]/gi, " ") + '", "' + measure.ml_heading_english.replace(/[\n|\r]/gi, " ") + '", "'+ measure.table_name + '" ) ; \n';
					} else {
						viewToCreate += 'myView.addMeasure( "' + measure.field_name + '", "' + measure.stats[s] + '", "' + measure.name + '", "' + measure.ml_headings[s] + '", "' + measure.ml_headings_english[s] + '", "'+ measure.table_name + '" ) ; \n';
					}					
				}
			}
        }

		if (curTgrp.hasOwnProperty('paginatedPanelProperties')){
			var paginatedPanelProperties = curTgrp.paginatedPanelProperties;
			for (s in paginatedPanelProperties) {
				viewToCreate += "myView.addPaginatedPanelProperties( '" + s + "', '" + paginatedPanelProperties[s] + "' ) ; \n";
			}
		}		
    }
    
    if (view.hasOwnProperty('viewURL')){
    	viewToCreate += "myView.addURL( '" + view.viewURL + "' ) ; \n";
    }

    // convert the javascript statements into a view definition object
    var myView = new Ab.ViewDef.View();
    var myConverter = new Ab.ViewDef.Convert(viewToCreate, "myView");
    myConverter.convertDo();
    // warn if any unconvertable sections were found
    eval(myConverter.getConvertedContentsAsJavascript());
    if (myConverter.hasUnconvertableSections()) 
        alert(myConverter.getDescriptionOfUnconvertableSections());

    return myView;
}

/**
 * Check if this pattern needs an index field
 *
 * @param	None
 * @return 	None
 *
 */
function indexPattern(){
	var bMatchingPattern = (pattern.match(/ab-viewdef-report|ab-viewdef-report-drilldown|ab-viewdef-report-drilldown-two-level|ab-viewdef-editform-drilldown|ab-viewdef-editform-drilldown-two-level|ab-viewdef-editform-drilldown-popup/gi));
	if (bMatchingPattern){
	   return true;
	}
	return false;	
}

/**
 * Show the source code and "Save Changes" button if checkbox is checked.
 * Hide the source code and "Save Changes" button if checkbox is unchecked.
 * Store the setting.
 *
 * @param	None
 * @return 	None
 *
 */
function setAdvancedEditing(){
    var aeCheckBox = $('advancedEditing');
    
    var codeText = $('showCode');
    if (aeCheckBox.checked == true) {
        codeText.style.display = "";
        tabsFrame.showCode = true;
    }
    else {
        codeText.style.display = "none";
        tabsFrame.showCode = false;
    }
}

/**
 * Retrieves the cached "Enable Advanced Editing" status and check/uncheck the checkbox accordingly
 *
 * @param	None
 * @return 	None
 *
 */
function showAdvancedEditingStatus(){
    var aeCheckBox = $('advancedEditing');
    var bShowCode = tabsFrame.showCode;
    if (bShowCode != undefined) {
    
        if (bShowCode == true) {
            aeCheckBox.checked = true;
        }
        else {
            aeCheckBox.checked = false;
        }
        setAdvancedEditing();
    }
}

