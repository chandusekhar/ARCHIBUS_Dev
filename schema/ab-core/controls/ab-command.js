/**
 * Declare the namespace for the command JS classes.
 */
Ab.namespace('command');


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
Ab.command.Command = Base.extend({
    
    // ----------------------- properties that are set automatically -------------------------------
    
    // Command type
    type: '',
    
    // ID attribute of the parent control that contains this command
    parentPanelId: '',
    
    // whether the command is enabled (active)
    enabled: true,
    
    // ----------------------- user-defined properties (from AXVW file) ----------------------------
    
    // target window (i.e. 'opener', 'self') or frame name
    target: 'self',
    
    // ID attribute of the target control
    panelId: '',
    
    // whether to apply parent panel restriction if no other restriction had been specified
    applyParentRestriction: true,
    
    // whether to apply current row restriction
    applySelectionRestriction: true,

    // whether to apply multiple selected rows restriction
    applyMultipleSelectionRestriction: true,
    
    // whether to apply a restriction containing only the primary keys 
    applyPrimaryKeyRestriction: false,

	// whether to clear the current restriction of the target panel
    clearRestriction: false,

    // ----------------------- command state variables ---------------------------------------------
    
    // command-specific restriction as an object containing primary key values
    restriction: null,
    
    // result of the command execution, true by default
    result: true,

    // context object used pass data values between commands
    context: null,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.type = commandData.type;
        if (valueExists(commandData.target)) {
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
        return Ab.view.View.getView(this.target);  
    },
    
    /**
     * Returns parent control that contains this command.
     */
    getParentPanel: function() {
        var panel = null;
        if (this.parentPanelId != '') {
            panel = View.getControl('self', this.parentPanelId)
        }
        return panel;  
    },
    
    /**
     * Returns target control.
     */
    getTargetPanel: function() {
        var panelId = this.panelId;
        if (!valueExistsNotEmpty(panelId)) {
            panelId = this.parentPanelId;
        }
        return View.getControl(this.target, panelId);
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
                
                // restriction applied to the parent panel
                var panelRestriction = null;
                if (this.applyParentRestriction) {
                    panelRestriction = panel.restriction;
                }

                // restriction applied by this command, specific to the panel type
                var commandRestriction = null;
                if (panel.type == 'form') {
                    if (this.applyParentRestriction) {
                        commandRestriction = panel.getFieldRestriction(true);
                    }
					else if (this.applyPrimaryKeyRestriction) {
						commandRestriction = panel.getPrimaryKeyFieldValues(true);
					}
                } else if (panel.type == 'grid') {
                    if (this.applyMultipleSelectionRestriction && panel.multipleSelectionEnabled) {
                        commandRestriction = panel.getPrimaryKeysForSelectedRows();
						// multiple selection restriction cannot be combined with any other restriction
						panelRestriction = null;
                    }
                }
                
                if (typeof panelRestriction !="string" && panelRestriction != null && commandRestriction != null && panel.type != 'form') {
                    r = panelRestriction;
                    r.addClauses(commandRestriction);
                } else if (panelRestriction != null) {
                    r = panelRestriction;
                } else if (commandRestriction != null) {
                    r = commandRestriction;
                }
            }
        }

        return r;
    },
	
	/**
	 * Return the given value(s) trimmed of any whitespace
	 * First test that the given value is indeed an array
	 * Then trim off any whitespace surrounding each value in the array 
	 */
	trimArrayValues: function(valuesArray) {
		if (typeof valuesArray === 'object' && valuesArray && valuesArray instanceof Array) {
			for (var i = 0; i < valuesArray.length; i++) {
				valuesArray[i] = trim(valuesArray[i]);
			}
		}
		else if (typeof valuesArray === 'string') {
			valuesArray = trim(valuesArray);
		}
		
		return valuesArray;
	},
    
    /**
     * Default command handler. Should be overridden in derived command classes.
     * @return true if the command is executed successfully, false if the command failed.
     */
    handle: function(context) {
        if (typeof(context) != 'undefined') {
            this.context = context;
            this.context.command = this;
        }

        // result is true by default
        this.result = true;
    }
});


/**
 * Command that executes other commands sequentially.
 */
Ab.command.commandChain = Ab.command.Command.extend({
    
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
                var commandType = commandData.type;
                var commandClass = Ab.command[commandType];
                if (commandClass == null) {
                    commandClass = Ab.command.Command;
                }
                var command = new commandClass(commandData);
                this.addCommand(command);
            }
        }
    },
    
    /**
     * Command handler.
     * @param {context} Context object containing input parameters for all commands. Optional.
     */
    handle: function(context) {
        // if this command is disabled, do not execute
        if (!this.enabled) {
            return;
        }
        
        this.inherit(context);

        // create context object that can be used by chained commands as a data billboard
        if (valueExists(context)) {
            this.context = context;
        } else {
            this.context = {};
        }
        
        // execute all chained commands
        for (var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            
            // do not execute disabled commands
            if (!command.enabled) {
                continue;
            }
            
			command.restriction = this.restriction;
            try {
                command.handle(this.context);
            } catch (e) {
				if (typeof View != 'undefined') {
					View.showMessage('error', e.message, 'Line ' + e.lineNumber + ' at ' + e.fileName, e.stack);
				}
                this.result = false;
                break;
            }
            
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
 * Command that opens a view in a new window.
 *
 * @param {viewName} Name of the view to display.
 */
Ab.command.openView = Ab.command.Command.extend({
    // view name to open
    viewName: '',

    // fields from the target table to pass as URL restrictions to the view
    fieldNames: [],

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = commandData.viewName;
        if (valueExists(commandData.fieldNames)) {
            this.fieldNames = commandData.fieldNames.split(',');
        }
    },

    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        var url = this.viewName + '?';

        var command = this;

        _.each(this.fieldNames, function (fieldName) {
            var fieldValue = command.getFieldValue(fieldName);

            var index = fieldName.indexOf('.');
            if (index != -1) {
                fieldName = fieldName.slice(index + 1);
            }

            if (valueExistsNotEmpty(fieldValue)) {
                url += fieldName + '=' + fieldValue + '&';
            }
        });

        // KB 3053600: clear View.dialogRestriction when opening other views, lest the restriction is passed to them
        View.dialogRestriction = null;

        window.open(url);
    },

    /**
     * Return field value from the parent panel.
     * @param fieldName
     */
    getFieldValue: function(fieldName) {
        var fieldValue = null;

        var panel = this.getTargetPanel();
        if (panel && panel.type == 'grid') {
            var selectedRecords = panel.getSelectedRecords();
            if (selectedRecords.length > 0) {
                var selectedRecord = selectedRecords[0];
                fieldValue = selectedRecord.getValue(fieldName);
            }
        }

        return fieldValue;
    }
});


/**
 * Command that opens a new dialog and displays specified view.
 * 
 * @param {viewName} Name of the view to display.
 * @param {newRecord} 'true'|'false';
 *     if 'true', sets up the form in the "new record" mode; default is 'false';
 */
Ab.command.openDialog = Ab.command.Command.extend({
    
    viewName: '',
    newRecord: false,
    
    x: null,
    y: null,
    width: null,
    height: null,
    dialogTitle: '',
    closeButton: true,
    maximize: false,
  
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);

        this.viewName = commandData.viewName;
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
        if (valueExists(commandData.width)) {
            this.width = parseInt(commandData.width);
        }
        if (valueExists(commandData.height)) {
            this.height = parseInt(commandData.height);
        }
        if (commandData.closeButton == false || commandData.closeButton == 'false') {
            this.closeButton = false;
        }
        if (valueExists(commandData.maximize) && commandData.maximize == 'true') {
            this.maximize = true;
        }
        if (valueExists(commandData.dialogTitle)) {
            this.dialogTitle = commandData.dialogTitle;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);

        if (context && context.clientX && !this.x) {
            this.x = context.clientX;
        }
        if (context && context.clientY && !this.y) {
            this.y = context.clientY;
        }

        var view = this.getTargetView();
        var panel = this.getParentPanel();
		
		if (valueExistsNotEmpty(this.viewName)) {
			// set the reference to the current panel in the view, so that the dialog can access it
			view.dialogOpenerPanel = panel;
            view.openDialog(this.viewName, this.getRestriction(), this.newRecord, this.getWindowConfig(context));
		}
		else {
            var targetPanel = this.getTargetPanel();
            targetPanel.refresh(this.getRestriction(), this.newRecord);
            targetPanel.showInWindow(this.getWindowConfig(context));
		}
    },
	
	getWindowConfig: function(context) {
		return {
            anchor: (context && context.target) || (context && context.el ? context.el.dom : null),
            x: this.x,
            y: this.y,
            width: this.width, 
            height: this.height,
            title: this.dialogTitle,
            closeButton: this.closeButton,
            maximize: this.maximize,
            collapsible: false
        };
	}
});



/**
 * Command that closes specified dialog.
 */
Ab.command.closeDialog = Ab.command.Command.extend({
    
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
		
		var panel = this.getParentPanel();
		if (panel && panel.isShownInWindow()) {
			panel.closeWindow();
		} else if (panel && panel.parentTab && panel.parentTab.parentPanel.isShownInWindow()) {
            panel.parentTab.parentPanel.closeWindow();
        } else if(View.getOpenerView().addNewSelectVDialog){
        	View.getParentDialog().panel.refresh();
        	View.getOpenerView().addNewSelectVDialog.hide();
		} else {
			var view = View.getOpenerWindow().View;
			if (view != null) {
				view.closeDialog();
			}
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
Ab.command.showPanel = Ab.command.Command.extend({
   
    // whether the panel should display a new record 
    newRecord: false,
    
    // whether the panel should be shown or hidden
    show: true,
    
    // whether the panel header bar should be also shows according to the show property
    includeHeader: true,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
        if (valueExists(commandData.show) && (commandData.show === 'false' || !commandData.show)) {
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
        this.inherit(context);
        
        var panel = this.getTargetPanel();
        if (panel != null) {
            var newRestriction = this.getRestriction();
            
            if (this.clearRestriction) {
                panel.restriction = null;
                newRestriction = null;
                    }
            
            if (this.show) {
                panel.refresh(newRestriction, this.newRecord);
            }
            
            panel.show(this.show, this.includeHeader);
        }
    }
});

/**
 * This command clears specified panel state, restoring it to its default values.
 * It is typically used to clear the restriction console. 
 */
Ab.command.clearPanel = Ab.command.Command.extend({

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
        
        var panel = this.getTargetPanel();
        if (panel != null) {
            panel.clear();
        }
    }
});

/**
 * This command loads specified content view into specified view panel. 
 * 
 * @param {panelId} the id attribute of the view panel; 
 * @param {fileName} the name of the view file to load;
 */
Ab.command.loadView = Ab.command.Command.extend({
    
    fileName: '',
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.fileName = commandData.fileName;
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var panel = this.getTargetPanel();
        if (panel != null) {
            var restriction = this.getRestriction();
            panel.loadView(this.fileName, restriction);
        }
    }
});

/**
 * This command expands, collapses, or toggles specified layout region. 
 */
Ab.command.showRegion = Ab.command.Command.extend({

    // layout id
    layout: 'mainLayout',
   
    // region name (north|south|east|west|center) 
    region: '',
    
    // action: show|hide|toggle
    action: 'show',
    
    /**
     * Constructor.
     */
    constructor: function(config) {
        this.inherit(config);
        Ext.apply(this, config);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var view = this.getTargetView();
        var layoutManager = view.getLayoutManager(this.layout);
        if (layoutManager) {
            if (this.action == 'show') {
                layoutManager.expandRegion(this.region);
            } else if (this.action == 'hide') {
                layoutManager.collapseRegion(this.region);
            } else {
                if (layoutManager.isRegionCollapsed(this.region)) {
                    layoutManager.expandRegion(this.region);
                } else {
                    layoutManager.collapseRegion(this.region);
                }
            }
        }
    }
});

// --------------------------- form commands -------------------------------------------------------

/**
 * Base class for form-related commands.
 */
Ab.command.FormCommand = Ab.command.Command.extend({
    
    formId: null, 
    workflowRuleId: null,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.formId)) {
            this.formId = commandData.formId;
        }
        if (valueExists(commandData.workflowRuleId)) {
            this.workflowRuleId = commandData.workflowRuleId;
        }
    },
    
    /**
     * Command handler.
     */
    getForm: function(context) {
        var form = null;
        if (this.formId == null) {
            // if formId property is not set, return the parent form panel
            form = this.getParentPanel();
        } else {
            // otherwise return specified form panel
			form = this.getTargetPanel();
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
Ab.command.saveForm = Ab.command.FormCommand.extend({
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
           this.result = form.save(this.workflowRuleId);
        }
    }
});

/**
 * This command clears the form data values
 * It works with edit forms that are displayed in dialog windows or in panels, 
 * with or without using newRecord attribute.
 * 
 * @param {formId} the id attribute of the form panel element in AXVW.
 */
Ab.command.clearForm = Ab.command.FormCommand.extend({
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
Ab.command.deleteRecord = Ab.command.FormCommand.extend({

	// @begin_translatable
	z_CONFIRM_DELETE_MESSAGE: 'Record [{0}] will be deleted.',
    z_MESSAGE_INVALID_PK_FIELD: 'One or more required fields need a value.',
	z_CONFIRM_DELETE_MISMATCH_MESSAGE: 'Record to delete does not match the record that was selected.',
	// @end_translatable
	
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
        
        var pkeys = form.getPrimaryKeyFields();
        var oldValues = form.record;
        var curValues = form.getPrimaryKeyFieldValues();
        var bPkeysMatch = true;
        var oldPkeyValues = {};
        
        for(var i=0; i<pkeys.length; i++){        	
        	var fieldName = pkeys[i];
        	var oldValue = oldValues.getValue(fieldName);
        	var curValue = curValues[fieldName];
        	var fieldDef = form.fields.get(fieldName).fieldDef;


        	if(fieldDef.isDate && oldValue.constructor != String){
        		oldValue = oldValue.format(fieldDef.getDateFormat(false));       		
        	}
 
        	if(fieldDef.isTime && oldValue.constructor != String){
        		oldValue = oldValue.format(fieldDef.getTimeFormat(false));
        	}      	       	
 	
        	if(oldValue != curValue){
        		bPkeysMatch = false;
        	}
        	oldPkeyValues[pkeys[i]] = oldValue;
        }
        
        var record = (bPkeysMatch) ? form.getPrimaryKeyFieldValues() : oldPkeyValues;
                
        var values = '';
        for (i in record){
			if ( !valueExistsNotEmpty(record[i]) ) {
		        alert(Ab.view.View.getLocalizedString(this.z_MESSAGE_INVALID_PK_FIELD));
				this.result = false;
				return;
			}
        	values += record[i] + ' ';
        }        
        var confirmMessage = (!bPkeysMatch) ? Ab.view.View.getLocalizedString(this.z_CONFIRM_DELETE_MISMATCH_MESSAGE) + '\n' : '';
        confirmMessage += String.format(Ab.view.View.getLocalizedString(this.z_CONFIRM_DELETE_MESSAGE), trim(values));
        var confirmDlg = confirm(confirmMessage);
		
        if ((form != null) && (confirmDlg)) {
           this.result = form.deleteRecord();
        } else {
        	this.result = false;
        }
    }
});

// --------------------------- tabbed view commands ------------------------------------------------

/**
 * Base class for commands that operate with tab panels. 
 */
Ab.command.TabPageCommand = Ab.command.Command.extend({
    
    tabPanelId: null,
    tabPageName: '',
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.tabPanelId)) {
            this.tabPanelId = commandData.tabPanelId;
        }
        if (valueExists(commandData.tabPageName)) {
            this.tabPageName = commandData.tabPageName;
        }
    },
    
    /**
     * Returns the parent tab panel.
     */
    getTabs: function() {
        var tabs = null;
        var view = this.getTargetView();
        if (valueExists(this.tabPanelId)) {
            // panelId command property was specified in AXVW
            tabs = view.getControl('', this.tabPanelId);
        } else {
            // implicit tab panel - try to find any tab panel in the view
            var tabPanels = view.getControlsByType(self, 'tabs');
            if (tabPanels.length == 0) {
                tabPanels = view.getControlsByType(parent, 'tabs');
            }            
            tabs = tabPanels[0];
        }
		return tabs;
    }
});


/**
 * This command displays specified tab page and its content view. 
 * It can optionally apply restrictions to the data records displayed in the tab page view.
 * 
 * @param {tabPanelId} the id attribute of the tabs panel;
 * @param {tabPageName} the name attribute of the tab element to select;
 * @param {newRecord} true|false new record flag to set in the selected tab form; 
 */
Ab.command.selectTabPage = Ab.command.TabPageCommand.extend({
    
    newRecord: false,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var restriction = this.getRestriction();
        
        var tabs = this.getTabs();
        if (tabs) {
            tabs.selectTab(this.tabPageName, restriction, this.newRecord, this.clearRestriction);
        }
    }
});

/**
 * This command creates new tab page and loads specified content view into it. 
 * 
 * @param {tabPanelId} the id attribute of the tabs panel;
 * @param {viewName} the name of the view file to load;
 * @param {newRecord} true|false new record flag to set in the selected tab form; 
 */
Ab.command.createTabPage = Ab.command.TabPageCommand.extend({
    
    viewName: '',
    newRecord: false,
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = commandData.viewName;
        if (valueExists(commandData.newRecord) && commandData.newRecord == 'true') {
            this.newRecord = true;
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        
        var restriction = this.getRestriction();
        
        var tabs = this.getTabs();
        if (tabs) {
            tabs.createTab(this.viewName, restriction, this.newRecord);
        }
    }
});


/**
 * This command closes specified dynamic tab page. 
 * 
 * @param {tabPanelId} the id attribute of the tabs panel;
 * @param {tabPageName} the name attribute of the tab element to select;
 */
Ab.command.closeTabPage = Ab.command.TabPageCommand.extend({
    
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
        
        var tabs = this.getTabs();
        if (tabs) {
            tabs.closeTab(this.tabPageName);
        }
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
Ab.command.workflowRule = Ab.command.Command.extend({

    ruleId: '',
    showMessageAsPopup: false,

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (typeof(commandData.ruleId) != 'undefined') {
            this.ruleId = commandData.ruleId;
        }
        if (valueExists(commandData.showMessageAsPopup) && commandData.showMessageAsPopup == 'true') {
            this.showMessageAsPopup = true;
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
    	    parameters.groupIndex = (typeof panel.viewDef.tableGroupIndex == 'undefined') ? 0 : panel.viewDef.tableGroupIndex;
            parameters.controlId = (typeof panel.panelId == 'undefined') ? panel.id : panel.panelId;
			parameters.version = Ab.view.View.version;  
            parameters.dataSourceId = panel.dataSourceId;

            if (panel.type == 'form') {
                parameters.fieldValues = toJSON(panel.getFieldValues());
                parameters.oldFieldValues = toJSON(panel.getOldFieldValues());
                
            } else if (panel.type == 'grid') {
                if (this.applyMultipleSelectionRestriction && panel.multipleSelectionEnabled) {
                    parameters.records = toJSON(panel.getPrimaryKeysForSelectedRows());
                } else {
                    // per-row command?
                    var r = this.getRestriction();
                    if (r != null) {
                        parameters.fieldValues = toJSON(r);
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

        var wfrResult = Ab.workflow.Workflow.runRuleAndReturnResult(
            this.ruleId,
            this.getParameters());
		if (wfrResult.code == 'executed') {
            this.result = true;
            this.context.message = wfrResult.message;
            this.context.data = wfrResult.data;
            this.context.dataSet = wfrResult.dataSet;
            
            if (this.showMessageAsPopup) {
                View.alert(wfrResult.message);
            }
        }
		else {
            this.result = false;
            Ab.workflow.Workflow.handleError(wfrResult);
		}
    }
});


/**
 * Command that starts specified job and displays the job progress dialog or view.
 */
Ab.command.startJob = Ab.command.workflowRule.extend({
    // @begin_translatable
    z_MESSAGE_PROGRESS_TITLE: 'Job Progress',
    // @end_translatable

     // if true, the command will display ab-paginated-report-job.axvw, otherwise it will display the job progress dialog
    useSingleJobView: false,
    
    // ID of the message used as a progress bar title
    messageId: null,
    
    // if specified, the command will display the result view after the job execution is complete
    resultView: '',

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.useSingleJobView) && commandData.useSingleJobView == 'true') {
            this.useSingleJobView = true;
        }
        if (valueExists(commandData.messageId)) {
            this.messageId = commandData.messageId;
        }
        if (valueExists(commandData.resultView)) {
            this.resultView = commandData.resultView;
        }
    },

    /**
     * Command handler.
     */
    handle: function(context) {
        var message = '';
        if (valueExists(this.messageId)) {
            message = getMessage(this.messageId);
        } else {
            message = View.getLocalizedString(this.z_PROGRESS_TITLE);
        }
        try {
            var jobId = Workflow.startJob(this.ruleId);
            
            if (this.useSingleJobView) {
                 var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
                 if (valueExistsNotEmpty(this.resultView)) {
                     url = url + '&resultView=' + this.resultView;
                 }
                 //View.loadView(url);
                 var view = this.getTargetView();
 	            view.openDialog(url, '', '', false);
            } else {
                View.openJobProgressBar(message, jobId, this.resultView);
            }
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});


/**
 * Command that deletes records that are selected by the user in the grid control.
 * The parent control must an instance of the Ab.grid.MiniConsole.
 */
Ab.command.deleteSelectedRows = Ab.command.workflowRule.extend({
    
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
Ab.command.documentCommand = Ab.command.openDialog.extend({
    
    tableName: '',
    fieldName: '',
    
    constructor: function(commandData) {
        this.inherit(commandData);
        this.tableName = commandData.tableName;
        this.fieldName = commandData.fieldName;
        this.closeButton = false;
		this.applyParentRestriction = false;
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {

        // add document parameters for the dialog
        var view = this.getTargetView();
        var panel = this.getParentPanel();

		// canonical PK field ordering needed for multi-field afm_docs PKey
		var pkFields = view.dataSources.get(panel.dataSourceId).primaryKeyFields;
        
        view.dialogDocumentParameters = {
            tableName: this.tableName,
            fieldName: this.fieldName,
            fieldValue: panel.getFieldValue(this.tableName + '.' + this.fieldName),
			primaryKeyFields: pkFields,
            panel: panel
        }
        
        this.inherit(context);
    }
});

/**
 * Command that opens a Check In New Document dialog.
 */
Ab.command.checkInNewDocument = Ab.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-doc-checkin.axvw';
        this.width = 600;
        this.height = 400;
    }
});


/**
 * Command that opens a Check In New Document Version dialog. 
 * A dialog for changing the version of an existing document.
 */
Ab.command.checkInNewDocumentVersion = Ab.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-doc-checkin-new-version.axvw';
        this.width = 600;
        this.height = 400;
    }
});


/**
 * Command that opens a Check Out Document dialog.
 */
Ab.command.checkOutDocument = Ab.command.documentCommand.extend({

    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-doc-checkout.axvw';
    }
});

/**
 * Command that Shows the Document in a dialog.
 */
Ab.command.showDocument = Ab.command.documentCommand.extend({    
    
    // full name of an image field on this form, used to display image documents
    displayFieldName: '',    
	
    constructor: function(commandData) {
        this.inherit(commandData);
        this.displayFieldName = commandData.displayFieldName;
    },
    
    handle: function() {
        var form = this.getParentPanel();
        var fileName = form.getFieldValue(this.tableName + '.' + this.fieldName);

        var keys = this.getKeysFromForm(form);
		
		var imageElementId = valueExistsNotEmpty(this.displayFieldName) ? form.getFieldElementName(this.displayFieldName) : null;
		
		View.showDocument(keys, this.tableName, this.fieldName, fileName, imageElementId);
    },
    
    /**
     * Restriction specific to document commands
     * is key to afm_docs (table_name - field_name - pkey_value) 
     * where table & field names are those of the document field & pkey_val is PK of owning record
     */
    getKeysFromForm: function(form) {
        // add primary key values from the document table
        // the primary key of the document table must be present on the form (hidden or otherwise)
        var pkeys = [];
        var fieldNames = form.getPrimaryKeyFields();
        for (var i = 0, name; name = fieldNames[i]; i++) {
            // filter out fields from other tables
            if (name.indexOf(this.tableName + '.') == 0 &&
                name != this.tableName + '.' + this.fieldName) {
                var value = form.getFieldValue(name);
                pkeys.push({'name': name, 'value':value});
            }
        }

        var keys = {};
        for (var i=0, pkey; pkey = pkeys[i]; i++) {
            keys[pkey.name.substring(pkey.name.lastIndexOf('.') + 1)] = pkey.value;
        }

        return keys;
    }
});

/**
 * Command that opens the Document Locking dialog.
 */
Ab.command.lockDocument = Ab.command.documentCommand.extend({        
	
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-doc-lock.axvw';
        this.width = 500;
        this.height = 250;
    }
});

/**
 * Command that deletes document from specified field.
 */
Ab.command.deleteDocument = Ab.command.documentCommand.extend({
    
    constructor: function(commandData) {
        this.inherit(commandData);
        this.viewName = 'ab-doc-mark-deleted.axvw';
        this.width = 500;
        this.height = 250;
    }
});


// --------------------------- other commands ------------------------------------------------------

/**
 * Command that executes specified Java Script function.
 */
Ab.command.callFunction = Ab.command.Command.extend({

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
        if (fn && fn.call) {
            this.context.restriction = this.getRestriction();
            var result = fn(context);
            if (valueExists(result)) {
                this.result = result;
            }
        } else {
            // fallback for 16.3 compatibility - handle inline JavaScript
            var script = this.functionName.replace(/&quot;/g, "'");
            eval(script);
        }
    }
});

/**
 * This command exports the content of specified panel using specified content type. 
 */
Ab.command.exportPanel = Ab.command.Command.extend({
   
    // @begin_translatable
    z_PROGRESS_MESSAGE: 'Exporting data, please wait',
    z_ERROR_MESSAGE: 'Export failed',
    // @end_translatable

    // format for the export: 'pdf' or 'xls' are supported in 16.3-17.2
    // format 'docx' supported in 18.1 ?
    outputType: '',
    
    // optional name of the export XSL-FO file
    file: '',
    
    //export reporting case with tab & its useFrame=false
    exportReportViewName: null,
    
    // whether the results should be immediately shown in a new dialog
    openDialog: true,

	// whether the export interaction (for dataTransfer) should occur in a dialog r.t. a new window/tab
	useDialog: false,

	// whether the export interaction (for dataTransfer) should export related document files
	isExportDocument: false,

	// whether the import interaction (for dataTransfer) should import related document files
	isImportDocument: false,
	
	//if printing out client-side passed parsed restriction
	printRestriction: false,
	
	//docx output orientation
	orientation: null,
	
	//custom report handler.
	handler: null,
	
	//export's recordLimit setting in export command
	recordLimit: null,
	
	//configurable property only for docx like <command pageSize="17;17"/> (in inches)
	pageSize: null,
	
	/**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.outputType)) {
            this.outputType = commandData.outputType;
        }
        if(valueExists(commandData.viewName)){
         this.exportReportViewName = commandData.viewName;
         }
        if (valueExists(commandData.file)) {
            this.file = commandData.file;
        }
        if (valueExists(commandData.openDialog) && commandData.openDialog == 'false') {
            this.openDialog = false;
        }
		if (valueExists(commandData.useDialog) && (commandData.useDialog == 'true')) {
			this.useDialog = true;
		}
        if (valueExists(commandData.isExportDocument) && commandData.isExportDocument == 'true') {
            this.isExportDocument = true;
        }
        if (valueExists(commandData.isImportDocument) && commandData.isImportDocument == 'true') {
            this.isImportDocument = true;
        }
        if (valueExists(commandData.printRestriction) && commandData.printRestriction == 'true') {
            this.printRestriction = true;
        }
        if (valueExistsNotEmpty(commandData.orientation)) {
            this.orientation = commandData.orientation;
        }
        
        if (valueExists(commandData.handler)) {
            this.handler = commandData.handler;
        }
        
        if (valueExists(commandData.recordLimit)) {
            this.recordLimit = commandData.recordLimit;
        }
        
        if (valueExists(commandData.pageSize)) {
            this.pageSize = commandData.pageSize;
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
            
         if (this.outputType === 'pdf' && panel.type != 'htmlChart') {
        	 if(valueExistsNotEmpty(this.file)){
        		// PDF based on custom XSL-FO
 				this.generatePDFReport.defer(500, this, [panel]); 
        	 }else{
        		//PDF based on java library Aspose.words
 				this.openReport(panel);
        	 }
            }else if(this.outputType === 'xls' || this.outputType === 'docx' || this.outputType === 'jpg' || this.outputType === 'png' || (this.outputType === 'pdf' && panel.type == 'htmlChart')){
            	// XLS or DOCX output
				this.openReport(panel);
			}else if (this.outputType === 'txfr') {
				// data transfer UI
				this.openDataTransferUI(panel);
			}
		}
    },
    
    /**
     * Opens DOCX or XLS or PDF report.
     */
    openReport: function(panel){
    	View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
    	 try{
    		 if(valueExists(panel) && panel.callReportJob){
    			 var reportProperties = {outputType: this.outputType, printRestriction: this.printRestriction, 
    					 orientation: this.orientation, handler:this.handler, recordLimit: this.recordLimit, pageSize:this.pageSize};
    			 
    			 var jobId = panel.callReportJob(reportProperties);
    			 
    			 if(panel.type != 'htmlChart')
    				 this.displayReport(jobId, this.outputType);
    		 } 
    	 }catch(e){
    		 var message = View.getLocalizedString(this.z_ERROR_MESSAGE);
             View.showMessage('error', message, e.message, e.data);
    	 }
    	View.closeProgressBar();
    },
    
    /**
     * Displays panel's report result.
     */
    displayReport: function(jobId, outputType){
    	if(jobId != null){
			 var jobStatus = Workflow.getJobStatus(jobId);
			 //XXX: finished or failed
			 while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
				jobStatus = Workflow.getJobStatus(jobId);
			 }
			
			 if (jobStatus.jobFinished) {
				var url  = jobStatus.jobFile.url;
				if(valueExists(outputType) && outputType === 'pdf'){
			        window.open(url);
				}else{
					window.location = url;
				}
			}
		 }
    },
	
    /**
     * Data transfer UI
     */
    openDataTransferUI: function(panel) {
    	var reportViewName = panel.viewDef.viewName + '.axvw';
		var reportDataSourceId = panel.dataSourceId;
		var reportTitle = panel.title;
		var restriction = toJSON(panel.restriction);

		var url = 'ab-data-transfer-main.axvw?viewName=' + reportViewName + '&panelId=' + panel.id;
		if(this.isExportDocument)
			url = url + '&isExportDocument=true';
		else 
			url = url + '&isExportDocument=false';
		
		if(this.isImportDocument)
			url = url + '&isImportDocument=true';
		else 
			url = url + '&isImportDocument=false';
		
		
		var view = this.getTargetView();

		if (this.useDialog) { // for SmartClient
			view.progressReportParameters = {};
			view.progressReportParameters.viewName = reportViewName;
			view.progressReportParameters.panelId = panel.id;
			view.progressReportParameters.isExportDocument = this.isExportDocument;
			view.progressReportParameters.isImportDocument = this.isImportDocument;
			
			view.openDialog(url, '', '', false);
			this.styleInteractiveDialog(view);
		}
		else {
			window.open(url);
		}
    },
    
    /**
     * PDF report (deprecated starting with V21.1)
     */
	generatePDFReport: function(panel) {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		try {
	        // set panel export parameters and render the panel
	        panel.exportType = this.outputType; 
	        panel.exportFile = this.file;    
	        if(valueExistsNotEmpty(this.orientation)){
	        	 panel.orientation = this.orientation;
	        }
	       
	        if(valueExists(this.exportReportViewName)){
	        	panel.exportReportViewName = this.exportReportViewName;
	        }        
	        panel.refresh(panel.restriction, this.newRecord);
	       
	        // reset panel export parameters
	        panel.exportType = ''; 
	        panel.exportFile = '';            
	        
	        // use panel export URL to open dialog and display the rendered file
	        var url = panel.exportURL;            
	        if (this.openDialog && url != null && url != '') {
	           var view = this.getTargetView();
	           view.openDialog(url, '', '', {collapsible:false});
	        }
	
	        panel.show(this.show);
	
	        View.closeProgressBar();
        } catch (e) {
            View.closeProgressBar();

            var message = View.getLocalizedString(this.z_ERROR_MESSAGE);
            View.showMessage('error', message, e.message, e.data);
        }
	},

	/**
	 * SmartClient shows dataTransfer exportPanel in a dialog over a new browser panel
	 * Style the dialog to hide the panel
	 */
	styleInteractiveDialog: function(view) {
		view.dialog.maximize();
		if (view.dialog.tools.restore != null)
		{
			view.dialog.tools.restore.hide();
		}		
		if (view.dialog.tools.maximize != null)
		{
			view.dialog.tools.maximize.hide();
		}
		if (view.dialog.tools.close != null)
		{
			view.dialog.tools.close.hide();
		}		
		if (view.dialog.tools.toggle != null)
		{
			view.dialog.tools.toggle.hide();
		}
		if (view.dialog.buttons != null && view.dialog.buttons.length > 0)
		{
			view.dialog.buttons[0].hide();
		}
	}

});


/**
 * This command displays custom help text. 
 */
Ab.command.showHelp = Ab.command.Command.extend({
    // file name or path   
    file: '',
    
    // whether the results should be immediately shown in a new dialog
    openDialog: true,
    
    width: null,
        
    height: null, 
       
    
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        if (valueExists(commandData.file)) {
            this.file = commandData.file;
        }
        
        if (valueExists(commandData.openDialog) && commandData.openDialog == 'false') {
            this.openDialog = false;
        }        
        if (valueExists(commandData.width)) {
            this.width = parseInt(commandData.width);
        }        
        if (valueExists(commandData.height)) {
            this.height = parseInt(commandData.height);
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);        

        this.normalizeLegacyHelpLinks();
        
		if (this.openDialog && this.file != '' ) {
			var view = this.getTargetView();		
			//view.openDialog(this.file, '', false, '', '', this.width, this.height);
			openNewContent(this.file, '', 'toolbar=yes,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600');
		}                   
    },
    
    /**
     * Converts the old help URL format that used help files inside the web app into the new help URL format based on archibus.com.
     */
    normalizeLegacyHelpLinks: function() {
        //
        // old format:
        // <command type="showHelp" file="/help/system/Content/update_wiz/transfer_out.htm" />
        // <command type="showHelp" file="/help/user/Subsystems/webc/Content/web_user/res/reserve/timeline.htm"/>
        //
        // new format:
        // http://www.archibus.com/ai/abizfiles/v21.1_help/system_management_help/afm-sysman.htm#update_wiz/transfer_out.htm
        // http://www.archibus.com/ai/abizfiles/v21.1_help/archibus_help/archibus.htm#../Subsystems/webc/Content/web_user/res/reserve/timeline.htm
        //
        var oldUserPrefix = ('/help/user');
        var oldSystemPrefix = ('/help/system/Content/');
        var newUserPrefix = View.helpLink.replace('(user.helpExtension)', View.user.helpExtension) + '#..';
        var newSystemPrefix = View.systemAdministrationHelpLink + '#';
        if (this.file.indexOf(oldUserPrefix) === 0) {
            this.file = newUserPrefix + this.file.substring(oldUserPrefix.length);
        } else if (this.file.indexOf(oldSystemPrefix) === 0) {
            this.file = newSystemPrefix + this.file.substring(oldSystemPrefix.length);
        }
    }
});


/**
 * This command displays custom help text. 
 */
Ab.command.selectFields = Ab.command.Command.extend({
    // panelId    
    panelId: '',

    // whether the results should be immediately shown in a new dialog
    openDialog: true,
    
    width: null,
        
    height: null, 
       
    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);

        if (valueExists(commandData.panelId)) {
            this.panelId = commandData.panelId;			        
        }                
        if (valueExists(commandData.openDialog) && commandData.openDialog == 'false') {
            this.openDialog = false;
        }        
        if (valueExists(commandData.width)) {
            this.width = parseInt(commandData.width);
        }        
        if (valueExists(commandData.height)) {
            this.height = parseInt(commandData.height);
        }
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);        

		if (this.openDialog) {
			var panel = this.getTargetPanel();
			
			var dialog = View.openDialog('ab-select-fields.axvw', '', false, {
				width : 465,
				height : 430,
				isDialog : true,
				closeButton: false,
				panel: panel
			});
		}                   
    }
});

/**
 * This command converts an SVG to a PNG.
 */
Ab.command.captureSvgImage = Ab.command.Command.extend({
    // target id, usually the div for the SVG
    id: '',
     
    // whether to display the captured image in a new window
    displayImage: true,

    // name of callback function
    functionName: null,

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);

        if (valueExists(commandData.id)) {
            this.id = commandData.id;
        }

        if (valueExists(commandData.displayImage)) {
            this.displayImage = commandData.displayImage;
        }

        if (valueExists(commandData.functionName)) {
            this.functionName = commandData.functionName;
        }
    },

    /**
     * Command handler.
     */
    handle: function(context) {
        this.inherit(context);
        var imageCapture = new ImageCapture();

        var callback = window[this.functionName];
        if (!callback && this.functionName) {
            var script = this.functionName.replace(/&quot;/g, "'");
            callback = eval(script);
        }

        //KB# 3049941 workaround weblogic does not pass command's id issue
        var divId;
    	if(this.id)
    	   divId = this.id;
        else if (this.panelId)
           divId = this.panelId;
        else if (this.parentPanelId)
    	   divId = this.parentPanelId;

    	imageCapture.captureImage(divId, this.displayImage, callback);
    }
});


/**
 * Select Value command.
 */
Ab.command.selectValue = Ab.command.Command.extend({
    // @begin_translatable
    z_MESSAGE_SELECT_VALUE_DWG_PARAMS: 'Command must use the fieldNames attribute',
    // @end_translatable

    fieldNames: null,
    selectFieldNames: null,
    visibleFieldNames: null,
    sortFieldNames: null,
    
    dialogTitle: '',
    dialogRestriction: null,
    actionListener: null,
    applyFilter: true, 
    showIndex: true, 
    workflowRuleId: null,
    selectValueType: 'grid',
    recordLimit: null,
    applyVpaRestrictions: true,
	showNullFilters: false,

    autoComplete: true,
    minLength: 1,
    maxResults: 0,
    dataSource: '',
    
    addNewDialog: null,
    showDialog: true,
    showAddNewButton: null,

    // callback function name to call before opening the dialog
    beforeSelect: null,

    /**
     * Constructor.
     */
    constructor: function(config) {
        this.inherit(config);

        Ext.apply(this, config);
        
        if (this.autoComplete == "false") {
            this.autoComplete = false;
        }
        if (this.showIndex == "false") {
        	this.showIndex = false;
        }
        if (this.applyFilter == "false") {
        	this.applyFilter = false;
        }
        if (this.applyVpaRestrictions == "false") {
        	this.applyVpaRestrictions = false;
        }
        if (!valueExists(this.visibleFieldNames)) {
        	this.visibleFieldNames = this.selectFieldNames;
        }
        if (this.showNullFilters == "true") {
        	this.showNullFilters = true;
        }
        if (this.showDialog == "false") {
        	this.showDialog = false;
        }
        
        this.dialogRestriction = Ext.util.Format.htmlDecode(config.restriction);
    },
    
    /**
     * Command handler.
     */
    handle: function(context) {
        if (valueExistsNotEmpty(this.beforeSelect)) {
            if (!this.beforeSelect.call) {
                this.beforeSelect = window[this.beforeSelect];
            }
            if (this.beforeSelect.call) {
                this.beforeSelect.call(window, this);
            }
        }

    	if (!this.showDialog) {
    		return;
    	}
    	
    	// prepare dialog sort parameter
    	var sortValues = [];
    	if (valueExists(this.sortFieldNames)) {
    		// sort field names are specified - prepare sortValues grid parameter
	    	var sortValuesKeys = this.trimArrayValues(this.sortFieldNames.split(','));
	    	for (var i = 0; i < sortValuesKeys.length; i++) {
	    		sortValues.push({
	    			fieldName: sortValuesKeys[i],
	    			sortOrder: 1
	    		});
	    	}
    	} else if (valueExists(this.sortValues)) {
    		// sortValues are specified as text - evaluate into JS array
    		sortValues = eval(this.sortValues);
    	}
		else {
			// KB 3032695 use visble fields as sort values if none given
			var fieldArray = this.trimArrayValues(this.visibleFieldNames.split(','));
			for (var i = 0; i < fieldArray.length; i++) {
	    		sortValues.push({
	    			fieldName: fieldArray[i],
	    			sortOrder: 1
	    		});
	    	}
		}
    	
    	// if there is no title provided (customized select value command),
    	// create the title from form field titles
    	if (!valueExistsNotEmpty(this.dialogTitle)) {
    		 var targetForm = this.getParentPanel();
    		 if (targetForm != null){
    			 var title = '';
    			 var fieldDefs = targetForm.getDataSource().fieldDefs;
    			 var fieldNamesArray = this.trimArrayValues(this.fieldNames.split(','));
    			 for (var i=0; i < fieldNamesArray.length; i++) {
    				 var fieldName = fieldNamesArray[i];
    				 var fieldDef = fieldDefs.get(fieldName);		
	    			 if (fieldDef != null) {
	    				 if (title != '') {
	    					 title = title + ', ' + fieldDef.title;
	    				 } else {
	    					 title =  fieldDef.title;
	    				 }
	    			 }
    			 }
    			 this.dialogTitle = title;
    		 }
    	}
    
		if (!valueExists(this.selectValueType) || 
				this.selectValueType == 'tree' ||  
				this.selectValueType == 'hierTree' || 
				this.selectValueType == 'grid' ||
				this.selectValueType == 'multiple') {
            View.selectValue(
                this.parentPanelId,
                this.dialogTitle,
                this.trimArrayValues(this.fieldNames.split(',')),
                trim(this.selectFieldNames.split(',')[0].split('.')[0]), // table from the first select field
                this.trimArrayValues(this.selectFieldNames.split(',')),
                this.trimArrayValues(this.visibleFieldNames.split(',')),
                this.dialogRestriction,
                this.actionListener,
                this.applyFilter,
                this.showIndex,
                this.workflowRuleId,
                null,
                null,
                this.selectValueType,
                this.recordLimit,
                toJSON(sortValues),
				this.applyVpaRestrictions,
                this.addNewDialog,
				this.showNullFilters,
				this.showAddNewButton);
		}
		else if (this.selectValueType == 'floorDrawing') {
			if (this.fieldNames == null) {
				View.showMessage('error', Ab.view.View.getLocalizedString(this.z_MESSAGE_SELECT_VALUE_DWG_PARAMS));
				return;
			}
			if (this.selectFieldNames == null) {
				this.selectFieldNames="rm.rm_id";
			}
            View.selectValueFloorDrawing(
                this.parentPanelId,
                this.dialogTitle,
                this.trimArrayValues(this.fieldNames.split(',')),
                trim(this.selectFieldNames.split(',')[0].split('.')[0]), // table from the first select field
                this.trimArrayValues(this.selectFieldNames.split(','))
			);
		}
    }
});

