function refreshParent(){
    var parentView = View.getOpenerView();
    parentView.panels.get('riskFactors_grid').refresh();
}

function hideLevels(){
    var parentView = View.getOpenerView();
    parentView.panels.get('riskFactorLevels_grid').show(false);
}