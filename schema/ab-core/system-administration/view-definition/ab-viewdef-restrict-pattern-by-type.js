var tabsFrame = View.getView('parent').panels.get('tabsFrame');
function user_form_onload(){
    user_form_afterSelect();
}

/**
 * Called when "Select Pattern" tab is loaded or refreshed.  Sets up form and displays
 * available patterns based upon view type
 *
 * @param	None
 * @return	None
 *
 */
function user_form_afterSelect(){
    var fileToConvert = tabsFrame.fileToConvert;
    
    // disable tabs "Save" and "Publish" tabs
    tabsFrame.setTabEnabled("page6", false);
    tabsFrame.setTabEnabled("page7", false);
    var patternsTable = $('patternsTable');
     
    // reset pattern form  	
    var patterntypes = document.getElementsByName('viewPattern');
    var patternTDs = patternsTable.getElementsByTagName("td");
    for (var x = 0; x < patternTDs.length; x++) {
        patternTDs[x].style.display = "none";
        $('NoMatchMsg').style.display = "";
    }
    
    // if a conversion, there is no need to select tables, so hide "Select Data" button and show "Select Characteristics" buttons
    if ((fileToConvert != undefined) && (fileToConvert != null) && (fileToConvert != "")) {
        $('gotoSelectDataStep').style.display = "none";
        $('gotoCharacteristicsStep').style.display = "";
    }
    else {
        // if a new view, show "Select Data" button and hide "Select Characteristics" buttons
        $('gotoCharacteristicsStep').style.display = "none";
        $('gotoSelectDataStep').style.display = "";
    }
    
    // check if a view type was selected.  if not, navigate to "Select Type" tab    
    if ((tabsFrame.typeRestriction == undefined) || (tabsFrame.typeRestriction == "")) {
        alert(getMessage('noType'));
        tabsFrame.selectTab('page1');
    }
    
    // display available patterns	
    displayAvailablePatterns();
    
    // ensure that previously selected value (the type of pattern) is displayed on the interface even if navigate to another part of the wizard and then navigate back
    if (tabsFrame.typeRestriction != undefined) {
        var patterntype = tabsFrame.patternRestriction;
        for (i = 0; i < patterntypes.length; i++) {
            if (patterntypes[i].id == patterntype) {
                patterntypes[i].checked = true;
            } else {
                patterntypes[i].checked = false;				
			}
        }
    }
    
}

/**
 * Display available patterns based on number of of tablegroups and view type
 *
 * @param	None
 * @return	None
 *
 */
function displayAvailablePatterns(){
    var view = tabsFrame.newView;
    var viewType = tabsFrame.typeRestriction;
	    
    // if the number of actual tablegroups is less than or equal to the number of the tables required by patterns, use the actual number of tablegroups
    if ((view.tableGroups) && (view.tableGroups.length <= tabsFrame.tablegroupsRestriction)) {
        var numberOfTgrpsInView = tabsFrame.tablegroupsRestriction;
    }
    else {
    
        // otherwise, set this to 0 to show all patterns
        var numberOfTgrpsInView = 0;
    }
    
    // if there is a file to convert, detect the number of tablegroups in the view and display the available patterns    
    if ((tabsFrame.fileToConvert != undefined) && (tabsFrame.fileToConvert != '') || (numberOfTgrpsInView > 0)) {
    
        var tdObjects = document.getElementsByTagName("td");
        for (i = 0; i < tdObjects.length; i++) {
            if (tdObjects[i].id == String(numberOfTgrpsInView)) {
                var trObject = tdObjects[i].parentNode;
                if (String(trObject.id) == String(viewType)) {
                    tdObjects[i].style.display = "";
                    $('NoMatchMsg').style.display = "none";
                }
            }
        }
    }
    else 
        if (viewType != undefined) {
        
            // otherwise show ALL available patterns       
            var trObjects = document.getElementsByTagName("tr");
            for (i = 0; i < trObjects.length; i++) {
                if (trObjects[i].id == String(viewType)) {
                    var tdObjects = trObjects[i].getElementsByTagName("td");
                    for (j = 0; j < tdObjects.length; j++) {
                        if (tdObjects[j].id) {
                            tdObjects[j].style.display = "";
                            $('NoMatchMsg').style.display = "none";
                        }
                    }
                }
            }
        }
}

/**
 * Loops through radio buttons and stores selected pattern and its corresponding number of
 * available tablegroups
 *
 * @param	None
 * @return	None
 *
 */
function setViewPattern(obj){
	var pattern = obj.id;
	tabsFrame.patternRestriction = pattern;
	tabsFrame.tablegroupsRestriction = obj.value;
	var view = tabsFrame.newView;
	    
	// if drawing selected and tables don't match, reset tablegroups
	if (pattern.match(/paginated-highlight/gi) && view.hasOwnProperty('tableGroups')) {
		if (tabsFrame.hasOwnProperty('owner2grpRestriction') && tabsFrame.hasOwnProperty('ownergrpRestriction') && tabsFrame.hasOwnProperty('datagrpRestriction')) {		
			if (!((tabsFrame.ownergrpRestriction == tabsFrame.owner2grpRestriction) && (tabsFrame.datagrpRestriction == tabsFrame.owner2grpRestriction))) {
				view.tableGroups = new Array();
				tabsFrame.ownergrpRestriction = "";
				tabsFrame.owner2grpRestriction = "";
				tabsFrame.datagrpRestriction = "";
			}
		}
	}
	
	// check sortfields for 1D and 2D summary reports and charts
	
	if(pattern.match(/summary/gi)){
		if(!hasCorrectSortFields(view, pattern)){
			alert(getMessage('tooManyGroupingFields'));
		}
	}
	
    view.pattern = tabsFrame.patternRestriction;
    tabsFrame.newView = view;
}

function hasCorrectSortFields(view, pattern){
	var hasTableGroups = view.hasOwnProperty('tableGroups') ? true : false;
	if (hasTableGroups && (view.tableGroups.length > 0)){
		var tableGroups = view.tableGroups;
		for (var i=0; i<tableGroups.length; i++){
			if(tableGroups[i].hasOwnProperty('sortFields')){
				  var sfCount = tableGroups[i].sortFields.length;
				  var bDataTgrp = (i == tableGroups.length - 1) ? true : false;
					if(pattern.match(/chart-2d/gi) && (sfCount > 1)){
						return false;
					}
					if(pattern.match(/chart/gi) && (sfCount > 1) && bDataTgrp){
						return false;
					}
					if(pattern.match(/report/gi) && (sfCount > 2) && bDataTgrp){
						return false;
					}
			}
		}
	}	
  return true;	
}

/**
 * Warns if no pattern was selected.  Otherwise, goes to "Select Data" tab
 *
 * @param  	None
 * @return 	None
 *
 */
function continueToSelectData(){
    if ((tabsFrame.patternRestriction == undefined) || (tabsFrame.patternRestriction == "")) {
        alert(getMessage("noPattern"));
    }
    else {

    	if(tabsFrame.typeRestriction == 'url'){
    		//tabsFrame.showTab('page4URL', true);
    		tabsFrame.selectTab('page4URL');
    	} else {
    		//tabsFrame.setTabVisible('page4URL', false);
    		//tabsFrame.setTabVisible('page4', true);
        tabsFrame.selectTab('page3');
      }
    }
}

/**
 * Warns if no pattern was selected.  Otherwise, goes to "Set Characteristics" tab
 *
 * @param 	None
 * @return 	None
 *
 */
function continueToCharacteristics(){
    if ((tabsFrame.patternRestriction == undefined) || (tabsFrame.patternRestriction == "")) {
        alert(getMessage("noPattern"));
    }
    else {
     		if(tabsFrame.typeRestriction == 'url'){
    			//tabsFrame.showTab('page4URL', true);
    			tabsFrame.selectTab('page4URL');
    		} else {
    			//tabsFrame.setTabVisible('page4URL', false);
    			//tabsFrame.setTabVisible('page4', true);
        	tabsFrame.selectTab('page3');
      	}
    }
}
