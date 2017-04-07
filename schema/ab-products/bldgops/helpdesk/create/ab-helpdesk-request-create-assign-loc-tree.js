/**
 * @author Lei
 */
/**
 * Set tree restriction.
 * @param {Object} ob
 */      
function onTreeFlClick(ob){
	 var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
	var openController = View.controllers.get(1);
	openController.currentNode=currentNode;
	openController.loadDrawing();
}