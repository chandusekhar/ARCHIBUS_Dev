/**
 * Top-level JS controller for the basic Rule Wizard.
 */
View.createController('basicRuleWizard', {
	
	// selected rule type: 'new' or 'existing'
	ruleType: 'new',
	
	// selected rule file (if ruleType == 'existing')
	ruleFile: '',
	
	// selected template type: 'minimal' or 'template' (if ruleType == 'new')
	templateType: 'minimal',
	
	// array of selected template files (if ruleType == 'new')
	templateFiles: null,
	
	// new rule name (if ruleType == 'new')
	ruleName: '',
	
	afterViewLoad: function() {
	    this.templateFiles = [];
    }
});