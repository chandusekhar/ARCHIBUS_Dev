
function onSubmit(){
	var openView = View.getOpenerView();
	openView.closeDialog();
	var controller = openView.controllers.get("wrCreateController");
	controller.submitRequest();
}