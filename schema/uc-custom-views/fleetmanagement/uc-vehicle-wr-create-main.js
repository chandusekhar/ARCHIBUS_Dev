// CHANGE LOG
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var wrCreateController = View.createController('wrCreateController', {

	afterViewLoad: function() {
	
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		
	}

	
});