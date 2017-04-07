
var blcostWrDetailsController = View.createController('blcostWrDetailsController', {
	/**
	 * Search by console
	 */
	afterInitialDataFetch:function(){
		var parentController = View.getOpenerView().controllers.get(1);
        var otherRes =  parentController.otherRes;
		if(parentController.blId && parentController.month){
			otherRes = otherRes + " AND wrhwr.bl_id='" + parentController.blId +"' ";
	        this.detailsReport.addParameter("month", "='"+parentController.month+"'");
	        this.detailsReport.refresh(otherRes);
		}
		else{
	        this.detailsReport.addParameter("month", " is not null ");
			otherRes = otherRes + " AND wrhwr.bl_id='" + parentController.blId +"' ";
	        this.detailsReport.refresh(otherRes);
		}
	}
})