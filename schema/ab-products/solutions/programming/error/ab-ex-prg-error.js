
var errorController = View.createController('error', {
    
    afterViewLoad: function() {
        this.prgError_testPanel.setInstructions(getMessage('instruction1'));
    },
    
    prgError_testPanel_onThrowException: function() {
        try {
            Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-logProgressAndThrowException', '0');
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});