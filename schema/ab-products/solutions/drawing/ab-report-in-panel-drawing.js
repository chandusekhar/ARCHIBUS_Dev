

var controller = View.createController('reportPanelController', {
	afterViewLoad: function() {	
    	// specify a handler for when an load event occurs in the Drawing component
    	// In this case is used to ensure that the related grids with a color field
    	// are using the same opacity as the Drawing Control itself
    	this.reportInPanel_cadPanel.addEventListener('onload', onLoadHandler);
		
		// example of loading a drawing on startup from javascript
		this.reportInPanel_cadPanel.addDrawing(new Ab.drawing.DwgCtrlLoc('HQ', '17'));
	}
});

function onLoadHandler()
{
	// Ensure that associated grids are using the same color opacity as the Drawing Control
	var op = View.getControl('', 'reportInPanel_cadPanel').getFillOpacity();
	View.getControl('', 'reportInPanel_orgs').setColorOpacity(op);
	View.getControl('', 'reportInPanel_rooms').setColorOpacity(op);	
	View.getControl('', 'reportInPanel_orgs').update();
	View.getControl('', 'reportInPanel_rooms').update();
}





