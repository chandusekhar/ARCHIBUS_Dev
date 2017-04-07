
var abReportEventController = View.createController('abReportEventController', {
	afterInitialDataFetch: function(){
		//if this view is opened as popup, get the restriction from parent view 
		var openerView = View.getOpenerView().getOpenerView();
		
		
		if(openerView ){
			
			//hide DOC button when open as pop up 
			if(openerView.popUpRestriction){
				this.abCompEventActivityLogGrid.actions.get('doc').show(false);
				this.abCompEventActivityLogGrid.addParameter('consoleResRegcompliance', openerView.popUpRestriction);
			}else if(openerView.whichView){
				this.abCompEventActivityLogGrid.actions.get('doc').show(false);
			}
			
		}
	},
	
	
	/**
	* Event Handler of action "Doc"
	*/
	abCompEventActivityLogGrid_onDoc: function(){
		
		var	parameters = {};
		parameters.consoleRes =this.abCompEventActivityLogGrid.restriction?this.abCompEventActivityLogGrid.restriction:" 1=1 ";
		View.openPaginatedReportDialog("ab-comp-event-pgrt.axvw" ,null, parameters);

	}
	
});

