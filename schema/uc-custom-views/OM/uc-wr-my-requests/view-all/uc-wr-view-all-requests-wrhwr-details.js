var wrhwrDetailsController = View.createController('wrhwrDetailsController', {

	afterInitialDataFetch: function() {
		var wr_id = window.location.parameters['wrId'];
		
		this.wrhwr_details.refresh("wr_id='"+wr_id+"'");
	},
	
	openPrintWindow: function()
	{
		var wr_id = this.wrhwr_details.getFieldValue("wrhwr.wr_id");
		window.open('uc-wr-my-requests-print.axvw?handler=com.archibus.config.ActionHandlerDrawing&wrhwr.wr_id='+wr_id, 'newWindow', 'width=600, height=800, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

	}
});