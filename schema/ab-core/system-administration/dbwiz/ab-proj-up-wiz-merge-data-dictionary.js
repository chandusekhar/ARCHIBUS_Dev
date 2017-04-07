var mergeDataDictController = View.createController('mergeDataDict_ctrl', {
	isExecuteCommands: true,
	isLogCommands: true,
	
	afterInitialDataFetch:function(){

		this.wizardController = View.getOpenerView().controllers.get('tabsController');
		$('executeOnDb').checked = this.isExecuteCommands;
		$('outputToFile').checked = this.isLogCommands;
		
		/*
		 * If use this view outside wizard.
		 */
		if(typeof(this.wizardController) == 'undefined'){
			View.openDialog('ab-proj-up-wiz-select-library-folder.axvw', null, false, {
			    width: 400, 
			    height: 300, 
			    closeButton: false,
			    maximize: false
			 });
		}

		this.afmFldsTrans_grid.refresh();
	},
	
	/**
	 * Sets the output.
	 */
	setOutput:function(){
		$('executeOnDb').checked = this.wizardController.executeSql;
		$('outputToFile').checked = this.wizardController.generateSqlLog;
		this.isExecuteCommands = this.wizardController.executeSql;
		this.isLogCommands = this.wizardController.generateSqlLog;
	},

	afmFldsTrans_grid_afterRefresh: function(){
		
		this.afmFldsTrans_grid.gridRows.each(function(row) {
			var recommAction = row.record['afm_flds_trans.rec_action.raw'];
			var chosenAction = row.record['afm_flds_trans.chosen_action.raw'];
			var changeType = row.record['afm_flds_trans.change_type.raw'];
			var applyOrDeleteAction = "Apply";
			var keepAction = "Keep";
			var jsFunction = "onApply";
			
			if("PROJECT_ONLY" == changeType || "TBL_IN_PROJ_ONLY" == changeType){
				applyOrDeleteAction = "Delete";
				jsFunction = "onDelete";
			}
			if("APPLY CHANGE" == chosenAction){
				applyOrDeleteAction = "<b id=\"apply\">["+applyOrDeleteAction+"]</b>";
			}else if ("DELETE FIELD" == chosenAction){
				applyOrDeleteAction = "<b id=\"delete\">["+applyOrDeleteAction+"]</b>";
			}else if ("KEEP EXISTING" == chosenAction){
				keepAction = "<b id=\"keep\">["+keepAction+"]</b>";
			}
			
			if("NO ACTION" == recommAction){
				row.cells.get(6).dom.innerHTML = "";
				if("PROJECT_ONLY" == changeType || "TBL_IN_PROJ_ONLY" == changeType){
					row.cells.get(6).dom.innerHTML = "<div><tr id=\"chose_action\"><td colspan=\"2\"><a id=\"applyOrDeleteHref\" href=\"javascript:"+jsFunction+"("+row.getIndex()+");\">"+applyOrDeleteAction+"</a></td>&nbsp;|&nbsp;<td><a id=\"keepHref\" href=\"javascript:onKeep("+row.getIndex()+");\">"+keepAction+"</a></td></tr></div>";
				}
			}else{
				if(	"NEW" == changeType || 
					"TBL_IS_NEW" == changeType || 
					"TBL_IN_PROJ_ONLY" == changeType){
					row.cells.get(6).dom.innerHTML = "<div><tr id=\"chose_action\"><td colspan=\"2\"><a id=\"applyOrDeleteHref\" href=\"javascript:"+jsFunction+"("+row.getIndex()+");\">"+applyOrDeleteAction+"</a></td>&nbsp;|&nbsp;<td><a id=\"keepHref\" href=\"javascript:onKeep("+row.getIndex()+");\">"+keepAction+"</a></td></tr></div>";
				}else if("NO_DB_VAL_IN_ENUM" == changeType || "CIRC_REF" == changeType){
					row.cells.get(6).dom.innerHTML = "";
				}else{
					row.cells.get(6).dom.innerHTML = "<div><tr id=\"chose_action\"><td colspan=\"2\"><a id=\"applyOrDeleteHref\" href=\"javascript:"+jsFunction+"("+row.getIndex()+");\">"+applyOrDeleteAction+"</a></td>&nbsp;|&nbsp;<td><a id=\"keepHref\" href=\"javascript:onKeep("+row.getIndex()+");\">"+keepAction+"</a></td><td><a id=\"editHref\" href=\"javascript:onEdit("+row.getIndex()+");\">&nbsp;[...]</a></td></tr></div>";
				}
			}
		});
	},
	
	fieldsToShow_onApplyRecomm: function(){
		
		if(!this.isExecuteCommands && !this.isLogCommands){
			View.showMessage(getMessage('noOutputSelected'));
			return;
		}

		View.confirm(getMessage("confirmApplyMessage"), function(button) {
			if (button == 'yes') {
				
				try {
					ProjectUpdateWizardService.startApplyRecommActionJob(mergeDataDictController.isExecuteCommands, mergeDataDictController.isLogCommands,
						{
						callback: function(job_id) {
							mergeDataDictController.afterCallJob(job_id);
						},
						errorHandler: function(m, e) {
							View.showException(e);
						}
						});
				}catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	},
	
	fieldsToShow_onApplyChosen: function(){

		if(!this.isExecuteCommands && !this.isLogCommands){
			View.showMessage(getMessage('noOutputSelected'));
			return;
		}

		this.validateDataDictionaryChanges();
	},
	
	/**
	 * Check data dictionary user selection dependencies. 
	 */
	validateDataDictionaryChanges: function(){
		try {
			ProjectUpdateWizardService.startValidateChosenDataDictionaryChangesJob(
				{
				callback: function(job_id) {
					mergeDataDictController.afterValidatingDataDictionaryJob(job_id);
				},
				errorHandler: function(m, e) {
					View.showException(e);
				}
				});
		}catch (e) {
			Workflow.handleError(e);
		}
	},
	
	afterValidatingDataDictionaryJob:function(jobId){
		var progressBarMessage = "Checking for dependency tables..."; 
		View.openJobProgressBar(progressBarMessage, jobId, '', function(status) {
			if(status.jobFinished && "true" == status.jobFile.title){
				View.showMessage(getMessage('includeDependecyTables') + status.jobPartialResults[0].title);
				return;
			}else{
				mergeDataDictController.applyChosen(jobId);
			}
		});
	},

	/**
	 * Call apply chosen job.
	 */
	applyChosen: function(){
		View.confirm(getMessage("confirmApplyMessage"), function(button) {
			if (button == 'yes') {
				try {
					ProjectUpdateWizardService.startApplyChosenActionJob(mergeDataDictController.isExecuteCommands, mergeDataDictController.isLogCommands,
						{
						callback: function(job_id) {
							mergeDataDictController.afterCallJob(job_id);
						},
						errorHandler: function(m, e) {
							View.showException(e);
						}
						});
				}catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	},
	
	fieldsToShow_onKeepML: function(){
		// will set the afm_flds_trans.recomm_action = 'KEEP EXISTING'
		// will set the afm_flds_trans.chosen_action = 'KEEP EXISTING'
		try {
			ProjectUpdateWizardService.keepMlHeading();
		}catch (e) {
			Workflow.handleError(e);
		}
		this.afmFldsTrans_grid.refresh();
	},
	
	afterCallJob:function(jobId){
		View.openJobProgressBar("Updating Data Dictionary...", jobId, '', function(status) {
			mergeDataDictController.afmFldsTrans_grid.refresh();
		});
	}
	
});

function getChosenAction(autonum_id){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_flds_trans.autonumbered_id', autonum_id, '=');
	var records = mergeDataDictController.chosenAction_ds.getRecord(restriction).records;
	var action = "";
	if(!valueExistsNotEmpty(records)){
		action = mergeDataDictController.chosenAction_ds.getRecord(restriction).getValue('afm_flds_trans.chosen_action');
	}else{
		action = records[0].values['afm_flds_trans.chosen_action'];
	}
	return action;
}

function isAlreadyKeep(autonum_id){
	var chosenAction = getChosenAction(autonum_id);
	var alreadyKeep = false;
	if("KEEP EXISTING" == chosenAction){
		alreadyKeep = true;
	}
	return alreadyKeep;
}

function isAlreadyApply(autonum_id){
	var chosenAction = getChosenAction(autonum_id);
	var alreadyApply = false;
	if( "APPLY CHANGE" == chosenAction || "DELETE FIELD" == chosenAction){
		alreadyApply = true;
	}
	return alreadyApply;
}

function onApply(rowIndex){
	var id = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].record["afm_flds_trans.autonumbered_id"];
	var isApply= isAlreadyApply(id);
	if(isApply){
		setChosenAction(id, 'NO ACTION');
	}else{
		setChosenAction(id, 'APPLY CHANGE');
	}
	setApply(rowIndex,isApply);
}

function onKeep(rowIndex){
	var id = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].record["afm_flds_trans.autonumbered_id"];
	var isKeep = isAlreadyKeep(id);
	if(isKeep){
		setChosenAction(id, 'NO ACTION');
	}else{
		setChosenAction(id, 'KEEP EXISTING');
	}
	setKeep(rowIndex, isKeep);
}

function onDelete(rowIndex){
	var id = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].record["afm_flds_trans.autonumbered_id"];
	var isDelete = isAlreadyApply(id);
	if(isDelete){
		setChosenAction(id, 'NO ACTION');
	}else{
		setChosenAction(id, 'DELETE FIELD');
	}
	setDelete(rowIndex, isDelete);
}

function setDelete(rowIndex, isApply){
	var newInnerHTML = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML;
	if(isApply){
		newInnerHTML = newInnerHTML.replace("><b id=\"delete\">[Delete]</b><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><b id=\"keep\">[Keep]</b><", ">Keep<");
		newInnerHTML = newInnerHTML.replace("><B id=delete>[Delete]</B><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><B id=keep>[Keep]</B><", ">Keep<");
	}else{
		newInnerHTML = newInnerHTML.replace(">Delete<", "><b id=\"delete\">[Delete]</b><");
		newInnerHTML = newInnerHTML.replace("><b id=\"keep\">[Keep]</b><", ">Keep<");
		newInnerHTML = newInnerHTML.replace(">Delete<", "><B id=delete>[Delete]</B><");
		newInnerHTML = newInnerHTML.replace("><B id=keep>[Keep]</B><", ">Keep<");
	}
	mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML = newInnerHTML;
}

function setApply(rowIndex, isApply){
	var newInnerHTML = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML;
	if(isApply){
		newInnerHTML = newInnerHTML.replace("><b id=\"apply\">[Apply]</b><", ">Apply<");
		newInnerHTML = newInnerHTML.replace("><b id=\"keep\">[Keep]</b><", ">Keep<");
		newInnerHTML = newInnerHTML.replace("><B id=apply>[Apply]</B><", ">Apply<");
		newInnerHTML = newInnerHTML.replace("><B id=keep>[Keep]</B><", ">Keep<");
	}else{
		newInnerHTML = newInnerHTML.replace(">Apply<", "><b id=\"apply\">[Apply]</b><");
		newInnerHTML = newInnerHTML.replace("><b id=\"keep\">[Keep]</b><", ">Keep<");
		newInnerHTML = newInnerHTML.replace(">Apply<", "><B id=apply>[Apply]</B><");
		newInnerHTML = newInnerHTML.replace("><B id=keep>[Keep]</B><", ">Keep<");
	}
	mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML = newInnerHTML;
}
function setKeep(rowIndex, isKeep){
	var newInnerHTML = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML;
	if(isKeep){
		newInnerHTML = newInnerHTML.replace("><b id=\"delete\">[Delete]</b><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><B id=delete>[Delete]</B><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><b id=\"apply\">[Apply]</b><", ">Apply<");
		newInnerHTML = newInnerHTML.replace("><B id=apply>[Apply]</B><",">Apply<");
		newInnerHTML = newInnerHTML.replace("><b id=\"keep\">[Keep]</b><", ">Keep<");
		newInnerHTML = newInnerHTML.replace("><B id=keep>[Keep]</B><", ">Keep<");
	}else{
		newInnerHTML = newInnerHTML.replace("><b id=\"delete\">[Delete]</b><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><B id=delete>[Delete]</B><", ">Delete<");
		newInnerHTML = newInnerHTML.replace("><b id=\"apply\">[Apply]</b><",">Apply<");
		newInnerHTML = newInnerHTML.replace("><B id=apply>[Apply]</B><",">Apply<");
		newInnerHTML = newInnerHTML.replace(">Keep<","><b id=\"keep\">[Keep]</b><");
		newInnerHTML = newInnerHTML.replace(">Keep<","><B id=keep>[Keep]</B><");
	}
	mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex].cells.get(6).dom.innerHTML = newInnerHTML;
}

function onEdit(rowIndex){
	var row = mergeDataDictController.afmFldsTrans_grid.gridRows.items[rowIndex];
	var tableName = row.record['afm_flds_trans.table_name'];
	var fieldName = row.record['afm_flds_trans.field_name'];
	
	var rest = new Ab.view.Restriction();
	rest.addClause("afm_flds.table_name",tableName,"=");
	rest.addClause("afm_flds.field_name",fieldName,"=");

	View.openDialog("ab-proj-up-wiz-edit-data-dictionary-field.axvw", rest, false);
}

/**
 * Set chosen action for one record only
 * @param id afm_flds_trans.autoincrement_id
 * @param action action
 */
function setChosenAction(id, action){
	try{
		ProjectUpdateWizardService.setChosenAction(id, action,
						{
						callback: function() {
						},
						errorHandler: function(m, e) {
							View.showException(e);
						}
						});
	}catch(e){
		Workflow.handleError(e);
	}
}

function checkHideMLHeading(){
	if(document.getElementById("ml_heading").checked){
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideMLRestr',"afm_flds_trans.change_type NOT IN ('ML_HEADING')");
	}else{
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideMLRestr',"1=1");
	}
	mergeDataDictController.afmFldsTrans_grid.refresh();
}

function checkHideNew(){
	if(document.getElementById("new").checked){
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideNewRestr',"afm_flds_trans.change_type NOT IN ('TBL_IS_NEW', 'NEW')");
	}else{
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideNewRestr',"1=1");
	}
	mergeDataDictController.afmFldsTrans_grid.refresh();
}

function checkHideFieldSize(){
	if(document.getElementById("fieldSize").checked){
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideSizeChgRestr',"afm_flds_trans.change_type NOT IN ('SIZE', 'DECIMALS')");
	}else{
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideSizeChgRestr',"1=1");
	}
	mergeDataDictController.afmFldsTrans_grid.refresh();
}

function checkHideDataDictDiffs(){
	if(document.getElementById("dataDict").checked){
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideDDChgRestr',"afm_flds_trans.data_dict_diffs IS NULL");
	}else{
		mergeDataDictController.afmFldsTrans_grid.addParameter('hideDDChgRestr',"1=1");
	}
	mergeDataDictController.afmFldsTrans_grid.refresh();
}

/**
 * Sets the output. 
 */
function setOutput(){
	mergeDataDictController.isExecuteCommands = $('executeOnDb').checked;
	mergeDataDictController.isLogCommands = $('outputToFile').checked;
}

/**
 * Sets afm_flds_trans.chosen_action for selected items to "actions";
 * @param action
 */
function setSelected(action){
	var selectedItems = mergeDataDictController.afmFldsTrans_grid.gridRows.items;
	for(var rowIndex=0; rowIndex<selectedItems.length; rowIndex++){
		var id = selectedItems[rowIndex].record["afm_flds_trans.autonumbered_id"];
		setChosenAction(id, action);
	}
	mergeDataDictController.afmFldsTrans_grid.refresh();
}

/**
 * Returns the multi-selection restriction.
 * @returns {Ab.view.Restriction}
 */
function getMultiSelectionRestriction(){
	var restriction = new Ab.view.Restriction();
	var changeTypes = getSelectedMultipleValues();
	if(changeTypes.length != 0){
		restriction.addClause('afm_flds_trans.change_type', changeTypes, 'IN');
	}
	return restriction;
}

/**
 * Apply multiselection filter.
 */
function multiSelectionFilter(){
	mergeDataDictController.afmFldsTrans_grid.refresh(getMultiSelectionRestriction());
}

/**
 * Clears the selection filter.
 */
function onClearFilter(){
	var changeTypeSel = $('selectChangeType');
	for(var i=0; i<changeTypeSel.length; i++){
		changeTypeSel[i].selected = false;
	}
}

/**
 * Returns an array of strings, containing selected values. 
 */
function getSelectedMultipleValues() {
	
	var values = [];
	var changeTypeSel = $('selectChangeType');

	for(var i=0; i<changeTypeSel.length; i++){
		if(changeTypeSel[i].selected){
			values.push(changeTypeSel[i].value);
		}
	}
	
	return values;
}
