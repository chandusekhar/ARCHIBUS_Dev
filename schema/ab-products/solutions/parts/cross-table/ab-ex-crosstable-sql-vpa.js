
View.createController('exCrosstableSqlVpa', {
	
	/**
	 * Apply bl_id parameter to the cross table and refresh it.
	 */
	exCrosstableSqlVpa_onApplyParameter: function() {
		this.exCrosstableSqlVpa.addParameter('bl_id', 'HQ');
		this.exCrosstableSqlVpa.refresh();
	}
});