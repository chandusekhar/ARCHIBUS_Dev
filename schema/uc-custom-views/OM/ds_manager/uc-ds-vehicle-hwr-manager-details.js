// CHANGE LOG:
// 2015/01/11 - MSHUSSAI - Created this new file from scratch in order to view Fleet Archived requests

var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };
		
var hwrDetailsController = View.createController('hwrDetailsController', {

	afterInitialDataFetch: function() {
		var wr_id = window.location.parameters['wrId'];
		
		this.hwr_details.refresh("wr_id='"+wr_id+"'");
	},
	
	hwr_details_afterRefresh: function() {
		BRG.UI.addNameField('prob_cat_name', this.hwr_details, 'hwr.prob_type', 'probtype', 'prob_cat',
        {'probtype.prob_type' : 'hwr.prob_type'},
        nameLabelConfig);
	},
	
	openInvoiceWindow: function()
	{
		var wr_id = this.hwr_details.getFieldValue("hwr.wr_id");
		window.open('uc-wr-manager-hwr-print-invoice.axvw?handler=com.archibus.config.ActionHandlerDrawing&hwr.wr_id='+wr_id+'&hwrcf.wr_id='+wr_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

	},
	
	openPackageInvoiceWindow: function()
	{
		var wo_id = this.hwr_details.getFieldValue("hwr.wo_id");
		var wr_id = this.hwr_details.getFieldValue("hwr.wr_id");
		window.open('uc-wr-manager-hwr-print-invoice-package.axvw?handler=com.archibus.config.ActionHandlerDrawing&hwo.wo_id='+wo_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
	}
});