function setDelete_usable(){
	View.panels.get("detailsPanel").actions.get("delete").forceDisable(false);
}
function setDelete_unusable(){
	View.panels.get("detailsPanel").actions.get("delete").forceDisable(true);
}


