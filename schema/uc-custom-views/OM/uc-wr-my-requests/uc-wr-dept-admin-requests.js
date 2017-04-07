// CHANGE LOG
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var wrViewController = View.createController('wrViewController', {

	afterViewLoad: function() {

		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

	},

});

// *****************************************************************************
// Open the Craftsperson Print window
//******************************************************************************
function openPrintWindow()
{
	var form = View.getControl('', 'wr_report');
	var wr_id = form.getFieldValue('wrhwr.wr_id');
	window.open('uc-wr-my-requests-print.axvw?handler=com.archibus.config.ActionHandlerDrawing&wrhwr.wr_id='+wr_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
}
