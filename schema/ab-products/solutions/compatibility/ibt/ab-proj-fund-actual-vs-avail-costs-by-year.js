var projectActVsBudCostsByYearCtr = View.createController('projectActVsBudCostsByYear', {

    isDialog: false,
    openerController: null,
    restriction: '',
    
    afterInitialDataFetch: function(){
    },
    
    reopenDialog: function(page, controller, restriction){
        var crtController = this;
        View.closeDialog();
        View.openDialog(page, null, true, {
            width: 1024,
            height: 768,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get(controller);
                dialogController.isDialog = true;
                dialogController.openerController = crtController;
                dialogController.restriction = restriction;
                dialogController.filterRestriction = restriction.clauses[0].name + restriction.clauses[0].op + '\'' + restriction.clauses[0].value + '\'';
                dialogController.view.panels.get(0).refresh(restriction);
                dialogController.modifyPanelStyle(dialogController.view.type, dialogController.view.panels.get(0));
            }
        });
    }
})


function onClickEventProjectActualVsAvailCosts(obj){
    var tempObj = obj;
    var restriction = obj.restriction;
    var controller = projectActVsBudCostsByYearCtr;
    
    if (!controller.isDialog) {
        View.openDialog('ab-proj-fund-actual-vs-avail-costs-by-year-fund-details.axvw', restriction, true, {
            width: 1024,
            height: 768,
            closeButton: false
        });
        
    }
    else {
        controller.openerController.reopenDialog('ab-proj-fund-actual-vs-avail-costs-by-year-fund-details.axvw', 'projectActVsBudCostsByYearDetails', tempObj.restriction);
    }
    
}
