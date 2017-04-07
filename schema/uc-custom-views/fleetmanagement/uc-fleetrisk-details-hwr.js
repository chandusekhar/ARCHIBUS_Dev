// CHANGE LOG:
// 2015/12/01 - MSHUSSAI - developed this new javascript file to handle input wr_id parameter

var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };
		
var hwrDetailsController = View.createController('hwrDetailsController', {

	afterInitialDataFetch: function() {
		var wr_id = window.location.parameters['wrId'];
		
		this.details_panel.refresh("wr_id='"+wr_id+"'");
	},
	
	hwr_details_afterRefresh: function() {
		BRG.UI.addNameField('prob_cat_name', this.details_panel, 'hwr.prob_type', 'probtype', 'prob_cat',
        {'probtype.prob_type' : 'hwr.prob_type'},
        nameLabelConfig);
	},	
	
});