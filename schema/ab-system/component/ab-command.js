/**
 * Declare the namespace for the command JS classes.
 */
AFM.namespace('command');


/**
 * Factory class that can create command instances for specified Command type.
 */
AFM.command.CommandFactory = Base.extend({}, {
    createCommand: function(commandData) {
        var commandType = commandData.type;
        var commandClass = AFM.command[commandType];
        if (commandClass == null) {
            commandClass = AFM.command.Command;
        }
        return new commandClass(commandData);
    }
});


/**
 * Base class for all commands.
 * 
 * @param {parentPanelId} the ID of the parent panel element that contains this command;
 * 
 * @param {target} the name of the target window:
 *     'self': the current window or frame; this is the default value;
 *     'opener': the parent window that opened the current dialog window (if the current window is a dialog);
 *     'dialog': the dialog window (if the current window has opened the dialog);
 *     frame_name: name of any frame within the current window;
 * @param {panelId} the ID of the target panel element;
 * @param {applyParentRestriction} 'true'|'false';
 *     if 'true', applies parent panel restriction (if any) to the target panel; default is 'true';
 * @param {applySelectionRestriction} 'true'|'false';
 *     if 'true', applies current row restriction (if any) to the target panel; default is 'true';
 */
AFM.command.Command = Base.extend({
    
    // ----------------------- properties that are set automatically -------------------------------
    
    // Command type
    type: '',
    
    // ID attribute of the parent control that contains this command
    parentPanelId: '',
    
    // whether the command is enabled (active)
    enabled: true,
    
    // ----------------------- user-defined properties (from AXVW file) ----------------------------
    
    // target window (i.e. 'opener', 'self') or frame name
    target: '',
    
    // ID attribute of the target control
    panelId: '',
    
    // whether to apply parent panel restriction if no other restriction had been specified
    applyParentRestriction: true,
    
    // whether to apply current row restriction
    applySelectionRestriction: true,

    // whether to apply multiple selected rows restriction
    applyMultipleSelectionRestriction: true,
    
    // whether to clear the current restriction of the target panel
    clearRestriction: false,

    // whether to apply a restriction containing only the primary keys 
    applyPrimaryKeyRestriction: false,

    // ----------------------- command state variables ---------------------------------------------
    
    // command-specific restriction as an object containing primary key values
    restriction: null,
    
    // parent panel restriction, applied if the control-specific restriction is not set
    parentPanelRestriction: null,
    
    // result of the command execution, true by default
    result: true,

    // context object used pass data values between commands
    context: null,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.type = commandData.type;
        if (typeof(commandData.target) != 'undefined') {
            this.target = commandData.target;
        }
        if (valueExists(commandData.parentPanelId)) {
            this.parentPanelId = commandData.parentPanelId;
        }
        if (valueExists(commandData.panelId)) {
            this.panelId = commandData.panelId;
        }
        if (valueExists(commandData.applyParentRestriction)) {
            this.applyParentRestriction = (commandData.applyParentRestriction == 'true');
        }
        if (valueExists(commandData.applySelectionRestriction)) {
            this.applySelectionRestriction = (commandData.applySelectionRestriction == 'true');
        }
        if (valueExists(commandData.applyMultipleSelectionRestriction)) {
            this.applyMultipleSelectionRestriction = (commandData.applyMultipleSelectionRestriction == 'true');
        }
        if (valueExists(commandData.applyPrimaryKeyRestriction)) {
            this.applyPrimaryKeyRestriction = (commandData.applyPrimaryKeyRestriction == 'true');
        }
        if (valueExists(commandData.clearRestriction)) {
            this.clearRestriction = (commandData.clearRestriction == 'true');
        }		
    },
    
    /**
     * Returns target window. By default the current window is the target.
     */
    getTargetView: function() {
        return AFM.view.View.getView(this.target);  
    },
    
    /**
     * Returns parent control that contains this command.
     */
    getParentPanel: function() {
        var panel = null;
        if (this.parentPanelId != '') {
            panel = AFM.view.View.getControl('self', this.parentPanelId)
        }
        return panel;  
    },
    
    /**
     * Returns target control.
     */
    getTargetPanel: function() {
        return AFM.view.View.getControl(this.target, this.panelId);  
    },
    
    /**
     * Returns restriction for this command.
     */
    getRestriction: function() {
        var r = null;

        // if not explicitly prohibited, use this command restriction
        if (this.applySelectionRestriction) {
            r = this.restriction;
        }

        // if the restriction for this command was not explicitly set, use the parent panel restriction
        if (r == null) {
            var panel = this.getParentPanel();
            if (panel != null) {
                if (panel.type == 'form') {
                    if (this.applyParentRestriction) {
                        r = panel.getFieldValues(true);
                    }
					else if (this.applyPrimaryKeyRestriction) {
						r = panel.getPrimaryKeyFieldValues(true);
					}
                } 
				else if (panel.type == 'grid') {
                    if (this.applyMultipleSelectionRestriction && panel.multipleSelectionEnabled) {
                        r = panel.getPrimaryKeysForSelectedRows();
                    } else if (this.applyParentRestriction) {
                        r = this.parentPanelRestriction;
                    }
                }
            }
        }

        return r;
    },
    
    /**
     * Default command handler. Should be overridden in derived command classes.
     * @return true if the command is executed successfully, false if the command failed.
     */
    handle: function(context) {
        if (typeof(context) != 'undefined') {
            this.context = context;
        }

        // result is true by default
        this.result = true;
        
        // get the restriction from the parent control for use in overridden handle() method
        var panel = this.getParentPanel();
        if (panel != null) {
            this.parentPanelRestriction = panel.restriction;
        }
    }
});


/**
 * Command that executes other commands sequentially.
 */
AFM.command.commandChain = AFM.command.Command.extend({
    
    // chained commands
    commands: null,
    
    /**
     * Creates all chained commands from the data.
     */
    constructor: function(parentPanelId, restriction) {
        this.inherit({type: 'commandChain', parentPanelId: parentPanelId});
        
        if (typeof(restriction) != 'undefined') {
            this.restriction = restriction;
        }
        
        // arrays must be allocated in the constructor
        this.commands = new Array();
    },
    
    /**
     * Adds a command to the chain.
     */
    addCommand: function(command) {
        command.restriction = this.restriction;
        if (this.parentPanelId != '') {
            command.parentPanelId = this.parentPanelId;
        }
        this.commands.push(command);
    },
    
    /**
     * Adds commands to the chain.
     */
    addCommands: function(commandsData) {
        for (var i = 0; i < commandsData.length; i++) {
            var commandData = commandsData[i];
            if (commandData != null) {
                var command = AFM.command.CommandFactory.createCommand(commandsData[i]);
                this.addCommand(command);
            }
        }
    },
    
    /**
     * Command handler.
     */
    handle: function() {
        // if this command is disabled, do not execute
        if (!this.enabled) {
            return;
        }
        
        this.inherit();

        // create context object that can be used by chained commands as a data billboard
        this.context = {};
        
        // execute all chained commands
        for (var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            
            // do not execute disabled commands
            if (!command.enabled) {
                continue;
            }
            
            command.handle(this.context);
            
            // if any command fails, stop executing other commands
            if (!command.result) {
                this.result = false;
                break;
            }
        }
    }
});

// --------------------------- window and view commands --------------------------------------------

/**
 * Command that opens a new dialog and displays specified view.
 * 
 * @param {viewName} Name of the view to display.
 * @param {newRecord} 'true'|'false';
 *     if 'true', sets up the form in the "new record" mode; default is 'false';
 */
AFM.command.openDialog = AFM.command.Command.extend({
    
    viewName: '',
    newRecord: false,
    dialogX: 10,
    dialogY: 10,
    dialogWidth: 800,
    dialogHeight: 600,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = commandData.viewName;
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }

        if (valueExists(commandData.dialogX) && commandData.dialogX > 0 ) {
            this.dialogX = commandData.dialogX;
        }

        if (valueExists(commandData.dialogY) && commandData.dialogY > 0 ) {
            this.dialogY = commandData.dialogY;
        }

        if (valueExists(commandData.dialogWidth) && commandData.dialogWidth > 0 ) {
            this.dialogWidth = commandData.dialogWidth;
        }

        if (valueExists(commandData.dialogHeight) && commandData.dialogHeight > 0 ) {
            this.dialogHeight = commandData.dialogHeight;
        }

    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var panel = this.getParentPanel();
        var view = this.getTargetView();
        
        // set the reference to the current panel in the view, so that the dialog window can access it
        view.dialogOpenerPanel = panel;
        
        view.openDialog(this.viewName, this.getRestriction(), this.newRecord, this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight);
    }
});


/**
 * Command that closes specified dialog.
 */
AFM.command.closeDialog = AFM.command.Command.extend({
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var view = AFM.view.View.getView('opener');
        if (view != null) {
            view.closeDialog();
        }
    }
});


/**
 * This command displays a panel defined in the same or a different window or frame, 
 * and loads the panel data records from the server. 
 * It can optionally apply restrictions to the data records displayed in the panel. 
 * 
 * @param {newRecord} 'true'|'false';
 *     if 'true', sets up the form in the "new record" mode; default is 'false';
 */
AFM.command.showPanel = AFM.command.Command.extend({
   
    // whether the panel should display a new record 
    newRecord: false,
    
    // whether the panel should be shown or hidden
    show: true,
    
    // whether the panel header bar should be also shows according to the show property
    includeHeader: false,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
        if (valueExists(commandData.show) && commandData.show == 'false') {
            this.show = false;
        }
        if (valueExists(commandData.includeHeader) && commandData.includeHeader == 'true') {
            this.includeHeader = true;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
    	try{
            this.inherit(context);
            
            var panel = this.getTargetPanel();
            if (panel != null) {
                if (this.clearRestriction) {
                    panel.restriction = null;
                }
                
                if (this.show) {
                    panel.refresh(this.getRestriction(), this.newRecord);
                }
                
                panel.show(this.show, this.includeHeader);
               
            }
    	} catch (e) {
    	    // TODO: add logging
    	}
    }
});

// --------------------------- form commands -------------------------------------------------------

/**
 * Base class for form-related commands.
 */
AFM.command.FormCommand = AFM.command.Command.extend({
    
    formId: null,    
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.formId)) {
            this.formId = commandData.formId;
        }
    },
    
    /**
     * Command handler.
     */
    getForm: function(context) {
        var form = null;
        if (this.formId == null) {
            // if formId property is not set, save the parent form
            form = this.getParentPanel();
        } else {
            //otherwise save specified form
            form = AFM.view.View.getTargetPanel(this.target, this.formId)
        }
        return form;
    }
});

/**
 * This command validates the form data changed by the user 
 * and saves the changes to the server if the validation was successful. 
 * It works with edit forms that are displayed in dialog windows or in panels, 
 * with or without using newRecord attribute.
 * 
 * @param {formId} the id attribute of the form panel element in AXVW.
 */
AFM.command.saveForm = AFM.command.FormCommand.extend({
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var form = this.getForm();
        if (form != null) {
           this.result = form.save();
        }
    }
});

AFM.command.refreshForm = AFM.command.FormCommand.extend({
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var form = this.getForm();
        if (form != null) {
           this.result = form.refresh();
        }
    }
});

AFM.command.clearForm = AFM.command.FormCommand.extend({
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var form = this.getForm();
        if (form != null) {
           this.result = form.clear();
        }
    }
});

/**
 * This command deletes the current record displayed in the form. 
 * It works with edit forms that are displayed in dialog windows or in panels.
 * 
 * @param {formId} the id attribute of the form panel element in AXVW.
 */
AFM.command.deleteRecord = AFM.command.FormCommand.extend({

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var form = this.getForm();
        var record = form.getPrimaryKeyFieldValues();
        var values = '';
        for (i in record){
        	values += record[i] + ' ';
        }
        
        var delete_warning_message = '';
        var delete_warning_message_object = document.getElementById("general_delete_warning_message_empty_required_fields");
		if(delete_warning_message_object!=null)
			delete_warning_message = delete_warning_message_object.innerHTML;
	
        var confirmDlg = confirm(delete_warning_message);
        if ((form != null) && (confirmDlg)){
           this.result = form.deleteRecord();
        }
    }
});

// --------------------------- tabbed view commands ------------------------------------------------

/**
 * This command displays specified tab page and its content view. 
 * It can optionally apply restrictions to the data records displayed in the tab page view.
 * 
 * @param {tabPageName} the name attribute of the tab element to select;
 * @param {newRecord} true|false new record flag to set in the selected tab form; 
 */
AFM.command.selectTabPage = AFM.command.Command.extend({
    
    tabPageName: '',
    newRecord: false,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.tabPageName)) {
            this.tabPageName = commandData.tabPageName;
        }
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var view = this.getTargetView();
        var restriction = this.getRestriction();
        var parsedRestriction = restriction ? getParsedRestrictionFromRowPrimaryKeys(restriction) : null;
        view.selectTabPage(this.tabPageName, restriction, parsedRestriction, this.newRecord);
    }
});

// --------------------------- workflow rule commands ----------------------------------------------

/**
 * Command that executes specified workflow rule.
 * If the parent panel is a form, passes current form field values to the WFR.
 * If the parent panel is a grid, passes PKs of the selected rows to the WFR.
 * If the parent panel is a grid and the command is at the field level,
 * the grid automatically sets the command restriction to PKs of the current row.
 */
AFM.command.workflowRule = AFM.command.Command.extend({

    ruleId: '',

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (typeof(commandData.ruleId) != 'undefined') {
            this.ruleId = commandData.ruleId;
        }
    },

    /**
     * Creates WFR input parameters. Derived classes may override.
     */
    getParameters: function() {
        var parameters = new Object();
        var panel = this.getParentPanel();
        if (panel != null) {
            parameters.viewName = panel.viewDef.viewName;
    	    parameters.groupIndex = panel.viewDef.tableGroupIndex;
            parameters.controlId = panel.panelId;

            var r = this.getRestriction();
            if (r != null) {
                if (panel.type == 'form') {
                    parameters.fields = toJSON(r);
                } else if (panel.type == 'grid') {
                    if (this.applyMultipleSelectionRestriction && panel.multipleSelectionEnabled) {
                        parameters.records = toJSON(r);
                    } else {
                        parameters.fields = toJSON(r);
                    }
                }
            }
        }
        return parameters;
    },

    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult(
            this.ruleId,
            this.getParameters());
		if (wfrResult.code == 'executed') {
            this.result = true;
            this.context.message = wfrResult.message;
            this.context.data = wfrResult.data;
        }
		else {
            this.result = false;
            AFM.workflow.Workflow.handleError(wfrResult);
		}
    }
});


/**
 * Command that deletes records that are selected by the user in the grid control.
 * The parent control must an instance of the AFM.grid.MiniConsole.
 */
AFM.command.deleteSelectedRows = AFM.command.workflowRule.extend({
    
    constructor: function(commandData) {
        this.inherit(commandData);
        this.ruleId = 'AbCommonResources-deleteDataRecords';
    }
});

// --------------------------- document commands ---------------------------------------------------

/**
 * Base class for document commands.
 * Most document commands open a dialog and pass additional parameters to it.
 */
AFM.command.documentCommand = AFM.command.openDialog.extend({
    
    tableName: '',
    fieldName: '',
    
    constructor: function(commandData) {
        this.inherit(commandData);
        this.tableName = commandData.tableName;
        this.fieldName = commandData.fieldName;
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {

        // add document parameters for the dialog
        var view = this.getTargetView();
        var panel = this.getParentPanel();
        
        view.dialogDocumentParameters = {
            tableName: this.tableName,
            fieldName: this.fieldName,
            fieldValue: panel.getFieldValue(this.tableName + '.' + this.fieldName)
        }
        
        this.inherit(context);
    },

	/**
	 * restriction specific to document commands
	 * is key to afm_docs (table_name - field_name - pkey_value) 
	 * where table & field names are those of the document field & pkey_val is PK of owning record
	 *
	 */
	getRestriction: function() {
		var restriction = new Object();
        var form = this.getParentPanel();
        
		// document field full field 
		restriction.table_name = this.tableName;
		restriction.field_name = this.fieldName;
		
		// add primary key values from the document table
		// the primary key of the document table must be present on the form (hidden or otherwise)
		restriction.pkeys = new Array();
		var fieldNames = form.getPrimaryKeyFields();
		for (var i = 0, name; name = fieldNames[i]; i++) {
		    // filter out fields from other tables
		    if (name.indexOf(this.tableName + '.') == 0 &&
		        name != this.tableName + '.' + this.fieldName) {
    		    var value = form.getFieldValue(name);
    			restriction.pkeys.push({'name': name, 'value':value});
		    }
		}

		return restriction;
	}
});

/**
 * Command that opens a Check In New Document dialog.
 */
AFM.command.checkInNewDocument = AFM.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-checkin-document-core.axvw';
    }
});


/**
 * Command that opens a Check In New Document Version dialog. 
 * A dialog for changing the version of an existing document.
 */
AFM.command.checkInNewDocumentVersion = AFM.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-checkin-document-new-version-core.axvw';
    }
});


/**
 * Command that opens a Check Out Document dialog.
 */
AFM.command.checkOutDocument = AFM.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-checkout-document-core.axvw';
    }
});

/**
 * Command that Shows the Document in a dialog.
 */
AFM.command.showDocument = AFM.command.documentCommand.extend({        
	
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-show-document-core.axvw';
    },
	
    handle: function() {
        // do not open dialog - get the file from the server

        var panel = this.getParentPanel();
        var fileName = panel.getFieldValue(this.tableName + '.' + this.fieldName);

        // restriction for the DocumentService is in a special format
        var keys = {};
        var restriction = this.getRestriction();
        for (var i=0, pkey; pkey = restriction.pkeys[i]; i++) {
            keys[pkey.name.substring(pkey.name.lastIndexOf('.') + 1)] = pkey.value;
        }
        
        if (this.isImage(fileName)) {
            // image document, should be displayed in an image field on this form
            DocumentService.getImage(keys, this.tableName, this.fieldName, '1', true, {
                callback: function(image) {
                    AFM.view.View.openDialog(image);
                },
                errorHandler: function(m, e) {
                    AFM.workflow.Workflow.handleError(e);
                }
            });
        } else {
            // application document, should be handled by the browser using iframe managed by DWR
            DocumentService.show(keys, this.tableName, this.fieldName, fileName, '', true, 'showDocument', {
                callback: function(fileTransfer) {
                    dwr.engine.openInDownload(fileTransfer);
                },
                errorHandler: function(m, e) {
                    AFM.workflow.Workflow.handleError(e);
                }
            });
        }
    },
    
    /**
     * Return true if specified file name matches one of the supported image formats.
     */
    isImage: function(fileName) {
        var isImage = false;
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if (valueExistsNotEmpty(extension)) {
            extension = extension.toLowerCase();
            isImage = (extension == 'bmp' || 
                       extension == 'gif' || 
                       extension == 'jpg' || 
                       extension == 'png');
        }
        return isImage;
    }
});

/**
 * Command that opens the Document Locking dialog.
 */
AFM.command.lockDocument = AFM.command.documentCommand.extend({        
	
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-lock-document-core.axvw';
    }
});

/**
 * Command that deletes document from specified field.
 * This is the only document command that does not open a dialog,
 * but directly invokes a WFR instead.
 */
AFM.command.deleteDocument = AFM.command.documentCommand.extend({
    
    constructor: function(commandData) {
        this.inherit(commandData);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
	    var canDelete = true;
	    
	    // ask the user to confirm
        if ($("document_delete_warning_message") != null) {
		    canDelete = confirm($("document_delete_warning_message").innerHTML);
        }

	    if (canDelete) {
            // prepare WFR parameters
            var form = this.getParentPanel();
        	var parameters = {
        		'table_name': this.tableName,
        		'field_name': this.fieldName,
        		'pkeys': toJSON(form.getPrimaryKeyFieldValues())
        	};
            
            // call WFR
            var result = AFM.workflow.Workflow.runRuleAndReturnResult(
                'AbCommonResources-markDeleted', parameters);
                
    		if (result.code != 'executed') {
                this.result = false;
                AFM.workflow.Workflow.handleError(result);
    		}
            
            // refresh the parent form
            var form = this.getParentPanel();
            form.refresh();
        }
    }
});

// --------------------------- other commands ------------------------------------------------------

/**
 * Command that executes specified Java Script function.
 */
AFM.command.callFunction = AFM.command.Command.extend({

    functionName: '',

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.functionName = commandData.functionName;
    },

    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var fn = window[this.functionName];
        if (fn.call) {
        		this.context.restriction = this.getRestriction();
            var result = fn(context);
            if (valueExists(result)) {
                this.result = result;
            }
        }
    }
});



/**
 * This command exports the content of specified panel using specified content type. 
 */
AFM.command.exportPanel = AFM.command.Command.extend({
   
    // format for the export (e.g., PDF, Excel, etc.)
    outputType: '',
    
    // optional nae of the export XSL-FO file
    file: '',
    
    // whether the results should be immediately shown in a new dialog
    openDialog: true,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.outputType)) {
            this.outputType = commandData.outputType;
        }
        if (valueExists(commandData.file)) {
            this.file = commandData.file;
        }
        if (valueExists(commandData.openDialog) && commandData.openDialog == 'false') {
            this.openDialog = false;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var panel = this.getTargetPanel();
        if (panel != null) {
            if (this.clearRestriction) {
                panel.restriction = null;
            }
            
            // set panel export parameters and render the panel
			panel.exportType = this.outputType; 
			panel.exportFile = this.file;            
            panel.refresh(this.getRestriction(), this.newRecord);
            
			// reset panel export parameters
			panel.exportType = ''; 
			panel.exportFile = '';            
			
			// use panel export URL to open dialog and display the rendered file
			var url = panel.exportURL;            
			if (this.openDialog && url != null && url != '') {
		        var view = this.getTargetView();
		        view.openDialog(url, '', '', false);
			}

            panel.show(this.show);
        }
    }
});


/**
 * This command displays custom help text 
 */
AFM.command.showHelp = AFM.command.Command.extend({
       
    file: '',
    
    // whether the results should be immediately shown in a new dialog
    openDialog: true,
    
    width: 800,
    
    height: 600,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);

        if (valueExists(commandData.file)) {
            this.file = commandData.file;
            if(valueExists(contextPath)){
             this.file = contextPath + this.file;
            }
        }
        if (valueExists(commandData.openDialog) && commandData.openDialog == 'false') {
            this.openDialog = false;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);             			            
		if (this.openDialog && this.file != '') {
			var view = this.getTargetView();
			view.openDialog(this.file, '', false, '', '', this.width, this.height);
		}
    }
});