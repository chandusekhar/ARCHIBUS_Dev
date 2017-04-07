var tabsFrame = View.getView('parent').panels.get('tabsFrame');
if (tabsFrame == null) {
    tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');
}



/**
 * Takes a string (filename) as argument and checks if the view is an *.axvw.  If so,
 * display the view in a dialog.  If not, alert user.
 *
 * @param	filename	string containing the name of the file
 * @return	None
 *
 */
function displayView(fileName){
    var fileExt = fileName.substring((fileName.length - 5), (fileName.length));
	var pattern = tabsFrame.patternRestriction;
    if (fileExt.toUpperCase() == ".AXVW") {
/*
		if (pattern.match(/paginated/gi)) {
			fileName =  'ab-paginated-report-job.axvw?viewName=' + fileName;
			var link = parent.Ab.view.View.getBaseUrl() + '/' + fileName;
			window.open(link);
		} else {
			Ab.view.View.openDialog(fileName);
		}
*/

		if (pattern && pattern.match(/paginated/gi)) {
			fileName = 'ab-paginated-report-job.axvw?viewName=' + fileName;
		}

		Ab.view.View.openDialog(fileName);
	
    }
    else {
        alert(getMessage("onlyAXVW"));
    }
}

/**
 * Returns the number of tablegroups in the selected view
 *
 * @param	None
 * @return	numberOfTableGroups 	Integer - the number of tablegroups in the selected view
 *
 */
function getNumberOfTablegroups(){
    // Take the contents of the view
    var originalView = tabsFrame.fileContents;
    
    // Convert it into an object
    var myView = new Ab.ViewDef.View();
    var myConverter = new Ab.ViewDef.Convert(originalView, "myView");
    myConverter.convertDo();
    
    // Extract the relevant pieces
    var convertedContents = myConverter.getConvertedContentsAsJavascript();
    eval(convertedContents);
    
    // Get the number of tableGroups
    var numberOfTableGroups = myView.tableGroups.length;
    
    return numberOfTableGroups
}

/**
 * Clear settings and return to second tab (Select Type)
 *
 * @param	None
 * @return	None
 *
 */
function startOver(){
    var answer = confirm(getMessage('startOver'));
    if (answer) {
        clearSettings(tabsFrame);
        tabsFrame.selectTab('page1');
    }
}

/**
 * Clear settings
 *
 * @param	tabsFrame	Need this parameter for alterView
 * @return	None
 *
 */
function clearSettings(tabsFrame){
    var view = new Object();
    var tgrp = new Array();
    view.tableGroups = tgrp;
    view.chartProperties = new Array();
    view.paginatedProperties = new Array();
    tabsFrame.newView = view;
    
    tabsFrame.fileToConvert = "";
    tabsFrame.fileContents = "";
    tabsFrame.typeRestriction = "";
    tabsFrame.patternRestriction = "";
    tabsFrame.restriction = "";
    tabsFrame.viewType = "";
    tabsFrame.tablegroupsRestriction = 0;
    tabsFrame.disableFileSelect = false;
    //XXX: new grid multiple selection  over pages
    tabsFrame.clearFieldsSelection = true;
	
	tabsFrame.datagrpRestriction = '';
	tabsFrame.ownergrpRestriction = '';
	tabsFrame.owner2grpRestriction = '';
}

/**
 * Clears settings and navigate to 'Load' tab. Used in the 'Save' and 'Publish' tabs.
 *
 * @param	None
 * @return	None
 *
 */
function convertNewView(){
    clearSettings(tabsFrame);
    tabsFrame.selectTab('page0');
}

/**
 * Clears settings and navigate to 'Select Type' tab. Used in the 'Save' and 'Publish' tabs.
 *
 * @param	None
 * @return	None
 *
 */
function createNewView(){
    clearSettings(tabsFrame);
    tabsFrame.selectTab('page1');
}

/**
 * Takes a string as argument and return it in camelCase format
 *
 * @param	str		String 		Original string
 * @return	str		String		String in camelCase format
 *
 */
function convertToCamelCase(str){
    var i = 0;
    var ch = "";
    str = str.toLowerCase();
    
    // remove file extension
    str = str.replace(/([\s|\S]*)(\..*)$/, "$1");
    
    // replace all non-alphanumeric chars with spaces
    str = str.replace(/[^a-zA-Z0-9]/g, " ");
    
    // loop through each character
    for (var i = 0; i < str.length; i++) {
        ch = str.substring(i, i + 1);
        
        // if there is a space, remove it, and convert the next letter to uppercase
        if (ch.match(/[\s]{1}/i)) {
            str = str.replace(str.substring(i, i + 2), str.charAt(i + 1).toUpperCase());
        }
    }
    
    return str;
}

/**
 * Returns the cell element based on grid, row, and column
 *
 * @param		grid		object for grid panel
 * @param		row			integer	for row position
 * @param		column		integer for column position
 * @return		cellElement	cell element
 *
 */
function getCellElement(grid, row, column){
    var rowElement = grid.getDataRows()[row];
    var cellElement = rowElement.childNodes[column];
    return cellElement;
}

/**
 * Checks is object has properties.  If so, return true.  If not, return false.
 *
 * @param	obj			object 
 * @return	true|false	boolean		
 *
 */
function hasProperties(obj){	
	for (i in obj){
		if (obj.hasOwnProperty(i)){
			return true;
		}
	}	
    return false;
}

/**
 * Checks if summarizeBySortOrder exists
 *
 * @param	None
 * @return	true|false	boolean		
 *
 */
function hasSummarizeBySortOrder(tgrp){
/*
	var tabsFrame = View.getView('parent').panels.get('tabsFrame');
	
	if(tabsFrame == null){
		tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');	
	}
	view = tabsFrame.newView;
*/	
	
	// var bSummarizeBySortOrder = false;
	if (tgrp.hasOwnProperty('paginatedPanelProperties')) {
		var paginatedPanelProperties = tgrp.paginatedPanelProperties;
		if ((paginatedPanelProperties) && paginatedPanelProperties.hasOwnProperty('summarizeBySortOrder')) {
			return true;
		}
	}
	
	return false;
}

/**
 * Returns true if there is a match	
 *
 * @param	a			String
 * @param	b			String
 * @return	true|false	Boolean
 *
 */
function checkIfMatch(a, b){
	var regExp = new RegExp(b, "gi");

	if (a.match(regExp)){
		return true;
	}
	
	return false;
}

/**
 * Check if has main field
 *
 * @param	tgrp		Object
 * @return	true|false	Boolean
 *
 */
function checkIfHasMainField(fields, table){
	var bHasMainField = false;
	if ((fields != undefined) && (fields != '')){
		for (var i=0; i<fields.length; i++){
			if (fields[i].table_name == table){
				return true;
			}
		}
	}
}

/**
 * Determine whether this is called from the Alter View wizard.
 *
 * @param	None
 * @return	None
 *
 */
function isAlterWizard(){
    return (tabsFrame != null && typeof tabsFrame.isAlter != "undefined" && tabsFrame.isAlter != null && tabsFrame.isAlter)
}

function isMiniWizard(){
    return (tabsFrame != null && typeof tabsFrame.isMini != "undefined" && tabsFrame.isMini != null && tabsFrame.isMini)
}

/**
 * Warn users if needed parameter restrictions were not selected
 *
 * @param	view	Object
 * @return 	None
 *
 */
function validateParameterRestrictions(view){

	var numberOfTgrps = view.tableGroups.length;
	
	// check that all parent tablegroups have at least one restriction parameter
	for (var i=0; i<numberOfTgrps-1; i++){
		var tgrp = view.tableGroups[i];
		var fields = tgrp.fields;
		var bHasRestParam = false;
		
		if ((fields != undefined) && (fields != '')){
			for (var x=0; x<fields.length; x++){
				var field = fields[x];
				if (field.hasOwnProperty('restriction_parameter')){
					bHasRestParam = true;
				}
			}
		
			if (bHasRestParam == false){
				alert(getMessage('noRestrictionParameter'));
				tabsFrame.selectTab('page4');
				return false;			
			}
		}
	}

	// check that the restriction parameters of the child tablegroups have
	// such validating fields
	var msg = getMessage('missingFieldsForRestParam') + '\n\n';
	var bNeedField = false;
	for (var j=1; j<numberOfTgrps; j++){
		
		var tgrp = view.tableGroups[j];
		var paramRestrictions = tgrp.parameterRestrictionClauses;
		var fields = tgrp.fields;
		
		if ((paramRestrictions != undefined) && (paramRestrictions != '')){
			for (var q = 0; q < paramRestrictions.length; q++) {
				var paramRest = paramRestrictions[q];
				var table_name = paramRest.table_name;
				var field_name = paramRest.field_name;
				var bFound = false;
				var alternate_table = '';
				
				if ((fields != undefined) && (fields != '')){
					for (var r=0; r<fields.length; r++){
						var field = fields[r];
						
						// if found a field that has the same field_name, but different table_name, store the table name as a possible alternative
						if (field.field_name == field_name){
							if (field.table_name == table_name){
								bFound = true;
							} else {
								alternate_table = field.table_name;
							}
						}
						
						/*
							if ((field.table_name == table_name) && (field.field_name == field_name)){
								bFound = true;
							}
						*/
					}
				}
				
				// if couldn't find a field that matches, use alternate table
				if (bFound == false){
					if (alternate_table != '') {
						view.tableGroups[j].paramRestrictions[q].table_name = table_name;
					} else {
						msg += '  ' + field.ml_heading.replace(/[\n|\r]/, " ") + ' (' + table_name + '.' + field_name + ')\n';
						bNeedField = true;
					}
				}
				msg += '\n'
			}
		}				
	}
	
	if (bNeedField == true){
		alert(msg)
		tabsFrame.selectTab('page4');
		return false;	
	}
	
	tabsFrame.newView = view;
	return true;
}

/**
 * Determine whether tablegroup has group by date
 *
 * @param	curTgrp 	Object of current tablegroup
 * @return	bFound		Boolean of whether group by date has been found
 *
 */
function hasGroupByDate(curTgrp){
    var sortFields = curTgrp.sortFields;
    if ((sortFields) && (sortFields.length > 0)) {
    	for(var i=0; i<sortFields.length; i++){
    		var sortField = sortFields[i];
        var groupByDate = sortFields[i].groupByDate;
        if ((groupByDate != '')) {
        	 return true;
        }
    	}
    }
    return false;   
}

function getGroupByDates(curTgrp){
    var sortFields = curTgrp.sortFields;
    var groupByDates = new Array();
    if ((sortFields) && (sortFields.length > 0)) {
    	for(var i=0; i<sortFields.length; i++){
    		var sortField = sortFields[i];
        var groupByDate = sortFields[i].groupByDate;
        if (sortField.hasOwnProperty('groupByDate') && (groupByDate != '')) {
        	 groupByDates.push(sortFields[i]);
        }
    	}
    }
    return groupByDates;  
}

function hasShowTotalsForField(measuresArr, table_name, field_name){
	if(measuresArr){
		for (var k = 0; k < measuresArr.length; k++) {
			var stats = measuresArr[k].stats;
			if(table_name == measuresArr[k].table_name && field_name == measuresArr[k].field_name){
				for (x = 0; x < stats.length; x++) {
					if(stats[x].toLowerCase() == "sum"){
						return true;
					}
				}
			}
		}
	}
	return false;    	
}

/**
* Checks for showCount
*
* @param	measuresArr
* @return	Boolean
*
*/    
function hasShowCount(measuresArr){
	if(measuresArr){
		for(var i=0; i<measuresArr.length; i++){
			var stats = measuresArr[i].stats;
			for(var j=0; j<stats.length; j++){
				if(stats[j].toLowerCase() == "count"){
					return true;
				}
			}
		}
	}
	return false;
}


function hasShowCountOrTotals(measuresArr){
	var str = '';	if(measuresArr){
		for(var i=0; i<measuresArr.length; i++){
			var stats = measuresArr[i].stats;
			for(var j=0; j<stats.length; j++){
				if((stats[j].toLowerCase() == "count") || (stats[j].toLowerCase() == "sum")){
					return true;
				}
			}
		}
	}
	return false;
}

function generateVFSQLdialects(sqlObj){
		if(typeof(sqlObj) == 'string'){
			sqlObj = eval('(' + sqlObj + ')');
		}	
		
		var str = '';
		if(sqlObj){
			str += generateVFSQLdialect('generic', sqlObj);
			str += generateVFSQLdialect('oracle', sqlObj);
			str += generateVFSQLdialect('sqlServer', sqlObj);
			str += generateVFSQLdialect('sybase', sqlObj);
		}
		return str;
}
			
function generateVFSQLdialect(dialect, sqlObj){
		var str = '';
		if(sqlObj.hasOwnProperty(dialect) && sqlObj[dialect] != ''){
			str += "\n    " + '    ' + '    ' ;
			str += '<sql dialect="' + dialect + '">';
			str += sqlObj[dialect];
			str += '</sql>';
		}
		return str;
}	

/**
* Return template
*	
* @param	tgrpndx
* @param markerId
* @return	template
*
*/
function getTemplate(tgrpndx, markerId ){
	var pattern = new RegExp('(<\\!--ViewDef-' + markerId + '-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + markerId + '-End-->[\\s]*)', 'gi' );
	
	// get the template
	var template = String(this.originalPattern.match(pattern));
	return template;
}

function getTemplateFromContents(contents, markerId ){
	var pattern = new RegExp('(<\\!--ViewDef-' + markerId + '-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + markerId + '-End-->[\\s]*)', 'gi' );
	
	// get the template
	var template = String(contents.match(pattern));
	return template;
}

/**
* Return template without the marker tags
*	
* @param tgrpndx
* @param	markerId
* @return	template 
*
*/ 
function getTemplateWithoutMarker(tgrpndx, markerId ){
	var pattern = new RegExp('(<\\!--ViewDef-' + markerId + '-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + markerId + '-End-->[\\s]*)', 'gi' );
	var template = String(this.originalPattern.match(pattern));
	
	return template.replace(pattern, "$2");
}

/**
* Return template with new attribute value
*	
* @param template
* @param	attribute
* @param newValue
* @return	template 
*
*/        
function getTemplateWithNewAttributeValue(template, attribute, newValue){
	var pattern = new RegExp('(' + attribute + '\=")(.*?)(")');
	return template.replace(pattern, "$1" + newValue + "$3");
}  
    
/**
* Return regex pattern for attribute
*	
* @param	attribute
* @return	attribute pattern
*
*/
function getAttributePattern(attribute){
	var pattern = new RegExp(attribute + '\="(.*?)"');
	return pattern;
}

/**
* Return attribute value from given template and attribute name
*	
* @param template
* @param	attribute
* @return	attribute value
*
*/
 function getAttributeValue(template, attribute){
	// var pattern = new RegExp(attribute + '\="(.*?)"');
	var pattern = new RegExp('([\\s|\\S]* ' + attribute + '\=")(.*?)("[\\s|\\S]*)');
	return template.replace(pattern, "$2");
}

 function getTagValue(template, startTag, endTag){
 	// var pattern = new RegExp('(' + startTag + '[\\s\\S].*?(?!' + startTag + ')[\\s\\S].*?>[\\s\\S]*?' + endTag + ')', 'gmi');
	var pattern = new RegExp('([\\s|\\S]*' + startTag + ')(.*?)(' + endTag + '[\\s|\\S]*)', 'gmi');
	return template.replace(pattern, "$2");
}  

function showAddVFButton(){
	var view = tabsFrame.newView;
	var pattern = tabsFrame.patternRestriction;
	var index = view.tableGroups.length - tabsFrame.selectedTableGroup - 1;
	var validPatterns = '|ab-viewdef-report|ab-viewdef-report-drilldown|ab-viewdef-report-drilldown-two-level|ab-viewdef-paginated|ab-viewdef-paginated-parent-child|ab-viewdef-paginated-parent-parent-child|ab-viewdef-column';
	var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);

	if(pattern.match(/ab-viewdef-paginated/gi)){
		var tgrp = view.tableGroups[index];
		if(hasSummarizeBySortOrder(tgrp) || pattern.match(/paginated-highlight-thematic/) || (pattern.match(/ab-viewdef-paginated-stats-data/gi) && (index !=1)) || (pattern.match(/paginated-highlight-restriction/) && (index != 2))){
			$('addVirtualField').style.display = 'none';
			
			var fields = tgrp.fields;
			var bHasVF = false;
			if(fields){
				for(var i=0; i<fields.length; i++){
					if((fields[i].is_virtual == 'true') || (fields[i].is_virtual == true)){
						bHasVF = true;
					} 
				}
			}
			
			// warn
			if(bHasVF){
				alert(getMessage('removeVFs'));
			}

		} else {
			$('addVirtualField').style.display = '';
		}
		
	// button for form panels of edit forms	
	} else if(pattern.match(/editform-drilldown-popup|ab-viewdef-columnreport-drilldown/gi) || (pattern.match(/editform|summary-chart-drilldown|summary-report-drilldown/gi) && (index != (numberOfTblgrps - 1))) || (pattern.match(/editform-drilldown-console/) && (index != 0)) ){
		$('addVirtualField').style.display = '';
	} else if(validPatterns.search(pattern) != -1){
		$('addVirtualField').style.display = '';
	} else {
		$('addVirtualField').style.display = 'none';
	}		
} 



function removeVirtualFields(){
	var view = tabsFrame.newView;
	var pattern = tabsFrame.patternRestriction;
	var validPatterns = '|ab-viewdef-report|ab-viewdef-report-drilldown|ab-viewdef-report-drilldown-two-level|ab-viewdef-summary-chart|ab-viewdef-summary-chart-drilldown|ab-viewdef-summary-report|ab-viewdef-summary-report-drilldown|ab-viewdef-paginated|ab-viewdef-paginated-parent-child|ab-viewdef-paginated-parent-parent-child|';
	var tgrps = view.tableGroups;
	var bRemoveVF = false;
	for(var x=0; x<tgrps.length; x++){
		if(pattern.match(/ab-viewdef-paginated/gi)){
			var tgrp = view.tableGroups[x];
			var fields = tgrp.fields;
			if(hasSummarizeBySortOrder(tgrp)){
				for(var j=0; j<fields.length; j++){
					if((fields[j].is_virtual == 'true') || (fields[j].is_virtual == true)){
						bRemoveVF = true;
					} 
				}	
				break;	
			}	
		} else if(!pattern.match(validPatterns)){
			bRemoveVF = true;
			break;
		}
	}	
	
	if(bRemoveVF){
		var answer = confirm(getMessage('confirmRemoveVFs'));
		if(answer){
			for(var y=0; y<tgrps.length; y++){
				var fields = tgrps[y].fields;
				var newFields = [];
				for(var i=0; i<fields.length; i++){
					if((fields[i].is_virtual == false) || (fields[i].is_virtual == 'false')){
						newFields.push(fields[i]);
					} 
				}

				var newSortFields = [];
				var sortFields = tgrps[y].sortFields;
				for(var i=0; i<sortFields.length; i++){
					if((sortFields[i].is_virtual == false) || (sortFields[i].is_virtual == 'false')){
						newSortFields.push(sortFields[i]);
					} 
				}
				view.tableGroups[y].fields = newFields;
				view.tableGroups[y].sortFields = newSortFields;
				tabsFrame.newView = view;
			}
			return true;
		} else {
			return false;
		}	
	}
	return true;
}

function hasFieldsWithSameName(fields){
	if(fields){
		for(var i=0; i<fields.length; i++){
			for(var j=i+1; j<fields.length; j++){
				if(fields[i].field_name == fields[j].field_name){
					return true;

				}
			}
		}
	}
	return false;
}

function removeShowCountOrTotals(measures){
	var newMeasures = [];
	if(measures){
		for(var i=0; i<measures.length; i++){
			var stats = measures[i].stats;		
			for(var j=0; j<stats.length; j++){
				if((stats[j].toLowerCase() == "count") || (stats[j].toLowerCase() == "sum")){
					stats.splice(j, 1);
				}
			}
			measures[i].stats = stats;
						
			// remove measure
			if(stats.length == 0){
			} else {
				newMeasures = measures[i];
			}		
		}
	}

	return newMeasures;
}

// Returns boolean of whether or 64 bit IE browser
function is64BitIE(){
	var userAgent = navigator.userAgent;
	var sixtyfourBit = "WOW64";
  if ((navigator.appName == 'Microsoft Internet Explorer') && !(userAgent.search(sixtyfourBit) == -1) ){
  	return true;
  }
 	return false;
}	

function createStatPrefix(prefix){
	prefix = prefix.toLowerCase();
	prefix = prefix.replace("-", "_");
	switch (prefix) {
		case "sum_percent":
			prefix = "sp";
		break;
		case "count_percent":
			prefix = "cp";
		break;           
		case "count":
			prefix = "ct";
		break;
	}
	return prefix;
}

function isNumeric(elem){
	var numericExpression = /^[0-9]+$/;
	if(elem.value.match(numericExpression)){
		return true;
	}else{
		alert(getMessage('invalidNumber'));
		elem.focus();
		return false;
	}
}

/**
 * Save view title into view object
 *
 * @param	None
 * @return	None
 *
 */
function saveViewTitle(){
    var view = tabsFrame.newView;
    var viewTitle = $('viewTitle').value;
    viewTitle = replaceAmpersand(viewTitle);
    view.title = viewTitle;
    tabsFrame.newView = view;
}

/**
 * Replace display ampersand with HTML ampersand (ie replace & with &amp;)
 *
 * @param	str_original		String 	Input
 * @return	str_new		String 	Output with & replaced as &amp;
 *
 */
function replaceAmpersand(str_original){
    var objRegExp = /\&/gi;
    var str_new = str_original.replace(objRegExp, '&amp;');
    
    return str_new;
}

function addStringSeparators(str){
	if(valueExistsNotEmpty(str)){
		if(str.charAt(str.length-1) == ';'){
			str = str.substring(0, str.length-1);
		}
		str = str.replace(/[\s]*;[\s]*/gi, "','");
		str = "'" + str + "'";
	}
	return str;
}

function addFieldsToRestriction(restriction, fieldsStr){
	var msg = '';
	var invalid_msg = getMessage('invalid_field');
	if(fieldsStr.charAt(fieldsStr.length-1) == ';'){
		fieldsStr = fieldsStr.substring(0, fieldsStr.length-1);
	}

	if(fieldsStr == ''){
		return restriction;
	}
	
	fieldsStr = fieldsStr.replace(/[\s]*;[\s]*/gi, ",");
	var fields = fieldsStr.split(/,/);

	for(var i=0; i<fields.length; i++){
		var field = fields[i];
		var tmp = field.split(/\./);
		var table_name = tmp[0];
		var field_name = tmp[1];
		if(valueExists(field_name) && valueExists(table_name)){	
			var firstOp = (restriction.clauses.length > 1) ? ' OR ' : ') AND (';
			restriction.addClause("afm_flds.table_name", table_name, '=' , firstOp);
			restriction.addClause("afm_flds.field_name", field_name, '=' , 'AND');
		}	else {
			msg += invalid_msg.replace('{0}', table_name);
			msg = msg.replace('{1}', field_name);
		}	
	}
	
	if(msg != ''){
		alert(msg);
	}

	return restriction;
}