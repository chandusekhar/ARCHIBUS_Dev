/**
 * Action listener.
 */
function onSelectMenuActionFromProject(actionId, mapController){
	if(valueExists(mapController.selectedProjects) && mapController.selectedProjects.length > 0){
		if(mapController.markerType != actionId){
			mapController.markerType = actionId;
			mapController.clearMap();
			mapController.showMarkers();
		}
	}else{
		mapController.clearMap();
		mapController.resetMapExtent();
	}
}


/**
 * Action listener.
 */
function onSelectMenuAction(actionId, mapController){
	if(mapController.markerType != actionId){
		mapController.markerType = actionId;
		mapController.showMarkers();
	}
}