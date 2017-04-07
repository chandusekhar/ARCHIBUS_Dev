var projMngDashProfController = View.createController('projMngDashProf',{
	statuses: new Array('approved','approvedInDesign','issuedInProcess','issuedOnHold','completedPending','completedNotVer','completedVer','closed','approvedCancelled','issuedStopped'),
	
	afterInitialDataFetch: function(){        
		for(var i = 0; i < this.statuses.length; i++){
			var status = this.statuses[i];
			this.projMngDashProf_form.addParameter(status, getMessage(status));
		}
	},
	
	projMngDashProf_form_afterRefresh: function(){
		var openerController = null;
		if(valueExists(View.controllers.get('projMngDash'))){
			openerController = View.controllers.get('projMngDash');
		} else if(valueExists(View.controllers.get('abEamProjConsoleDashController'))){
			openerController = View.controllers.get('abEamProjConsoleDashController');
		}
		
		openerController.refreshProjDash(this.projMngDashProf_form.getRecord());
	}
});
