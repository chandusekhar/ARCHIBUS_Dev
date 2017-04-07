var moveWizardController = View.createController('moveWizard',{
	afterInitialDataFetch: function() {
	},

	afterViewLoad: function() {
		hideMoveTabs();
    }
});

// Used to hide the move tabs when starting the Edit Moves view

function hideMoveTabs() {
	View.panels.get('motabs').hideTab('page1');
	View.panels.get('motabs').hideTab('page2');
	View.panels.get('motabs').hideTab('page3');
	View.panels.get('motabs').hideTab('page4');
	View.panels.get('motabs').hideTab('page5');
	View.panels.get('motabs').hideTab('page6');
}
