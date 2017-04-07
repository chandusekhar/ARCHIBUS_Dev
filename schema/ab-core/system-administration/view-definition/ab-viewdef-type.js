tabsFrame = View.getView('parent').panels.get('tabsFrame');

/**
 * Called when "Select Type" tab is loaded
 *
 * @param  	None
 * @return 	None
 *
 */
function user_form_onload(){
    user_form_afterSelect();
}

/**
 * Called when "Select Type" tab is loaded or refreshed
 *
 * @param  	None
 * @return 	None
 *
 */
function user_form_afterSelect(){

    // enable relevant tabs.  disable rest.
    enableViewTypeTabs();
    
    // no edit forms for mini
    $('edit').style.display = (isMiniWizard()) ? 'none' : '';
       
    // ensure that a previously selected value (the type of view) is displayed on the interface
    displaySelectedViewType();

    // if the number of table groups have not been determined, process.  Otherwise, skip
    if ((tabsFrame.tablegroupsRestriction == undefined) || (tabsFrame.tablegroupsRestriction == 0)) {
    
        // if no file name was selected, this is a new view
        if ((tabsFrame.fileToConvert == undefined) || (tabsFrame.fileToConvert == '')) {
        
            // initialize view object, store in tabs frame, and clear objects        
            initViewObjAndClearTables();
        }
        else {
            // otherwise, this is a view that needs to be converted, load the view and read in selected view        
            loadSelectedView(tabsFrame);
            
            // disable select box
            tabsFrame.disableFileSelect = true;
        }
    }
    
    // read in the view properties
    var view = tabsFrame.newView;
    
    // if there are tablegroups, disable the select box
    if (view.tableGroups.length > 0) {
        tabsFrame.disableFileSelect = true;
    }
}

/**
 * Enable tabs relevant to "Select Type" tab.  Disable rest.
 *
 * @param  	None
 * @return 	None
 *
 */
function enableViewTypeTabs(){
    tabsFrame.setTabEnabled("page0", true);
    tabsFrame.setTabEnabled("page1", true);
    tabsFrame.setTabEnabled("page2", false);
    tabsFrame.setTabEnabled("page3", false);
    tabsFrame.setTabEnabled("page4", false);
    tabsFrame.setTabEnabled("page5", false);
    tabsFrame.setTabEnabled("page6", false);
    tabsFrame.setTabEnabled("page7", false);
}

/**
 * Ensure that a previously selected value (the type of view) is displayed on the interface.
 * Used when navigate to another part of the wizard and then navigate back
 *
 * @param  	view 	Object that store view properties
 * @return 	None
 *
 */
function displaySelectedViewType(){
    // get view type radio buttons
    var viewtype = document.getElementsByName('viewtype');
    
    // loop through radio buttons and check if it matches previously selected value 	
    if (tabsFrame.typeRestriction != undefined) {
        for (i = 0; i < viewtype.length; i++) {
            if (viewtype[i].value == tabsFrame.typeRestriction) {
                viewtype[i].checked = true;
            }
            else {
                viewtype[i].checked = false;
            }
        }
    }
}

/**
 * Initialize view object, creating the tablegroups and chartProperties, and store
 * object as a property in the parent tab frame.  Clear table names.
 *
 * @param  	view 	Object that store view properties
 * @return 	None
 *
 */
function initViewObjAndClearTables(){
    // create an object to store properties of the view
	var view = new Object();
    
    // create an array that will later hold tablegroups
    var tableGroups = new Array();
    
    // assign this array of tablegroups to the view object
    view.tableGroups = tableGroups;
    
    // initialize and store chart properties into the view object
    view = createChartProperties(view);

    view = createPanelProperties(view);
    
    // initialize and store paginated properties into the view object
	view.paginatedProperties = new Object();
		    
    // initialize and store paginated panel properties into the view object
	// view.paginatedPanelProperties = new Object();
	
    // Store this view object into the tabs frame
    tabsFrame.newView = view;
    
    // clear the table names for each tablegroup
    tabsFrame.datagrpRestriction = "";
    tabsFrame.ownergrpRestriction = "";
    tabsFrame.owner2grpRestriction = "";
}

/**
 * Takes view object as argument and return the object with chartProperties
 * initialized and assigned to it
 *
 * @param  	view 	Object that store view properties
 * @return 	None
 *
 */
function createChartProperties(view){
    view.chartProperties = new Object();
    view.enableChartDrilldown = true;
    return view;
}


function createPanelProperties(view){
		var panelProperty = new Object();	
		
        // 3042418
        if (isMiniWizard()) {
        	panelProperty['docx'] = 'true';
        	panelProperty['xls'] = 'true';
        	panelProperty['txfr'] = 'false';
        	panelProperty['showIndexAndFilterOnLoad'] = 'true';
        }
        
        if (!isMiniWizard() && !isAlterWizard()) {
        	panelProperty['docx'] = 'true';
        	panelProperty['xls'] = 'true';
        	panelProperty['txfr'] = 'true';
        	panelProperty['showIndexAndFilterOnLoad'] = 'true';
        }
    view.panelProperties = [panelProperty,panelProperty,panelProperty];
    return view;
}

/**
 * if a view type was selected, ensure that the appropriate radio button checked
 * used when navigate to a different part of the wizard and back
 *
 * @param  	None
 * @return 	None
 *
 */
function setViewType(value){
	if (tabsFrame.typeRestriction != value) {
		tabsFrame.typeRestriction = value;
		tabsFrame.patternRestriction = '';
	}	   
}

/**
 * Enable chart drilldown as default if this is a summary report
 *
 * @param  	None
 * @return 	None
 *
 */
function enableChartDrilldown(){
    var view = tabsFrame.newView;
    if (tabsFrame.typeRestriction == 'summaryReports') {
        view.enableChartDrilldown = true;
    }
}

/**
 * Called when the continue button is pressed. Warn if no view type was selected.
 * Otherwise, navigate to next tab.
 *
 * @param  	None
 * @return 	None
 *
 */
function continueToSelectPattern(){
    if ((tabsFrame.typeRestriction == "") || (tabsFrame.typeRestriction == undefined)) {
        alert(getMessage("noViewType"));
    }
    else {
        tabsFrame.selectTab('page2');
    }
}


