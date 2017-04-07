var tabsFrame = View.getView('parent').panels.get('tabsFrame');
var vdw_preview_control = View.createController('vdw_preview', {
    tgFrame_page5_afterRefresh: function(){
        onLoadPreview();
    }
    
});

/**
 * Sets up the "Preview" page and generates a viewable *.axvw based upon selected options in the previous tabs.
 * Called each time the "Preview" tab if loaded or refreshed.
 *
 * @param  	None
 * @return 	None
 *
 */
function onLoadPreview(){

    // enable all relevant tabs.  Disable rest.
    tabsFrame.setTabEnabled("page6", true);
    tabsFrame.setTabEnabled("page7", false);
    
    // clear any restrictions
    tabsFrame.restriction = null;
    
    // set the button label (for localization)
    $('saveChangeButton').value = getMessage("saveChanges");
    
    // check if view type was selected
    checkIfViewTypeSelected();
    
    // check if pattern was selected
    checkIfPatternSelected();
    
    // ensure that the selected pattern is a valid selected view type
    validatePattern();
    
    // delete old temp file
    deletePrimaryTempFile();
    
    // if there is a secondary temp file, delete it
    deleteSecondaryTempFile();
    
    // if a file needs to be converted, convert first.  otherwise, it is a new view, so directly process it.
    processView();
}

/**
 * Checks if a view type was selected.  If not, alert and navigate to "Select Type" tab.
 *
 * @param  	None
 * @return 	None
 *
 */
function checkIfViewTypeSelected(){
    if ((tabsFrame.typeRestriction == undefined) || (tabsFrame.typeRestriction == "")) {
        alert(getMessage("noViewType"));
        tabsFrame.selectTab('page1');
        return;
    }
}

/**
 * Checks if a pattern was selected.  If not, alert and navigate to "Select Pattern" tab.
 *
 * @param  	None
 * @return 	None
 *
 */
function checkIfPatternSelected(){
    if ((tabsFrame.patternRestriction == undefined) || (tabsFrame.patternRestriction == "")) {
        alert(getMessage("noPattern"));
        tabsFrame.selectTab('page2');
        return;
    }
}

/**
 * Explicitly delete old temp file
 *
 * @param  	None
 * @return 	None
 *
 */
function deletePrimaryTempFile(){
    if ((tabsFrame.uniqueFileName != null) || (tabsFrame.uniqueFileName != "")) {
        var parameters = {
            'fileName': tabsFrame.uniqueFileName + ".axvw"
        };
        var result = Workflow.runRuleAndReturnResult('AbSystemAdministration-deleteFile', parameters);
    }
}

/**
 * If there is a secondary temp file, delete it
 *
 * @param  	None
 * @return 	None
 *
 */
function deleteSecondaryTempFile(){
    if ((tabsFrame.secondaryFilePath != null) || (tabsFrame.secondaryFilePath != "")) {
        var secondaryFilePath = tabsFrame.secondaryFilePath;
        if (secondaryFilePath != undefined) {
            var secondaryFileName = secondaryFilePath.match(/(.*)[\/\\]([^\/\\]+\.\w+)$/);
            var parameters = {
                'fileName': secondaryFileName[2]
            };
            var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-deleteFile', parameters);
        }
    }
}

/**
 * If a file needs to be converted, convert first.  Otherwise, it is a new view, so directly process it.
 *
 * @param  	None
 * @return 	None
 *
 */
function processView(){
    // get the file contents	
    var fileToConvert = tabsFrame.fileToConvert;
    
    // if this is a file conversion   
    if ((fileToConvert != undefined) && (fileToConvert != '')) {
        convertFilePerform(fileToConvert);
    }
    else 
        if ((fileToConvert == undefined) || (fileToConvert == '') && (tabsFrame.newView != null)) {
            // if this is a new view
            var myView = convertToViewDefObj();
            if (myView != undefined) {
                try {
                    applyPatternToCreateAXVW(myView, getMessage("none"));                    
                } 
                catch (e) {
                }
            }
        }
}

/**
 * Navigate to the next tab ("Save")
 *
 * @param  	None
 * @return 	None
 *
 */
function selectTab6(){
    if (tabsFrame != null) {
        tabsFrame.selectTab("page6");
    }
}

/**
 * Check if pattern is valid view type.  If no, warn
 *
 * @param  	None
 * @return 	None
 *
 */
function validatePattern(){
    var viewType = tabsFrame.typeRestriction;
    var pattern = tabsFrame.patternRestriction;
    var bValid = false;
    	
	/*
	var viewTypeRegExpObj = new RegExp(viewType, 'gi');
	alert(pattern + '\n' + viewType)
	if (!pattern.match(viewTypeRegExpObj)) {
		alert(getMessage("wrongPattern"));
        tabsFrame.selectTab("page2");
	}
  	*/
	
    switch (viewType) {
        case "reports":
            if (pattern.match(/report/gi)) {
                bValid = true;
            }
            break;
        case "paginated":
            if (pattern.match(/paginated/gi)) {
                bValid = true;
            }
            break;           
        case "summaryReports":
            if (pattern.match(/summary/gi)) {
                bValid = true;
            }
            break;
            
        case "editForms":
            if (pattern.match(/edit/gi)) {
                bValid = true;
            }
            break;
        case "columnReports":
            if (pattern.match(/columnreport/gi)) {
                bValid = true;
            }
            break;
        case "url":
            if (pattern.match(/url/gi)) {
                bValid = true;
            }
            break;
    }
    
    if (bValid == false) {
        alert(getMessage("wrongPattern"));
        tabsFrame.selectTab("page2");
    } 
}
