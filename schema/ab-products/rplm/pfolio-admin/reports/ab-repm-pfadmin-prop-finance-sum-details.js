var abRepmPfadminPropFinanceSumDetailsController = View.createController('abRepmPfadminPropFinanceSumDetailsCtrl', {
	afterViewLoad: function(){
		this.abRepmPfadminPropFinanceSumDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmPfadminPropFinanceSumDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmPfadminPropFinanceSumDetails_propPanel.addParameter('neither', getMessage('neither'));
	},
	abRepmPfadminPropFinanceSumDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmPfadminPropFinanceSumDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmPfadminPropFinanceSumDetails_propPanel.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmPfadminPropFinanceSumDetails_propPanel.fields.get(this.abRepmPfadminPropFinanceSumDetails_propPanel.fields.indexOfKey('image_field')).dom.src = null;
			this.abRepmPfadminPropFinanceSumDetails_propPanel.fields.get(this.abRepmPfadminPropFinanceSumDetails_propPanel.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	}
})


function onReport(commandObject, reportView){
	var overviewController = View.controllers.get("abRepmPfadminPropFinanceSumCtrl");
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(overviewController.printableRestriction);
	
	var parameters = {
		'prId': commandObject.getRestriction().clauses[0].value,
		'owned' : getMessage("owned"),
		'leased' : getMessage("leased"),
		'neither' : getMessage("neither"),
		'printRestriction': (overviewController ? true : false),
        'printableRestriction': (overviewController ? printableRestriction : null)
	};
	View.openPaginatedReportDialog(reportView, null, parameters);
}
