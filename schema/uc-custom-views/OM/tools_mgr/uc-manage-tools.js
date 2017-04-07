// CHANGE LOG
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var detailsPanelController = View.createController('detailsPanelController', {

	afterViewLoad: function() {
	
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		
	},


	tl_details_afterRefresh: function() {
	//alert("Refresh");
	
		statusField=this.tl_details.fields.get('tl.status')
	
		var statusDropDown = statusField.dom;
		UC.UI.removeOption(statusDropDown, 'IU');
		UC.UI.removeOption(statusDropDown, 'R');
	}


});