View.createController("abMsdsDefProviderController", {
	

	/**
	 *  Execute after 'abMsdsDefProviderForm' Form refreshed
	 */
	abMsdsDefProviderForm_onSave: function(){
		
		var form=this.abMsdsDefProviderForm;
		form.setFieldValue('company.date_last_updated',getCurrentDateInISOFormat());
		form.save();
		this.abMsdsDefProviderGrid.refresh();
		
	}
});
