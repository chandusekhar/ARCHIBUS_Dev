var controller = View.createController('runScript', {

	fileType: null,
	isLocal:true,
	files:null,
	reportTask: null,
    reportTaskRunner: null,
    executionNumber:null,
    wizardController:null,
    selectedText:'',
	
	afterInitialDataFetch:function(){
		this.wizardController = View.getOpenerView().controllers.get('tabsController');
		$('contextPath').innerHTML += View.contextPath + '/'; 
	},

	selectionPanel_onBack:function(){
		this.wizardController.updProjWizTabs.showTab('specifyTransfer', true);
		this.wizardController.updProjWizTabs.selectTab('specifyTransfer');
		this.wizardController.updProjWizTabs.disableTab('runScript');
	},
	
	/**
     * Run script action.
     */
	scriptPanel_onRunScript:function(){
		
		var script = this.selectedText.trim();
		
		if(script.length == 0){
			script = $('contents').value.trim();
			if(script.length == 0){
				View.showMessage(getMessage('nothingToExecute'));
				return;
			}
		}
		
		$('log').innerHTML = '';
		this.executionNumber = -1;
		
		try {
			SchemaUpdateWizardService.runScript(script,
											{
											callback: function(jobId) {
												controller.afterCallJob(jobId);
		    								},
		    								errorHandler: function(m, e) {
		    									View.showException(e);
		        							}
			});
		}catch(e){
			Workflow.handleError(e);
		}
	},
		
	/**
	 * After script was started.
	 */
	afterCallJob:function(jobId){
		this.jobId = jobId;
		this.startRefreshGridTask(this);
	},

	/**
	 * Stops the script.
	 */
	scriptPanel_onStopScript:function(){
		this.reportTaskRunner.stop(this.reportTask);
	},
	
    /**
     * Start auto-refresh job results using Ext.util.TaskRunner 
     */
    startRefreshGridTask: function(controller){
        this.reportTask = {
            run: function(){
            	var status = Workflow.getJobStatus(controller.jobId);
            	// if the job is not running
            	if('Started' != status.jobStatus){
            		controller.reportTaskRunner.stop(controller.reportTask);
            	}
        		writeMessageLog(status.jobPartialResults);
            },
            interval: 2000
        }
        controller.reportTaskRunner = new Ext.util.TaskRunner();
        controller.reportTaskRunner.start(controller.reportTask);
    }
});


/**
 * Return the highlighted text.
 */
function setSelected(){
	  var textComponent = document.getElementById('contents');

	  // IE version
	  if (document.selection != undefined)
	  {
	    textComponent.focus();
	    var sel = document.selection.createRange();
	    controller.selectedText = sel.text;
	  }// Mozilla version
	  else if (textComponent.selectionStart != undefined){
	    var startPos = textComponent.selectionStart;
	    var endPos = textComponent.selectionEnd;
	    controller.selectedText = textComponent.value.substring(startPos, endPos)
	  }
}
/**
 * 
 * @param partialResults
 */
function writeMessageLog(partialResults){
	for(var i=0;i<partialResults.length;i++){
		if(controller.executionNumber < parseInt(partialResults[i].title)){
    		$('log').innerHTML += formatMessage(partialResults[i].name, partialResults[i].url);
    		controller.executionNumber = controller.executionNumber + 1;
		}
	}
}

/**
 * Makes the error message in red color.
 * 
 * @param message message
 * @param type type of the message(ERROR, INFO, WARNING)
 * @returns {String} the message in HTML format
 */
function formatMessage(message, type){
	if('ERROR' == type){
		message = '<span style="color:red">' + message + '</span>';
	}
	return message + '<br/>';
}

/**
 * 
 * @param importFileType
 */
function prepareInput(importFileType){
	
	if ( importFileType == "SERVER" ) {
		$('inLocalFileBrow').disabled = true;
		$('refreshFiles').disabled = false;
		$('loadFile').disabled = false;
		$('selectFile').disabled = false;
		controller.isLocal = false;
		setServerFiles();
	}
	if ( importFileType == "LOCAL" ) {
		$('inLocalFileBrow').disabled = false;
		$('refreshFiles').disabled = true;
		$('loadFile').disabled = true;
		$('selectFile').disabled = true;
		controller.isLocal = true;
	}
}

/**
 * Select the server file.
 */
function loadServerFile(){
	try {
		SchemaUpdateWizardService.getServerFileContents($('serverFolder').value, $('selectFile').value,
										{
										callback: function(contents) {
											$('contents').value = contents;
										},
	    								errorHandler: function(m, e) {
	    									View.showException(e);
	        							}
		});
	}catch(e){
		Workflow.handleError(e);
	}
}

function setServerFileNames(files){
	/**
	* Remove old values
	*/
	for (i = 0; i < $('selectFile').options.length; i++) {
		$('selectFile').options[i] = null;
	}
	/**
	* Add new files names.
	*/
	for (var i = 0; i < files.length; i++) {
		$('selectFile').options[i] = new Option(files[i], files[i], false);
	}
}

/**
 * Loads selected file contents into HTML page.
 * @param event the event
 */
function loadFile(event){

	controller.file = $('inLocalFileBrow').files[0];

	if (isAccepted()) {
		var input = event.target;
	    var reader = new FileReader();
	    reader.onload = function(){
	    	$('contents').value = reader.result;
	    };
		reader.readAsText(controller.file);	
	}else{
		View.showMessage("File not supported! Supported extensions: " + $('inLocalFileBrow').accept.split(','));
	}	
}

/**
 * Get server file names.
 */
function setServerFiles(){
	try {
		SchemaUpdateWizardService.getServerFiles($('serverFolder').value,
										{
										callback: function(files) {
											setServerFileNames(files);
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
 * File has accepted extension.
 * @returns {Boolean}
 */
function isAccepted(){
	var extensions = $('inLocalFileBrow').accept.split(',');
	for(var i=0;i<extensions.length;i++){
		if(controller.file.name.lastIndexOf(extensions[i]) + extensions[i].length == controller.file.name.length){
			return true;
		}
	}
	return false;
}