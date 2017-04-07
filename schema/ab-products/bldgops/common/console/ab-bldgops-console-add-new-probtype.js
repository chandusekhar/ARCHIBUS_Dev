View.createController('addNewProbTypeController', {

	isFirstTier : true,

	/**
	 * Show hide first tier field.
	 */
	afterInitialDataFetch : function() {
		this.determinFirstTierField();
	},

	/**
	 * Show first tier field when second radio is selected.
	 */
	determinFirstTierField : function() {
		if (this.isFirstTier) {
			this.addNewProbTypeForm.showField('firstTier', false);
			this.addNewProbTypeForm.fields.get('firstTier').fieldDef.required = false;
		} else {
			this.addNewProbTypeForm.showField('firstTier', true);
			this.addNewProbTypeForm.fields.get('firstTier').fieldDef.required = true;
		}
	},

	/**
	 * Show first tier field when second radio is selected.
	 */
	addNewProbTypeForm_beforeSave : function() {
		// construct the full problem type by parent and real prob_type
		var probType = this.addNewProbTypeForm.getFieldValue("own_prob_type");
		if (!this.isFirstTier) {
			probType = this.addNewProbTypeForm.getFieldValue("firstTier") + '|' + probType;
		}
		// set field values
		this.addNewProbTypeForm.setFieldValue("probtype.prob_type", probType);
		this.addNewProbTypeForm.setFieldValue("probtype.hierarchy_ids", probType + '|');
	}

});

/**
 * If second tier selected, then show first tier field, else hide first tier field
 */
function onChangeProblemLevel() {
	var controller = View.controllers.get('addNewProbTypeController');
	var problemLevel = document.getElementsByName("problemLevel");
	if (problemLevel[0].checked) {
		controller.isFirstTier = true;
	} else if (problemLevel[1].checked) {
		controller.isFirstTier = false;
	}

	controller.determinFirstTierField();
}

/**
 * Add new problem type to parent form
 */
function addNewProblemTypeToParentForm() {
	var openerView = View.getOpenerView();
	if (openerView) {

		var parentController = openerView.controllers.get('wrCreateController');

		if (parentController) {

			// re-load the parent problem types in parent form
			parentController.showParentProblemType();

			var currntController = View.controllers.get('addNewProbTypeController');
			if (currntController.isFirstTier) {

				// if the new problem type is first tier, set the first tier in parent form
				parentController.createRequestForm.setFieldValue('prob_type_parent', currntController.addNewProbTypeForm.getFieldValue("probtype.prob_type"));
				parentController.showSubProblemTypeByParent();

			} else {
				
				//get first tier and second tier
				var secondTier = currntController.addNewProbTypeForm.getFieldValue("probtype.prob_type");
				var firstTier = secondTier.split('|')[0];

				// set the first tier and second tier in parent form
				parentController.createRequestForm.setFieldValue('prob_type_parent', firstTier);
				parentController.showSubProblemTypeByParent();
				parentController.createRequestForm.setFieldValue('prob_type_sub', secondTier);

			}

	        //set problem type for priority
		    parentController.setProblemType();
			
			// show priority
			parentController.priorityField.showPriority();
		}

	}
}
