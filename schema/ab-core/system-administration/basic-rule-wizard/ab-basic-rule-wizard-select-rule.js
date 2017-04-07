/**
 * JS controller for the Select New or Existing Rule tab.
 */
View.createController('basicRuleWizardSelectRule', {
	
	// parent wizard controller
	parentController: null,
	
	afterViewLoad: function() {
	    this.parentController = View.controllers.get('basicRuleWizard'); 
	
	    // attach event listeners to radio buttons
	    this.addRadioButtonEventListeners('ruleType', this.onSelectRuleType);
    },
    
    /**
     * Called when the user selects one of New or Existing radio buttons.
     */
    onSelectRuleType: function(radioButton) {
    	if (radioButton.checked) {
    	    var ruleType = radioButton.value;
    	    
    	    // show or hide the list of existing rules
    	    var isShowRules = (ruleType == 'existing');
    	    Ext.get('selectRuleTable').setVisible(isShowRules);
    	    if (isShowRules) {
    	    	this.onShowRules();
    	    }
    	    
    	    // disable the Select Template and enable the Configure Script tab tab if the user has chosen Existing Rule
	    	this.wizardTabs.enableTab('selectTemplate', !isShowRules);
	    	this.wizardTabs.enableTab('configureScript', isShowRules);
    	    
    	    // store the selection in the parent controller
    	    this.parentController.ruleType = ruleType;
    	}
    },
    
    /**
     * Displays or re-displays existing basic rules.
     */
    onShowRules: function() {
        try {
            var result = Workflow.callMethod('AbSystemAdministration-BasicRuleWizService-getBasicRuleFiles');

            // remove existing rows, except the first one (title)
            var table = Ext.get('selectRuleTable');
            var rows = table.select('tr').elements;
		    for (var i = 1; i < rows.length; i++) {
		    	Ext.removeNode(rows[i]);
	        }
		    
		    // add rows for all basic rules
		    for (var i = 0; i < result.data.length; i++) {
		    	var file = result.data[i];
		    	var html = '<tr><td><input type="radio" name="ruleFile" value="' + file + '">&nbsp<span>' + file + '</span></input></td></tr>';
		    	Ext.DomHelper.append(table, html);
		    }
		    
		    // attach event listeners to radio buttons
		    this.addRadioButtonEventListeners('ruleFile', this.onSelectRuleFile);
            
        } catch (e) {
        	Workflow.handleError(e);
        }
    },
    
    /**
     * Called when the user selects one of the existing basic rules.
     */
    onSelectRuleFile: function(radioButton) {
    	if (radioButton.checked) {
    	    var ruleFile = radioButton.value;
    	    
    	    // store the selection in the parent controller
    	    this.parentController.ruleFile = ruleFile;
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
     * Called when the user clicks on the Next button.
     */
	selectRulePanel_onSelectRuleNext: function() {
    	if (this.parentController.ruleType === 'existing' && this.parentController.ruleFile === '') {
    		View.showMessage(getMessage('selectRuleFile'));
    		
    	} else if (this.parentController.ruleType === 'new') {
    		this.wizardTabs.selectTab('selectTemplate');
    		View.controllers.get('basicRuleWizardSelectTemplate').afterSelect();
    		
    	} else {
    		// go to the Configure Script tab
    		this.wizardTabs.selectTab('configureScript');
    		// ask the tab controller to load requested script
    		View.controllers.get('basicRuleWizardConfigureScript').onLoadScript();
    	}
    }
});