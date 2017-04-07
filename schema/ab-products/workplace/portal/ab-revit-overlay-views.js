/**
 * Get the restriction field from the URL parameters and apply it as a filter value.
 * The restriction field does not have to be a PK or FK, but cannot be
 * a date or a time field.
 *
 * The control to restrict must be named detailsPanel.
 *
 * Typical invocations would be:
 *  http://localhost:8080/archibus/schema/ab-system/html/url-proxy.htm?viewName=ab-revit-overlay-eq.axvw&fieldName=eq.eq_id&fieldValue=1003
 *  http://localhost:8080/archibus/schema/ab-system/html/url-proxy.htm?viewName=ab-revit-overlay-ta.axvw&fieldName=ta.ta_id&fieldValue=1000000081
 *
 * Please refer to \schema\ab-system\html\url-proxy-top.js for more
 * information.
 */

var controller = View.createController('revitViewController', {	
	
	/**
	 * After grid has loaded and filter elements exist
	 * set up parameters, filter and refresh
	 */
	afterInitialDataFetch: function() {
		var parameters = window.location.parameters;
		var grid = null;

		//  Third key part
		var fieldName = parameters.fieldName3;
		var fieldValue = parameters.fieldValue3;
		if (valueExists(fieldName) && valueExists(fieldValue)) {
			grid = AFM.view.View.getControl('', 'detailsPanel');
			grid.setFilterValue(fieldName, fieldValue);
		}
		
		//  Second key part
		fieldName = parameters.fieldName2;
		fieldValue = parameters.fieldValue2;
		if (valueExists(fieldName) && valueExists(fieldValue)) {
			if (grid == null) {
				grid = AFM.view.View.getControl('', 'detailsPanel');
			}
			grid.setFilterValue(fieldName, fieldValue);
		}
		
		//  First key part -- all use cases have a first key part, so
		//  do the grid.refresh() in this condition.
		fieldName = parameters.fieldName;
		fieldValue = parameters.fieldValue;
		if (valueExists(fieldName) && valueExists(fieldValue)) {
			if (grid == null) {
				grid = AFM.view.View.getControl('', 'detailsPanel');
			}
			grid.setFilterValue(fieldName, fieldValue);
			grid.refresh();
		}
	}
});

