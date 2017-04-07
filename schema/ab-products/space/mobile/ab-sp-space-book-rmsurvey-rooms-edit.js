
function onEditSurveyRoom() {
	//refresh panel
	View.getOpenerView().panels.get('spaceSurveyRoomsGrid_grid').refresh();

	//close dialog
	View.getOpenerView().closeDialog();
}
