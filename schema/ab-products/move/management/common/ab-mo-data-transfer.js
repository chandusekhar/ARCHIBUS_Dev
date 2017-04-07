var abMoDtTransferCtrl = View.createController('abMoDtTransferCtrl',{
	jobId: '',
	
	transferOutRuleId: 'AbMoveManagement-MoveDataTransfer-moveTransferOut',
	transferInRuleId: 'AbMoveManagement-MoveDataTransfer-moveTransferIn',
	
	progressControl: null,

	// primary keys mo_id
	pk_mo_id: [],
	// transfer action
	transferAction: null,
	// transfer format
	transferFormat: 'XLS',
	// type Employee, Hire, Leaving, Equipment, Asset, Room
	type: null,
	// project_id,
	project_id: null,
	//source panel 
	panel_source: null,
	//file to import 
	importLocalFile: null,
	
	panelTitle: null,
	
	afterViewLoad: function(){
		var parameters = View.parameters;
		this.type = parameters['type'];
		this.pk_mo_id = parameters['pk_mo_id'];
		this.project_id = parameters['project_id'];
		this.panel_source = parameters['panel_source'];
		this.panelTitle = parameters['panelTitle'];
		var tabPanel = this.tabs_abMoDataTransfer;
		tabPanel.setTabVisible('moDataTransfer_selection', false);
	},
	
	panel_transferAction_onNext: function(){
		var radioActionObj = document.getElementsByName("transferAction");
		for(var i=0; i<radioActionObj.length; i++){
			if ( radioActionObj[i].checked ) {
				this.transferAction = radioActionObj[i].value;
				break;
			} 	
		}
		var tabPanel = this.tabs_abMoDataTransfer;
		if (this.transferAction == "OUT") {
			if(this.pk_mo_id.length == 0){
				View.showMessage(getMessage('NO_EXPORT_DATA'));
				return;
			}
			tabPanel.selectTab('moDataTransfer_progress');
			this.buildProgressReport();
		}else if(this.transferAction == "IN"){
			tabPanel.setTabVisible('moDataTransfer_selection', true);
			tabPanel.selectTab('moDataTransfer_selection');
		}
		
	},
	selectionPanel_onNext: function(){
		var fileObj = $('inLocalFileBrow');
		if(fileObj.value == ""){
			View.showMessage('error', getMessage("PROGRESS_ERROR_EMPTY_LOCALE_FILE"));
			return;
		}
		this.importLocalFile = fileObj;
		var tabPanel = this.tabs_abMoDataTransfer;
		tabPanel.selectTab('moDataTransfer_progress');
		this.buildProgressReport();
	},
	buildProgressReport: function() {
	
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		
		//hide the result view column for transfer in/comparison
		if(this.transferAction != "OUT"){
			configObj.setConfigParameter("showResultFile", false);
		}
		
		// do not show the partial results
		if(this.transferAction == "OUT"){
			configObj.setConfigParameter("showResults", false);
		}

		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(getMessage("PROGRESS_STOP_TRANSFER")));
	    this.startTransfer();
	},
	startTransfer: function(){
		
		if( this.transferAction == "OUT" ) {
			this.progressControl.parameters = [];
			this.progressControl.addParameter('panelTitle', this.panelTitle);
			this.jobId = Workflow.startJob(this.transferOutRuleId, this.type, this.transferFormat, this.pk_mo_id.length, this.pk_mo_id.join(",") );
			this.progressControl.setProgressAndRunTask(this.jobId);

		}else if( this.transferAction == "IN") {
			var filePath =  "";
			filePath = this.importLocalFile.value.toLowerCase();
			var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
			var serverFileName = null;
			Workflow.startJobWithUpload(this.transferInRuleId, this.importLocalFile, this.afterDataTransferStarted, this, this.type, this.project_id, serverFileName, fileExt);
			
		}
	},
	
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    this.showProgress.defer(1000, this);
    },

 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    reportProgressPanel_onStartOver: function(){
    	
		
		document.getElementById('inLocalFileBrow').value = "";
		View.panels.items[3].setTabVisible('moDataTransfer_selection', false);
		View.panels.items[3].selectTab('moDataTransfer_action');
		
		document.getElementsByName("transferAction")[0].checked = true;
    }	
})
