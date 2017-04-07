/**
 * @author Song
 */

var abWasteRptManifestDetailsController = View.createController('abWasteRptManifestDetailsController', {
	afterInitialDataFetch: function(){
		var openerView = View.getOpenerView();
		var wasteId = openerView.controllers.get("abWasteRptShipmentsController").wasteId;
		var panel = this.abWasteRptShipmentsViewManifestForm;
		panel.addParameter('wasteId', wasteId);
		panel.refresh();
	}
});