var controller = View.createController('dataTransferSelection', {
	
	afterViewLoad: function() {
		this.initiU();	
	},
	
	initiU: function(){
		//out part
		$('out1').style.display="none";
		$('out2').style.display="none";
		
		//in part
		$('in1').style.display="none";
		$('in2').style.display="none";
		$('in3').style.display="none";
		$('in4').style.display="none";
		
		//compare part
		$('com1').style.display="none";
		$('com2').style.display="none";
		$('com3').style.display="none";
	},
	
	updateUI: function(transferAction){
		if( transferAction == "OUT" ) {
			$('out1').style.display="";
			$('out2').style.display="";

			$('in1').style.display="none";
			$('in2').style.display="none";
			$('in3').style.display="none";
			$('in4').style.display="none";
			
			//compare part
			$('com1').style.display="none";
			$('com2').style.display="none";
			$('com3').style.display="none";
		}else if( transferAction == "IN" ) {
		
			$('out1').style.display="none";
			$('out2').style.display="none";
		
			$('in1').style.display="";
			$('in2').style.display="";
			$('in3').style.display="";
			$('in4').style.display="";
			
			$('inLocalFileRadio').checked = "1";
			
			//compare part
			$('com1').style.display="none";
			$('com2').style.display="none";
			$('com3').style.display="none";
		}else if( transferAction == "COMPARE" ) {
			$('out1').style.display="none";
			$('out2').style.display="none";

			$('in1').style.display="none";
			$('in2').style.display="none";
			$('in3').style.display="none";
			$('in4').style.display="none";
			
			$('com1').style.display="";
			$('com2').style.display="";
			$('com3').style.display="";
			
			$('comLocalFileRadio').checked = "1";
			
		}	
	},

	getParentView: function() {
		var parentView = null;
		var mainController = this.view.controllers.get('dataTransferMain');
		if (mainController != null)
		{
			parentView = this.view;
		}
		else {
			parentView = View.getView('parent');
		}
		return parentView;
	},


	
	selectionPanel_onNext: function(){
	   var parentView = this.getParentView();

	   var transferAction = parentView.progressReportParameters.transferAction;
		//if transfer out
		if( transferAction == "OUT" ) {
			//get and save the action selection
			var radioActionObj = document.getElementsByName("outSelection");
		
			for(var i=0; i<radioActionObj.length; i++){
				if ( radioActionObj[i].checked ) {
					parentView.progressReportParameters.transferFormat = radioActionObj[i].value;
					break;
				} 	
			}
		}else {
			var fileObj = null;
			if( transferAction == "IN" ) {
				fileObj = $('inLocalFileBrow');
				if($(inLocalFileRadio).checked=="1" && fileObj.value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_LOCALE_FILE));
					return;
				}
				
				if($(inServerFileRadio).checked=="1" && $("inServerFileName").value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_SERVER_FILE));
					return;
				}

				if($('inReportCheck').checked==false){
					parentView.progressReportParameters.isCompare = false;
				} else {
					parentView.progressReportParameters.isCompare = true;
				}
				
				if($('inValidCheck').checked==false){
					parentView.progressReportParameters.checkValidation = false;
				} else {
					parentView.progressReportParameters.checkValidation = true;
				}
				
			}else if( transferAction == "COMPARE" ) {
				fileObj = $('comLocalFileBrow');
				if($(comLocalFileRadio).checked=="1" && fileObj.value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_COMPARE_FILE));
					return;
				}

				if($(comServerFileRadio).checked=="1" && $("comServerFileName").value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_SERVER_COMPARE_FILE));
					return;
				}

				parentView.progressReportParameters.isCompare = true;
				
				if($('compValidCheck').checked==false){
					parentView.progressReportParameters.checkValidation = false;
				} else {
					parentView.progressReportParameters.checkValidation = true;
				}
			}
			parentView.progressReportParameters.importLocalFile = fileObj;
		}
		
		if( transferAction != "OUT" ){
			var filePath = "";
			
			if (parentView.progressReportParameters.importLocalFile.value == "") {
				filePath = parentView.progressReportParameters.serverFileName.toLowerCase();
			} 
			else {
				filePath = parentView.progressReportParameters.importLocalFile.value.toLowerCase();
			}
			var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
			if(fileExt!='csv' && fileExt!='xls' && fileExt!='xlsx'){
				alert("Please choose a file in either TEXT (.csv) or Excel (.xls, .xlsx) formats."); 
				return;
			}
		}	
			
		//nav to next page
		var tabPanel = parentView.panels.get('datatransfer_tabs');
		tabPanel.selectTab('datatransfer_progress');
			
		parentView.controllers.get('dataTransferProgress').buildProgressReport();
	},
    
    // ----------------------- constants -----------------------------------------------------------
	   
	// @begin_translatable
	PROGRESS_ERROR_EMPTY_LOCALE_FILE: 'Please use browser button to locate a file to transfer in.',
	PROGRESS_ERROR_EMPTY_COMPARE_FILE: 'Please use browser button to locate a file to compare.',
	PROGRESS_ERROR_EMPTY_SERVER_FILE: 'The server does not have the file to transfer in.',
	PROGRESS_ERROR_EMPTY_SERVER_COMPARE_FILE: 'The server does not have the file to compare.'
	// @end_translatable
	
	
});

function getParentView () {
	var parentView = null;	
	var mainController = View.controllers.get('dataTransferMain');
	if (mainController != null) {
		parentView = View;
	}
	else {
		parentView = View.getView('parent');
	}

	return parentView;
}

function setServerFileName(){
	var parentView = getParentView();
	var jobId = Workflow.startJob("AbSystemAdministration-dataTransfer-getDefaultServerFilename", parentView.progressReportParameters.viewName, parentView.progressReportParameters.dataSourceId);
	var result = Workflow.getJobStatus(jobId);

	if (result != null & result.jobPartialResults != null && result.jobPartialResults.length > 0) {
		if(parentView.progressReportParameters.transferAction=="COMPARE"){
			$('comServerFileName').value = result.jobPartialResults[0].url;
		} else {
			$('inServerFileName').value = result.jobPartialResults[0].url;
		}
		parentView.progressReportParameters.serverFileName =  result.jobPartialResults[0].name;
	} 
	else {
		alert(getMessage("noServerFileToTransferIn"));
		parentView.progressReportParameters.serverFileName = "";
	}
}

function prepareImport(importFileType){
	if ( importFileType == "SERVER" ) {
		$('inLocalFileBrow').disabled = true;
		setServerFileName();
	}
	
	if ( importFileType == "LOCAL" ) {
		$('inLocalFileBrow').disabled = false;
		$('inServerFileName').value = "";
		var parentView = getParentView();
		parentView.progressReportParameters.serverFileName = "";
	}
}

function prepareCompare(compareFileType){
	if (compareFileType == "SERVER" ) {
		$('comLocalFileBrow').disabled = true;
		setServerFileName();
	}
	
	if (compareFileType == "LOCAL" ) {
		$('comLocalFileBrow').disabled = false;
		$('comServerFileName').value = "";
		var parentView = getParentView();
		parentView.progressReportParameters.serverFileName = "";
	}
}

