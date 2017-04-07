/**
 * Called when "Select" tab is refreshed.  If a pattern was selected, based upon
 * its number of available tablegroups, disable relevant "Select Data" tabs.
 * Disable the rest.  Select the topmost tab.  If a pattern was not selected, warn
 * and go back to "Select Pattern" tab.
 *
 * @param	None
 * @return 	None
 *
 */
function user_form_afterSelect(){
    var tabsFrame = View.getView('parent').panels.get('tabsFrame');
    var myTabsFrame = View.panels.get('dataTabs');
    var pattern = tabsFrame.patternRestriction;

    // disable "Save" and "Publish" tabs
    tabsFrame.setTabEnabled('page6', false);
    tabsFrame.setTabEnabled('page7', false);
    
    // if a pattern was not selected, warn and navigate back to "Select Pattern" tab
    if ((tabsFrame.tablegroupsRestriction == '') || (tabsFrame.tablegroupsRestriction == undefined)) {
        alert(getMessage('noPattern'));
        tabsFrame.selectTab('page2');
    }
    else {
        // otherwise, based upon the pattern's number of available tablegroup's, display and select the appropriate tabs
        if (tabsFrame.tablegroupsRestriction > 0) {
        
            // get the number of tablegroups based on selected pattern
            var numberOfTblgrps = Number(tabsFrame.tablegroupsRestriction);
            
            // if drawing, show only "Select Data" tab
            if (pattern.match(/paginated-highlight/gi)){
            	numberOfTblgrps = 1;
            }

            var listOfRestrictedTables = tabsFrame.listOfRestrictionTables;

			// show tabs that are within selected view's number of tablegroups
            for (i = 1; i < (numberOfTblgrps + 1); i++) {
                myTabsFrame.showTab("page3-" + i, true);
            }
			
            // hide any "Select Data" tabs that are beyond the selected view's number of tablegroups
            // assumption: The names of "Select Data" tabs follow the naming convention of page3-1, page3-2, page3-3, etc.		
            for (j = (numberOfTblgrps + 1); j < 4; j++) {
                myTabsFrame.hideTab("page3-" + j, true);
            }
            
            // enable the topmost tablegroup's tab
            var tabName = "page3-" + String(numberOfTblgrps);
			
			// select the topmost tablegroup's tab, applying a restriction on the table_name		
			if (pattern.match(/paginated-highlight/gi) && (tabsFrame.datagrpRestriction == '')){

				// if drawing pattern and no tables have been selected, restrict list to show only those tables that have a "dwgname" fields (as other tables cannot contain drawings)
				restriction = 'table_name IN (SELECT table_name FROM afm_flds WHERE afm_type = 2100)';
				restriction += (valueExistsNotEmpty(listOfRestrictedTables) && listOfRestrictedTables != ';') ? " AND table_name IN (" + addStringSeparators(tabsFrame.listOfRestrictionTables) + ")" : "";   	
				myTabsFrame.selectTab(tabName, restriction);
			} else if (((numberOfTblgrps == 1) || (pattern.match(/paginated-highlight/gi))) && (tabsFrame.datagrpRestriction) && (tabsFrame.datagrpRestriction != '')) {

            	// if only 1 tablegroup or if paginated drawing (3 tablegroups, but 1 select data tab) and a table has previously been selected, show the table
                var restriction = "afm_tbls.table_name = '" + tabsFrame.datagrpRestriction + "'";	
                restriction += (valueExistsNotEmpty(listOfRestrictedTables) && listOfRestrictedTables != ';') ? " AND table_name IN (" + addStringSeparators(tabsFrame.listOfRestrictionTables) + ")" : "";  					
                myTabsFrame.selectTab(tabName, restriction);
            }
            else {          	
            	var restriction = (valueExistsNotEmpty(listOfRestrictedTables) && listOfRestrictedTables != ';') ? "table_name IN (" + addStringSeparators(tabsFrame.listOfRestrictionTables) + ")" : "";
            	// otherwise, clear restriction				
            	myTabsFrame.selectTab(tabName, restriction);
            }		
        }
    }
}

