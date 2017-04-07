// ab-dyna-panel.js

var controller = View.createController('dynaPanelTest', {
    
    afterInitialDataFetch: function() {
        var message = 'view not found';
        
		var detailsFrame = Ab.view.View.getControl('','panel_row3col2');
		var replaceTarget = View.getControl('','panel_row5col2');

		if (replaceTarget != null && detailsFrame != null) {
			message = 'panel was found';
			detailsFrame.loadView('ab-view-nav-wednesday.axvw');
			replaceTarget.loadView('ab-view-nav-switcher.axvw');
		}      
        //View.showMessage(message);
    }
});
