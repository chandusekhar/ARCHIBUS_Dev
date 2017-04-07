var addFldsReportCtrl = View.createController('addFldsReportCtrl', {
 
	console_onShow:function(){
		this.abViewdefReport_detailsPanel.refresh(this.console.getFieldRestriction());
	}
	    
});

