function refreshParent(){
    var parentView = View.getOpenerView();
    parentView.panels.get('riskFactorLevels_grid').refresh();
}