
var abSpOccupAnalRmpctDetailsController = View.createController('abSpOccupAnalRmpctDetailsController', {

	afterInitialDataFetch:function(){

		var parentController = View.getOpenerView().controllers.get(0);
		this.abSpOccupAnalRmpctDetailsGrid.addParameter('rmpctRestriction', parentController.detailsRes);
		this.abSpOccupAnalRmpctDetailsGrid.addParameter('hrmpctRestriction', parentController.detailsRes.replace(/rmpct/g, "hrmpct"));
		this.abSpOccupAnalRmpctDetailsGrid.show(true);
        this.abSpOccupAnalRmpctDetailsGrid.refresh();
	}
})