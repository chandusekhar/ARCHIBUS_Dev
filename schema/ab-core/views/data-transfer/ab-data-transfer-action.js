var controller = View.createController('dataTransferAction', {

	afterViewLoad: function(){
		//default to transfer out
		document.getElementsByName("transferAction")[0].checked = true;
	},
	
	actionPanel_onNext: function(){
		//get and save the action selection
		var radioActionObj = document.getElementsByName("transferAction");

		var parentView = null;
		var mainController = this.view.controllers.get('dataTransferMain');
		if (mainController != null)
		{
			parentView = this.view;
		}
		else {
			parentView = View.getView('parent');
		}

		for(var i=0; i<radioActionObj.length; i++){
			if ( radioActionObj[i].checked ) {
				parentView.progressReportParameters.transferAction = radioActionObj[i].value;
				break;
			} 	
		}
		
		//next tab
		parentView.controllers.get('dataTransferSelection').updateUI(View.progressReportParameters.transferAction);
		
		var tabPanel = parentView.panels.get('datatransfer_tabs');
		tabPanel.selectTab('datatransfer_selection');
		
	}
});

