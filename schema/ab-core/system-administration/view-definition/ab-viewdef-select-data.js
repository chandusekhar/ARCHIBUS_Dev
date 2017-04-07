var tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');
var dataTabsFrame = View.getView('parent').panels.get('dataTabs');
var tabName = dataTabsFrame.getSelectedTabName();
var tgrp_position = Number(tabName.charAt((tabName.length - 1)));
var pattern = tabsFrame.patternRestriction;

var vdw_data_control = View.createController('vdw_data_control', {
    afterInitialDataFetch: function(){
        user_form_afterSelect();
    }	
});

/**
 * Called when "Select Data" child frames are first loaded or when refreshed.  Function used for
 * all three "Select Data" child tabs.  Controls which table and tab to show depending on whether there is
 * an owner table and whether a table was previously selected.
 *
 * @param  	None
 * @return 	None
 *
 */
function user_form_afterSelect(){

	var pattern = tabsFrame.patternRestriction;	
    var tgrpPanel = 'tgrp' + tgrp_position + 'Panel'; // determine  panel name based on the tab name
    var grid = Ab.view.View.getControl('', tgrpPanel);
    var view = tabsFrame.newView; // get the view object
    var numOfTgrps = view.tableGroups.length; // get the number of tablegroups in the view object
    var table_name = ""; // variable to store the current table name
    var parentTable = ""; // variable to store the parent/owner table name (relevant to the curent table)
    var restriction = ""; // variable to store restriction for the next tab
    var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction); // number of tablegroups based on the selected pattern
	    
	// if the number of tablegroup in the pattern matches the number of tablegroups in the view obj, enable corresponding tabs
    if (numOfTgrps == numberOfTblgrps) {
        for (j = 1; j < 4; j++) {
            dataTabsFrame.setTabEnabled("page3-" + j, true);
        }
    }
  
  	var action = grid.actions.get('goNext' + tgrp_position);
	action.enable(false);
			
    // for "data" tablegroup
    if (tgrp_position == 1) {
        table_name = tabsFrame.datagrpRestriction;
        parentTable = tabsFrame.ownergrpRestriction;
        if ((numberOfTblgrps > 1) && !(pattern.match(/highlight/gi))) {
            $('goBack1').style.display = "";
        }
        else {
            $('goBack1').style.display = "none";
        }
    }
    
    // for "owner" tablegroup
    if (tgrp_position == 2) {
        table_name = tabsFrame.ownergrpRestriction;
        parentTable = tabsFrame.owner2grpRestriction;
        if (numberOfTblgrps > 2) {
            $('goBack2').style.display = "";
        }
        else {
            $('goBack2').style.display = "none";
        }
    }
    
    // for "owner2" tablegroup
    if (tgrp_position == 3) {
        table_name = tabsFrame.owner2grpRestriction;
    }
    
    // if a table was previously selected, restrict the grid show only that table record and hide the "Select" button
    if ((table_name != "") && (table_name != undefined)) {
		action.enable(true);  
		  
        // apply restriction to grid
        restriction = "afm_tbls.table_name = '" + table_name + "'";
        grid.refresh(restriction);
        
		hideButtons(grid);
			
    } else if (parentTable != "") {
			action.enable(false);   
			     
            // otherwise, if a parent table exists, restrict grid to show all possible tables that can have the parent table as an owner table
            restriction = "afm_tbls.table_name = '" + parentTable + "' OR EXISTS (SELECT 1 FROM afm_flds WHERE afm_tbls.table_name = afm_flds.table_name AND afm_flds.ref_table='" + parentTable + "'";
            var listOfRestrictedTables = tabsFrame.listOfRestrictionTables;
            restriction += (valueExistsNotEmpty(listOfRestrictedTables) && listOfRestrictedTables != ';') ? " AND table_name IN (" + addStringSeparators(listOfRestrictedTables) + ")" : "";
            restriction += ")";
            grid.refresh(restriction);
    }
   
    // show the miniconsole filter uncollapsed
    if (grid) {
		grid.indexLevel = 0;
        grid.isCollapsed = false;
        grid.showIndexAndFilter();
    }
    
}

/**
 * Called when "Choose a Different Table" button is pressed.  Displays a confirmation prompt.
 * If yes, based on the tablegroup position, disable the "Next" buttons and clear the current table
 * along with any child tables.
 *
 * @param	None
 * @return	None
 *
 */
function chooseDifferentTable(){
    var tgrpPanel = 'tgrp' + tgrp_position + 'Panel';
    var grid = Ab.view.View.getControl('', tgrpPanel);
    var view = tabsFrame.newView;
    var numOfTgrps = view.tableGroups.length;
    var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
    var index = tgrp_position - numOfTgrps - 1;
    var table_name = "";
    var restriction = "";
	var action = grid.actions.get('goNext' + tgrp_position);
    
    // display confirmation prompt
    var answer = confirm(getMessage('removeSubTgrps'));
    
    // if yes   
    if (answer) {
        // if owner2 tablegroup, clear all 3 tables and disable "Next" button
        if ((tgrp_position == 3) && (tabsFrame.tablegroupsRestriction >= 3)) {
            action.enable(true);
            tabsFrame.ownergrpRestriction = "";
            tabsFrame.owner2grpRestriction = "";
            tabsFrame.datagrpRestriction = "";
        }
        
        // if owner1 tablegroup, clear owner1 and data tables and disable "Next" button
        if ((tgrp_position == 2) && (tabsFrame.tablegroupsRestriction >= 2)) {
            action.enable(true);
            table_name = tabsFrame.owner2grpRestriction;
            tabsFrame.ownergrpRestriction = "";
            tabsFrame.datagrpRestriction = "";
        }
        
        // if data tablegroup
        if (tgrp_position == 1) {
            // if pattern calls for only tablegroup, show all tables
            if (tabsFrame.tablegroupsRestriction == 1) {
                table_name = "";
				tabsFrame.datagrpRestriction = "";
            }
            else {
                // otherwise, there are owner tablegroups
                table_name = tabsFrame.ownergrpRestriction;
                tabsFrame.datagrpRestriction = "";
            }
        }
                              
        // restrict view to show relevant tables
        if (pattern.match(/paginated-highlight/gi)){
        	  restriction = 'afm_tbls.table_name IN (SELECT table_name FROM afm_flds WHERE afm_type = 2100)';
        } else if ((table_name != "") & (table_name != undefined)) {
            restriction = "afm_tbls.table_name = '" + table_name + "' OR EXISTS (SELECT 1 FROM afm_flds WHERE afm_tbls.table_name = afm_flds.table_name AND afm_flds.ref_table='" + table_name + "')";
        }
        
        var listOfRestrictedTables = tabsFrame.listOfRestrictionTables;       
        restriction += (valueExistsNotEmpty(listOfRestrictedTables) && listOfRestrictedTables != ';') ? " AND table_name IN (" + addStringSeparators(listOfRestrictedTables) + ")" : "";
            
		grid.indexLevel = 0;
        grid.refresh(restriction);
        
        // create a tablegroup object
        var tableGroup = createTgrpObject('');
        
        // assign the tablegroup object to its position in the view object
        var pos = tgrp_position;
        if (pattern.match(/paginated-highlight/gi)){
        	pos = 0;
        }
        var start = pos;
        var end = numberOfTblgrps - pos;
        for (var x=start; x<end; x++) {
            view.tableGroups[x] = tableGroup;
        }
        tabsFrame.newView = view;
        
    }
    
    // disable "Next" button
    action.enable(false);
}

/**
 * Set the data table
 *
 * @param	None
 * @return	None
 *
 */
function setDataTbl(){
    var currentIndex = 1;
    var tablegroup = "datagrpRestriction";
    setTable(currentIndex, tablegroup, this.grid.getPrimaryKeysForRow(this));	
}

/**
 * Set the owner table
 *
 * @param	None
 * @return	None
 *
 */
function set1stOwnerTbl(){
    var currentIndex = 2;
    var tablegroup = "ownergrpRestriction";
    setTable(currentIndex, tablegroup, this.grid.getPrimaryKeysForRow(this));
}

/**
 * Set the owner2 table
 *
 * @param	None
 * @return	None
 *
 */
function set2ndOwnerTbl(){
    var currentIndex = 3;
    var tablegroup = "owner2grpRestriction";
    setTable(currentIndex, tablegroup, this.grid.getPrimaryKeysForRow(this));
}

/**
 * Set the table in the appropriate tablegroup and go to the next tab
 *
 * @param	None
 * @return	None
 *
 */
function setTable(currentIndex, tablegroup, primaryKeys){
    var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
    var currentTab = "page3-" + currentIndex;
    var PKpair = String(toJSON(primaryKeys));
    var objRegExp = /{".*": "(.*)"}/i;
    table = PKpair.replace(objRegExp, "$1");
    var view = tabsFrame.newView;
    var tIndex = currentIndex - 1;
    
    // Create a tablegroup object to hold tablegroup properties (for now, this is the table_name and which tablegroup)
    var tableGroup = createTgrpObject(table);
    // if we don't have enough tablegroups for the pattern, add the table_name
    if (view.tableGroups.length < numberOfTblgrps) {
        view.tableGroups.push(tableGroup);
    }
    else {
        // otherwise, replace the table_name for this current tablegroup
        view.tableGroups[(numberOfTblgrps - tgrp_position)] = tableGroup;
    }

	var pattern = tabsFrame.patternRestriction;	
	var bHasDrawing = false;
	
	// for drawing 
	if (pattern.match(/paginated-highlight/gi)){
		bHasDrawing = true;
		tgrp_position = 1;
	}	

	// if this is a drawing report, set the owner and owner2 table groups to have the same table
	if (bHasDrawing == true){
	
		if (view.hasOwnProperty('tableGroups')){
			if (view.tableGroups.length == 3){
				view.tableGroups[0] = createTgrpObject(table);
				view.tableGroups[1] = createTgrpObject(table);
			}
		}
		
		if (view.tableGroups.length !=3){
			view.tableGroups.push(createTgrpObject(table));			//	owner        
			view.tableGroups.push(createTgrpObject(table));			// 	owner2
		}	
					
		tabsFrame.ownergrpRestriction = table;
		tabsFrame.owner2grpRestriction = table;
		
		/*
		// if thematic drawings, default summarize to true
		if ((pattern == 'ab-viewdef-paginated-highlight-thematic') && (!valueExistsNotEmpty(tabsFrame.fileToConvert))){
			// view.tableGroups[0].paginatedPanelProperties.summarizeBySortOrder = 'summarizeBySortOrder';	
			view.tableGroups[2].paginatedPanelProperties.summarizeBySortOrder = 'summarizeBySortOrder';	
		}
		*/
	}
		    
    // Store this information in the tab frame
    tabsFrame.newView = view;
 
 	// clear the mini-console index before we leave
 	var tgrpPanel = 'tgrp' + tgrp_position + 'Panel';	
	var grid = Ab.view.View.getControl('', tgrpPanel);
	// grid.indexValue = '';
	grid.setIndexLevel(0);
	// grid.indexEntries =  null;
	// grid.indexRow = null;
		   
    if ((currentIndex) == 1) {
        // Go to "Set Characteristics"
        tabsFrame.datagrpRestriction = table;
        var toTab = "page4";
        tabsFrame.restriction = "";
        tabsFrame.selectTab(toTab);
    }
    else {
    
        // Otherwise, go to the next "Select Data" tab with restriction to related tables   			       
        if (currentIndex == 2) {
            tabsFrame.ownergrpRestriction = table;
        }
        else {
            tabsFrame.owner2grpRestriction = table;
        }
        
        var toTab = String("page3-" + (currentIndex - 1));
        dataTabsFrame.selectTab(toTab);
    }
    tabsFrame.disableFileSelect = true;
}

/**
 * Called when the "Back" button is pressed.
 *
 * @param	None
 * @return	None
 *
 */
function goBack(){
    var parentTgrp = tgrp_position + 1;
    
    dataTabsFrame.selectTab("page3-" + parentTgrp);
}

/**
 * Called when the "Next button is press.
 *
 * @param	None
 * @return	None
 *
 */
function goNext(){
    var childTgrp = tgrp_position - 1;
    dataTabsFrame.selectTab("page3-" + childTgrp);
}

/**
 * Navigate to the "Set Characteristics" tab
 *
 * @param	None
 * @return	None
 *
 */
function goToSetChararcteristics(){
    tabsFrame.selectTab('page4');
}

/**
 * Creates and returns a tablegroup object using with the passed in table name
 *
 * @param	table_name	String containing the name of the selected table
 * @return	tablegroup	Object to store tablegroup
 *
 */
function createTgrpObject(table_name){
    var tableGroup = new Object();
    var tables = new Array();
    var tbl = new Object();
    tbl.table_name = table_name;
    tbl.role = "main";
    tableGroup.paginatedPanelProperties = new Object();
    tables.push(tbl);
    tableGroup.tables = tables;
    return tableGroup;
}

/**
 * Handle data tablegroup tab.  Force refresh
 *
 * @param	grid	grid object
 * @return	none
 *
 */
function handleDataForm(){
	var data_table = tabsFrame.datagrpRestriction;
	if ((data_table != '') && data_table != undefined) {
		var tgrpPanel = 'tgrp' + tgrp_position + 'Panel';	
		var grid = Ab.view.View.getControl('', tgrpPanel);
		var action = grid.actions.get('goNext' + tgrp_position);
		action.enable(true);				
		hideButtons(grid);    	
	}
}

/**
 * Hide buttons altogether when just redisplaying
 *
 * @param	grid	grid object
 * @return	none
 *
 */
function hideButtons(grid){
	var numRows = grid.rows.length;
	for (var j = 0; j < numRows; j++) {
		var buttonCell = getCellElement(grid, 0, 0);
		var button = buttonCell.firstChild;
		button.style.display = "none";
    }	
}


