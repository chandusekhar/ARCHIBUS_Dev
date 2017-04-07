/**
 * View's controller
 */
var abEhsDefTrainingController = View.createController('abEhsDefTrainingCtrl',{
	savedCategoryId: null,
	
	recurringPatternCtrl : null,
	
	afterViewLoad:function(){
		this.recurringPatternCtrl = View.controllers.get("abRecurringPatternCtrl");
		
		this.abEhsDefTraining_treeCat.setTreeNodeConfigForLevel(0,           	
	            [{fieldName: 'ehs_training_cat.training_category_id'},                   
	             {fieldName: 'ehs_training_cat.description', length: 50}]);
	},
	
	afterInitialDataFetch: function(){
		this.recurringPatternCtrl.showRecurringPatternPanel(false);
	},
	
	/**
	 * Show the edit form, including the recurring part
	 */
	showEditForm: function(show, newRecord, cmdObject){
		this.abEhsDefTraining_form.show(show);
		this.recurringPatternCtrl.showRecurringPatternPanel(show);

		if (show) {
			this.abEhsDefTraining_form.refresh(cmdObject ? cmdObject.restriction : null, newRecord);
			this.initForm();
			
			if(this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh') == '1'){
				var recurringRule = this.abEhsDefTraining_form.getFieldValue("ehs_training.recurring_rule");
				this.recurringPatternCtrl.setRecurringPattern(recurringRule);
				this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", true);
			}else{
				//this.recurringPatternCtrl.enableRecurringPattern(false);
				this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", false);
				
				this.recurringPatternCtrl.showRecurringPatternPanel(false);
			}
        }
	},
	
	abEhsDefTraining_form_afterRefresh: function(){
		this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefTraining_form.getFieldValue("ehs_training.recurring_rule"));
		
		//showing or hide Reschedule Assignments button
		this.showOrHideRescheduleButton();
	},
	
	/**
	 * Show or hide Reschedule Assignments button base on the future current employee training assignment for recurrence training program
	 */
	showOrHideRescheduleButton : function() {
		// flag that indicate showing or hide reschedule Assignments button, default to hide this button
		var showButton = false;

		// is current training program recurrence
		var isRecurrenctTraining = this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh') == '1' ? true : false;

		// only show this button when edit mode for recurrence training program
		if (!this.abEhsDefTraining_form.newRecord && isRecurrenctTraining) {

			var trainingId = this.abEhsDefTraining_form.getFieldValue('ehs_training.training_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ehs_training_results.training_id', trainingId, '=');
			var futureAssignments = this.abEhsDefTraining_AssignmentDS.getRecords(restriction);
			// is this training program have future employee assignment
			var haveFutureAssignment = futureAssignments.length > 0 ? true : false;

			// if this recurrence training program having future employee assignment, then show the Reschedule Assignments button
			if (haveFutureAssignment) {
				showButton = true;
			}
		}

		// show or hide Reschedule Assignments button base on the flag 'showButton'
		this.abEhsDefTraining_form.actions.get('rescheduleAssignments').show(showButton);
	},
	
	/**
	 * When click RescheduleAssignments button, open pop up to do the reschedule 
	 */
	abEhsDefTraining_form_onRescheduleAssignments : function() {
		View.trainingIdForReschedule = this.abEhsDefTraining_form.getFieldValue('ehs_training.training_id');
		View.openDialog('ab-ehs-def-training-reschedule.axvw');
	},
	
	abEhsDefTraining_form_beforeSave: function(){
		this.abEhsDefTraining_form.setFieldValue('ehs_training.recurring_rule', this.recurringPatternCtrl.getRecurringPattern());
		this.saveCategoryId();

		if(!this.checkNeedsRefresh())
			return false;
		
		return true;
	},
	
	/**
	 * Initialize the form with the category ID of the last clicked node in the tree 
	 */
	initForm: function(){
		var currentNode = this.abEhsDefTraining_treeCat.lastNodeClicked;
		if(currentNode){
			var categoryId = currentNode.data['ehs_training_cat.training_category_id'];
			if(!valueExistsNotEmpty(categoryId)){
				categoryId = currentNode.data['ehs_training.training_category_id'];
			}
			
			if(valueExistsNotEmpty(categoryId)){
				this.abEhsDefTraining_form.setFieldValue('ehs_training.training_category_id', categoryId);
			}
		}
	},
	
	/**
	 * Save the category ID of the current record in the form
	 */
	saveCategoryId: function(){
		this.savedCategoryId = this.abEhsDefTraining_form.getFieldValue('ehs_training.training_category_id');
	},
	
	/**
	 * Check if <Is Refresh Required?> is Yes and a recurrence has been chosen.
	 * If not, alert the user to choose a recurrence
	 */
	checkNeedsRefresh: function(){
		var needsRefresh = this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh');
		if(needsRefresh == "1"){
			//check that renewal frequency is described
			if(this.recurringPatternCtrl.getRecurringPatternType() == "none"){
				View.showMessage(getMessage("selectRecurrence"));
				return false;
			}
			
			//check that one of the stop conditions is defined: Date End or End After[ ]Ocurrences or Once button selected
			/* PC not required after last changes to common code, default values of 5-10 years can be used if no stop condition is indicated
			if(!isRecurrenceEnd(this.abEhsDefTraining_form.getFieldValue("ehs_training.date_recurrence_end"), this.recurringPatternCtrl)){
				return false;
			}*/
		}
		
		return true;
	},
	
	/**
	 * Handle enabling and values for the Refresh fields and form
	 */
	onChangeNeedsRefresh: function(){
		var needsRefresh = this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh');
		if(needsRefresh == "1"){
			this.recurringPatternCtrl.showRecurringPatternPanel(true);
			
			this.recurringPatternCtrl.enableRecurringPattern(true);
			this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", true);
		} else {
			this.recurringPatternCtrl.clearRecurringPattern();
			//this.recurringPatternCtrl.enableRecurringPattern(false);
			this.abEhsDefTraining_form.fields.get("ehs_training.date_recurrence_end").clear();
			this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", false);
			
			this.recurringPatternCtrl.showRecurringPatternPanel(false);
		}
	},
	
	/**
	 * Refreshes the tree and selects the saved category ID, if any
	 */
	refreshTreeAndSelect: function(){
		this.abEhsDefTraining_treeCat.refresh();
		
		var rootNode = this.abEhsDefTraining_treeCat.treeView.getRoot();
		if(valueExistsNotEmpty(this.savedCategoryId)){
			/* Search the node of the category id, to expand it */
	        for (var i = 0; i < rootNode.children.length; i++) {
	            var node = rootNode.children[i];
	            if (node.data['ehs_training_cat.training_category_id'] == this.savedCategoryId) {
	            	this.abEhsDefTraining_treeCat.expandNode(node);

	            	break;
	            }
	        }
		}
	}
})