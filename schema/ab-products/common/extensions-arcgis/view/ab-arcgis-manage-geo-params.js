var viewController = ('viewControl', {
	
	afterViewLoad: function(){

	},

	afterInitialDataFetch: function(){

	},

	onImportGeoParams: function(row) {
		console.log('<--- onImportGeoParams --->');

		// get the dwg_name
		var dwgName = row['afm_dwgs.dwg_name'];

		var parameters = {'dwgname': dwgName};

		// call WFR to export georeference parameters
		var result = Ab.workflow.Workflow.call('AbCommonResources-ArcgisExtensionsService-importDrawingGeoreferenceParametersToDatabaseFromFile', parameters);
		if (result.code != 'executed') {
			Ab.workflow.Workflow.handleError(result);
		} else {
			View.showMessage('Georeference parameters imported.');
			// refresh the panel
			View.panels.get('dwgsPanel').refresh();
		}

		
	},

	onExportGeoParams: function(row) {
		console.log('<--- onExportGeoParams --->');

		// get the dwg_name
		var dwgName = row['afm_dwgs.dwg_name'];

		var parameters = {'dwgname': dwgName};

		// call WFR to export georeference parameters
		var result = Ab.workflow.Workflow.call('AbCommonResources-ArcgisExtensionsService-exportDrawingGeoreferenceParametersToFileFromDatabase', parameters);
		if (result.code != 'executed') {
			Ab.workflow.Workflow.handleError(result);
		} else {
			View.showMessage('Georeference parameters exported.');
		}

	},
	
	onEditGeoParams: function(row) {
		console.log('<--- onEditGeoParams --->');

		// create restriction
		var restriction = new Ab.view.Restriction();
		if (row) {
			restriction.addClause('afm_dwgs.dwg_name', row['afm_dwgs.dwg_name'], "=", "OR");
		}

		//display popup edit form
		var offsetX = $('dwgsPanel').offsetWidth - 525;
        var offsetY  = $('dwgsPanel').offsetHeight - 325;
        
        var editForm = View.panels.get('dwgsEditForm');
        editForm.refresh(restriction);
        editForm.showInWindow({ 
            width: 500, height: 300, 
            x: offsetX, y: offsetY,
            closeButton: false });	

	}	

});