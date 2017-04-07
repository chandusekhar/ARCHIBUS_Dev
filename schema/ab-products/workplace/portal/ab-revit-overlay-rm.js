/**
 * Get the Room restriction field from the URL parameters and apply it as a
 * filter value to _each_ panel in the ab-revit-overlay-rm.axvw.
 *
 * The values must be in order in the URL: bl_id, fl_id, then rm_id, e.g.
 * http://localhost:8080/archibus/schema/ab-system/html/url-proxy.htm?viewName=ab-revit-overlay-rm.axvw&fieldName=rm.bl_id&fieldValue=HQ&fieldName2=rm.fl_id&fieldValue2=17&fieldName3=rm.rm_id&fieldValue3=101
 */

var controller = View.createController('revitRoomViewController', {	
	/**
	 * After grid has loadeds and filter elements exist
	 * set up parameters, filter and refresh
	 *	 
	 */
	afterInitialDataFetch: function() {
		var gridRm = AFM.view.View.getControl('', 'detailsPanelRm');
		var gridEm = View.getControl('', 'detailsPanelEm');
		var gridEq = View.getControl('', 'detailsPanelEq');
		var gridTa = View.getControl('', 'detailsPanelTa');

		var parameters = window.location.parameters;

		//  Third key part
		var fieldValue = parameters.fieldValue3;
		if (valueExists(fieldValue)) {
			gridRm.setFilterValue("rm.rm_id", fieldValue);
			gridEm.setFilterValue("em.rm_id", fieldValue);
			gridEq.setFilterValue("eq.rm_id", fieldValue);
			gridTa.setFilterValue("ta.rm_id", fieldValue);
		}
		
		//  Second key part
		fieldValue = parameters.fieldValue2;
		if (valueExists(fieldValue)) {
			gridRm.setFilterValue("rm.fl_id", fieldValue);
			gridEm.setFilterValue("em.fl_id", fieldValue);
			gridEq.setFilterValue("eq.fl_id", fieldValue);
			gridTa.setFilterValue("ta.fl_id", fieldValue);
		}
		
		//  First key part -- all use cases have a first key part, so
		//  do the grid.refresh() in this condition.
		fieldValue = parameters.fieldValue;
		if (valueExists(fieldValue)) {
			gridRm.setFilterValue("rm.bl_id", fieldValue);
			gridEm.setFilterValue("em.bl_id", fieldValue);
			gridEq.setFilterValue("eq.bl_id", fieldValue);
			gridTa.setFilterValue("ta.bl_id", fieldValue);
			
			gridEm.refresh();
			gridRm.refresh();
			gridEq.refresh();
			gridTa.refresh();
		}
	}
});


