
var controller = View.createController('roomSelectorController', {
	 
	res : new Ab.view.Restriction(),
	
	afterViewLoad: function() {	
    	this.exSelectRoom_cadPanel.addEventListener('onclick', onClickHandler);
    	var resIn = View.getOpenerView().dialogRestriction;
    	if (resIn != null)
    	{
    	    this.res.addClauses(resIn, true);
    	    this.exSelectRoom_cadPanel.addDrawing(this.res);
    	}
    }
	
});


function onClickHandler(pk, selected)
{
	var ctrl = View.controllers.get('roomSelectorController');
	var res = ctrl.res;
	var clause = res.clauses[0];
	var name = clause.name;
	var i = name.indexOf('.');
	if (i <= 0)
		return;
		
	var tbl = name.substr(0, i);
	if (res.clauses.length < 3)
		res.addClause(tbl + '.rm_id', pk[2], '=');
	else
		res.clauses[2].value = pk[2];
	View.parameters.callback(res);
	// The .defer method used here is required for proper functionality with Firefox 2
	View.closeThisDialog.defer(100, View);
	// Otherwise the .closeThisDialog method is sufficient in all other tested browsers
	//View.closeThisDialog();
}





