var controller = View.createController('localizationTransferSelection', {
	
	afterViewLoad: function() {
		this.initiU();	
	},
	
	initiU: function(){		
		//in part
		$('in1').style.display="none";
		$('in2').style.display="none";
		$('in3').style.display="none";
		
		//compare part
		$('com1').style.display="none";
		$('com2').style.display="none";
	},
	
	updateUI: function(transferAction){
    if( transferAction == "IN" ) {				
			$('in1').style.display="";
			$('in2').style.display="";
			$('in3').style.display="";
	
			$('inLocalFileRadio').checked = "1";
			
			//compare part
			$('com1').style.display="none";
			$('com2').style.display="none";
		}else if( transferAction == "COMPARE" ) {
			$('in1').style.display="none";
			$('in2').style.display="none";
			$('in3').style.display="none";

			$('com1').style.display="";
			$('com2').style.display="";
			
			$('comLocalFileRadio').checked = "1";
			
		}	
	},
	
	selectionPanel_onNext: function(){
	   var transferAction = View.getView('parent').progressReportParameters.transferAction;

			var fileObj = null;
			if( transferAction == "IN" ) {
				fileObj = $('inLocalFileBrow');
				if($('inLocalFileRadio').checked=="1" && fileObj.value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_LOCALE_FILE));
					return;
				}				

				if($('inReportCheck').checked==false){
					View.getView('parent').progressReportParameters.isCompare = false;
				} else {
					View.getView('parent').progressReportParameters.isCompare = true;
				}
			}else if( transferAction == "COMPARE" ) {
				fileObj = $('comLocalFileBrow');
				if($(comLocalFileRadio).checked=="1" && fileObj.value == ""){
					View.showMessage('error', Ab.view.View.getLocalizedString(this.PROGRESS_ERROR_EMPTY_COMPARE_FILE));
					return;
				}

				View.getView('parent').progressReportParameters.isCompare = true;
			}
			View.getView('parent').progressReportParameters.importLocalFile = fileObj;

		
		//nav to next page
		var tabPanel = View.getView('parent').panels.get('localizationtransfer_tabs');
		tabPanel.selectTab('localizationtransfer_progress');
		
		View.getView('parent').controllers.get('localizationTransferProgress').buildProgressReport();
	},
    
    // ----------------------- constants -----------------------------------------------------------	   
	PROGRESS_ERROR_EMPTY_LOCALE_FILE: 'Please use browser button to locate a file to transfer in.',
	PROGRESS_ERROR_EMPTY_COMPARE_FILE: 'Please use browser button to locate a file to compare.'
	
	
});

function prepareImport(importFileType){
	/*
	if( importFileType == "SERVER" ) {
		$('inLocalFileBrow').disabled = true;
		setServerFileName();
	}
	*/
	
	if( importFileType == "LOCAL" ) {
		$('inLocalFileBrow').disabled = false;
		View.getView('parent').progressReportParameters.serverFileName = "";
	}
}

function prepareCompare(compareFileType){
	if( compareFileType == "SERVER" ) {
		$('comLocalFileBrow').disabled = true;
	}
	
	if( compareFileType == "LOCAL" ) {
		$('comLocalFileBrow').disabled = false;
		View.getView('parent').progressReportParameters.serverFileName = "";
	}
}

