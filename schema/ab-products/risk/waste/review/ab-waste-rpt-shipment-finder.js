/**
 * @author Song
 */

var abWasteDefMainfestsController = View.createController('abWasteDefMainfestsController',{
	//filter restriction object
	filterRestriction: null,
	
	/**
	 * console Show click
	 */
	abWasteRptShipmentFinderConsole_onShow: function(){
		this.filterRestriction = this.abWasteRptShipmentFinderConsole.getFieldRestriction();
		this.abWasteRptShipmentFinderGrid.refresh(this.filterRestriction);
	},
	
	abWasteRptShipmentFinderGrid_onDocx: function(){
		var restriction = null;
		if(this.filterRestriction){
			restriction = {'abWasteRptShipmentFinderPaginateDS': this.filterRestriction};
		}
		var parameters = {
				 'printRestriction': true
		};
		
		//generate paginated report
		View.openPaginatedReportDialog('ab-waste-rpt-shipment-finder-paginate.axvw', restriction, parameters);
	}
});
