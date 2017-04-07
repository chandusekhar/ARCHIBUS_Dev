
View.createController('findManageDocument', {
	
	/**
	 * Enable/disable per-row Show buttons after grid refresh. 
	 */
	exFindManageDoc_leaseGrid_afterRefresh: function() {
		// for each grid row
		this.exFindManageDoc_leaseGrid.gridRows.each(function (row) {
			// get the document field value
			var record = row.getRecord();
			leaseDocFileName = record.getValue('ls.doc');
			
			// disable the Show button if the document field is empty
			var action = row.actions.get('show');
			action.forceDisable(!valueExistsNotEmpty(leaseDocFileName));
		});
	},
	
	/**
	 * Event listener for per-row Show buttons.
	 */
	exFindManageDoc_leaseGrid_onShow: function(row) {
		var record = row.getRecord();
		
		var leaseId = record.getValue('ls.ls_id');
        var leaseDocFileName = record.getValue('ls.doc');
		var keys = {
			'ls_id': leaseId
		};
		
		View.showDocument(keys, 'ls', 'doc', leaseDocFileName);
	},
	
	/**
	 * Show the custom image field.
	 */
	exFindManageDoc_leaseForm_onShowField: function() {
	    this.exFindManageDoc_leaseForm.showField('ls_doc_image', true);
	},
	
	/**
	 * Hide the custom image field.
	 */
	exFindManageDoc_leaseForm_onHideField: function() {
	    this.exFindManageDoc_leaseForm.showField('ls_doc_image', false);
	},
	
	/**
	 * Display the image stored as document in the image field.
	 */
	exFindManageDoc_leaseForm_onShowImageDoc: function() {
	    this.exFindManageDoc_leaseForm.showImageDoc('ls_doc_image', 'ls.ls_id', 'ls.doc');
	},
	
	/**
	 * Display the example image file in the image field.
	 */
	exFindManageDoc_leaseForm_onShowImageFile: function() {
	    this.exFindManageDoc_leaseForm.showImageFile('ls_doc_image', '/archibus/schema/ab-system/graphics/CampusQuadrantPlan.gif');
	},
	
	/**
	 * Clear the image field.
	 */
	exFindManageDoc_leaseForm_onHideImage: function() {
	    this.exFindManageDoc_leaseForm.clearImage('ls_doc_image');
	}
});
