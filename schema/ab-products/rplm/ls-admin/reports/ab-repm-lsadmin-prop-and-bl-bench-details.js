var abRepmLsadminPropAndBlBenchDetailsController = View.createController('abRepmLsadminPropAndBlBenchDetailsCtrl', {
	afterViewLoad: function(){
		this.abRepmLsadminPropAndBlBenchDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminPropAndBlBenchDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminPropAndBlBenchDetails_propPanel.addParameter('neither', getMessage('neither'));
	},
	abRepmLsadminPropAndBlBenchDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminPropAndBlBenchDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmLsadminPropAndBlBenchDetails_propPanel.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmLsadminPropAndBlBenchDetails_propPanel.fields.get(this.abRepmLsadminPropAndBlBenchDetails_propPanel.fields.indexOfKey('image_field')).dom.src = null;
			this.abRepmLsadminPropAndBlBenchDetails_propPanel.fields.get(this.abRepmLsadminPropAndBlBenchDetails_propPanel.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	}
})

function onReport(commandObject, reportView){
	var overviewController = View.controllers.get("abRepmLsadminPropAndBlBenchCtrl");
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(overviewController.printableRestriction);
	var currencyCode = View.project.budgetCurrency.code;
	
	var parameters = {
		'prId': commandObject.getRestriction().clauses[0].value,
		'owned' : getMessage("owned"),
		'leased' : getMessage("leased"),
		'neither' : getMessage("neither"),
		'currencyCode' : currencyCode,
		'printRestriction': (overviewController ? true : false),
        'printableRestriction': (overviewController ? printableRestriction : null)
	};
	View.openPaginatedReportDialog(reportView, null, parameters);
}
