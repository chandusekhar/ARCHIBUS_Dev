var transferTypeController = View.createController('transferType_ctrl', {
	wizardController:null,
	afmTblsFilePath:null,
	afmTableTypesFileName:'afm_tbls_table_types.csv',
	
	afterInitialDataFetch:function(){
		this.wizardController = View.controllers.items[0];
		this.afmTblsFilePath = '/schema/ab-core/system-administration/dbwiz/data/'+this.afmTableTypesFileName;
		showOption();
		//showTab('runScript', false);
	},
	
	/**
	 * Goes to the next tab.
	 */
	updProjTransferType_onNext:function(){
		
		if(!this.isTablesTypesDefined()){
			var message = getMessage("confirmUpdateAfmTbls").replace('{path}', View.contextPath + this.afmTblsFilePath);
			View.confirm(message, function(button) {
			if (button == 'yes') {
				transferTypeController.checkExistsFile(transferTypeController.afmTblsFilePath);
			}else{
				goToNextTab(transferTypeController.wizardController.updProjWizTabs);
			}
			});
		}else{
			if(this.wizardController.transferIn &&
			   !this.wizardController.generateSqlLog && 
			   !this.wizardController.executeSql){
					View.showMessage(getMessage('noOutputSelected'));
					return;
			}
			
			if(this.wizardController.runScript){
				this.wizardController.updProjWizTabs.showTab('runScript', true);
				this.wizardController.updProjWizTabs.selectTab('runScript');
				this.wizardController.updProjWizTabs.disableTab('specifyTransfer');
			}else{
				goToNextTab(this.wizardController.updProjWizTabs);	
			}
		}
		
		setTransferFolder(this.wizardController.transferOut);
		
	},
	
	afterCallJob:function(jobId){
		View.openJobProgressBar(getMessage('updateTableTypes'), jobId, '', function(status) {
			goToNextTab(transferTypeController.wizardController.updProjWizTabs);
		});
	},
	
	isTablesTypesDefined: function(){
		var isDefined = this.isTableTypesDefined_ds.getRecord().values['afm_tbls.is_defined'];
		if(!valueExistsNotEmpty(isDefined)){
			// for older DB.
			isDefined = this.isTableTypesDefined_ds.getRecord().records[0].values['afm_tbls.is_defined'];
		}
		return (isDefined == 1) ? true : false;
	},
	
	checkExistsFile: function(fileName){
			try {
				ProjectUpdateWizardService.fileExists(fileName,
										{
								callback: function(isFileExist) {
								transferTypeController.afterGetFileExist(isFileExist);
								},
								errorHandler: function(m, e) {
									View.showException(e);
								}
			});
			}catch (e) {
				Workflow.handleError(e);
			}
	},
	
	afterGetFileExist: function(isFileExist){
		if(isFileExist){
			try {
				ProjectUpdateWizardService.startUpdateTableTypesJob({
					callback: function(job_id) {
						transferTypeController.afterCallJob(job_id);
					},
					errorHandler: function(m, e) {
						View.showException(e);
					}
				});
			}catch (e) {
				Workflow.handleError(e);
			}
		}else{
			View.showMessage(this.afmTblsFilePath + ' file is missing');
		}
	}
});

function updateTransferTypeHelpLink(){
	if(transferTypeController.wizardController.transferOut){
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkTransferOut');
	}else if(transferTypeController.wizardController.transferIn){
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkTransferIn');
	}else{
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkPerformCompare');
	}
}

/**
 * The user chooses transfer Out option.
 */
function checkTransferOut(){
	transferTypeController.wizardController.transferOut = true;
	transferTypeController.wizardController.transferIn = false;
	transferTypeController.wizardController.compare = false;
	transferTypeController.wizardController.runScript = false;
	showOption();
	//change panel title if visible
	setTabTitle('transferPanelTitle');
	showTab('mergeDataDictionary', false);
	showTab('compareDataDictionary', false);
	showTab('runScript', false);
	showTab('performTransfer',true);
	showTab('specifyTables',true);
	updateTransferTypeHelpLink();
	showDataDictFolderOption(false);
}

/**
 * The user chooses transfer In option.
 */
function checkTransferIn(){
	transferTypeController.wizardController.transferIn = true;
	transferTypeController.wizardController.transferOut = false;
	transferTypeController.wizardController.compare = false;
	transferTypeController.wizardController.runScript = false;
	showOption();
	//change panel title if visible
	setTabTitle('transferPanelTitle');
	showTab('compareDataDictionary', false);
	showTab('runScript', false);
	showTab('performTransfer',true);
	showTab('specifyTables',true);
	updateTransferTypeHelpLink();
	showDataDictFolderOption(true);
}

/**
 * The user chooses compare option.
 */
function checkCompare(){
	transferTypeController.wizardController.compare = true;
	transferTypeController.wizardController.transferOut = false;
	transferTypeController.wizardController.transferIn = false;
	transferTypeController.wizardController.runScript = false;
	showOption();
	//change panel title if visible
	setTabTitle('comparePanelTitle');
	showTab('mergeDataDictionary', false);
	showTab('compareDataDictionary', true);
	showTab('runScript', false);
	showTab('performTransfer',true);
	showTab('specifyTables',true);
	updateTransferTypeHelpLink();
	showDataDictFolderOption(true);
}

/**
 * The user chooses run script option.
 */
function checkRunScript(){
	transferTypeController.wizardController.compare = false;
	transferTypeController.wizardController.transferOut = false;
	transferTypeController.wizardController.transferIn = false;
	transferTypeController.wizardController.runScript = true;
	showOption();
	//change panel title if visible
	//setTabTitle('sunScriptPanelTitle');
	showTab('mergeDataDictionary', false);
	showTab('compareDataDictionary', false);
	showTab('performTransfer',false);
	showTab('specifyTables',false);
	showTab('runScript', true);
	updateTransferTypeHelpLink();
	showDataDictFolderOption(false);
}

/**
 * If checked then the files are delete before transfer out and after successfully transfer in.
 */
function includeDelete(){
	if(document.getElementById("delete").checked){
		if(transferTypeController.wizardController.transferOut){
			transferTypeController.wizardController.deleteBeforeTransferOut = true;
		}else{
			transferTypeController.wizardController.deleteAfterTransferIn = true;
		}
	} else {
		if(transferTypeController.wizardController.transferOut){
			transferTypeController.wizardController.deleteBeforeTransferOut = false;
		}else{
			transferTypeController.wizardController.deleteAfterTransferIn = false;
		}
	}
}

/**
 *  Logs the SQL commands for transfer in.
 */
function sqlCommandsOutput(){
	transferTypeController.wizardController.generateSqlLog = $('sqlLogger').checked;
	transferTypeController.wizardController.executeSql = $('sqlExecutor').checked;
}

/**
 * Handles options.
 */
function showOption(){

	if(transferTypeController.wizardController.transferOut || transferTypeController.wizardController.transferIn){
		// show head title
		$('howToPerformTransfer_span').innerHTML = getMessage('howToPerformTransfer');
		$('delete').style.display = "";
		
		if(transferTypeController.wizardController.transferOut){
			// show transfer out option
			$('sqlLogger').style.display="none";
			$('sqlExecutor').style.display="none";
			$('delete').checked = true;
			$('deleteOption_span').innerHTML = getMessage('transferOutOption');
			$('outputSql_span').innerHTML = '';
			$('executeSql_span').innerHTML = '';
		}else{
			// show transfer in options
			$('sqlLogger').style.display="";
			$('sqlLogger').checked = true;
			$('sqlExecutor').style.display="";
			$('sqlExecutor').checked = true;
			$('delete').checked = false;
			$('deleteOption_span').innerHTML = getMessage('transferInOption');
			$('outputSql_span').innerHTML = getMessage('outputToSqlOption');
			$('executeSql_span').innerHTML = getMessage('executeSqlOption');
		}
	} else{
		// hide all
		$('howToPerformTransfer_span').innerHTML = '';
		$('deleteOption_span').innerHTML = '';
		$('outputSql_span').innerHTML = '';
		$('executeSql_span').innerHTML = '';
		$('delete').style.display = "none";
		$('sqlLogger').style.display="none";
		$('sqlExecutor').style.display="none";
	}
}
