var specifyTablesController = View.createController('specifyTables_ctrl', {
	includeValidatedTables: false,
	tablesLike: null,
	appExtTables: '',
	projectTables: '',
	wizardController:null,
	afmFileLocation: null,
	
	afterInitialDataFetch:function(){
		this.wizardController = View.controllers.items[0];
		checkTableLike();
	},

	updProjSpecifyTables_onNext:function(){
		
		var pTableTypes = getSelectedProjTableTypes();
		var aTableTypes = getSelectedARCHTableTypes();
		var validatedTables = document.getElementById("validateTables").checked;
		var likeSelection = '';
		var allTableTypes = pTableTypes.concat(aTableTypes);
		var isTransferIn = this.wizardController.transferIn || this.wizardController.compare;
		var tableLikeCheck = document.getElementById("checkTableLike");
		var tableLikeInput = document.getElementById("inputTablesLike");

		if(allTableTypes.length == 0 && tableLikeInput.value.length == 0){
			var confirmMessage = getMessage("messageNothingSelected");
	        View.showMessage(confirmMessage);
	        return;
        }
		
		if(tableLikeCheck.checked){
			likeSelection = tableLikeInput.value;
		}
		
		if(this.wizardController.compare){
			var archibusFiles = new Array();
			archibusFiles[0] = '/afm_tbls.csv';
			archibusFiles[1] = '/afm_flds.csv';
			this.checkIfFilesExists(archibusFiles, allTableTypes, validatedTables, likeSelection, isTransferIn);
		}else{
			this.addSelectedTables(allTableTypes, validatedTables, likeSelection, isTransferIn);
		}
	},
	
	addSelectedTables: function(allTableTypes, validatedTables, likeSelection, isTransferIn){
		
		enableButtons(false);
		
		// the Java method writes records into afm_transfer_set table
		try{
			ProjectUpdateWizardService.addTableNamesToTransferSet(allTableTypes, validatedTables, likeSelection, isTransferIn,
						{
						callback: function(jobId) {
							specifyTablesController.afterSetTables(jobId);
						},
						errorHandler: function(m, e) {
							View.showException(e);
						}
						});
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	checkIfFilesExists: function(fileNamesPath, allTableTypes, validatedTables, likeSelection, isTransferIn){
		try{
			ProjectUpdateWizardService.filesExists(fileNamesPath, 
					{
					callback: function(filesExist) {
						specifyTablesController.afterCheckFiles(filesExist, allTableTypes, validatedTables, likeSelection, isTransferIn);
					},
					errorHandler: function(m, e) {
						View.showException(e);
					}
				});
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	afterCheckFiles: function(fileExist, allTableTypes, validatedTables, likeSelection, isTransferIn){
		if(fileExist){
			this.addSelectedTables(allTableTypes, validatedTables, likeSelection, isTransferIn);
		}else{
			var message = this.getFileNotExistsWarningMessage();
			View.showMessage(message);
		}
	},

	getFileNotExistsWarningMessage: function(){
		var selectedFolder = $('selectFolders').value;
		var dbType = '';
		if('personalized-database'!=selectedFolder){
			dbType = this.wizardController.dbType +'/';
		}
		var path = View.contextPath + "/projects/users/public/dt/database-update/" + dbType + selectedFolder;
		var	tblsFileMessage = path + '/afm_tbls.csv ';
		var	fldsFileMessage = path + '/afm_flds.csv ';
		return tblsFileMessage + getMessage('andOr') + ' ' + fldsFileMessage + getMessage('fileIsMissing');
	},
	
	afterSetTables:function(jobId){
		View.openJobProgressBar(getMessage("addingTablesToProcess"), jobId, '', function(status) {
			specifyTablesController.afterSetTablesJobEnds();
		});
	},
	
	afterSetTablesJobEnds:function(){
		
		// refresh tab first
		var performTransferTab = this.wizardController.updProjWizTabs.tabs[2];
		var performTransferController = performTransferTab.getContentFrame().View.controllers.items[0];
		var panelGrid = performTransferController.afmTransferSetOut_grid;
		if(this.wizardController.transferIn){
			panelGrid = performTransferController.afmTransferSetIn_grid;
			performTransferController.afmTransferSetOut_grid.show(false);
			performTransferController.afmTransferSetCompare_grid.show(false);
		}else if(this.wizardController.transferOut){
			performTransferController.afmTransferSetIn_grid.show(false);
			performTransferController.afmTransferSetCompare_grid.show(false);
		}else{
			panelGrid = performTransferController.afmTransferSetCompare_grid;
			performTransferController.afmTransferSetIn_grid.show(false);
			performTransferController.afmTransferSetOut_grid.show(false);
		}
		
		panelGrid.refresh();
		updateSpecifyTablesHelpLink(performTransferController);
			
		if(this.wizardController.transferIn && this.wizardController.isMergeDataDict){
			panelGrid.showColumn("afm_transfer_set.nrecords_updated", false);
			panelGrid.showColumn("afm_transfer_set.nrecords_missing", false);
			panelGrid.showColumn("afm_transfer_set.nrecords_inserted", false);
			panelGrid.showColumn('multipleSelectionColumn', false);
			panelGrid.update();
		} 
		if(panelGrid.rows.length == 0){
			var confirmMessage = getMessage("messageNothingSelected");
	        View.showMessage(confirmMessage);
			enableButtons(true);
	        return;
		}else{
			setPerformTransferTitles();
			goToNextTab(this.wizardController.updProjWizTabs);
			performTransferController.initializeButtons(true,true,false,false);
			enableButtons(true);
		}
	},
	
	updProjSpecifyTables_onBack:function(){
		this.wizardController.updProjWizTabs.tabs[2].loadView();
		goToPrevTab(this.wizardController.updProjWizTabs);
	}
});

function updateSpecifyTablesHelpLink(performTransferController){
	if(specifyTablesController.wizardController.transferOut){
		performTransferController.actionProgressPanel.actions.get('help').command.commands[0].file = View.contextPath + getMessage('helpLinkTransferOut');
	}else if(specifyTablesController.wizardController.transferIn){
		performTransferController.actionProgressPanel.actions.get('help').command.commands[0].file = View.contextPath + getMessage('helpLinkTransferIn');
	}else{
		performTransferController.actionProgressPanel.actions.get('help').command.commands[0].file = View.contextPath + getMessage('helpLinkPerformCompare');
	}
}

function enableButtons(isEnabled){
	if(isEnabled){
		specifyTablesController.updProjSpecifyTables.actions.get('back').forceDisable(false);
		specifyTablesController.updProjSpecifyTables.actions.get('next').forceDisable(false);
	}
	specifyTablesController.updProjSpecifyTables.enableButton('next', isEnabled);
	specifyTablesController.updProjSpecifyTables.enableButton('back', isEnabled);
}

/**
 * Gets the selected Project Type
 */
function getSelectedProjTableTypes(){
	var projSpecChildren = document.getElementsByName("projSpecTables");
	var tType = new Array();
	var j = 0;
	for(var i=0; i<projSpecChildren.length; i++){
		if(projSpecChildren[i].checked){
			tType.push(projSpecChildren[i].value);
		}
	}
	return tType;
}

function getSelectedARCHTableTypes(){
	var archSpecChildren = document.getElementsByName("archSpecTables");
	var tType = new Array();
	var j = 0;
	for(var i=0; i<archSpecChildren.length; i++){
		if(archSpecChildren[i].checked){
			tType.push(archSpecChildren[i].value);
		}
	}
	return tType;
}

function setPerformTransferTitles(){
	var bMessage = '';
	var pMessage = '';
	
	if(specifyTablesController.wizardController.transferOut){
		bMessage = 'transferOutButtonsTitle';
		pMessage = 'transferPanelTitle';
	}else if (specifyTablesController.wizardController.transferIn){
		bMessage = 'transferInButtonsTitle';
		pMessage = 'transferPanelTitle';
		// it's a merge Data Dictionary operation.
		if (document.getElementById("dataDict").checked){
			specifyTablesController.wizardController.isMergeDataDict = true;
			bMessage = 'compareButtonsTitle';
			showTab('mergeDataDictionary', true);
		}
	}else{
		bMessage = 'compareButtonsTitle';
		pMessage = 'comparePanelTitle';
	}
	setButtonsTitle(bMessage);
	setTabTitle(pMessage);
}

function checkDataDictionary(){
	if (document.getElementById("dataDict").checked && specifyTablesController.wizardController.transferIn){
		disableProjSpecificTables();
		document.getElementById("appDict").disabled = true;
		document.getElementById("pNav").disabled = true;
		document.getElementById("appDict").checked = false;
		document.getElementById("pNav").checked = false
		document.getElementById("validateTables").disabled = true;
		document.getElementById("validateTables").checked = false;
		specifyTablesController.wizardController.isMergeDataDict = true;
	}else{
		enableProjSpecificTables(false);
		document.getElementById("appDict").disabled = false;
		document.getElementById("pNav").disabled = false
		document.getElementById("validateTables").disabled = false;
		specifyTablesController.wizardController.isMergeDataDict = false;
	}
}

function checkTableLike(){
	if (document.getElementById("checkTableLike").checked){
		specifyTablesController.wizardController.isMergeDataDict = false;
		disableAll();
		document.getElementById("validateTables").disabled = false;
	}else{
		enableAll();
	}
}
function disableProjSpecificTables(){
	//var children = document.getElementById("projSpecTables").children[0].children;
	//for(var i=0;i<children.length;i++){
	//	children[0].cells
	document.getElementById("security").disabled = true;
	document.getElementById("appData").disabled = true;
	document.getElementById("data").disabled = true;
	//document.getElementById("dashboard").disabled = true;
	document.getElementById("security").checked = false;
	document.getElementById("appData").checked = false;
	document.getElementById("data").checked = false;
	//document.getElementById("dashboard").checked = false;
}

function enableProjSpecificTables(isTableLike){
	document.getElementById("security").disabled = false;
	document.getElementById("appData").disabled = false;
	document.getElementById("data").disabled = false;
	//document.getElementById("dashboard").disabled = false;
	if(isTableLike) {
		//document.getElementById("dashboard").disabled = false;
		document.getElementById("security").checked = true;
		document.getElementById("appData").checked = true;
		document.getElementById("data").checked = true;
		//document.getElementById("dashboard").checked = true;
	}
}

function disableAppExtTables(){
	document.getElementById("dataDict").disabled = true;
	document.getElementById("appDict").disabled = true;
	document.getElementById("pNav").disabled = true;
	document.getElementById("dataDict").checked = false;
	document.getElementById("appDict").checked = false;
	document.getElementById("pNav").checked = false;
}

function enableAppExtTables(){
	document.getElementById("dataDict").disabled = false;
	document.getElementById("appDict").disabled = false;
	document.getElementById("pNav").disabled = false;
}

function disableAll(){
	disableProjSpecificTables();
	disableAppExtTables();
	document.getElementById("inputTablesLike").disabled = false;
}

function enableAll(){
	enableProjSpecificTables(true);
	enableAppExtTables();
	document.getElementById("inputTablesLike").disabled = true;
}