var estimateAndNotReservedReportController=View.createController('estimateAndNotReservedReportController',{
	afterInitialDataFetch: function(){
		var partId=View.parameters["partId"];
		var storageLocId=View.parameters["storageLocId"];
		
		this.estimatePartRpt.addParameter('partCodeParam',"wrpt.part_id='"+partId+"'");
		this.estimatePartRpt.addParameter('storageLocationCodeParam',"wrpt.pt_store_loc_id='"+storageLocId+"'");
		
		this.estimatePartRpt.refresh();
	}
});