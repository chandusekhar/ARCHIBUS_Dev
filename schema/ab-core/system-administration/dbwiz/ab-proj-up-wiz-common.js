/**
 * Move to first tab from the wizard.
 * @param tabController
 */
function goToFirstTab(tabController, isSchemUpWiz){
	var tabs = tabController.tabs;
	var firstTabName = tabs[0].name;
	tabController.showTab(firstTabName, true);
	tabController.selectTab(firstTabName);
	if(isSchemUpWiz){
		reloadSchemUpWizTabs(tabController);
	}
}

/**
 * Move to next tab.
 * @param tabController
 */
function goToNextTab(tabController){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	var nextTabName = tabs[activeTabId+1].name;
	tabController.showTab(nextTabName, true);
	tabController.selectTab(nextTabName);
	tabController.disableTab(activeTabName);
}

/**
 * Move to previous tab.
 * @param tabController
 */
function goToPrevTab(tabController){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	var prevTabName = tabs[activeTabId-1].name;
	tabController.showTab(prevTabName, true);
	tabController.selectTab(prevTabName);
	tabController.disableTab(activeTabName);
}

/**
 * Move to the specified tab name.
 * @param tabController tab controller
 * @param tabName name of the tab
 */
function goToTabName(tabController, tabName){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	tabController.showTab(tabName, true);
	tabController.selectTab(tabName);
	tabController.disableTab(activeTabName);
}

/**
 * Reload tabs.
 * @param tabController tabs controller
 */
function reloadSchemUpWizTabs(tabController){
	var tabs = tabController.tabs;
	for(var i=0;i<tabs.length;i++){
		if(i>0){
			tabController.disableTab(tabs[i].name);
		}
	}
	// reload update sql tables tab to clear the panel from old messages.
	tabs[1].loadView();
	// reload recreate structures tab to clear the panel from old messages.
	tabs[2].loadView();
}

/**
 * Returns active tab index.
 * @param tabs tabs controller
 * @param activeTabName active tab name
 * @returns active tab index
 */
function getActiveTabId(tabs, activeTabName){
	for(var i=0;i<tabs.length;i++ ){
		if(tabs[i].name == activeTabName){
			return tabs[i].index;
		}
	}
}

/**
 * Sets buttons names.
 * @param title name of the button
 */
function setButtonsTitle(title){
	var tabController = specifyTablesController.wizardController.updProjWizTabs.tabs[2].getContentFrame().View.controllers.items[0];
	var startButton = tabController.actionProgressPanel.actions.get('start');
	var stopButton = tabController.actionProgressPanel.actions.get('stop');
	var resumeButton = tabController.actionProgressPanel.actions.get('pause');
	var start = getMessage('start');
	var stop = getMessage('stop');
	var resume = getMessage('pause');
	var bTitle = getMessage(title);
	startButton.setTitle(start+bTitle);	
	stopButton.setTitle(stop+bTitle);	
	resumeButton.setTitle(resume+bTitle);	
}

/**
 * Sets tab title.
 * @param title title
 */
function setTabTitle(title){
	var pTitle = getMessage(title);
	specifyTablesController.wizardController.updProjWizTabs.tabs[2].setTitle(pTitle);
}

/**
 * show tab by name.
 */
function showTab(tabName, show){
	if(show){
		specifyTablesController.wizardController.updProjWizTabs.findTab(tabName).loadView();
		specifyTablesController.wizardController.updProjWizTabs.showTab(tabName, show);
	}else{
		specifyTablesController.wizardController.updProjWizTabs.hideTab(tabName);
	}
}

/**
 * Returns array of selected values.
 * 
 * @param grid grid panel
 * @param fieldName field name
 * @returns array of values of field name
 */
function getSelected(grid, fieldName) {
    var values = [];
    var i = 0;
    grid.gridRows.each(function(row) {
        if (row.isSelected()) {
            var value = row.getRecord().getValue(fieldName);
            values[i++] = value;
        }
    });        
    return values;
}

/**
 * Returns true if the object is in the array.
 * 
 * @param array array of objects
 * @param obj object to find
 * @returns {Boolean}
 */
function contains(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * Set the check boxes to initial values. 
 */
function refreshCheckboxes(gridPanel, selectedTables, readOnly){
	gridPanel.enableSelectAll(!readOnly);
	var gridRows = gridPanel.rows;
	var dataRows = gridPanel.getDataRows();
	for(var i = 0; i < gridRows.length; i++){
		var row = gridRows[i].row;
		var record = row.getRecord();
		if(contains(selectedTables, record.getValue('afm_transfer_set.table_name'))){
			row.select();
		}
        var selectionCheckbox = dataRows[i].firstChild.firstChild;
        selectionCheckbox.disabled = readOnly;
	}
}

/**
 * Show transfer in folder option.
 * @param show
 */
function showDataDictFolderOption(show){
	if(show){
		$('transferFolderOption').style.display = "";
		readFolders();
	}else{
		$('transferFolderOption').style.display = "none";
	}
}

/**
 * Reads folders.
 */
function readFolders(){
	try {
		ProjectUpdateWizardService.getDataDictionaryFolders(
								{
						callback: function(folders) {
							addFoldersToSelectList(folders);
						},
						errorHandler: function(m, e) {
							View.showException(e);
						}
	});
	}catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Add Data Dictionary folders to option list.
 */
function addFoldersToSelectList(folders){
	/**
	 * Remove old values
	 */
	var length = $('selectFolders').options.length;

	for (i = 0; i < length; i++) {
		$('selectFolders').options[i] = null;
	}
	
	/**
	 * Add new folders names.
	 */
	for (var i = 0; i < folders.length; i++) {
		$('selectFolders').options[i] = new Option(folders[i], folders[i], false);
	}

}

/**
 * Set context folder.
 * @param isTransferOut if is transfer out selected then the context folder is blank.
 */
function setTransferFolder(isTransferOut){
	
	var folder = $('selectFolders').value;
	
	if(isTransferOut){
		folder = '';
	}
	
	View.controllers.items[0].selectedFolder = folder;
	
	try{
		ProjectUpdateWizardService.setContextFolder(folder); 
	}catch(e){
		Workflow.handleError(e);
	}
}

/**
 * Returns the transfer in path to CSV file to be imported.
 * @param tableName table name
 * @returns {String} path
 */
function getCsvFilePath(tableName){
	return View.getBaseUrl() + '/projects/users/public/dt/database-update/' + View.controllers.items[0].wizardController.dbType + "/" + View.controllers.items[0].wizardController.selectedFolder + "/" + tableName + ".csv"
}
