/**
 * Calls the WFR for recalculation depreciation
 * for equipments or tagged furniture, depending on the parameter <forWhat>
 * @param {String} forWhat Values in 'eq','ta'
 * @param {String} panelToRefresh
 */
function recalculateDepreciation(forWhat, panelToRefresh){
	// confirm recalculation
	var message = getMessage('confirmRecalculation');
	var jobName = "AbAssetManagement-AssetService-calculateEquipmentDepreciation";

	switch(forWhat) {
		case 'eq':
			jobName = "AbAssetManagement-AssetService-calculateEquipmentDepreciation";
			break;
		case 'ta':
		    jobName = "AbAssetManagement-AssetService-calculateTaggedFurnitureDepreciation";
			break;
		default: 
			break;
	}


	View.confirm(message, function(button) {
		if (button == 'yes') {
			try {
			    var jobId = Workflow.startJob(jobName);
				View.openJobProgressBar(getMessage('calculateMessage'), jobId, '', function(status) {
					if(View.panels.get(panelToRefresh).visible){
						View.panels.get(panelToRefresh).refresh();
					}
			    });
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}
