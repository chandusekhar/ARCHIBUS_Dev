var controller = View.createController('dataTransferMain', {

	afterViewLoad: function() {

		View.progressReportParameters = {};
			
	    var parameters = window.location.parameters;
	    if (valueExists(parameters)) {
	        for (var name in parameters) {
				var value = parameters[name];
				if (name.toLowerCase() == 'viewname') {
					View.progressReportParameters.viewName = value;
	 			} 
				else if (name.toLowerCase() == 'panelid'){
	 				View.progressReportParameters.panelId = value;
	 			} else if (name.toLowerCase() == 'isexportdocument'){
	 				if(value.toLowerCase() == 'true')
	 					View.progressReportParameters.isExportDocument = true;
	 				else 
	 					View.progressReportParameters.isExportDocument = false;
	 			} else if (name.toLowerCase() == 'isimportdocument'){
	 				if(value.toLowerCase() == 'true')
	 					View.progressReportParameters.isImportDocument = true;
	 				else 
	 					View.progressReportParameters.isImportDocument = false;
	 			}
	        }
	    }
			
		//XXX: get panel and datasource info from targeted grid panel
		var openerWindow = View.getOpenerWindow();
		if (openerWindow != null && valueExists(openerWindow.View) && openerWindow != self) {
			var sourcePanel = openerWindow.View.panels.get(View.progressReportParameters.panelId);
			if (sourcePanel == null) {  // KB 3036336 when sourcePanel is within a frame
				for (var i = 0, parentPanel; parentPanel = openerWindow.View.panels.items[i]; i++) {
					sourcePanel = parentPanel.contentView.panels.get(View.progressReportParameters.panelId);					
					if (sourcePanel != null) {
						break;
					}
				}
			}
			View.progressReportParameters.dataSourceId = sourcePanel.dataSourceId;
			View.progressReportParameters.panelTitle = sourcePanel.title;
			View.progressReportParameters.panelRestriction = toJSON(sourcePanel.restriction);
		}
	}	
});
