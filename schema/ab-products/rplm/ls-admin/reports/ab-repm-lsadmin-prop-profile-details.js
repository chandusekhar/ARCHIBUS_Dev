var abRepmLsadminPropProfileDetailsController = View.createController('abRepmLsadminPropProfileDetailsCtrl', {
	afterViewLoad: function(){
		this.abRepmLsadminPropProfileDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminPropProfileDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminPropProfileDetails_propPanel.addParameter('neither', getMessage('neither'));
	},
	abRepmLsadminPropProfileDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminPropProfileDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmLsadminPropProfileDetails_propPanel.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmLsadminPropProfileDetails_propPanel.fields.get(this.abRepmLsadminPropProfileDetails_propPanel.fields.indexOfKey('image_field')).dom.src = null;
			this.abRepmLsadminPropProfileDetails_propPanel.fields.get(this.abRepmLsadminPropProfileDetails_propPanel.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	}
})



function onReport(commandObject, reportView){
	var overviewController = View.controllers.get("abRepmLsadminPropProfileCtrl");
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
