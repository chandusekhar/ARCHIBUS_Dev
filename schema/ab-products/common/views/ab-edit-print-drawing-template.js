var printDrawingTemplateController = View.createController('printDrawingTemplateController', {
	
	/**
	 * The upload work flow rule name.
	 */
	uploadWorkflowRule: 'AbSpaceRoomInventoryBAR-SpaceExpressService-uploadSpacePDFPrintingDOCXTemplate',
	
	/**
	 * The local file name.
	 */
	uploadFile: null,
	
	/**
	 * The progress control to display the upload result.
	 */
	progressControl: null,
	
	/**
	 * The job id when upload template.
	 */
	jobId: null,
	
	selectionPanel_onUploadTemplate: function() {
		var templateFile = $('templateFile');
		if(templateFile.value == ""){
			View.showMessage('error', getMessage('NO_UPLOAD_FILE'));
			return;
		}
		this.uploadFile = templateFile;
		var tabPanel = this.plantypeTemplateFileTabs;
		tabPanel.selectTab('plantypeTemplateFile_progress');
		this.buildProgressReport();
	},
	
	buildProgressReport: function() {
		
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		configObj.setConfigParameter("showResultFile", false);

		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(getMessage("PROGRESS_STOP_UPLOAD")));
	    this.startTransfer();
	},
	
	startTransfer: function(){
		var filePath =  "";
		filePath = this.uploadFile.value.toLowerCase();
		var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
		if (fileExt != "docx" || fileExt != "doc") {
			alert("Error file type, only docx or doc is accepted");
		} else {
			Workflow.startJobWithUpload(this.uploadWorkflowRule, this.uploadFile, this.afterDataTransferStarted, this, fileExt);
		}
	},
	
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    this.showProgress.defer(1000, this);
    },
    
    showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
    },
    
    reportProgressPanel_onStartOver: function(){
		$('templateFile').value = "";
		this.plantypeTemplateFileTabs.selectTab('plantypeTemplateFile_selection');
    }
});