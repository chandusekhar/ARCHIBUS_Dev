

var controller = View.createController('rmDetailController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.rmDetailSeparatePanel_floors.addEventListener('onMultipleSelectionChange', function(row) {
			controller.rmDetailSeparatePanel_cadPanel.addDrawing(row, null);
	    });
	    
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.rmDetailSeparatePanel_cadPanel.addEventListener('onclick', onClickHandler);
	}
});


function onClickHandler(pk, selected)
{
	var form = View.getControl("", "rmDetailSeparatePanel_form");
	var r = new Ab.view.Restriction();
	r.addClause("rm.bl_id", pk[0], "=", true);
	r.addClause("rm.fl_id", pk[1], "=", true);
	r.addClause("rm.rm_id", pk[2], "=", true);
	form.refresh(r);
}



