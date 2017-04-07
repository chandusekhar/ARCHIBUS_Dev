function refreshParent(){
    var parentView = View.getOpenerView();
    parentView.panels.get('riskFactorAssessment_grid').refresh();
}