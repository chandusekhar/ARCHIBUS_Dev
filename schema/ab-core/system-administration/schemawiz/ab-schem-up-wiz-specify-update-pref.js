var specifyUpdateController = View.createController('specifyUpdate_ctrl', {
	
	wizardController:null,
	includeValidTables:false,
	isOracle:false,
	
	afterInitialDataFetch:function(){
		this.wizardController = View.controllers.items[0];
		//$('path_to_file').innerHTML = getMessage("path").replace('user_name', View.user.name.toLowerCase());
	},
	updSchSpecUpdPref_onNext:function(){
		initParameters();
		var likeWildcard = document.getElementById("inputTablesLike").value;
		var includeValidTables = document.getElementById("checkValidatingTables").checked;
		var puwTables = document.getElementById("checkPuwTables").checked;
		
		if(!specifyUpdateController.wizardController.executeOnDb && !specifyUpdateController.wizardController.logSqlCommands){
			View.showMessage(getMessage("specify_output_option"));
		}else{
				if(!puwTables && likeWildcard.length == 0){
					View.showMessage(getMessage("specify_like_option"));
				}else{
					if(this.isOracle){
						hasBlobTables(likeWildcard, includeValidTables, puwTables);
					}else{
						runCompareJob();
					}
				}
		}
	},
	
afterCallJob: function(job_id){
		// notify the progress panel
		View.openDialog('ab-schem-up-wiz-compare-job.axvw', {}, true, {
			width : 1000,
			height : 250,
			closeButton : false,
			isDialog : true,
			afterInitialDataFetch : function(dialogView) {
				var dialogController = dialogView.controllers.get('compareJob_ctrl');
				dialogController.jobId = job_id;
				dialogController.tabController = specifyUpdateController;
				dialogController.startJob();
				}
		});
	},

	showOptionForOracle:function(){
		var tableSpace_input_elem = document.getElementById("inputTablespace");
		var tableSpace_title_elem = document.getElementById("tablespaceForOracle_span_title");
		var tableSpace_eg_elem = document.getElementById("tablespaceForOracle_span_eg");
		tableSpace_input_elem.style.display = "";
		tableSpace_title_elem.style.display = "";
		tableSpace_eg_elem.style.display = "";
		
		var checkbox_elem = document.getElementById("setToCharForOracle");
		var text_elem = document.getElementById("setToCharForOracle_span");
		checkbox_elem.style.display = "";
		text_elem.style.display = "";
	}

});

/**
 * Check if the selected tables contains BLOB fields.
 * 
 */
function hasBlobTables(likeWildcard, includeValidTables, puwTables){
	try {
		SchemaUpdateWizardService.hasBlobTables(likeWildcard, includeValidTables, puwTables,
										{
										callback: function(isBlob) {
											afterCheckingBlob(isBlob);
	    								},
	    								errorHandler: function(m, e) {
	    									View.showException(e);
	        							}
		});
	}catch(e){
		Workflow.handleError(e);
	}
}

function afterCheckingBlob(isBlob){
	if(isBlob){
		var tableSpaceName = document.getElementById("inputTablespace").value;
		if (tableSpaceName.length == 0){
			View.showMessage(getMessage('missing_tablespace'));
			return;
		}else{
			specifyUpdateController.wizardController.tableSpaceName = tableSpaceName;
		}
	}
	runCompareJob();
}

function runCompareJob(){
	var likeWildcard = document.getElementById("inputTablesLike").value;
	var includeValidTables = document.getElementById("checkValidatingTables").checked;
	var puwTables = document.getElementById("checkPuwTables").checked;
	var recreateTables = document.getElementById("checkRecreate").checked;
	var recreateFKs = document.getElementById("checkRecreateFK").checked;

	try {
		// the Java method will write records into afm_transfer_set table
		SchemaUpdateWizardService.startCompareJob(likeWildcard, includeValidTables, recreateTables, puwTables, recreateFKs,
									{
									callback: function(job_id) {
										specifyUpdateController.afterCallJob(job_id);
    								},
    								errorHandler: function(m, e) {
    									View.showException(e);
        							}
									});
	}catch(e){
		Workflow.handleError(e);
	}
}

/**
 * Initialize UI parameters.
 */
function initParameters(){
	specifyUpdateController.wizardController.executeOnDb = document.getElementById("checkImmediate").checked;
	specifyUpdateController.wizardController.logSqlCommands = document.getElementById("checkOutputToFile").checked;
	specifyUpdateController.wizardController.isRecreateTable = document.getElementById("checkRecreate").checked; 
	specifyUpdateController.wizardController.isRecreateFK = document.getElementById("checkRecreateFK").checked;
	specifyUpdateController.wizardController.isValidated = document.getElementById("checkValidatingTables").checked;
	specifyUpdateController.wizardController.isChar = document.getElementById("setToCharForOracle").checked;
}

function onCheckTableLike(){
	var isChecked = document.getElementById("checkboxTableLike").checked;
	if(isChecked){
		document.getElementById("inputTablesLike").disabled = false;
		document.getElementById("checkPuwTables").checked = false;
	}else{
		document.getElementById("inputTablesLike").disabled = true;
		document.getElementById("checkPuwTables").checked = true;
	}
}

function onCheckProjUpTables(){
	var isChecked = document.getElementById("checkPuwTables").checked;
	if(isChecked){
		document.getElementById("checkboxTableLike").checked = false;
		document.getElementById("inputTablesLike").disabled = true;
		document.getElementById("inputTablesLike").value = '';
	}else{
		document.getElementById("checkboxTableLike").checked = true;
		document.getElementById("inputTablesLike").disabled = false;
	}
}