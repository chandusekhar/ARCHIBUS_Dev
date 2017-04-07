/**
 * Controller for the Select Value configuration example (ab-ex-form-panel-select-value-configured.axvw).
 */
var abTestSelectValueCtrl = View.createController('abTestSelectValueCtrl', {

	prgFormSelectValueAddNew_hiddenAddNewFormJs_onSelectEmstd: function() {
		var restriction = this.prgFormSelectValueAddNew_hiddenAddNewFormJs.getFieldRestriction();

		View.selectValue({
	    	formId: 'prgFormSelectValueAddNew_hiddenAddNewFormJs',
	    	title: 'Select Employee Standard',
	    	fieldNames: ['em.em_std'],
	    	selectTableName: 'em',
	    	selectFieldNames: ['em.em_std'],
	    	visibleFields: [
				{fieldName: 'em.em_std'}
			],
            showAddNewButton: 'false',
            addNewDialog: 'ab-ex-prg-form-select-value-add-new-dialog.axvw'
		});
	}
});

