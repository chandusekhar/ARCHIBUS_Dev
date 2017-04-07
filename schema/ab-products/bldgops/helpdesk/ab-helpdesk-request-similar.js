
function onCancel() { 
	var openView = View.getOpenerView();
	openView.closeDialog();
	var controller = openView.controllers.get("helpDeskBasicController");
	controller.requestPanel_onCancel();
}

function onContinue(){
	var openView = View.getOpenerView();
	openView.closeDialog();
	var controller = openView.controllers.get("helpDeskBasicController");
	controller.saveAndNext();
}