var drawingController = View.createController('drawingController', {
	afterInitialDataFetch: function() {
		// load the drawing based on the queryString
		var bl_id = window.location.parameters['bl_id'];
		var fl_id = window.location.parameters['fl_id'];
		
		// add drawing takes a restriction object
		var rest = new Ab.view.Restriction();
		rest.addClause("fl.bl_id", bl_id, "=");
		rest.addClause("fl.fl_id", fl_id, "=");

		this.cadPanel.addDrawing(rest, null);
	}
});