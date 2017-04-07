/**
 * Read in the view file, convert it into a view object, and store the view information in the tab frame
 *
 * @param	tabsFrame	Need for alter view
 * @return	None
 *
 */
function loadSelectedView(tabsFrame){
    var fileName = tabsFrame.fileToConvert;
    var isAlter = (tabsFrame != null && typeof tabsFrame.isAlter != "undefined" && tabsFrame.isAlter != null && tabsFrame.isAlter);
    // set parameters for a view that is located in the filesToConvert folder
    var parameters = {
        'fileName': fileName,
        'fileType': 'View'
    };
    
    // set parameters an Alterable view
    if (isAlter) {
        parameters = {
            'fileName': fileName,
            'fileType': 'Canonic'
        };
    }
    
    // run wf rule to get view contents
    try{
    	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-getViewContents', parameters);
    	var fileContents = result.message;
    	
    	// store filename, whether it is alterable, and filecontents in the tab frame
    	tabsFrame.fileFullName = result.data.fileFullName;
    	tabsFrame.isAlterable = result.data.isAlterable;
    	tabsFrame.fileContents = fileContents;
    	
    	// convert the file to a view object and store in tab frame
    	convertToViewObject(tabsFrame);
    	var view = tabsFrame.newView;
    	
    	// get and store number of tablegroups in view object
    	var numTgrps = view.tableGroups.length;
    	tabsFrame.tablegroupsRestriction = numTgrps;
    	
    	// set the data, owner, and owner2 properties   
    	for (i = (numTgrps - 1); i >= 0; i--) {
    		if (i == (numTgrps - 1)) {
    			tabsFrame.datagrpRestriction = view.tableGroups[i].tables[0].table_name;
    		}
    		if (i == (numTgrps - 2)) {
    			tabsFrame.ownergrpRestriction = view.tableGroups[i].tables[0].table_name;
    		}
    		if (i == (numTgrps - 3)) {
    			tabsFrame.owner2grpRestriction = view.tableGroups[i].tables[0].table_name;
    		}
    	}
  } catch(e){
  	alert('Error: ' + e.message);
  }
}

/**
 * Convert the file contents to a view object
 *
 * @param	None
 * @return	None
 *
 */
function convertToViewObject(tabsFrame){
    var fileToConvert = tabsFrame.fileToConvert;

    if ((fileToConvert != undefined) && (fileToConvert != "") && (fileToConvert != null)) {
        var result = getViewObject(tabsFrame);
        var oView = result.viewObj;
        var titles = result.viewTitles;
        
        for (var i in oView.tableGroups) {
            // get tables
            var oTables = oView.tableGroups[i].tables;
            
            // get fields
            oFields = oView.tableGroups[i].fields;
            
            // get sorts
            oSortFields = oView.tableGroups[i].sortFields;
            
            // get titles, if they exist
            if (titles != undefined) {
                oView.tableGroups[i].title = titles[i];
            }
            
            // get the tablegroup position and store the table names
            var tgrpPos = oView.tableGroups.length - i;
            for (var j in oTables) {
                // Search for the main table and add this our view object
                if (oTables[j].role == "main") {
                    switch (tgrpPos) {
                        case 1:
                            tabsFrame.datagrpRestriction = oTables[j].table_name;
                            break;
                        case 2:
                            tabsFrame.ownergrpRestriction = oTables[j].table_name;
                            break;
                        case 3:
                            tabsFrame.owner2grpRestriction = oTables[j].table_name;
                            break;
                    }
                }
            }
            
            // store fields into view object
            oFields = getFieldProperties(oFields);
            oView.tableGroups[i].fields = oFields;
            
            // store sorts into view object
            oSortFields = getFieldProperties(oSortFields);
            oView.tableGroups[i].sortFields = oSortFields;
        }

        // store view pattern into view object
        oView.pattern = tabsFrame.patternRestriction;
        
        // store view object into tabs frame
        tabsFrame.newView = oView;
    }
}

/**
 * Returns an object that contains two properties: the view object and an array of titles
 *
 * @param	None
 * @return	object with two properties: the view object and titles array
 *
 */
function getViewObject(tabsFrame){
    var fileToConvert = tabsFrame.fileToConvert;
    var originalView = tabsFrame.fileContents;
    var fileExt = fileToConvert.substring((fileToConvert.length - 5), (fileToConvert.length));
    
    // if *.axvw file...
    if (fileExt.toUpperCase() == ".AXVW") {
        // remove any non-essential titles (PDF, XLS, etc)
        originalView = removeNonEssentialTitles(originalView);
        
        // convert the string to a DOM object   
        var domObject = getViewAsDOM(originalView);
        
        // un-nest afmTableGroups
        originalView = preprocessView(domObject);
        
        // get the titles
        var titles = getTitles(domObject);
    }
 
    // process the view, converting it a view object
    var myView = new Ab.ViewDef.View();
    if ((originalView != undefined) && (originalView != null) && (originalView != "")) {
        var myConverter = new Ab.ViewDef.Convert(originalView, "myView");
        myConverter.convertDo();
        var convertedContents = myConverter.getConvertedContentsAsJavascript();
        if (myConverter.hasUnconvertableSections()) 
            alert(myConverter.getDescriptionOfUnconvertableSections());
        eval(convertedContents);
    }
    
    return {
        viewObj: myView,
        viewTitles: titles
    };
}

/**
 * Convert a string of view contents (after stripping away unessential titles) and return as a DOM object
 *
 * @param	originalView 	String of view contents (after stripping away unessential titles)
 * @return	x				Object dom representation of string
 *
 */
function getViewAsDOM(originalView){

    // code for IE
    if (window.ActiveXObject) {
        var doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
        doc.loadXML(originalView);
    }
    else {
    
        // code for Mozilla, Firefox, Opera, etc.
        var parser = new DOMParser();
        var doc = parser.parseFromString(originalView, "text/xml");
    }
    
    var x = doc.documentElement;
    
    return x;
}

/**
 * Remove common, non-essential titles (PDF, XLS, buttons, etc) that can clutter the parsing of essential titles
 *
 * @param	originalView	String containing original view contents
 * @return	originalView	String containing view contents after removing non-essential titles
 *
 */
function removeNonEssentialTitles(originalView){
    var objRegExp = /<title.*>Parsed Restriction<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>SQL Restriction<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>PDF<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>XLS<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>Save<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>Delete<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>Cancel<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>Add New<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    var objRegExp = /<title.*>Refresh<\/title>/gi;
    originalView = originalView.replace(objRegExp, "");
    
    return originalView;
}

/**
 * Returns an array of tablegroup titles for pre-17.1 (which use <afmTableGroup>) and 17-1 and later views
 * (which use <panel>)
 *
 * @param	x		DOM object of view contents
 * @return	titles	Array of tablegroup titles
 *
 */
function getTitles(x){
    var titles = new Array();
    
    // get tablegroups for pre-17.1 views   
    var afmTableGroup = x.getElementsByTagName("afmTableGroup");
    
    // get tablegroups for 17.1 and later views
    if (afmTableGroup.length == 0) {
        afmTableGroup = x.getElementsByTagName("panel");
    }
    
    // loop through each tablegroup.  if there is a title, push it into the titles array. if not, push in an empty string to have a placeholder
    for (i = 0; i < afmTableGroup.length; i++) {
        var tgrpTitle = afmTableGroup[i].getElementsByTagName("title");
        if (tgrpTitle.length == 0) {
            titles.push("");
        }
        else {
            titles.push(tgrpTitle[0].text);
        }
    }
    return titles;
}

/**
 * In some pre-17.1 views, the <dataSource> element may appear after its sibling <afmTableGroup>
 * element, which can invert the tablegroups in the converted view.  preprocessView first
 * bubbles afmTableGroup's nextSibling nodes to the top of the peer nodes, unnesting the
 * tablegroups.  Returns contents as a string.
 *
 * @param	x					DOM object of the view contents
 * @return	preprocessedView	String representative of unnested contents
 *
 */
function preprocessView(x){
    // get tablegroups (Firefox includes textnodes, so cannot use nextSibling)
    var afmTableGroup = x.getElementsByTagName("afmTableGroup");
    
    // for each tablegroup, get the parent, siblings, and number of siblings
    for (i = 0; i < afmTableGroup.length; i++) {
        var parent = afmTableGroup[i].parentNode;
        var siblings = afmTableGroup[i].parentNode.childNodes;
        var numberOfSiblings = siblings.length;
        
        // for each sibling
        for (j = 0; j < numberOfSiblings; j++) {
        
            // find current afmTableGroup position
            if (siblings[j] == afmTableGroup[i]) {
            
                // while it is not the last node    					  	
                while ((j < numberOfSiblings) && (siblings[j + 1])) {
                
                    // move on if this is a text node (mainly for FF) or if its sibling is another afmTableGroup
                    if ((siblings[j + 1].nodeType == 3) || (siblings[j + 1].nodeName == "afmTableGroup")) {
                        j = j + 1;
                    }
                    else {
                        // otherwise, swap the nodes so that non-afmTablegroups bubble to the top
                        var new_node = afmTableGroup[i].parentNode.removeChild(siblings[j + 1]);
                        parent.insertBefore(new_node, afmTableGroup[i]);
                        break;
                    }
                }
            }
        }
    }
    
    // convert DOM to string for IE
    var preprocessedView = String(x.xml);
    
    // convert DOM to string for Firefox   
    if ((preprocessedView == "undefined") || (preprocessedView == null)) {
        var serializer = new XMLSerializer();
        preprocessedView = String(serializer.serializeToString(x));
    }
    
    return preprocessedView;
}

/**
 * Returns an array of field objects with properties filled in.  Field objects will contain table_name,
 * field_name, ml_heading, data_type, primary_key, and afm_type.  Often this information may not be available
 * when strictly reading in a previously created view, so a wf rule is retrieve this information.
 *
 * @param	oFields		Array of original field objects
 * @return	oFields		Array of field objects with properties filled in
 *
 */
function getFieldProperties(oFields){
    var restriction = "";
    var restrictionLang = "";
    
    // loop through array of field objects    
    for (var i in oFields) {
    
        // if encounter a field object that does not have both a table name AND a field name, remove it
        if ((oFields[i].table_name == undefined) || (oFields[i].field_name == undefined)) {
            oFields = oFields.remove(i);
        }
        else {
            // otherwise, add to restriction
            if (i != 0) {
                restriction += " OR ";
                restrictionLang += " OR ";
            }
            restriction += "(afm_flds.table_name = '" + oFields[i].table_name + "' AND afm_flds.field_name = '" + oFields[i].field_name + "') \n";
            restrictionLang += "(afm_flds_lang.table_name = '" + oFields[i].table_name + "' AND afm_flds_lang.field_name = '" + oFields[i].field_name + "') \n";
        }        
    }
    

    var parameters = {
        tableName: 'afm_flds',
        fieldNames: toJSON(['afm_flds.field_name', 'afm_flds.ml_heading', 'afm_flds.data_type', 'afm_flds.primary_key', 'afm_flds.table_name', 'afm_flds.afm_type']),
        restriction: restriction
    };
    
    // retrieve field properties
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
    	
    	var dataLang = [];
    	
    	var currentLanguageFieldName = (View.user.dbExtension == '')  ? 'afm_flds.ml_heading' :  'afm_flds_lang.ml_heading' + '_' + View.user.dbExtension;    

    	if((currentLanguageFieldName != 'afm_flds.ml_heading')){
    		var parametersLang = {
    			tableName: 'afm_flds_lang',
    			fieldNames: toJSON(['afm_flds_lang.field_name', 'afm_flds_lang.ml_heading_' + View.user.dbExtension,  'afm_flds_lang.table_name']),
    			restriction: restrictionLang
    		};
    		var resultLang = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parametersLang);
    		if (resultLang.code == 'executed') {
    			dataLang = resultLang.data;
    		}
    	}

                  
    
        // map field properties to field object
        for (var j in result.data.records) {
            var rows = result.data.records[j];
            for (var k in oFields) {
                if ((oFields[k].field_name == rows['afm_flds.field_name']) && (oFields[k].table_name == rows['afm_flds.table_name'])) {
                    //	oFields[k].ml_heading = rows['afm_flds.ml_heading'].replace(/[\n|\r]/," ");
                    //oFields[k].ml_heading_english = rows['afm_flds.ml_heading'];
                    oFields[k].ml_heading = rows['afm_flds.ml_heading'];
                    oFields[k].ml_heading_english = ((valueExistsNotEmpty(oFields[k].ml_heading_english_original)) && (rows['afm_flds.ml_heading'] != oFields[k].ml_heading_english_original)) ?  oFields[k].ml_heading_english_original : rows['afm_flds.ml_heading'];
                    oFields[k].ml_heading_english_original = rows['afm_flds.ml_heading'];
                    oFields[k].data_type = rows['afm_flds.data_type'];
                    oFields[k].afm_type = rows['afm_flds.afm_type'];
                    oFields[k].primary_key = rows['afm_flds.primary_key'];
                    if(currentLanguageFieldName != 'afm_flds.ml_heading'){
                    	var rowsLang = dataLang.records[j];
                    	oFields[k].ml_heading = rowsLang[currentLanguageFieldName];
                    } else {
                    	oFields[k].ml_heading = rows['afm_flds.ml_heading'];
                    }                    
                                     
                }
            }
        }
    }
    else {
        Ab.workflow.Workflow.handleError(result);
    }
    
    return oFields;
}



