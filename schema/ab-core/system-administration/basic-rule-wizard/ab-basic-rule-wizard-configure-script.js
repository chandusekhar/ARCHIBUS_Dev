/**
 * JS controller for the Configure Script tab.
 */
View.createController('basicRuleWizardConfigureScript', {
	
	// parent wizard controller
	parentController: null,
	
	// part of the basic rule code immediately before the script
	beforeScript: '',
	
	// part of the basic rule code immediately after the script
	afterScript: '',
	
	afterViewLoad: function() {
	    this.parentController = View.controllers.get('basicRuleWizard'); 
    },
    
    syncHeight: function() {
	    var height = this.wizardTabs.tabHeight;
	    Ext.get('script').setHeight(height * 0.5);
	    Ext.get('output').setHeight(height * 0.25);
    },
    
    /**
     * Called from Select Rule or Select Template tabs to load either the rule or the templates.
     */
    onLoadScript: function() {
    	this.syncHeight();
    	
    	$('script').value = '';
    	$('output').value = '';
    	
    	var name = (this.parentController.ruleType === 'existing') ? this.parentController.ruleFile : this.parentController.ruleName;
		this.configureScriptPanel.setTitle(getMessage('scriptPanelTitle') + ' ' + name);
		
    	if (this.parentController.ruleType === 'existing') {
    		var filenames = [];
   			filenames.push(this.parentController.ruleFile);
    		this.loadFiles(filenames, '/schema/ab-products/common/resources/basic-rules/');
    		
    	} else {
    		var filenames = [];
    		for (var i = 0; i < this.parentController.templateFiles.length; i++) {
    			filenames.push('BasicRuleTemplate_' + this.parentController.templateFiles[i] + '.java');
    		}
    		this.loadFiles(filenames, '/schema/ab-core/system-administration/basic-rule-wizard/templates/');
    	}

    	$('script').focus();
    },
    
    /**
     * Loads specified template files and returns combined text. 
     */
    loadFiles: function(filenames, basePath) {
    	var controller = this;
    	
    	// loaded files content
    	var files = [];
    	
    	// we will iterate this counter until all files are loaded
    	var fileIndex = 0;

    	// loads one file
    	var getFile = function(filename) {
    		var path = View.contextPath + basePath + filename;
    		YAHOO.util.Connect.asyncRequest('GET', path, {
    			success: onSuccess,
    			failure: onFailure,
    			cache: false
    		}, null);
    	}
    	
    	// called after the file has been loaded
    	var onSuccess = function(response) {
    		// store the file content
    		files[fileIndex] = response.responseText;
    		
    		if (++fileIndex < filenames.length) {
    			// get the next file
    		    getFile(filenames[fileIndex]);
    		} else {
    			// all files loaded - show the script
                showContent();    			
    		}
    	}
    	
    	// called if one of the files could not be loaded
    	var onFailure = function(response) {
    		View.showMessage('error', getMessage('fileLoadFailure') + response.statusText, response.responseText);
    	}
    	
    	// shows the content of all loaded files in the script text area
    	var showContent = function() {
    		var text = '';
    		for (var i = 0; i < files.length; i++) {
    			text = text + getRuleText(files[i]) + '\n\n';
    		}
        	$('script').value = text;
    	}
    	
    	// takes the complete file text and returns the rule/template text between BEGIN RULE and END RULE comment lines
        var getRuleText = function(fileText) {
        	var begin = fileText.indexOf('// BEGIN RULE');
        	begin = fileText.indexOf('\n', begin) + 1;
        	var end = fileText.indexOf('// END RULE', begin);
        	
        	controller.beforeScript = fileText.slice(0, begin);
        	controller.afterScript = fileText.slice(end);
        	
        	return fileText.slice(begin, end - 1);
        }

        // start the loading process - get the first file
    	getFile(filenames[0]);
    },
    
    /**
     * Called when the user clicks on the Back button.
     */
    configureScriptPanel_onConfigureScriptBack: function() {
    	if (this.parentController.ruleType === 'existing') {
  		    this.wizardTabs.selectTab('selectRule');
    	} else {
  		    this.wizardTabs.selectTab('selectTemplate');
    	}
    },
    
    /**
     * Called when the user clicks on the Test button.
     */
    configureScriptPanel_onConfigureScriptTest: function() {
    	// save script to a temporary Java file
    	var className = 'BasicRules_TemporaryFileUsedForTesting';
    	this.saveBasicRule(className, false);
    	
		try {
			// mask the panel and display the waiting indicator
			this.configureScriptPanel.parentEl.mask(getMessage('testing'));
			
			// compile and run the script
			var result = Workflow.call('AbCommonResources-' + className);
			$('output').value = result.output;
			
			this.showLineBreaksInTextArea.defer(500);
			
			this.configureScriptPanel.parentEl.unmask();
			
		} catch (e) {
			this.configureScriptPanel.parentEl.unmask();
    		Workflow.handleError(e);
		}
		
		// delete temporary Java file
		this.deleteBasicRule(className);
    },
    
    /**
     * KB 3033611: IE does not show more than one line in textarea unless the white-space CSS property is set to normal.
     * For an unknown reason, this CSS cannot be set in advance, and has to be applied at runtime, after the element text is set.
     */
    showLineBreaksInTextArea: function() {
		$('output').style.whiteSpace = 'nowrap';
		$('output').style.whiteSpace = 'normal';
    },
    
    /**
     * Called when the user clicks on the Save and Next button.
     */
    configureScriptPanel_onConfigureScriptNext: function() {
    	// determine the Java class name
    	var className = '';
    	if (this.parentController.ruleType === 'existing') {
    		className = this.parentController.ruleFile.replace('.java', '');
    		
    	} else {
    		// camel-case the rule name entered by the user
    		var ruleName = this.parentController.ruleName.replace(/(^|\s)([a-z])/g , function(m, p1, p2) { 
    			return p2.toUpperCase(); 
    		});
    		className = 'BasicRules_' + ruleName;
    	}
    	
    	// store the URL that invokes the basic rule for the Add to Process Navigator view
    	this.wizardTabs.textFileName = 'ab-single-job.axvw?ruleId=AbCommonResources-' + className;

    	// save and continue
    	this.saveBasicRule(className, true);
    },
    
    /**
     * Saves specified basic rule class.
     */
    saveBasicRule: function(className, andContinue) {
    	var controller = this;
    	
    	// create the complete Java class text
    	var script = trim(this.beforeScript + $('script').value + this.afterScript);
    	
    	// replace the Java class name from the template by the new name
		script = script.replace(/(class)(\s)([A-Za-z0-9_]+)/, 'class ' + className);
		
		var save = function() {
	    	// save the file
    		try {
    			Workflow.callMethod(
    				'AbSystemAdministration-BasicRuleWizService-saveBasicRule', className, script);
    		} catch (e) {
        		Workflow.handleError(e);
    		}
		}

    	// ask the user to confirm
		if (andContinue) {
	    	View.confirm(getMessage('confirmSaveFile') + '<br/>' + className, function(button) {
	    		if (button === 'yes') {
	    			save();
	      		    controller.wizardTabs.selectTab('addToNavigator');
	    		}
	    	});
		} else {
			save();
		}
    },
    
    /**
     * Deletes specified basic rule files (.java and .class).
     */
    deleteBasicRule: function(className) {
		try {
			Workflow.callMethod(
				'AbSystemAdministration-BasicRuleWizService-deleteBasicRule', className);
		} catch (e) {
    		Workflow.handleError(e);
		}
    },
    
    /**
     * Called when the user clicks on the Help button.
     */
    configureScriptPanel_onConfigureScriptHelp: function() {
    	// TODO: display specific help page
    }
});