/**
 * JS controller for the Select Template tab.
 */
View.createController('basicRuleWizardSelectTemplate', {
	
	// parent wizard controller
	parentController: null,
	
	afterViewLoad: function() {
	    this.parentController = View.controllers.get('basicRuleWizard'); 
	
	    // attach event listeners to radio buttons
	    this.addRadioButtonEventListeners('templateType', this.onSelectTemplateType);
    },
    
    /**
     * Called from the Select Rule tab.
     */
    afterSelect: function() {
		$('ruleName').focus();
    },
    
    /**
     * Called when the user selects one of Minimal or Template radio buttons.
     */
    onSelectTemplateType: function(radioButton) {
    	if (radioButton.checked) {
    	    var templateType = radioButton.value;
    	    
    	    // store the selection in the parent controller
    	    this.parentController.templateType = templateType;
    	    
    	    var disabled = (templateType === 'minimal'); 
    	    var radioButtons = document.getElementsByName('templateFile');
            for (i = 0; i < radioButtons.length; i++) {
            	var radioButton = radioButtons[i];
            	radioButton.disabled = disabled;
            }
    	}
    },
    
    /**
     * Helper method: adds specified controller method as an event listener to all radio buttons
     * that have specified name.
     */
    addRadioButtonEventListeners: function(radioButtonName, method) {
	    var radioButtons = document.getElementsByName(radioButtonName);
        for (i = 0; i < radioButtons.length; i++) {
        	var radioButton = radioButtons[i];
        	Ext.get(radioButton).on('click', method.createDelegate(this, [radioButton]));
        }
    },
	
    /**
     * Called when the user clicks on the Back button.
     */
	selectTemplatePanel_onSelectTemplateBack: function() {
  		this.wizardTabs.selectTab('selectRule');
    },
    
    /**
     * Called when the user clicks on the Next button.
     */
	selectTemplatePanel_onSelectTemplateNext: function() {
    	this.parentController.ruleName = $('ruleName').value;

    	this.parentController.templateFiles = [];
    	if (this.parentController.templateType == 'minimal') {
    		this.parentController.templateFiles.push('minimal');
    	}
    	var checkboxes = document.getElementsByName('templateFile');
        for (i = 0; i < checkboxes.length; i++) {
        	var checkbox = checkboxes[i];
        	if (checkbox.checked) {
        		this.parentController.templateFiles.push(checkbox.value);
        	}
        }
    	
    	if (this.parentController.ruleName == '') {
    		View.showMessage(getMessage('selectRuleName'));
    		
    	} else if (this.parentController.templateType === 'template' && this.parentController.templateFiles.length == 0) {
    		View.showMessage(getMessage('selectTemplateFile'));
    		
    	} else {
    		// go to the Configure Script tab
    		this.wizardTabs.selectTab('configureScript');
    		// ask the tab controller to load requested script
    		View.controllers.get('basicRuleWizardConfigureScript').onLoadScript();
    	}
    },
    
    /**
     * Called when the user clicks on the Help button.
     */
	selectTemplatePanel_onSelectTemplateHelp: function() {
    	// TODO: display specific help page
    }
});