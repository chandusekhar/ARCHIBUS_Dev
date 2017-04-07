var regTreeController = View.createController('regTreeController', {
	mainController:'',

	afterInitialDataFetch: function(){
		//since for different layput structure, the controller's initial sqeuence is different, 
		// so get top main controller by index such as '0' is not always correct, 
		// here use if else to get proper main controller that current tree is in by id.
		if(View.controllers.get('abCompUnscheduledController')){
			this.mainController=View.controllers.get('abCompUnscheduledController');

		} else if(View.controllers.get('commlogRptController')){
			this.mainController=View.controllers.get('commlogRptController');

		} else  if(View.controllers.get('abViolationRptController')){
			this.mainController=View.controllers.get('abViolationRptController');
		} 

		if(this.mainController){
			this.mainController.regTreeController=regTreeController;
		}

		//set proper title for tree showing in this View
		this.regulationLevel.setTitle(getMessage("treeTitle"));
	}
})

function clearRestriction(){
	regTreeController.treeRegcomp.unselectAll();
}

function onClickRegulation(){
    var curTreeNode = regTreeController.regulationLevel.lastNodeClicked;
	regTreeController.mainController.onClickRegulationNode(curTreeNode.data['regulation.regulation']);
}

function onClickProgram(){
    var curTreeNode = regTreeController.regulationLevel.lastNodeClicked;
	regTreeController.mainController.onClickProgramNode(curTreeNode.data['regprogram.regulation'],curTreeNode.data['regprogram.reg_program']);
}

function onClickRequirement(){
    var curTreeNode = regTreeController.regulationLevel.lastNodeClicked;
	regTreeController.mainController.onClickRequirementNode(curTreeNode.data['regrequirement.regulation'],curTreeNode.data['regrequirement.reg_program'],curTreeNode.data['regrequirement.reg_requirement']);
}
