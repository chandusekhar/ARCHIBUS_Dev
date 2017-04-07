var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}<br/>{1}<br/>{2}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reportTabController = View.createController('reportTabController', {
	
	//},
	res_report_afterRefresh: function() {
		BRG.UI.addNameField('wr_requestor_info', this.res_report, 'wr.requestor', 'em', ['phone','cellular_number','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_driver_info', this.res_report, 'wr.driver', 'em', ['phone','cellular_number','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
	}
})
	