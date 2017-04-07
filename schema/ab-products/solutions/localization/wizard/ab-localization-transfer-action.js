var controller = View.createController('localizationTransferAction', {

	afterViewLoad: function(){
		//default to transfer in
		document.getElementsByName("transferAction")[0].checked = true;
	},
	
	actionPanel_onNext: function(){
		//get and save the action selection
		var radioActionObj = document.getElementsByName("transferAction");
		for(var i=0; i<radioActionObj.length; i++){
			if ( radioActionObj[i].checked ) {
				View.getView('parent').progressReportParameters.transferAction = radioActionObj[i].value;
				break;
			} 	
		}
		
		//next tab
		View.getView('parent').controllers.get('localizationTransferSelection').updateUI(View.progressReportParameters.transferAction);
		
		var tabPanel = View.getView('parent').panels.get('localizationtransfer_tabs');
		tabPanel.selectTab('localizationtransfer_selection');
		
	}
});

