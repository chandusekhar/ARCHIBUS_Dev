/**
 * Declare the namespace for the view JS classes.
 */
AFM.namespace('view');

/**
 * Define single instance of the View class this window/frame.
 * View object provides methods that allow different parts of the view to interact.
 */
AFM.view.View = new (Base.extend({

        // registry of controls
        // for simplicity/maintainability, registry is now a per-window array allocated on construction of AFM.view.View
    controlRegistry: null,

    // optional restriction for this view
    restriction: null,

    // optional restriction for the dialog window
    dialogRestriction: null,

    // currently displayed dialog window
    dialog: null,

    // optional newrecord flag for this view
    newRecord: false,

    // optional newRecord flag for the dialog
    dialogNewRecord: false,

    // parameters for Select Value dialog
    selectValueParameters: null,

    // default size and position for dialog windows
    defaultDialogX: 10,
    defaultDialogY: 10,
    defaultDialogWidth: 800,
    defaultDialogHeight: 600,
    defaultWindowName: '',    
    /**
     * Constructor.
     */
    constructor: function() {
        this.controlRegistry = new Array();

                // find this window's or frameset's opener (if one exists)
                var openingView = opener;
                if (openingView == null) {
                        openingView = top.opener
                }
        // copy restriction from the window's or frameset's opener view
        if (openingView != null && valueExists(openingView.AFM)) {
            this.restriction = openingView.AFM.view.View.dialogRestriction;
            this.newRecord = openingView.AFM.view.View.dialogNewRecord;
        } else {
            // if not a dialog window, check if there is a parent tabs frame
            var tabsFrame = getFrameObject(self.parent, 'tabsFrame');
            if (tabsFrame != null) {
                if (valueExists(tabsFrame.restriction)) {
                    this.restriction = tabsFrame.restriction;
                }
                if (valueExists(tabsFrame.newRecord)) {
                    this.newRecord = tabsFrame.newRecord;
                }
            }
        }
    },

    /**
     * Opens dialog window to display specified message.
     * @param {type}       Dialog type: 'error'|'message'
     * @param {message}    Message.
     * @param {details}    Optional: details message.
     * @param {data}       Optional: data object.
     */
    showMessage: function(type, message, details, data) {
        alert(type + '\n' + message + '\n' + data);  
    },

    /**
     * Opens new dialog window and displays specified view.
     * @param {url}          URL to display in the dialog, typically a view name.
     * @param {restriction}  Optional: Restriction to be applied to the dialog view content.
     * @param {newRecord}    Optional: Hint for the dialog view to display in the new record mode.
     * @param {x}            Optional: x position of the new window. Default = 10px.
     * @param {y}            Optional: y position of the new window. Default = 10px.
     * @param {width}        Optional: width of the new window. Default = 800px.
     * @param {height}       Optional: height of the new window. Default = 600px.
     * @param {windowName}   Optional: name of the new window. Default = ''.
     */
    openDialog: function(url, restriction, newRecord, x, y, width, height, windowName) {

        // set the restriction for the dialog view
        if (typeof(restriction) != 'undefined') {
            this.dialogRestriction = restriction;
        } else {
            this.dialogRestriction = null;
        }

        if (typeof(newRecord) != 'undefined') {
            this.dialogNewRecord = newRecord;
        } else {
            this.dialogNewRecord = false;
        }

        if (typeof(x) == 'undefined') {
            x = this.defaultDialogX;
        }
        if (typeof(y) == 'undefined') {
            y = this.defaultDialogY;
        }
        if (typeof(width) == 'undefined') {
            width = this.defaultDialogWidth;
        }
        if (typeof(height) == 'undefined') {
            height = this.defaultDialogHeight;
        }
        if (typeof(windowName) == 'undefined') {
            windowName = this.defaultWindowName;
        }

        var newWindowSettings = 'toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=' + width + ',height=' + height;
        this.dialog = window.open('', windowName, newWindowSettings);
        this.dialog.moveTo(x, y);
        this.dialog.location = url;
        this.dialog.focus();
    },

    closeDialog: function() {
        if (this.dialog != null) {
            this.dialog.close();
            this.dialog = null;
        }
    },

    /**
     * Opens a dialog that allows the user to select specified field value.
     * @param {formId}
     * @param {title}
     * @param {targetFieldNames}
     * @param {selectTableName}
     * @param {selectFieldNames}
     * @param {visibleFieldNames}
     * @param {restriction}
     * @param {actionListener}		String: name of the afterSelectValue event handler function.
     * @param {applyFilter}			Boolean: whether to apply form field values as initial filter.
     * @param {showIndex}			Boolean: whether to show the index.
     * @param {workflowRuleId}      String: workflow rule ID used to get data records for the dialog.
     * @param {width}               Number: dialog width.
     * @param {height}              Number: dialog height.
     */
    selectValue: function(formId, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames,
                          restriction, actionListener, applyFilter, showIndex, workflowRuleId, width, height) {

        // prepare Select Value parameters
        this.selectValueParameters = {
           formId: formId,
           title: title,
           targetFieldNames: targetFieldNames,
           selectTableName: selectTableName,
           selectFieldNames: selectFieldNames,
           visibleFieldNames: visibleFieldNames,
           restriction: restriction,
           actionListener: actionListener,
           applyFilter: applyFilter,
           workflowRuleId: workflowRuleId};

                this.selectValueParameters.showIndex = getValueIfExists(showIndex, true);

        // add form field values entered by the user as possible restriction
        var form = this.getControl('self', formId);
        if (form != null) {
            this.selectValueParameters.filterValues = form.getFieldValues();
        }

        // open Select Value window
        var width = getValueIfExists(width, this.defaultDialogWidth);
        var height = getValueIfExists(height, this.defaultDialogHeight);
        this.openDialog('ab-select-value.axvw', restriction, false, 100, 100, width, height, 'selectV');
    },

    /**
     * Opens a dialog with tree control that allows the user to select specified field value.
     * @param {formId}
     * @param {title}
     * @param {targetFieldNames}    String:
     * @param {selectTableName}     String
     * @param {selectFieldNames}    String
     * @param {visibleFieldNames}   String
     * @param {restriction}
     * @param {actionListener}	    String: name of the afterSelectValue event handler function.
     * @param {applyFilter}	    Boolean: whether to apply form field values as initial filter.
     * @param {type}                String: 'selectValueTree' or 'selectValueHierTree'
     * @param {hierTraceField}	    String: hierarchical value field name
     * @param {width}               Number: dialog width.
     * @param {height}              Number: dialog height.
     */
    selectValueTree: function(formId, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames,
                          restriction, actionListener, applyFilter, type, width, height) {

        // prepare Select Value parameters
        this.selectValueParameters = {
           formId: formId,
           title: title,
           targetFieldNames: targetFieldNames,
           selectTableName: selectTableName,
           selectFieldNames: selectFieldNames,
           visibleFieldNames: visibleFieldNames,
           restriction: restriction,
           actionListener: actionListener,
           applyFilter: applyFilter,
           type: type};

        // add form field values entered by the user as possible restriction
        var form = this.getControl('self', formId);
        if (form != null) {
            this.selectValueParameters.filterValues = form.getFieldValues();
        }

        // open Select Value window
        var width = getValueIfExists(width, this.defaultDialogWidth);
        var height = getValueIfExists(height, this.defaultDialogHeight);
        this.openDialog('ab-select-value-tree.axvw', restriction, false, 100, 100, width, height);
    },


    /**
     * Appies specified restrictions to specified tab page, or to all tab pages,
     * and selects specified tab page.
     * @param {tabPageName} Tab page name to select.
     * @param {restriction} JS restriction object, optional.
     * @param {parsedRestriction} XML restriction for legacy views, optional.
     *                            Applied only to the tabPageName if it is specified,
     *                            or to all tab pages if tabPageName is not specified.
     * @param {newRecord} true|false
     */
    selectTabPage: function(tabPageName, restriction, parsedRestriction, newRecord) {
        var tabsFrame = getFrameObject(self.parent, 'tabsFrame');
        if (tabsFrame != null) {
            if (valueExists(restriction)) {
                tabsFrame.restriction = restriction;
            }
            if (valueExists(newRecord)) {
                tabsFrame.newRecord = newRecord;
            }else{
                    tabsFrame.newRecord = this.newRecord;
            }

            if (valueExists(parsedRestriction)) {
                tabsFrame.setTabsRestriction(parsedRestriction, tabPageName);
            }

            if (valueExists(tabPageName) && tabPageName != '') {
                tabsFrame.selectTab(tabPageName);
            }
        }
    },

    /**
     * Returns target window or frame specified by name.
     * @param {target}      Target window name: self|opener|dialog|frame_name.
     */
    getWindow: function(targetName) {
        var target = null;
        if (targetName == 'self' || targetName == '' || targetName == null) {
            target = self;
        } else if (targetName == 'opener') {
            target = opener;
            if (target == null) {
                target = parent.opener;
            }
        } else if (targetName == 'dialog') {
            target = this.dialog;
        } else {
            target = getFrameObject(parent, targetName);
        }
        return target;
    },

    /**
     * Returns View object for specified target window or frame.
     */
    getView: function(targetName) {
        var view = null;
        var targetWindow = this.getWindow(targetName);
        if (targetWindow != null) {
            view = targetWindow.AFM.view.View;
        }
        return view;
    },

        /**
         * Find registry & if none is found allocate a new one
         * add reference from found registry into the given win
         * registry is contained in 'first' window of frameset or only window of view
         *
         * for simplicity/maintainability, registry is now a per-window array allocated on construction of AFM.view.View
         */
        initializeRegistry: function(win) {
                // registry holder
                var cr = this.controlRegistry;

/*
                // set p to be the topmost window
                // if p is frameset it doesn't include ab-view.js so use 1st child frame and set p.controlRegistry to point to 1st frame's registry
                var p = win.parent;
                var w = win;
                while (p != w) {
                        w = p;
                        p = p.parent;
                }
                // frameset window has no AFM.view.view
                if (p.AFM == undefined || p.AFM.view.View == undefined) {
                        if (p.frames != null){
                                // does child window (i.e., frame[i] ) contain a previously allocated registry?
                                for (var i=0, f; f = p.frames[i]; i++) {
                                        if (f.AFM != undefined && f.AFM.view != null && f.AFM.view.View != null && f.AFM.view.View.controlRegistry != null) {
                                                cr = f.AFM.view.View.controlRegistry;
                                                break;
                                        }
                                }
                                var pff = p.frames[0];
                                // if registry not found, allocate one in 1st frame
                                if (cr == undefined && p.frames[0] != null && p.frames[0].AFM != null) {
                                        var pf = p.frames[0];
                                        if (pf.AFM.view.View != undefined &&  (pf.AFM.view.View.controlRegistry == undefined || pf.AFM.view.View.controlRegistry == null)) {
                                                pf.AFM.view.View.controlRegistry = new Array();
                                                cr = pf.AFM.view.View.controlRegistry
                                        }
                                }
                        }
                }
                // if top has registry add reference to it
                else if (p.AFM.view.View.controlRegistry != null && win.AFM != null && win.AFM.view.View.controlRegistry == null) {
                        win.AFM.view.View.controlRegistry = p.AFM.view.View.controlRegistry;
                }
                // else window does have AFM.view.view
                else if (p.AFM.view.View.controlRegistry == null) {
                        p.AFM.view.View.controlRegistry = new Array();
                        cr = p.AFM.view.View.controlRegistry;
                }
*/
                return cr;
        },

    /**
     * Add a specific control to the registry (wherever it actually is held).
         *
     * @param {win}				window / frame, to be used as part of the key,
         *							and whose registry reference is used to access the registry.
     * @param {newControlName}	ID of the control, to be used as part of the key.
     * @param {newControl}		Actual control reference to be placed in registry.
     */
        registerControl: function(win, newControlName, newControl) {
                var windowName = win.name;
                var existingControl = this.getControl(win, newControlName);

                if (existingControl != null) {
                        existingControl.control = newControl;
                }
                else {
                        win.AFM.view.View.controlRegistry.push(new AFM.view.RegistryEntry(windowName, newControlName, newControl));
                }
                var j = 'stopMe';
        },


    /**
     * Return a specific control from the registry, or null if not found.
         *
     * @param {win}				window / frame, to be used as part of the key,
         *							and whose registry reference is used to access the registry.
         *                          alternatively, can be a name of the window/frame:
         *                          self|opener|dialog|frame_name
     * @param {controlName}	    ID of the control.
     */
        getControl: function(win, controlName) {
                var ctrl = null;

                if (typeof(win) == 'string') {
                    win = this.getWindow(win);
                }

                var windowName = win.name;
                //XXX: KB3017616 - it's timing issue on forming win.AFM.view.View
                //if (!valueExists(win.AFM) || !valueExists(win.AFM.view.View)) {
                 //       alert("Calling getControl with incorrect window  [" + windowName + "]");
                //}

                if(valueExists(win.AFM) && valueExists(win.AFM.view.View)){
	                for (var i=0, entry; entry = win.AFM.view.View.controlRegistry[i]; i++) {
	                        if (entry.windowName != null && trim(entry.windowName) == windowName &&
	                                entry.controlName != null && trim(entry.controlName) == controlName) {
	                                // found registry entry
	                                return entry.control;
	                        }
	                }
                }
                return ctrl;
        },


        /**
         * Return a Tree control from the registry, or null if not found.
         *
         * @param {win}	window / frame, to be used as part of the key,
         *			and whose registry reference is used to access the registry.
         *                  alternatively, can be a name of the window/frame:
         *                  self|opener|dialog|frame_name
         */
         getTreeControl: function(win) {
                var ctrl = null;

                if (typeof(win) == 'string') {
                    win = this.getWindow(win);
                }

                var windowName = win.name;
                if (!valueExists(win.AFM) || !valueExists(win.AFM.view.View)) {
                        alert("Calling getControl with incorrect window  [" + windowName + "]");
                }

                for (var i=0, entry; entry = win.AFM.view.View.controlRegistry[i]; i++) {
                        ctrl = entry.control;
                        if (entry.windowName != null && trim(entry.windowName) == windowName &&
                            entry.controlName != null && ctrl.type != null &&
                            (trim(ctrl.type) == 'tree' || trim(ctrl.type) == 'hierTree')) {
                                // found registry entry
                                return ctrl;
                        }
                }
                return null;
        }
}));



AFM.view.RegistryEntry = Base.extend({
        // id of view containing the control. first part of two-part key
        windowName: '',

        // id of control. second part of two-part key
        controlName: '',

        // control reference
        control: '',

    /**
     * Constructor.
         * Entry in the registry holding window-control names as key & control reference as value
     * @param {windowName}	Registry key window or frame name.
     * @param {controlName}	Registry key control name.
     * @param {control}		Reference to actual control
         *
     */
    constructor: function(windowName, controlName, control) {
                this.windowName = windowName;
                this.controlName = controlName;
                this.control = control;
        }

        // equals
        // push
        // pop
});


/**
 * Contains view parameters for the controls that are based on the view format.
 * The view can be defined either by the AXVW view name, or by the table and fields.
 */
AFM.view.ViewDef = Base.extend({
    // view name
    viewName: null,

        // index into tableGroups within view definition. default to first (0th)
        tableGroupIndex: 0,

    // main table name
    tableName: null,

    // array of field names to be displayed
    fieldNames: null,

    /**
     * Constructor. The caller can specify either:
     *
     * @param {viewName}
     * @param {tableGroupIndex}
     *
     * or additionally:
     *
     * @param {tableName}
     * @param {fieldNames}
     *
     * In the second case the viewName parameter must be null.
     */
    constructor: function(viewName, tableGroupIndex, tableName, fieldNames) {
        this.viewName = viewName;
        if (typeof tableName != 'undefined') {
            this.tableName = tableName;
            this.fieldNames = fieldNames;
        }
                this.tableGroupIndex = tableGroupIndex;
    },

    /**
     * Returns field name array in JSON format.
     */
    getFields: function() {
        return this.fieldNames;
    }
});


/**
 * Restriction that can be passed by the command from one control to another,
 * or from the control to the workflow rule.
 *
 * {relOp='AND',
 *  clauses=[
 *     {name='rm.bl_id', op='=', value='HQ'},
 *     {name='rm.rm_std', op='IS NOT NULL', value=''}
 *  ]}
 */
AFM.view.Restriction = Base.extend({

    // clauses (i.e. rm.area < 100.0)
    clauses: null,

    // relational operation to combine clauses: AND|OR
    relOp: 'AND',

    /**
     * Constructor.
     * @param {fieldValues} An object containing form field values (optional).
     * @param {relOp} Relational operation code (optional).
     */
    constructor: function(fieldValues, relOp) {
        this.clauses = new Array();
        // fix for IE: toJSON() method cannot find the constructor when called from a different tab frame
        // TODO: find out why this is happenning and whether there's a better hack
        this.clauses.constructor = Array.constructor;

        // add field values as simple = clauses
        if (valueExists(fieldValues)) {
            for (var fieldName in fieldValues) {
                var fieldValue = fieldValues[fieldName];

                // ignore empty field values
                if (valueExists(fieldValue) && fieldValue != '') {
                    this.addClause(fieldName, fieldValue);
                }
            }
        }

        if (valueExists(relOp)) {
            this.relOp = relOp;
        }
    },

     /**
     * Adds a clause.
     * @param {replace} Optional; if true, existing clause for the same field must be replaced.
     *                  By default, existing clauses are not replaced.
     */
    addClause: function(name, value, op, relOp, replace) {
        if (valueExists(relOp) && relOp.constructor == Boolean) {
            replace = relOp;
            relOp = 'AND';
        }
        if (valueExists(replace) && replace) {
            this.removeClause(name);
        }
        this.clauses.push(new AFM.view.RestrictionClause(name, value, op, relOp));
    },

    /**
     * Removes a clause.
     */
    removeClause: function(name) {
        var existingClauseIndex = this.findClause(name);
        // remove the existing clause if exists
        if (existingClauseIndex > -1) {
            this.clauses.splice(existingClauseIndex, 1);
        }
     },

    /**
     * Adds all clauses from another restriction.
     * when replace is false, will only adds clauses if they do not exist in this restriction
     * when replace is true and the clause with the name already exists, will replace it with a new one.
     */
    addClauses: function(restriction, replace) {
        for (var i = 0; i < restriction.clauses.length; i++) {
            var clause = restriction.clauses[i];

            var existingClauseIndex= this.findClause(clause.name);

            // if we need to replace existing clause
            if (replace) {
                // remove the existing clause if exists
                if (existingClauseIndex > -1) {
                    this.clauses.splice(existingClauseIndex, 1);
                }

                // add the new clause
                this.addClause(clause.name, clause.value, clause.op, clause.relOp);
            } else {
                // only add the new clause when does not exist
                if (existingClauseIndex == -1) {
                    this.addClause(clause.name, clause.value, clause.op, clause.relOp);
                }
            }
        }
    },

    /**
     * Finds and returns clause by the full field name.
     * Returns -1 if the clause does not exist.
     * return the clause index number if the clause exists
     */
    findClause: function(name) {

        var clauseIndex = -1;
        for (var i = 0; i < this.clauses.length; i++) {
            var c = this.clauses[i];
            if (c.name == name) {
               clauseIndex = i;
            }
        }
        return clauseIndex;
    },

    /**
     * Compares this restriction to another one.
     * @return boolean true if two restrictions are identical.
     */
    equals: function(restriction) {
        var result = (this.relOp == restriction.relOp);
        if (result) {
            if (this.clauses == null && restriction.clauses != null) {
                result = false;
            } else if (this.clauses != null && restriction.clauses == null) {
                result = false;
            } else if (this.clauses == null && restriction.clauses == null) {
                // no clauses means that restrictions are equal
            } else if (this.clauses.length != restriction.clauses.length) {
                result = false;
            } else {
                for (var i = 0; i < this.clauses.length; i++) {
                    var clause = this.clauses[i];
                    var otherClause = restriction.clauses[i];
                    if (!clause.equals(otherClause)) {
                        result = false;
                        break;
                    }
                }
            }
        }
        return result;
    }
});

/**
 * Restriction clause performs specified operation upon specified field value.
 */
AFM.view.RestrictionClause = Base.extend({

    // full field name, i.e. wr.date_requested
    name: '',

    // value to compare with
    value: '',

    // operation: =|&gt;|&lt;|&gt;=|&lt;=|LIKE|IS NULL|IS NOT NULL
    op: '=',

    // relop: "AND" "OR" ")AND(" ")OR("
    relOp: 'AND',
   
    /**
     * Constructor.
     */
    constructor: function(name, value, op, relOp) {
        this.name = name;
        this.value = value;
        if (valueExists(op)) {
            this.op = op;
        }
        if (valueExists(relOp)) {
            this.relOp = relOp;
        }
    },
    /**
     * Compares this clause to another one.
     * @return boolean true if two clauses are identical.
     */
    equals: function(clause) {
        return (this.name == clause.name &&
                this.value == clause.value &&
                this.op == clause.op &&
				this.relOp == clause.relOp);
    }
});
