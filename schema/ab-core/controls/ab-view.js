/**
 * Declare the namespace for the view JS classes.
 */
Ab.namespace('view');

/**
 * Restriction that can be passed by the command from one control to another,
 * or from the control to the workflow rule.
 *
 * {clauses=[
 *     {name='rm.bl_id', op='=', value='HQ'},
 *     {name='rm.rm_std', op='IS NOT NULL', value='', relOp='OR'}
 *     {name='rm.fl_id', op='IN', value=['16', '17', '18'], relOp='OR'}
 *  ]}
 */
Ab.view.Restriction = Base.extend({

    // restriction title
    title: null,

    // clauses (i.e. rm.area < 100.0)
    clauses: null,

    // optional SQL WHERE clause, to combine with the rest of clauses using AND.
    // DO NOT USE - it is exclusively used for auto-complete and may be removed from the core in future.
    sql: '',

    /**
     * Constructor.
     * @param {fieldValues} An object containing form field values (optional).
     */
    constructor: function(fieldValues) {
        this.clauses = [];
        // fix for IE: toJSON() method cannot find the constructor when called from a different tab frame
        // TODO: find out why this is happenning and whether there's a better hack
        this.clauses.constructor = Array.constructor;

        // add field values as simple = clauses
        if (valueExists(fieldValues)) {
            for (var fieldName in fieldValues) {
                var fieldValue = fieldValues[fieldName];

                // ignore empty field values
                if (valueExists(fieldValue) && fieldValue !== '') {
                    this.addClause(fieldName, fieldValue);
                }
            }
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
        this.clauses.push(new Ab.view.RestrictionClause(name, value, op, relOp));
    },

    /**
     * Removes all clauses for specified field name.
     */
    removeClause: function(name) {
        var existingClauseIndex = this.findClauseIndex(name);
        while (existingClauseIndex > -1) {
            this.clauses.splice(existingClauseIndex, 1);
            existingClauseIndex = this.findClauseIndex(name);
        }
     },

    /**
     * Adds all clauses from another restriction.
     * when replace is false, will only adds clauses if they do not exist in this restriction
     * when replace is true and the clause with the name already exists, will replace it with a new one.
     * 
     * kb# 3039091 -  add 'otherParameters' object to allow add the "IS NULL" restriction if the restriction value is NULL or empty.
     * The 'otherParameters' object could contain two keys:
     * 		1. addForNullValue add the restriction for the NULL or UNDEFINED value in format of "dv.dv_id IS NULL"
     * 		2. addForEmptyValue add the restriction for the empty value in format of "dv.dv_id IS NULL
     * 
     */
    addClauses: function(restriction, replace, allowDuplicates, otherParameters) {
    	if (!valueExists(allowDuplicates)) {
    		allowDuplicates = false;
    	}
    	
    	
    	// kb# 3039091
    	// by default, will not add the restriction for null value (backward compatibility)
    	var addForNullValue = false;
    	
    	// by default, will not add the restriction for empty value (backward compatibility)
    	var addForEmptyValue = false;
    	
    	if (valueExists(otherParameters) && otherParameters.constructor == Object) {
    		 if (valueExists(otherParameters.addForNullValue))
    	    		addForNullValue = otherParameters.addForNullValue;
    		 
    	     if (!valueExists(otherParameters.addForEmptyValue))
    	       		addForEmptyValue = otherParameters.addForEmptyValue;
    	}
    	
    	
    	if (restriction && valueExists(restriction.clauses)) {
            for (var i = 0; i < restriction.clauses.length; i++) {
                var clause = restriction.clauses[i];

                // if there is null/undefined clause value
                if (!valueExists(clause.value)) {
                	// if users needs to add the clause
                	// kb# 3039091
                	if(addForNullValue){
                		this.addClause(clause.name, '', 'IS NULL');
                	}
                	continue;
                } else if (clause.value == '' && addForEmptyValue) {
                	// add the NULL clause for the empty values
                	// kb# 3039091
                	this.addClause(clause.name, '', 'IS NULL');
                    continue;
                }

                var existingClauseIndex= this.findClauseIndex(clause.name);

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
                    if (existingClauseIndex == -1 || allowDuplicates) {
                        this.addClause(clause.name, clause.value, clause.op, clause.relOp);
                    }
                }
            }
        }
    },

    /**
     * Finds and returns clause index by the full field name.
     * Returns -1 if the clause does not exist.
     * Returns the clause index number if the clause exists
     */
    findClauseIndex: function(name) {

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
     * Finds and returns clause by the full field name.
     */
    findClause: function(name) {
        var clause = null;
        var index = this.findClauseIndex(name);
        if (index != -1) {
            clause = this.clauses[index];
        }
        return clause;  
    },
    
    findClauses: function(name) {
        var clauses = [];
        var clauseIndex = -1;
        for (var i = 0; i < this.clauses.length; i++) {
            var c = this.clauses[i];
            if (c.name == name) {
            	clauses.push(c);
            }
        }
        return clauses;  
    },

    /**
     * Compares this restriction to another one.
     * @return boolean true if two restrictions are identical.
     */
    equals: function(restriction) {
        var result = true;

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

        return result;
    },

    /**
     * Returns the restriction title if it has been set. Otherwise generates the titles from clauses.
     */
    getTitle: function() {
        return this.title ? this.title : this.toString(false);
    },

    /**
     * Generates a text description of the restriction.
     */
    toString: function(includeNamesAndOps) {
        var text = '';
        for (var i = 0; i < this.clauses.length; i++) {
            if (i > 0) {
                text += ', ';
            }
            text += this.clauses[i].toString(includeNamesAndOps, false);
        }

        return text;
    },

    /**
     * Returns true if the restriction has no clauses.
     */
    isEmpty: function() {
        return this.clauses.length === 0;
    },

    /**
     * De-serializes state of this object from JSON data.
     * @param data
     */
    fromJSON: function(data) {
        Ext.apply(this, data);

        this.clauses = [];
        for (var i = 0; i < data.clauses.length; i++) {
            var clause = new Ab.view.RestrictionClause();
            clause.fromJSON(data.clauses[i]);
            this.clauses.push(clause);
        }
    },

    /**
     * Serializes state of this object to JSON data.
     * @param data
     */
    toJSON: function() {
        var data = {};
        Ext.apply(data, this);

        data.clauses = [];
        for (var i = 0; i < this.clauses.length; i++) {
            data.clauses.push(this.clauses[i].toJSON());
        }

        data.sql = this.sql;

        return data;
    }
});

/**
 * Restriction clause performs specified operation upon specified field value.
 */
Ab.view.RestrictionClause = Base.extend({
    
    // full field name, i.e. wr.date_requested
    name: '',
   
    // value to compare with
    value: '',
   
    // operation: =|&gt;|&lt;|&gt;=|&lt;=|LIKE|IS NULL|IS NOT NULL|IN
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
    },

    /**
     * Generates a text description of the clause.
     */
    toString: function(includeNameAndOp, includeRelOp) {
        var text = '';

        if (includeRelOp) {
            text += (' ' + this.relOp + ' ');
        }

        if (includeNameAndOp) {
        text += (this.name + ' ' + this.op + ' ');
        }

        text += this.value;

        return text;
    },

    /**
     * De-serializes state of this object from JSON data.
     * @param data
     */
    fromJSON: function(data) {
        Ext.apply(this, data);
    },

    /**
     * Serializes state of this object to JSON data.
     * @param data
     */
    toJSON: function() {
        var data = {};
        Ext.apply(data, this);
        return data;
    }
});


 /* Copyright (c) 2007 Marlin Forbes (http://www.datashaman.com)
  * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
  * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
  * 
  * Creates an object property window.location.parameters which is an associative array 
  * of the URL query string parameters used when requesting the current document.
  * If the parameter is present but has no value, such as the parameter flag in 
  * http://example.com/index.php?flag&id=blah, null is stored.
  * 
  * SK: fixed regex.
  */
function setupUrlParameters() {
    var parameters = {};
    if (window.location.search) {
        var paramArray = window.location.search.substr(1).split('&');
        var length = paramArray.length;
        for (var index = 0; index <length; index++ ) {
            var param = paramArray[index].split('=');
            var name = param[0];
            var value = typeof param[1] == "string"
                  ? decodeURIComponent(param[1].replace(/\+/g, ' '))
                  : null;
            parameters[name] = value;
        }
    }
    window.location.parameters = parameters;
}


/**
 * Define single instance of the View class this window/frame.
 * View object provides methods that allow different parts of the view to interact.
 */
Ab.view.View = new (Base.extend({
    
	// Ext.util.MixedCollection of child panels
    panels: null,
    
    // optional restriction for this view
    restriction: null,
    
    // optional restriction for the dialog window
    dialogRestriction: null,
    
    // optional parameters for the dialog view data sources
    dialogParameters: null,

    // currently displayed dialog window
    dialog: null,
    dialogView: null,
    
    // optional newrecord flag for this view
    newRecord: false,
    
    // optional newRecord flag for the dialog
    dialogNewRecord: false,
	
	// parameters set by the opener view
	parameters: null,
    
    // parameters for Select Value dialog
    selectValueParameters: null,
    
    // parameters for Progress Report
    progressReportParameters: null,
    
    // refresh parameters for all panels, used by the refreshPanels() method
    refreshParameters: null,
    
    // default size for dialog windows
    defaultDialogWidth: 900,
    defaultDialogHeight: 600,
    defaultSelectValueDialogWidth: 800,
    defaultSelectValueDialogHeight: 500,
    defaultMessageDialogWidth: 600,
    defaultMessageDialogHeight: 300,
    // default location for dialog windows top left corner
    defaultMessageDialogTop: 5,
    defaultMessageDialogLeft: 5,
    
    // array of layout managers defined in the view
    layoutManagers: null,
    
    // top-level layout manager
    topLevelLayoutManager: null,
    
    // default layout manager, used when layout manager name is not specified
    defaultLayoutManager: null,

    // map of nested layout managers defined in the view, keyed by name
	// nested layouts must add themselves since they have no component to do it for them
	nestedLayoutManagers: null,
	
	// Ext.Viewport for this window or frame
	viewport: null,
    
    // view format version: 1.0 (16.3 and 16.4) or 2.0 (Yalta 5)
    version: '1.0',
    
    // view title text
    originalTitle: null,
    title: '',
    titleBarId: 'viewToolbar_layoutWrapper',

	//HTML link address wrapping the title, used in main toolBar
	titleLink: '',
    
    // user home page
    mainView: '',
    
    // view to be displayed on logout
    logoutView: '',
    
    // ID of the view main panel, which should use the view restriction
    mainPanelId: null,
    
    // reference to the parent Ab.tab.Tab object, if this view is loaded inside a tab page
    parentTab: null,
	
	// reference to the parent Ab.view.ViewPanel object, if the view is loaded inside a view panel
	parentViewPanel: null,
    
    // true if the server run in development mode
    isDevelopmentMode: false,
    
    // expression evaluation context; populated when the view is loaded and all panels are created
    evaluationContext: null,
    
    // Ext.util.MixedCollection of Ab.data.DataSource objects 
    dataSources: null,
    
    // Ext.util.MixedCollection of view controllers 
    controllers: null,

    // Ext.util.MixedCollection of templates
    templates: null,

    // web application path context, portion of url preceding /schema/
    contextPath: '',
    
    // view metaData, for viewDef Wizard 
    designInfo: {},
    
    // whether to display the progress bar on load
    showLoadProgress: false,
    
    // Ext.Window that displays the progress bar
    progressWindow: null,
    
    // Ext.ProgressBar
    progressBar: null,
	
	// number of processes requesting the progress bar to be displayed
	// while the number is greater than 0, the progress bar is not dismissed
	progressBarRequestors: 0,
    
    // view state
    state: 0,
    STATE_CREATED: 1,
    STATE_LAYOUT: 2,
    STATE_LAYOUT_COMPLETE: 3,
    STATE_INITIAL_DATA_FETCH: 4,
    STATE_READY: 5,

    // set to true when the session timeout is detected
    sessionTimeoutDetected: false,

    // selected Process Navigator or Dashboard Tabs record for this view (or null if the view was opened via a URL)
	taskRecord: null,
	
	// selected Process Navigator or Dashboard Tabs information: {activityId}
	taskInfo: null,

	// Ext.Window instance that can display any job status
	jobStatusDialog: null,

    // Backbone.Events aggregator that supports publisher-subscriber pattern
    eventAggregator: null,
	
	/**
	 * Centralized detection of whether view is displayed within the SmartClient Browser control or not.
	 * When within SmartClient Browser views should not open a new window as that will not have the session and need to log in
	 * When within the SmartClient use Ab.view.View.openDialog(url, '', '', false); rather than window.open(url);
	 */
	isWithinSmartClient : (typeof(window.external) != "undefined" && window.external != null && window.external.isSmartClient) ? true : false,

	z_DEFAULT_TITLE: 'ARCHIBUS Web Central',
	// @begin_translatable    
	z_MESSAGE_VIEW_LOAD_FAILURE: 'View loading failed: ',
	z_TOOLTIP_PRINT_VIEW: '<b>Print</b> this view',
	z_TOOLTIP_ADD_FAVORITES: '<b>Add</b> this view to MyFavorites',
	z_TOOLTIP_EMAIL_VIEW_LINK:  '<b>Send</b> link to this view via email',
	z_TOOLTIP_SHOW_HELP: 'Show online <b>help</b>',
	z_MESSAGE_ERROR_IN: 'in ',
	z_MESSAGE_ERROR_LINE: 'Line ',
	z_MESSAGE_ERROR_AT: ' at ',
	z_TITLE_ERROR: 'Error',
	z_TITLE_MESSAGE: 'Message',
	z_TITLE_DETAILS: 'Details',
	z_TITLE_DATA: 'Data',
	z_TITLE_CLOSE: 'Close',
    z_TITLE_CANCEL: 'Cancel',
    z_TITLE_STOP_JOB: 'Stop Job',
    z_TITLE_JOB_COMPLETE: 'Completed',
    z_MESSAGE_LOADING: 'Loading',
    z_TOOLTIP_ALTER_VIEW: '<b>Alter</b> this view',
	z_MESSAGE_ADD_MYFAVORITE: 'Do you want to save this view to your My Favorites list?',
	z_MESSAGE_OVERWRITE_MYFAVORITE: 'This view is already on your My Favorites list. Do you want to overwrite the existing one?',
	z_MESSAGE_JOBSTATUS: 'The status for job (Job Id = jobId) is: <br><br>',
	z_MESSAGE_CONFIRM: 'Confirm',
	z_MESSAGE_OK: 'OK',
	z_MESSAGE_CANCEL: 'Cancel',
	z_MESSAGE_YES: 'Yes',
	z_MESSAGE_NO: 'No',
		
	z_MESSAGE_SELECT_VALUE_DWG_NO_RESTRICTION: 'Parent form of drawing select value must contain building and floor codes',
	z_MESSAGE_NO_TASK_MYFAVORITE: 'MyFavorites can only be created for views on the navigator or dashboard.',
	z_MESSAGE_ADD_SUCCESS_MYFAVORITE: 'MyFavorite written successfully',
	z_MESSAGE_ADD_FAIL_MYFAVORITE: 'MyFavorite write failed',
	z_TITLE_LOG_CONSOLE: 'Log Console',
	// @end_translatable


    // list of chart panel (names) to be loaded sequentially
	chartPanelIds: null,
	currentChartIndex: 0,
	currentChartPanel: null,

    /**
     * Constructor.
     */
    constructor: function() {
        // change Underscore template delimiters from <%= name %> style to {{ name }} style.
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

		// enable logging output to Firebug console, if Firebug is installed and enabled
        YAHOO.widget.Logger.enableBrowserConsole();
        this.log('View constructor: start');
        
        // parse URL parameters and add their collection to the window.location object
        setupUrlParameters();

        this.panels = new Ext.util.MixedCollection();
        this.controllers = new Ext.util.MixedCollection();
        this.dataSources = new Ext.util.MixedCollection();
        this.templates = new Ext.util.MixedCollection();
        this.layoutManagers = [];
        this.nestedLayoutManagers = [];
        this.refreshParameters = {};
		this.taskInfo = {
			activityId: '',
			processId: '',
			taskId: ''
		};

		// find this window's or frameset's opener (if one exists)
		var openerWindow = this.getOpenerWindow();

        // copy restriction from the window's or frameset's opener view
        if (openerWindow != null && valueExists(openerWindow.View) && openerWindow != self) {
            this.restriction = openerWindow.View.dialogRestriction;
            this.newRecord = openerWindow.View.dialogNewRecord;
			this.parameters = openerWindow.View.dialogConfig;
			// copy the current navigator task from the nav controller
			var viewContentPanel = openerWindow.View.getControl('viewContent');
			if (viewContentPanel != null) {
				this.taskRecord = viewContentPanel.taskRecord;
				this.taskInfo = viewContentPanel.taskInfo;
			}
			// KB 3044044, Page Navigation task's dialog's child dialogs need taskInfo too.
			else if (openerWindow.View.taskInfo != null) {
				this.taskInfo = openerWindow.View.taskInfo;
			}
        } else if (top && valueExists(top.taskInfo)) {
            // KB 3042652: called from a navigation page
            this.taskInfo = top.taskInfo;
        } else {
            // try getting restriction from the URL
            var parameters = window.location.parameters;
            if (valueExists(parameters)) {
                var restriction = new Ab.view.Restriction();
                for (var name in parameters) {
                    var value = parameters[name];
                    // ignore &handler=ActionHandlerDrawing parameter and other non-restriction parameters
                    if (name !== 'handler' && name !== 'viewName' && name != 'jobId' && name != 'ruleId' 
                    	&& name != 'showResult' && name != 'resultView' ) {
                        restriction.addClause(name, value);
                    }
                }
                if (restriction.clauses.length > 0) {
                    this.restriction = restriction;
                }
            }
        }
        
        this.state = this.STATE_CREATED;

        Ext.QuickTips.init();
        
        // use cookie provider to save/restore control UI state
        // Ext 2.0 Beta 1 has random issues with the control state provider - disable temporarily
        // Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

        this.eventAggregator = _.extend({}, Backbone.Events);

        this.log('View constructor: end');
    },
    
    /**
     * Called before the panels are created and loaded.
     */
    beforeLoad: function() {
        this.dateFormat = this.convertJavaDateFormat(strDateShortPattern);
        this.timeFormat = this.convertJavaDateFormat(timePattern);

        // create evaluation context
        this.evaluationContext = {};
        if (valueExists(this.user)) {
            this.evaluationContext['user'] = this.user;
        }
        if (valueExists(this.project)) {
            this.evaluationContext['project'] = this.project;
        }
        this.evaluationContext['messages'] = this.messages;
        this.evaluationContext['activityParameters'] = this.activityParameters;
    },
	
	/**
	 * Logs a message, if logging output is enabled.
	 * Delegates to YAHOO.log().
	 * @param {Object} message  Text message.
	 * @param {Object} category Optional: one of 'info', 'warn', 'error', 'time'
	 * @param {Object} source   Optional: source file name.
	 */
	log: function(message, category, source) {
		var source = source || 'view';
		// KB 3019607: the view may be loaded in another frame inside /ab-system/html/url-proxy.htm
		var yahoo = top.YAHOO || self.YAHOO;
		yahoo.log(message, category, source);
	},
	
	/**
	 * Clears previously set dialog window parameters.
	 */
	clearDialogParameters: function() {
		this.dialogRestriction = null;
		this.dialogParameters = null;
        this.dialogNewRecord = false;
        this.dialogConfig = null;
	},
    
    /**
     * Called to initialize the view, all controls, and all layout managers.
     */
    init: function() {
        Ext.apply(Ext, {
            BLANK_IMAGE_URL: this.contextPath + '/schema/ab-core/libraries/ext/resources/images/default/s.gif'
        });

        // error message views do not display any content
	    // KB 3019820: if error message view is initialized, frame action targets do not work in pre-1.0 views
	    if (this.type === 'errorMessage') {
	        return;
	    }
	    
        this.log('View.init(): start');

        if (this.showLoadProgress) {
            this.openProgressBar();
        }

        dwr.engine.setErrorHandler(Workflow.handleDwrError.createDelegate(Workflow));
        dwr.engine.setWarningHandler(Workflow.handleDwrWarning.createDelegate(Workflow));

        // lay out all panels
        this.doLayout();

		//XXX: alter button visiblity
        var alterButton = Ext.get('alterButton');
        if(alterButton !=null && (typeof this.designInfo.isAlterable == "undefined" 
        	|| this.designInfo.isAlterable == "null" || this.designInfo.isAlterable=='false')){
       	 	alterButton.setVisible(false);
       	 }
            
        this.log('View.init(): end');
            
        // wait until DWR fetches the script session ID, and the deferred layout is complete
        var runner = new Ext.util.TaskRunner();
        var task = {
            run: function(){
                if (valueExists(dwr.engine._scriptSessionId) && View.state >= View.STATE_LAYOUT_COMPLETE) {
                    runner.stop(task);
                    // proceed to initial data fetch
                    View.doInitialDataFetch();
                }
            },
            interval: 100
        }
        runner.start(task);        
    },
    
    /**
     * Refreshes the view main panel.
     * @param {clearRestriction} If specified and true, the current restriction is removed.
     */
    refresh: function(restriction, newRecord, clearRestriction) {
		this.restriction = restriction;
		this.newRecord = newRecord;
		
        this.controllers.each(function (controller) {
            controller.afterRefresh(restriction, newRecord, clearRestriction);
        });

        if (this.mainPanelId != null) {
            var mainPanel = this.getMainPanel();
            if (mainPanel.useParentRestriction) {
                mainPanel.refresh(restriction, newRecord, clearRestriction);
            } else {
                mainPanel.refresh();
            }
            mainPanel.show();
        }

        this.panels.each(function (panel) {
            panel.updateHeight();
        });
    },
	
    /**
     * Clears restrictions in all data-bound panels in the view.
     */
    clearPanelRestrictions: function() {
        this.panels.each(function (panel) {
        	if (panel.isDataBound()) {
        	    panel.restriction = null;
        	}
        });
    },
    
    /**
     * Refreshes all data-bound view panels, except specified console panel.
     * 
     * Custom controls can define themselves as data-bound by overriding the Component.isDataBound() method.
     * 
     * TODO: do we need an option to exclude specific panels from refresh?
     */
    refreshPanels: function(restriction, consolePanel) {
        this.restriction = restriction;
		
        this.openProgressBar();
        
        try {
            var totalProgressSteps = 0;
	        this.panels.each(function (panel) {
	        	if (panel.isDataBound() && panel !== consolePanel) {
	        		totalProgressSteps++;
	        	}
	        });
            var currentProgressStep = 0;
        	
	        this.panels.each(function (panel) {
	        	if (panel.isDataBound() && panel !== consolePanel) {
	    			for (var name in View.refreshParameters) {
	    				var value = View.refreshParameters[name];
	    				panel.addParameter(name, value);
	    			}
	                panel.refresh(restriction);
	                
	                currentProgressStep++;
	                View.updateProgressBar(currentProgressStep / totalProgressSteps);
	        	}
	        });
	        
	    	this.closeProgressBar();
        } catch (e) {
        	this.closeProgressBar();
        }
    },
    
    /**
     * Adds parameter used to refresh panels.
     */
    addRefreshParameter: function(name, value) {
        this.refreshParameters[name] = value;   
    },
	
	/**
	 * Reloads this view from the server.
	 */
	reload: function() {
		if (this.parentViewPanel) {
			this.parentViewPanel.reloadView();
		} else if (this.parentTab) {
		    this.parentTab.loadView();
		} else if(window==top){
			window.location.reload(false);
		}
	},
	
	/**
	 * Loads another view in the Process Navigator view content panel. 
	 */
	loadView: function(viewName) {
        var topViewContentPanel = top.View.panels.get('viewContent');
	    if (valueExists(topViewContentPanel)) {
	        topViewContentPanel.loadView(viewName);
	    } else {
	        window.location = viewName;
	    }
	},

    /**
     * Called before the dialog containing this view is closed.
     */
    beforeUnload: function() {
        this.panels.each(function(panel) {
            panel.beforeUnload();
        });
    },
    
    /**
     * Evaluate expressions in view properties.
     */
    evaluateExpressions: function() {
        var ctx = {view: this, user: this.user};
        
        // evaluate view title
        var evaluatedTitle = this.evaluateString(this.originalTitle, ctx);
        if (evaluatedTitle !== this.title) {
            this.setTitle(evaluatedTitle);
        }
        
        // delegate to all child panels
        this.panels.each(function(panel) {
            panel.evaluateExpressions();
        });
    },
    
    /**
     * Evaluate all %{...} expressions in specified string and return string with resolved expressions.
     * For example, "Hello ${user.name}" --> "Hello stranger".
     * 
     * @param {ctx} Evaluation context.
     */
    evaluateString: function(strIn, ctx) {
        var strOut = strIn;
        
        if (valueExists(strIn)) {
            strIn = strIn.replace(/%{/g, "${");
            strIn = strIn.replace(/&apos;/g, "'");
            
            if (strIn.indexOf('$') >= 0 || strIn.indexOf('{if') >= 0) {
                strIn = strIn.replace(/&quot;/g, "'")
                strIn = strIn.replace(/&amp;/g, "&")
                strOut = strIn.process(ctx);
            }
        }
        return strOut;  
    },
    
    /**
     * Evaluate a single ${...} expression in specified string and returns boolean result of evaluation.
     * For example, "${record.values['wr.status']=='R'}" --> false.
     * 
     * @param {ctx} Evaluation context.
     * @param {defaultValue} Value to return if the orginal string is null or undefined.
     */
    evaluateBoolean: function(strIn, ctx, defaultValue) {
		if (typeof(strIn) == 'boolean') {
			return strIn;
		}

		var result = defaultValue;

        if (valueExists(strIn) && typeof(strIn) == 'string') {
            strOut = this.evaluateString(strIn, ctx);
			result = (strOut == "true") ? true : false;
		}
        return result;
    },


	/**
     * Returns view main panel.
     */
    getMainPanel: function() {
    	return this.getControl('', this.mainPanelId);
    },

	/**
     * Returns view toolbar component.
     */
    getViewToolbar: function() {
    	return this.getControl('', 'viewToolbar');
    },
    
    /**
     * Set this view title.
     */
    setTitle: function(title) {
        if (!this.originalTitle) {
            this.originalTitle = title;
        }
        this.title = title;
        
        if (valueExists(title)) {
            document.title = title;
        } else {
            document.title = Ab.view.View.z_DEFAULT_TITLE;
        }
        
        if (this.hasTitle()) {
            if (this.parentTab != null) {
                this.parentTab.setTitle(this.title);
            } else {
				var viewTitlebar = Ext.get('viewToolbar_title');
				if (viewTitlebar) {
                    viewTitlebar.dom.innerHTML = title;
				} else {
                    this.createTitleBar();
				}
            }
        }
    },

	/**
	 * create the view titlebar
	 * actually delegated to Ab.view.Toolbar in ab-layout.js
	 */
	createTitleBar: function() {
        var buttons = [{
        	id:'alterButton',
            icon: Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-icon-alterview.png',
            tooltip: this.getLocalizedString(Ab.view.View.z_TOOLTIP_ALTER_VIEW),
            cls: 'x-btn-icon',
            handler: this.onAlterView.createDelegate(this)
        }];
		// drill-down views or popup dialog have no task and therefore can't be favorites
		if (!this.getParentDialog() && this.taskRecord != null && (this.taskRecord.getValue('afm_ptasks.task_file') || this.taskRecord.getValue('afm_processes.dashboard_view'))) {
			buttons.push({
         	    id:'favoritesButton',
                icon: Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-icon-add-my-favorites.png',
                tooltip: this.getLocalizedString(Ab.view.View.z_TOOLTIP_ADD_FAVORITES),
                cls: 'x-btn-icon',
                handler: this.onAddFavorite.createDelegate(this)
            });
		}
		if(!this.isPaginatedReport()){
			buttons.push({
        		id:'printButton',
            	icon: Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-icon-printview.png',
            	tooltip: this.getLocalizedString(Ab.view.View.z_TOOLTIP_PRINT_VIEW),
            	cls: 'x-btn-icon',
            	handler: this.onPrintView.createDelegate(this)
        	});
			buttons.push({
        		id:'emailButton',
            	icon: Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/ab-icon-emailview.png',
            	tooltip: this.getLocalizedString(Ab.view.View.z_TOOLTIP_EMAIL_VIEW_LINK),
            	cls: 'x-btn-icon',
            	handler: this.onEmailView.createDelegate(this)
        	});	
   		}	
        if (this.isDevelopmentMode) {
            buttons.push({
         	    id:'loggingButton',
                icon: Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/view/bug.png',
                tooltip: 'Open Log Console',
                cls: 'x-btn-icon',
                enableToggle: true,
                handler: this.onLogger.createDelegate(this)
            });
        }
		viewTitlebar = new Ab.view.Toolbar('viewToolbar', new Ab.view.ConfigObject({
            title: this.title,
			titleLink: this.titleLink,
            layout: 'viewLayout',
            region: 'north',
			cls: 'viewToolbar',
            buttons: buttons
        }));
	},

	/**
	 * check if paginated report
	 */
	isPaginatedReport: function() {
		return(Ab.view.View.originalRequestURL.indexOf('ab-paginated-report-job.axvw') != -1);
	},
		
	/**
	 * set the named toolbar button visible or invisible
	 */
	setToolbarButtonVisible: function(buttonId, visible) {
		var toolbar = this.getViewToolbar();
		if (!valueExists(toolbar)) {
		    return;
		}
		
		var targetButton = null;
		for (var i=0, button; button = toolbar.buttons[i]; i++) {
		    if (button.id == buttonId) {
			    targetButton = button;
				break;
            }
		}
		if (targetButton == null) {
			return;
		}

		if (!valueExists(visible)) {
			visible = true;
		}
		targetButton.setVisible(visible);
	},

	/**
	* invoke alter view wizard
	*/
    onAlterView: function(){
		this.openDialog(Ab.view.View.contextPath + '/schema/ab-core/system-administration/alter-view-wizard/ab-alterview-wizard.axvw',
		    null, true);
	},
    /**
     * Retruns true if the view has a title.
     */
    hasTitle: function() {
        return valueExistsNotEmpty(this.title);
    },
    
    /**
     * Returns true if this View object is at the top level (not counting Process Navigator and My Favorites).
     */
    isTopLevel: function() {
        return (self == top || window.name === 'viewContent_iframe' || window.name === 'myFavoriteView_iframe');
    },

    /**
     * Returns true if the view should have a border.
     */
    hasBorder: function() {
        return (self == top || 
            (window.name === 'viewContent_iframe' || window.name === 'myFavoriteView_iframe') && View.type === 'dashboard');
    },
    
    /**
     * Returns Ext.Window instance that contains this view, if exists.
     */
    getParentDialog: function() {
        var dialog = null;
        var openerWindow = this.getOpenerWindow();
        if (openerWindow != null && valueExists(openerWindow.View) && openerWindow != self) {
            dialog = openerWindow.View.dialog;
        }
        return dialog;
    },

    /**
     * Returns true if view components can use custom scroller.
     */
    useScroller: function() {
        return View.preferences.useScroller && !View.hasNativeScroller();
    },

    /**
     * Returns true if the page should use a custom scroller defined in ab-scroller.js.
     * Android and IOS devices have native scrollers, and the customer scroller does not work well on these devices:
     * users cannot tap-drag-release to scroll, or press-drag-release on the scroll thumb to scroll.
     */
    hasNativeScroller: function() {
        return navigator.userAgent.match(/Android/i) !== null || navigator.userAgent.match(/iPhone|iPad/i) !== null;
    },

    /**
     * Assigns all registered controls to their layout regions.
     */
    doLayout: function() {
        this.state = this.STATE_LAYOUT;
        
        try {
	        // create default view layout with regions for view title bar and view content 
	        // north region wraps around <div id="viewToolbar_layoutWrapper"> generated by the <view> tag 
	        // center region wraps around <div id="view_layoutWrapper"> generated by the <view> tag 
	        var regions = [{
	        	region:'center', 
	        	autoScroll: true,
	        	tabPosition:'top',
	        	margins: (self == top) ? Ab.view.Layout.DEFAULT_MARGINS : ''}
	        ];
	        if (this.hasTitle() && this.parentTab == null) {
	            regions.push({
                    id: 'viewToolbarRegion',
	                region:'north', 
	                split:false, 
	                height:28, 
	                contentEl: 'viewToolbar_layoutWrapper'
	            });
	        }      
	        this.topLevelLayoutManager = new Ab.view.Layout('viewLayout', 'border', null, null, regions);
	
	        // lay out all controls
	        this.panels.each(function(panel) {
	            panel.doLayout();
	        });
	        
	        // finalize layout managers
	        for (var i = 0; i < this.layoutManagers.length; i++) {
	            this.layoutManagers[i].bindToParentLayout();
	        }

	        for (var i = 0; i < this.layoutManagers.length; i++) {
	            this.layoutManagers[i].doLayout();
	        }

	        for (var i = 0; i < this.layoutManagers.length; i++) {
	            this.layoutManagers[i].afterLayout();
	        }

            // call controllers	        
            this.controllers.each(function (controller) {
                controller.afterLayout();
            });
            
        } catch (e) {
            // signal the view loader to continue
            this.state = this.STATE_READY;
            // this is a top-level call, nobody else can handle this exception
            this.showException(e, this.getLocalizedString(Ab.view.View.z_MESSAGE_VIEW_LOAD_FAILURE) + this.viewName);
        }
    },

    /**
     * Performs initial data fetch from the server for all controls after the view is loaded. 
     */
    doInitialDataFetch: function() {
        this.log('View.doInitialDataFetch(): start');

        // initialize HTML5 placeholders support for IE
        // TODO: This sets DOM element values, so the form has to check these in getFieldValue().
        // Is there a different library that displays placeholders on top of fields?
        if (!this.supportsPlaceholders()) {
            Placeholders.init({
                hideOnFocus: true
            });
        }

        try {
            this.afterViewLoad();

            this.state = this.STATE_INITIAL_DATA_FETCH;

			this.chartPanelIds = [];
            this.panels.each(function(panel) {
				if (View.type === 'dashboard' && panel.type === 'chart') {
					View.chartPanelIds.push(panel.id);
				}
            });
            
            this.totalProgressSteps = 0;
	        this.panels.each(function (panel) {
	        	if (panel.isDataBound()) {
	        		View.totalProgressSteps++;
	        	}
	        });
            this.totalProgressSteps += this.chartPanelIds.length;
            this.currentProgressStep = 0;
            
            this.panels.each(function(panel) {
				if (View.type === 'dashboard' && panel.type === 'chart') {
					// chart's initialDataFetch forcing showOnLoad='false'
				   	panel.loadChartSWFIntoFlash();
				}
				else {
	                panel.initialDataFetch();
				}
				
				this.currentProgressStep++;
		        if (this.showLoadProgress) {
		            this.updateProgressBar(this.currentProgressStep / this.totalProgressSteps);
		        }
            });
			
			if (this.chartPanelIds.length > 0) {
				View.chartLoader.defer(1000, View);
			} else {
				this.finishInitialDataFetch();
			}            
        } 
		catch (e) {
	        if (this.showLoadProgress) {
	            this.closeProgressBar();
	        }
            // signal the view loader to continue
            this.state = this.STATE_READY;
            // this is a top-level call, nobody else can handle this exception
            this.showException(e, this.getLocalizedString(Ab.view.View.z_MESSAGE_VIEW_LOAD_FAILURE) + this.viewName);
        }
        this.log('View.doInitialDataFetch(): end');
    },

	/*
	 * Modularize second half of initialDataFetch
	 * for common use
	 */
	finishInitialDataFetch: function() {
        this.evaluateExpressions();

        // if the view is loaded from a tab or a dashboard frame, call the opener tab or panel back
        var openerWindow = this.getOpenerWindow();
        if (openerWindow != null && openerWindow != self && valueExists(openerWindow.View)) {
            var parentTab = this.getParentTab();
            if (parentTab) {
                // existing app code use the parentTab property
                this.parentTab = parentTab;

                // copy view restriction from the parent tab before calling the afterViewLoad listener
                View.restriction = parentTab.restriction;
                View.newRecord = parentTab.newRecord;

                // defer the afterLoadView listener to support IE browser control in Outlook/SmartClient
                parentTab.afterLoadView.defer(500, parentTab, [this]);
            } else {
                var parentViewPanel = this.getParentViewPanel();
                openerWindow.View.afterLoadDialog(this, parentViewPanel);
            }
        }

		this.state = this.STATE_READY;
		this.afterInitialDataFetch();
		
        if (this.showLoadProgress) {
            this.closeProgressBar();
        }

        // create placeholders in form controls
        if (!this.supportsPlaceholders()) {
            Placeholders.create();
        }
    },

    /**
     * Recursive method for sequentially loading chart panels and waiting until one is loaded before starting the next.
     */
	chartLoader: function() {
		loadChart = function() {
			View.currentChartPanel = View.panels.get(View.chartPanelIds[View.currentChartIndex]);
			if (View.currentChartPanel.showOnLoad) {
				View.currentChartPanel.refresh();
			}
			this.currentProgressStep++;
	        if (this.showLoadProgress) {
	            this.updateProgressBar(this.currentProgressStep / this.totalProgressSteps);
	        }
		};
		
		if (View.currentChartPanel == null) {
			// we have not started loading the first chart yet
			loadChart();
			View.chartLoader.defer(300, View);
			
		} else if (View.currentChartPanel.isLoadComplete || !View.currentChartPanel.showOnLoad) {
			// current chart has finished loading (or should not be loaded)
			if (View.currentChartIndex == View.chartPanelIds.length - 1) {
				// this is the last chart in the view - we are done with all charts
				View.finishInitialDataFetch();
			} else {
				// start loading the next chart
				View.currentChartIndex++;
				loadChart();
				View.chartLoader.defer(300, View);
			}
		} else {
			// current chart is still loading
			View.chartLoader.defer(300, View);
		}
	},

    /**
     * Lifecycle callback. Called after the view is completely loaded, not including initial data fetch.
     */
    afterViewLoad: function() {
        // if current window or frame has a global callback, call it
        if (valueExists(self.afterViewLoad)) {
            self.afterViewLoad(this);
        }
        
        this.controllers.each(function (controller) {
            controller._afterViewLoad();
        });
    },
    
    /**
     * Lifecycle callback. Called after initial data fetch.
     */
    afterInitialDataFetch: function() {
        // if current window or frame has a global callback, call it
        if (valueExists(self.afterInitialDataFetch)) {
            self.afterInitialDataFetch(this);
        }
        
        this.panels.each(function(panel) {
            panel.afterInitialDataFetch();
        });

        this.controllers.each(function (controller) {
            controller.afterInitialDataFetch();
        });
    },
    
    /**
     * Returns true if this view is ready (i.e. control layout and initial data fetch are complete). 
     */
    isReady: function() {
        return (this.state === this.STATE_READY);
    },
    
    /**
     * Adds a layout manager to the view.
     */
    addLayoutManager: function(layoutManager) {
        this.layoutManagers.push(layoutManager);
        if (this.defaultLayoutManager == null) {
            this.defaultLayoutManager = layoutManager;
        } 
    },

    /**
     * Adds a template.
     * @param id
     */
    addTemplate: function(id) {
        this.templates.add(new Ab.view.Template(id));
    },
    
    /**
     * Opens new dialog window and displays specified view.
     * @param {url}          URL to display in the dialog, typically a view name.
     * @param {restriction}  Optional: Restriction to be applied to the dialog view content.
     * @param {newRecord}    Optional: Hint for the dialog view to display in the new record mode.
     * @param {x}            Optional: x position of the new window. Not used (dialog is centered).
     * @param {y}            Optional: y position of the new window. Not used (dialog is centered).
     * @param {width}        Optional: width of the new window. Default = 800px.
     * @param {height}       Optional: height of the new window. Default = 600px.
     */
    openDialog: function(url, restriction, newRecord, x, y, width, height) {
		var config = {};
        /*
         * 12/17/2012 IOAN when the dialog is opened from opener view
         * x.constructor == Object don't work. Added additional check with typeof
         * to solve this issue.
         */
        if (valueExists(x) && (x.constructor == Object || typeof(x) == 'object')) {
			config = x;
		} else {
			config.width = width;
			config.height = height;
		}
		
        this.ensureInViewport(config);
		
        // set the restriction and newRecord parameters for the dialog view
		this.dialogConfig = config;
        this.dialogRestriction = valueExists(restriction) ? restriction : null;
        this.dialogNewRecord = valueExists(newRecord) ? newRecord : false;

        
        // open Ext dialog
        this.openExtDialog(config, url);
    },

    /**
     * Returns true if the browser supports HTML5 placeholders.
     * TODO: consider using Modernizr.
     */
    supportsPlaceholders: function() {
        var testInput = document.createElement('input');
        return 'placeholder' in testInput;
    },
    
    /**
     * private function
     */
    openExtDialog: function (config, url) {
    	var dialogConfig = {
            layout: 'fit',
            height: config.height,
            width: config.width,
            modal: true,
            shadow: true,
            autoScroll: !valueExistsNotEmpty(url),
            closable: true,
            maximizable:true,
            collapsible:valueExists(config.collapsible) ? config.collapsible : false,
            buttonAlign: 'right',
            title: config.title
        };

        dialogConfig.buttons = [{
            id: 'closeButton',
            text: this.getLocalizedString(Ab.view.View.z_TITLE_CLOSE),
            handler: this.closeDialog.createDelegate(this),
            hidden: (valueExists(config.closeButton) && config.closeButton == false),
            hideMode: 'display'
        }];
        dialogConfig.defaultButton = 'closeButton';

        if (valueExistsNotEmpty(url)) {
            if (url.constructor == String) {
                // create managed iframe and load its content
                var frame = new Ext.ux.ManagedIFrame({
                    autoCreate: {
                        width: '100%',
                        height: '100%'
                    }
                });
                frame.setStyle('border', 'none');
                frame.setSrc(url, true);
                dialogConfig.contentEl = frame;
            } else {
                dialogConfig.contentEl = url;
            }
        }

        this.dialogConfig = config;
        var dialog = new Ext.Window(dialogConfig);
        dialog.show();

        var closeTool = dialog.tools.close.dom;
        Ext.get(closeTool).removeAllListeners();
        Ext.get(closeTool).addListener('click', this.closeDialog.createDelegate(this));

        if(config.useAddNewSelectVDialog == true){
        	this.addNewSelectVDialog = dialog;
        }else{
        	this.dialog = dialog;
        }
          		
  		if (valueExists(config.maximize) && config.maximize) {
  			this.dialog.maximize();
  		}
    },

    /**
     * Callback invoked by the child view after it is loaded and the initial data fetch is complete.
     *
     * @param {childView} Child View object.
     * @param {childViewPanel} View panel that loaded the child view.
     */
    afterLoadDialog: function(childView, childViewPanel) {
        this.dialogView = childView;

        if (valueExists(this.dialogConfig)) {
            if (valueExists(this.dialogConfig['afterViewLoad'])) {
                this.dialogConfig.afterViewLoad(childView);
            }
            if (valueExists(this.dialogConfig['afterInitialDataFetch'])) {
                this.dialogConfig.afterInitialDataFetch(childView);
            }

        } else if (childViewPanel) {
            childViewPanel.afterViewLoad(childView);
        }
    },
    
    /**
    * Opens new dialog window and displays specified paginated report view.
    * @param {viewName}     a paginated report view name.
    * @param {restrictionsForDataSources}  Optional: Restrictions to be applied to the dialog view content.
    *        e.g. {dataSourceId1: Ab.view.Restriction, dataSourceId2: Ab.view.Restriction}
    * @param {parametersForDataSources}    Optional: Parameters to be applied to the dialog view content.
    *		 e.g. {parameterName1: value, parameterName1: value ...}
    * @param {x}            Optional: x position of the new window. Not used (dialog is centered).
    * @param {y}            Optional: y position of the new window. Not used (dialog is centered).
    * @param {width}        Optional: width of the new window. Default = 800px.
    * @param {height}       Optional: height of the new window. Default = 600px.
    */
    openPaginatedReportDialog: function(viewName, restrictionsForDataSources, parametersForDataSources, x, y, width, height) {
    	var config = {};
		if (valueExists(x) && x.constructor == Object) {
			config = x;
		} else {
			config.width = width;
			config.height = height;
		}

        this.ensureInViewport(config);
		
        // set the restrictions, parameters and url for the dialog view
		this.dialogConfig = config;
        this.dialogRestriction = valueExists(restrictionsForDataSources) ? restrictionsForDataSources : null;
        this.dialogParameters = valueExists(parametersForDataSources) ? parametersForDataSources : null;
        var url = 'ab-paginated-report-job.axvw?viewName=' + viewName;
      
        // open Ext dialog
        this.openExtDialog(config, url);
    },

    /**
     * Closes current dialog window.
     */
    closeDialog: function() {
        if (this.dialog != null) {
            if (this.dialogView) {
               this.dialogView.beforeUnload();
            }
            // KB 3042085: if the dialog contains ManagedIFrame, destroy it
            if (this.dialog.contentEl && this.dialog.contentEl.destroy) {
                this.dialog.contentEl.destroy();
            }
    		this.dialog.close();
			this.dialog = null;
			this.dialogRestriction = null;
			this.dialogView = null;
        }
    },
    
    /**
     * Closes the dialog window in which this view is displayed.
     */
    closeThisDialog: function() {
        var view = this.getOpenerView();
        if (view != null) {
            view.closeDialog();
        }
    },
    
    /**
     * Add a parameter for the dialog.
     * @param {name} Parameter name.
     * @param {value} Parameter value.
     */
    addDialogParameter: function(name, value) {
    	if (this.dialogParameters == null) {
    		this.dialogParameters = {};
    	}
    	this.dialogParameters[name] = value;
    },
	
	/**
	 * Ensures that the width and height set in the config object are within the viewport size.
	 * @param {Object} config
	 */
	ensureInViewport: function(config) {
        // if width/height is not specified, use defaults
        if (!valueExists(config.width)) {
            config.width = this.defaultDialogWidth;
        }
        if (!valueExists(config.height)) {
            config.height = this.defaultDialogHeight;
        }
        
        // adjust width/height to not exceed the viewport size
        var viewportSize = this.topLevelLayoutManager.viewport.getSize();
        if (config.width > viewportSize.width - 20) {
			config.width = viewportSize.width - 20;
		}
        
        //XXX: the dialog has a proper height so that it'll show its buttons
        if (config.height > viewportSize.height - 80) {
        	config.height = viewportSize.height - 80;
        } else if (config.height > viewportSize.height - 60) {
			config.height = viewportSize.height - 60;
		} else if (config.height > viewportSize.height - 40) {
			config.height = viewportSize.height - 40;
		} else if (config.height > viewportSize.height - 20) {
			config.height = viewportSize.height - 20;
		}

        // if x and/or y position is specified, make sure the window is fully visible		
		if (valueExists(config.x)) {
			if (config.x + config.width > viewportSize.width) {
				config.x = viewportSize.width - config.width - 25;
			}
		} else {
            config.x = viewportSize.width - config.width - 25;
        }
        if (valueExists(config.y)) {
            if (config.y + config.height > viewportSize.height) {
                config.y = viewportSize.height - config.height - 25;
            }
        } else {
            config.y = viewportSize.height - config.height - 25;
        }
	},
    
    /**
     * Displays exception in a dialog.
     * @param {e} exception
     * @param {message} optional  message.
     */
    showException: function(e, message, callback, winLoc) {
		var message;
		var details;
		var data;
        
        if (valueExists(e.localizedMessage)) {
            // Java exception propagated by DWR
			message = e.localizedMessage;
			if (this.isDevelopmentMode) {
				details = e.details;
			}
        } else if (valueExists(e.cause)) {
            // Java exception propagated by DWR
            message = e.cause.localizedMessage;
            if (this.isDevelopmentMode) {
                details = e.cause.details;
            }
        } else {
            // JavaScript exception
            // JavaScript exception object can have either e.message or e.description property, depending on the browser
            var description = valueExists(e.description) ? e.description: e.message;
            // concatenate the caller's message parameter with the exception description
            message = message + ':<br/>' + description;
			
			if (this.isDevelopmentMode){
				details = e.message + '<br/>' + this.getLocalizedString(Ab.view.View.z_MESSAGE_ERROR_LINE) + e.lineNumber + ' ' + this.getLocalizedString(Ab.view.View.z_MESSAGE_ERROR_AT) + ' ' + e.fileName;
                if (e.stack && e.stack.replace) {
				    data = e.stack.replace(/\s/g, "<br/>");
                }
			} 
        }

        this.showMessage('error', message, details, data, callback, winLoc);
    },
    
    /**
     * Opens dialog window to display specified message.
     * @param {type}       Dialog type: 'error'|'message'
     * @param {message}    Message.
     * @param {details}    Optional: details message.
     * @param {data}       Optional: data object.
     * @param {callback}   Optional: function to call when the dialog is closed.
     * @param {winLoc}     Optional: location object {x,y} of dialog top left corner (defaults to 5,5).
     */
	message: function(type, message, details, data, callback, winLocation) {
		this.showMessage(type, message, details, data, callback, winLocation);
	},
    showMessage: function(type, message, details, data, callback, winLocation) {
		// no messages allowed if session timeout has been detected 
		if (this.sessionTimeoutDetected) {
			return;
		}

		this.localizeExtMessageBox();
        
        if (arguments.length == 1) {
			Ext.MessageBox.alert(this.getLocalizedString(Ab.view.View.z_TITLE_MESSAGE), type, callback);
			return;
        }
        
        // remove dialog DOM element if exists
        var dialogDiv = Ext.get('message_dialog_div');
        if (dialogDiv != null) {
            dialogDiv.remove();
        }
        
        // create new dialog DIV
        var html = '<div id="message_dialog_div" class="x-hidden">'
                 + '<div class="x-window-header"> </div>' 
                 + '<div id="message_dialog_tabs">'
                 + '</div> </div>';
        Ext.DomHelper.insertHtml('afterBegin', document.body, html);
        
        // open Ext dialog
        var tabItems = [];
        if (valueExistsNotEmpty(message)) {
        	tabItems.push({title: this.getLocalizedString(Ab.view.View.z_TITLE_MESSAGE), html: prettyPrintJson(message), fitToFrame:true, autoScroll:true, bodyStyle: 'padding:4px'});
        }
        if (valueExistsNotEmpty(details)) {
        	tabItems.push({title: this.getLocalizedString(Ab.view.View.z_TITLE_DETAILS), html: prettyPrintJson(details), fitToFrame:true, autoScroll:true, bodyStyle: 'padding:4px'});
        }
        if (valueExistsNotEmpty(data)) {
            tabItems.push({title: this.getLocalizedString(Ab.view.View.z_TITLE_DATA), html: prettyPrintJson(data), fitToFrame:true, autoScroll:true, bodyStyle: 'padding:4px'});
        }
		// The X & Y position of the top left corner of the Window on initial showing
		var windowXCoord = this.defaultMessageDialogLeft;
		var windowYCoord = this.defaultMessageDialogTop;
        if (valueExistsNotEmpty(winLocation) && valueExistsNotEmpty(winLocation.x) && valueExistsNotEmpty(winLocation.y)) {
			windowXCoord = winLocation.x;
			windowYCoord = winLocation.y;
        }
        
        var dialog = new Ext.Window({
        	el: 'message_dialog_div',
        	layout: 'fit',
			x: windowXCoord,
			y: windowYCoord,
            height: this.defaultMessageDialogHeight,
            width: this.defaultMessageDialogWidth,
            modal: true,
            shadow: false,
            autoScroll: false,
            closable: true,
            items: new Ext.TabPanel({
            	el: 'message_dialog_tabs',
            	activeTab: 0,
            	autoTabs: true,
            	border: false,
            	items: tabItems,
                style: 'padding-bottom: 8px'
            }),
            buttons: [{
                text: this.getLocalizedString(Ab.view.View.z_TITLE_CLOSE), 
                handler: function() {
                    dialog.close();
                    if (callback) {
                        callback();
                    }
                }
            }]
        });
        if (type == 'error') {
            dialog.setTitle(this.getLocalizedString(Ab.view.View.z_TITLE_ERROR));
        } else {
            dialog.setTitle(this.getLocalizedString(Ab.view.View.z_TITLE_MESSAGE));
        }
        
        dialog.show();
    },

	localizeExtMessageBox: function() {
		var messageOk = this.getLocalizedString(Ab.view.View.z_MESSAGE_OK);
		var messageCancel = this.getLocalizedString(Ab.view.View.z_MESSAGE_CANCEL);
		var messageYes = this.getLocalizedString(Ab.view.View.z_MESSAGE_YES);
		var messageNo = this.getLocalizedString(Ab.view.View.z_MESSAGE_NO);
		
		Ext.MessageBox.buttonText = {
			ok: messageOk,
			cancel: messageCancel,
			yes: messageYes,
			no: messageNo
		};
	},
				
	/**
	 * Displays confirmation dialog.
	 * @param {Object} message
	 * @param {Object} callback function taking one argument: selected button id.
	 */
	confirm: function(message, callback) {
		this.localizeExtMessageBox();
		Ext.MessageBox.confirm(this.getLocalizedString(Ab.view.View.z_MESSAGE_CONFIRM), message, callback);
	},
	
	/**
	 * Prompts the user to enter a value. 
	 * @param {Object} title    Dialog title.
	 * @param {Object} text     Dialog text.
	 * @param {Object} callback Callback function taking two arguments: selected button id and entered value.
	 */
	prompt: function(title, text, callback) {
		this.localizeExtMessageBox();
		Ext.MessageBox.prompt(title, text, callback);
	},
    
	/**
	 * Displays alert dialog.
	 * @param {Object} message
	 * @param {Object} callback function taking one argument: selected button id.
	 */
	alert: function(message, callback) {
		this.localizeExtMessageBox();
		Ext.MessageBox.alert(this.getLocalizedString(Ab.view.View.z_TITLE_MESSAGE), message, callback);
	},

    /**
     * Closes any open overlays.
     */
    closePanelWindows: function() {
        this.panels.each(function (panel) {
            if (panel.isShownInWindow()) {
                panel.closeWindow();
            }
        });
    },

    /**
     * Opens a dialog that allows the user to select specified field value.
     * @param {configOrFormId}      Either a configuration object containing named properties, or 
     *                              the parent form panel ID. If the configuration object is passed,
     *                              all other function parameters are ignored.
     * @param {title}               Title for the dialog.
     * @param {fieldNames}          Array of field names of the parent form panel.
     * @param {selectTableName}     Table name to select values from.
     * @param {selectFieldNames}    Array of field names to select values from.
     * @param {visibleFieldNames}   Array of field names to show in the dialog.
     * @param {restriction}			[optional] Restriction.
     * @param {actionListener}		[optional] String: name of the afterSelectValue event handler function.
     * @param {applyFilter}			[optional] Boolean: whether to apply form field values as initial filter.
     * @param {showIndex}			[optional] Boolean: whether to show the index.
     * @param {workflowRuleId}      [optional] String: workflow rule ID used to get data records for the dialog.
     * @param {width}               [optional] Number: dialog width.
     * @param {height}              [optional] Number: dialog height.
     * @param {selectValueType}     [optional] grid|tree|hierTree
     * @param {addNewDialog}     	[optional] String file name of add new dialog
     * @param {showNullFilters}		[optional] true | false For console only, add the values 'Null' & 'Not Null' to the possible filter values.
     * @param {showAddNewButton}    [optional] String Show Add New Button.
     */
    selectValue: function(configOrFormId, title, fieldNames, selectTableName, selectFieldNames, visibleFieldNames, 
                          restriction, actionListener, applyFilter, showIndex, workflowRuleId, width, height,
                          selectValueType, recordLimit, sortValues, applyVpaRestrictions, addNewDialog, showNullFilters, showAddNewButton) {

		var config = {};
		if (valueExists(configOrFormId) && configOrFormId.constructor == Object) {
			// all parameters are passed as a configuration object
			config = configOrFormId;
			// set local from config for control selection to allow 'tree' type
			selectValueType = configOrFormId.selectValueType
		} else {
	        config.formId = configOrFormId;
	        config.title = title;
	        config.fieldNames = fieldNames;
	        config.selectTableName = selectTableName;
	        config.selectFieldNames = selectFieldNames;
	        config.visibleFieldNames = visibleFieldNames;
	        config.restriction = restriction;
	        config.actionListener = actionListener;
	        config.applyFilter = getValueIfExists(applyFilter, true);
	        config.showIndex = getValueIfExists(showIndex, true);
	        config.workflowRuleId = workflowRuleId;
	        config.recordLimit = recordLimit;
	        config.width = width;
	        config.height = height;
	        config.sortValues = getValueIfExists(sortValues, null);
            config.selectValueType = getValueIfExists(selectValueType, null);
            config.applyVpaRestrictions = getValueIfExists(applyVpaRestrictions, true);
            config.addNewDialog = getValueIfExists(addNewDialog, null);
            config.showNullFilters = showNullFilters;
            config.showAddNewButton = getValueIfExists(showAddNewButton, null);
		}

        // add form field values entered by the user as possible restriction
        var form = this.getControl('self', config.formId);
        if (form != null) {
            config.filterValues = form.getFieldValues();
        }

        // evaluate the sort values JSON string
		if (valueExists(config.sortValues)) {
 			var evaluatedSortValues = eval('(' + config.sortValues + ')');
            config.sortValues = toJSON(evaluatedSortValues);
        }
		
		// this property will be used by the dialog
		this.selectValueParameters = config;
		
        // open Select Value window
        this.openDialog(null, restriction, false, {
            x: 100,
            y: 100,
            width: config.width,
            height: config.height
        });

        // initialize the custom control inside the dialog
        if (!valueExists(selectValueType) || selectValueType === 'grid' || selectValueType === 'multiple') {
            this.dialog.panel = new Ab.grid.SelectValue(this.dialog);
        } else {
            this.dialog.panel = new Ab.tree.SelectValueTree(this.dialog);
        }

        if (View.useScroller()) {
            this.dialog.body.dom.style.overflow = 'hidden';
        }
    },


    /**
     * Opens a dialog that allows the user to select a room within a floor drawing and set the specified field values.
     * @param {formId}				parentPanelId
     * @param {title}				legend title for drawing
     * @param {targetFieldNames}	form field to receive room_id
     * @param {selectTableName}		selected value table name
     * @param {selectFieldNames}	selected field name(s)
     */
    selectValueFloorDrawing: function(formId, title, targetFieldNames, selectTableName, selectFieldNames) {
		var roomTable = null;

        // add form field values entered by the user as possible restriction
	    var restriction = new Ab.view.Restriction();
        var form = View.getControl('self', formId);
        if (form != null) {
           var fieldValues = form.getFieldValues();
		   for (name in fieldValues) {
			   var fullnameArray = name.split('.');
			   if (fullnameArray.length == 2) {
				   if (fullnameArray[1] == 'bl_id' || fullnameArray[1] == 'fl_id' || fullnameArray[1] == 'rm_id') {
					   restriction.addClause(name, fieldValues[name]);
					   roomTable = fullnameArray[0];
				   }
			   }
		   }
        }

		// must restrict by, at least, building and floor
		if (restriction.clauses.length < 2) {
			this.message('error', View.getLocalizedString(Ab.view.View.z_MESSAGE_SELECT_VALUE_DWG_NO_RESTRICTION)); 
			return;
		}

        var controller = this;
		controller.form = form;
		controller.roomName = roomTable + '.rm_id';

        View.openDialog('ab-select-value-floor-dwg.axvw', restriction, false, {
            callback: function(res) {
                //var clause = res.clauses[2];
                var value = res.clauses[2].value;
                controller.form.setFieldValue(controller.roomName, res.clauses[2].value);
            }
        });
	},
	

	/**
	 * Shows a document.
	 * @param {keys}           Object containing primary key values for the document record.
	 *                                Format: {'ls_id': '001'}.
	 * @param {docTableName}   Document field table name (example: 'ls').
	 * @param {docFieldName}   Document field name (example: 'doc').
	 * @param {docFileName}    Document file name (example: 'ls-001-doc.doc').
	 * @param {imageElementId} Optional, ID of the DOM element that will display image document.
	 */
	showDocument: function(keys, docTableName, docFieldName, docFileName, imageElementId) {
	    var isImage = function(docFileName) {
	        var isImage = false;
	        var extension = docFileName.substring(docFileName.lastIndexOf('.') + 1);
	        if (valueExistsNotEmpty(extension)) {
	            extension = extension.toLowerCase();
	            isImage = (extension == 'bmp' || 
	                       extension == 'gif' || 
	                       extension == 'jpg' || 
	                       extension == 'png');
	        }
	        return isImage;
	    };
		
        if (isImage(docFileName)) {
            // image document, should be displayed in an image field on this form
            DocumentService.getImage(keys, docTableName, docFieldName, '1', true, {
                callback: function(image) {
                    if (valueExists(imageElementId)) {
                        dwr.util.setValue(imageElementId, image);
                    } else {
                        View.openDialog(image);
                    }
                },
                errorHandler: function(m, e) {
                    View.showException(e);
                }
            });
        } else {
            // application document, should be handled by the browser using iframe managed by DWR
            DocumentService.show(keys, docTableName, docFieldName, docFileName, '', true, 'showDocument', {
                callback: function(fileTransfer) {
                    dwr.engine.openInDownload(fileTransfer);
                },
                errorHandler: function(m, e) {
                    View.showException(e);
                }
            });
        }
	},
    
    /**
     * Opens the progress bar in the auto-updating mode.
     * @param {message} Optional: message to display.
     * @param {config} Optional: progress bar config object.
     */
    openProgressBar: function(message, config) {
	    this.initializeProgressBar(message);
	    
	    if (!valueExists(config)) {
	    	config = {
	    	    interval: 500
	    	};
	    }
        this.progressBar.wait(config);
    },
    
    /**
     * Updates the current progress bar.
     * 
     * @param {progress} The current progress, between 0 and 1.
     */
    updateProgressBar: function(progress) {
    	View.progressBar.updateProgress(progress);
    },
    
    /**
     * Opens the progress bar for specified job.
     * 
     * @param message the progress bar dialog title.
     * @param jobId the ID of the running job instance to display status for.
     * @param resultViewName [optional] if set, the dialog will load specified view after the job execution is complete. 
     */
    openJobProgressBar: function(message, jobId, resultViewName, callback, errorCallback) {
        var runner = new Ext.util.TaskRunner();

        var progressBar = this.initializeProgressBar(message, [{
            text: this.getLocalizedString(Ab.view.View.z_TITLE_STOP_JOB), 
            handler: function() {
                Workflow.stopJob(jobId);
            }
        }, {
            text: this.getLocalizedString(Ab.view.View.z_TITLE_CLOSE), 
            handler: function() {
                runner.stopAll();
                View.closeProgressBar();
            }
        }]);
        
        var task = {
            run: function() {
        	try {
                // get the latest job status
                var status = Workflow.getJobStatus(jobId);
                
                if (valueExists(progressBar)) {
                    // update the progress bar
	                var progress = 0;
	                if (status.jobTotalNumber > 0) {
	                    progress = status.jobCurrentNumber / status.jobTotalNumber;
	                }
	                progressBar.updateProgress(progress);

	                // update the dialog title
	                if (valueExistsNotEmpty(status.jobMessage)) {
	                    View.progressWindow.setTitle(message + ' - ' + status.jobMessage);
	                }
                }
                
                if (status.jobFinished) {
                    // stop updating the progress bar
                    runner.stop(task);
                    
                    if (valueExists(progressBar)) {
	                    // disable the Stop Job button
                        View.progressWindow.buttons[0].disable();
	                    
		                // update the dialog title
	                    var title = View.progressWindow.title + ' - ' + View.getLocalizedString(Ab.view.View.z_TITLE_JOB_COMPLETE);
	                    View.progressWindow.setTitle(title);
                    }
                    
                    // if result view is specified, display it
                    if (valueExistsNotEmpty(resultViewName)) {
                        View.loadView(resultViewName);
                        
                    // if callback is specified, close the dialog and pass the status to the callback
                    } else if (valueExists(callback)) {
                        // but delay closing for a second so that the user can catch the last progress reading
                        (function(){
                            View.closeProgressBar();
                            callback(status);
                        }).defer(1000);
                    }
                }
                
                if (status.jobStatusCode == 8) {
                	// job has failed
                	if (valueExists(errorCallback)) {
                        // stop updating the progress bar
                        runner.stop(task);
                        (function(){
                            View.closeProgressBar();
                            errorCallback(status);
                        }).defer(1000);
                	}
                }
        	} catch (e) {
        		runner.stop(task);
        		Workflow.handleError(e);
        	}
        	},
            interval: 1000
        }
        runner.start(task);        
    },
    
    /**
     * Creates the progress bar dialog.
     * 
     * @returns the Ext.ProgressBar instance.
     */
    initializeProgressBar: function(message, buttons) {
        this.progressBarRequestors++;
        
        if (this.progressWindow) {
            return null;
        }
        
        var windowConfig = {
            width: 500,
            height: 'auto',
            closable: false,
            modal: true,
            title: valueExists(message) ? message : this.getLocalizedString(this.z_MESSAGE_LOADING)
        };
        if (valueExists(buttons)) {
            windowConfig.buttons = buttons;
        }
        this.progressWindow = new Ext.Window(windowConfig);
        this.progressWindow.show();
        this.progressBar = new Ext.ProgressBar({
            renderTo: this.progressWindow.body
        });
        
        return this.progressBar;
    },
    
    /**
     * Closes the progress bar.
     */
    closeProgressBar: function() {
		if (this.progressBarRequestors > 0) {
			this.progressBarRequestors--;
		}
		
        if (this.progressBarRequestors == 0 && this.progressWindow) {
            this.progressBar.reset();
            this.progressWindow.close();
            this.progressWindow = null;
        }        
    },

    /**
     * Returns a reference to the parent tab that loaded this view.
     * @return Ab.tabs.Tab.
     */
    getParentTab: function() {
        var parentTab = null;

        var parentView = this.getOpenerView();
        var parentFrame = window.frameElement;
        if (parentFrame && parentView) {
            var tabName = parentFrame.name;

            parentView.panels.each(function(panel) {
                if (panel.type === 'tabs') {
                    for (var i = 0; i < panel.tabs.length; i++) {
                        var tab = panel.tabs[i];
                        if (tab.name === tabName || tab.name + '_frame' === tabName) {
                            parentTab = tab;
                            break;
                        }
                    }
                }
            });
        }

        return parentTab;
    },

    /**
     * Returns a reference to the parent view panel that loaded this view.
     * @return Ab.view.ViewPanel.
     */
    getParentViewPanel: function() {
        var viewPanel = null;

        var parentView = this.getOpenerView();
        var parentFrame = window.frameElement;
        if (parentFrame && parentView) {
            var viewPanelId = parentFrame.name.substring(0, parentFrame.name.indexOf('_iframe'));
            viewPanel = parentView.panels.get(viewPanelId);
        }

        return viewPanel;
    },

    /**
     * Returns window that has opened the child window or dialog where this View object is defined.
     */
    getOpenerWindow: function() {
        var openerWindow = opener;

        // if this dialog uses Ext.Dialog
        if (openerWindow == null) {
            openerWindow = parent;
        }        

        // if this dialog has frames
        if (openerWindow == null && top) {
            openerWindow = top.opener;
        }   
        //finally window object
        if(openerWindow == null){
        	openerWindow = window;
        }
        // check if the opener window belongs to the same domain
        try {
            var openerName = openerWindow.name;
        } catch (e) {
            // opener window has a different domain
            openerWindow = parent;
        }

        // if the opener window is the navigation page, return this window because it is the topmost
        try {
            if (openerWindow.applicationsTabHtmlFragment) {
                openerWindow = window;
            }
        } catch (e) {
            // unexpected error - there is nothing to do
        }

        return openerWindow;
    },
    
    /**
     * Returns View that has opened the child window or dialog where this View object is defined.
     */
    getOpenerView: function() {
        return this.getOpenerWindow().View;
    },
    
    /**
     * Returns target window or frame specified by name.
     * @param {target}      Target window name: self|parent|top|opener|dialog|frame_name.
     */
    getWindow: function(targetName) {
        var target = null;
        if (targetName == 'self' || targetName == '' || targetName == null) {
            target = self;
        } else if (targetName == 'parent') {
            target = parent;
        } else if (targetName == 'top') {
            target = top;
        } else if (targetName == 'opener') {
            target = opener;
            if (target == null) {
                target = parent.opener;
            }
        } else if (targetName == 'dialog') {
            target = this.dialog;
        } else {
            target = getFrameObject(parent, targetName);
            if (target == null) {
                target = getFrameObject(parent, targetName + '_iframe');
            }
        }
        if (target == null) {
            target = top;
        }
        // try target name + '_iframe' 
        if (target == null) {
        	target = this.getWindow(targetName + '_iframe');
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
            view = targetWindow.Ab.view.View;  
        }
        return view;
    },
    
    /**
     * Returns Ab.view.Layout object with specified name.
     * @param {layoutName} Layout name. If empty or not specified, returns default view layout.
     */
    getLayoutManager: function(layoutName) {
        var layoutManager = this.defaultLayoutManager;
        if (valueExistsNotEmpty(layoutName)) {
            for (var i = 0; i < this.layoutManagers.length; i++) {
                if (this.layoutManagers[i].id == layoutName) {
                    layoutManager = this.layoutManagers[i];
                    break;
                }
            }
        }
        return layoutManager;
    },

    /**
     * Finds layout and region by unique region ID.
     * @param {id} Layout region ID.
     * @return {layoutName, regionName}
     */
    getLayoutAndRegionById: function(id) {
        var result = null;
        for (var i = 0; i < this.layoutManagers.length; i++) {
            var layoutManager = this.layoutManagers[i];
            var regionName = layoutManager.getRegionNameById(id); 
            if (regionName != null) {
                result = {'layout': layoutManager.id, 'region': regionName, 'layoutManager': layoutManager};
                break;
            }
        }
        return result;
    },

    /**
     * Add a specific control to the hash of controls managed by this view.
     * @param {controlId}   View-unique control ID.
     * @param {control}     Control reference.
     */
	registerControl: function(controlId, control) {
		this.panels.add(controlId, control);
		
		// first registered control is the main panel 
		if (this.mainPanelId == null && controlId !== 'viewToolbar') {
		    this.mainPanelId = controlId;
		}
	},

    /**
     * Return a specific control from the registry, or null if not found.
     * Check specified view first. If control is not found, check its parent view.
	 * 
     * @param {win}       Window/frame that contains the view object that manages the control;
	 *                    Alternatively can be a name of the window: self|opener|dialog|frame_name.
     * @param {controlId} ID of the control.
     */
	getControl: function(win, controlId) {
		var control = null;
		
        if (!valueExists(controlId)) {
            // the first parameter is the controlId, not the window name
            controlId = win;
            win = self;
        }
		
		if (typeof(win) == 'string') {
		    win = this.getWindow(win);
		}
		
		// non-Yalta view - no controls in here
		if (!valueExists(win.Ab) || !valueExists(win.Ab.view) || !valueExists(win.Ab.view.View)) {
            return null;
		}
		
		var targetView = win.Ab.view.View;
		control = targetView.panels.get(controlId);
        
        if (control == null && win.parent != null && win.parent != win) {
            control = this.getControl(win.parent, controlId);
        }

        // KB 3036336 when control is within a framed view
        if (control == null && targetView != null) {
            for (var i = 0, parentPanel; parentPanel = targetView.panels.items[i]; i++) {
                if (parentPanel.contentView != null) {
                    control = parentPanel.contentView.panels.get(controlId);
                    if (controlId != null) {
                        break;
                    }
                }
            }
        }

        return control;
	},
	
	/**
	 * Returns an array of controls of specified type.
	 * If type is undefined or empty, returns all controls for specified window.
	 */
	getControlsByType: function(win, controlType) {
        var controls = [];

        if (typeof(win) == 'string') {
            win = this.getWindow(win);
        }

        var targetView = win.Ab.view.View;
		if (targetView) {
			targetView.panels.each(function(panel) {
				if (panel.type == controlType || !valueExistsNotEmpty(controlType)) {
					controls.push(panel);
				}
			});
		}
        return controls;	
	},

	/**
	 * Localize control display strings
	 *  read from Ab.localization.Localization object's localizedString array
	 * getLocalizedMessage: function(key1, key3)
	 */
	getLocalizedString: function(key3) {
		var localString = key3;
		if (typeof(Ab.localization) != 'undefined') {
			for (var i=0, msg; msg = Ab.localization.Localization.localizedStrings[i]; i++) {
				if (msg.key3 == key3) {
					(msg.value == '') ? localString = '*' + msg.key3 : localString = msg.value;
					return localString;
				}
			}
		}
		
		if(valueExistsNotEmpty(localString)){
			localString = convertFromXMLValue(localString);
		}
		
		return localString;
	},

	/**
	 * Returns currency code for specified symbol.
	 */
	currencyCodeFor: function(symbol) {
		var code = '';
		for (var i = 0; i < View.project.currencies.length; i++) {
			var currency = View.project.currencies[i];
			if (currency.symbol == symbol) {
				code = currency.code;
				break;
			}
		}
		
		return code;
	},

	/**
	 * Returns currency symbol for specified currency code.
	 */
	currencySymbolFor: function(code) {
		var symbol = '';
		for (var i = 0; i < View.project.currencies.length; i++) {
			var currency = View.project.currencies[i];
			if (currency.code == code) {
				symbol = currency.symbol;
				break;
			}
		}
		
		return symbol;
	},

    /**
     * Client-side implementation of User.isMemberOfGroup(). 
     * TODO: port complete server-side implementation.
     */	
	isMemberOfGroup: function(user, group) {
		if(group === ''){
			return true;
		}
		group = group.toLowerCase();
		
		for (var i = 0; i < user.groups.length; i++) {
			var userGroup = user.groups[i];
			userGroup = userGroup.toLowerCase();
	        if (userGroup === '%') {
                return true;
	        }
	        
	        var beginsWithWildCard = (userGroup.match("^%") != null);
            var bEndsWildCard = (userGroup.match("%$") != null );
            
            if (beginsWithWildCard) {
                // exclude beginning wild card
                userGroup = userGroup.substring(1);
            }

            if (bEndsWildCard) {
                // exclude ending wild card
                userGroup = userGroup.substring(0, userGroup.length - 1);
            }
            
            var userGroupAtTheEnd = false;
            var userGroupAtTheStart = false;
            var userGroupAnywhere = false;
            if (beginsWithWildCard) {
                if (bEndsWildCard) {
                    userGroupAnywhere = true;
                } else {
                    userGroupAtTheEnd = true;
                }
            } else {
                if (bEndsWildCard) {
                    userGroupAtTheStart = true;
                }
            }

            var matches = false;
            if (userGroupAnywhere) {
                // check if user group could be found in the  group name
                matches = group.indexOf(userGroup) > -1 ? true : false;
            } else if (userGroupAtTheEnd) {
                // check if user group mathes the end of the  group name
                matches = (group.match(userGroup+"$") != null);
            } else if (userGroupAtTheStart) {
                // check if user group mathes the start of the  group name
                matches = (group.match("^"+userGroup) != null);
            } else {
                // check if the group matches the beginning of the user group name
                matches = (userGroup.match("^"+group) != null);
            }
            
            if (matches) {
                return true;
            }
			
		}
		
	    return false;
	},
	
	/**
	 * Returns true if at least one of specified processes is assigned to the current user or role.
	 * 
     * @param activitiesAndProcesses The array of objects. Each object contains the activity ID (a
     *        string) and a list of process IDs for that activity (array of strings).
     *        
     * Example of use:
     *     View.isProcessAssignedToUser([{
     *         activityId: 'AbCapitalBudgeting',
     *         processIds: ['Allocate', 'Approve']
     *     }, {
     *         activityId: 'AbDashboardDepartment',
     *         processIds: ['Budgeting']
     *     }]);
	 */
	isProcessAssignedToUser: function(activitiesAndProcesses) {
		try {
			var result = Workflow.callMethod('AbSystemAdministration-ConfigHandlers-isProcessAssignedToUser', 
				activitiesAndProcesses);
			return result.value;
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Converts Java date/time format specifier into Ext.JS format specifier.
	 * See Ext.Date and java.text.SimpleDateFormat API docs.
	 * 
	 * @param {dateFormat} Java format specifier string.
	 * @return Ext format specifier string.
	 * 
	 * Conversion rules:
	 * 
	 * Component       Java pattern    Ext pattern
	 * -------------------------------------------
	 * short year      y yy yyy        y
	 * long year       yyyy+           Y
	 * short month     M MM            m
	 * long month      MMM             M
	 * full month      MMMM+           F
	 * day in a month  d               j
	 * day in a week   E EE EEE        D
	 * day in a week   EEEE+           l
	 * AM/PM           a               A
	 * hour in a day   H+              G
	 * hour, AM/PM     h+              g
	 * minute          m+              i
	 * second          s+              s
	 * millisecond     S+              u
	 * time zone       z               T
	 * time zone 822   Z               O
	 * 
	 * Example conversion for en_US (default afm-config.xml settings):
	 *  
     * 'M/d/yyyy' --> 'n/j/Y'
     * 'h:mm a' --> 'g:i a'
     * 
     * Performance note: regular expressions are not optimized. Since this function is called
     * only two times per view loading, the performance is not a concern.
	 */
	convertJavaDateFormat: function(dateFormat) {
        dateFormat = dateFormat.replace(/H+/g, 'G');
        dateFormat = dateFormat.replace(/h+/g, 'g');
        dateFormat = dateFormat.replace(/m+/g, 'i');
        dateFormat = dateFormat.replace(/s+/g, 's');
        dateFormat = dateFormat.replace(/S+/g, 'u');
        dateFormat = dateFormat.replace(/a/g, 'A');
        dateFormat = dateFormat.replace(/z/g, 'T');
        dateFormat = dateFormat.replace(/Z/g, 'O');
        dateFormat = dateFormat.replace(/Y{3,}/g, 'X'); // X is a placeholder
        dateFormat = dateFormat.replace(/y{3,}/g, 'x'); // x is a placeholder
        dateFormat = dateFormat.replace(/Y{1,2}/g, 'y');
	    dateFormat = dateFormat.replace(/y{1,2}/g, 'y');
        dateFormat = dateFormat.replace(/X/g, 'Y');     // replace X placeholders
        dateFormat = dateFormat.replace(/x/g, 'Y');     // replace x placeholders
        dateFormat = dateFormat.replace(/M{4,}/g, 'F');
        dateFormat = dateFormat.replace(/M{3}/g, 'M');
        dateFormat = dateFormat.replace(/M{1,2}/g, 'm');
        dateFormat = dateFormat.replace(/D+/g, 'j');
        dateFormat = dateFormat.replace(/d+/g, 'j');
        dateFormat = dateFormat.replace(/E{4,}/g, 'l');
        dateFormat = dateFormat.replace(/E{1,3}/g, 'D');
	    return dateFormat;
	},
	
	onPrintView: function() {
        //target frame object must be focused at first
        self.focus();
        //if objFrame has frames, leave the choice that what'll be
        //printed to users 
        self.print();
	},
	
	onEmailView: function() {
		this.openDialog(Ab.view.View.contextPath + '/schema/ab-core/views/ab-system-send-view-link.axvw',
		    null, false, 0, 0, 750, 350);
	},
	

	onAddFavorite: function() {
		var result = null;
		var task = this.taskRecord;
		if (task == null) {
			View.showMessage('error', View.getLocalizedString(this.z_MESSAGE_NO_TASK_MYFAVORITE));
			return;
		}
		// source view may be an afm_ptask (PNav view) or a afm_process (Dashboard view)
		var isPtask = true;

		var viewName = task.getValue('afm_ptasks.task_file');
		if (typeof viewName == 'undefined') {
			viewName = task.getValue('afm_processes.dashboard_view');
			isPtask = false;
		}
		if (typeof viewName == 'undefined') {
			View.showMessage('error', View.getLocalizedString(this.z_MESSAGE_NO_TASK_MYFAVORITE));
			return;
		}
		var userName = this.user.name;
		var myFavoriteExists = false;
		
		// is the current view a myFavorite? if yes, reset confirm dialog message
		if (task.getValue('afm_ptasks.is_hotlist.raw') == '1' && task.getValue('afm_ptasks.hot_user_name') == userName) {
				myFavoriteExists = true;
				viewName = viewName.substring(0, viewName.indexOf('-' + userName)) + '.axvw';
		}
		else {  // does this user already have a myFavorite for the current view?
			var favViewName = viewName.substring(0, viewName.indexOf('.axvw')) + '-' + userName + '.axvw'
			result = Workflow.call('AbSystemAdministration-checkIfViewExists', { fileName: favViewName });
			if (result.data.recordExists == 'true' ) {
				myFavoriteExists = true;
			}
		}
		var message = myFavoriteExists? this.getLocalizedString(Ab.view.View.z_MESSAGE_OVERWRITE_MYFAVORITE) : this.getLocalizedString(Ab.view.View.z_MESSAGE_ADD_MYFAVORITE);

		// confirm add view to myFavorites
		View.confirm(message, function(button) {
			if (button == 'yes') {
				var parameters = new Object();
				parameters.viewName = viewName;
				parameters.isWritePtask = !myFavoriteExists;

				parameters.taskId = isPtask ? task.getValue('afm_ptasks.task_id.key') : task.getValue('afm_processes.title');
				parameters.taskIdLocalized = isPtask ? task.getValue('afm_ptasks.task_id') : task.getValue('afm_processes.title');
				parameters.processId = isPtask ? task.getValue('afm_ptasks.process_id') : task.getValue('afm_processes.process_id');
				parameters.activityId = isPtask ? task.getValue('afm_ptasks.activity_id') : task.getValue('afm_processes.activity_id');

				try {
					Workflow.call('AbSystemAdministration-addViewToMyFavorites', parameters);
					// TODO: save for localization in next release
					// message = View.getLocalizedString(viewLocal.z_MESSAGE_ADD_FAIL_MYFAVORITE);
					// View.alert(message);
				} catch (e) {
					// TODO: save for localization in next release
					// message = View.getLocalizedString(viewLocal.z_MESSAGE_ADD_FAIL_MYFAVORITE);
					// View.showMessage('error', message, e.message);
					View.showMessage('error', e.message);
				}
			}
		});
	},

    
    onLogger: function() {
        if (!this.logWindow) {
            Ext.get('logger').setStyle('font-size', '12px');
            this.logWindow = new Ext.Window({
                title: 'Log Console',
                contentEl: 'logger',
                autoScroll: true,
                collapsible: true,
				maximizable: true,
                layout: 'fit',
                width: 800,
                height: 600,
                closeAction: 'hide'
            });
            this.logReader = new YAHOO.widget.LogReader('logger', {
                newestOnTop: false,
                verboseOutput: false
            });
            Ext.get('yui-log-hd0').remove();
        }
        if (this.logWindow.isVisible()) {
            this.logWindow.hide();
        }
        else {
            this.logWindow.show();
        }
    },
    
	/**
	 * Returns absolute base URL of the web application, for example:
	 * http://localhost:8080/archibus
     * https://localhost:8443/archibus
	 */
	getBaseUrl: function() {
		return window.location.protocol + '//' + window.location.host + this.contextPath;
	},

    /**
     * Returns absolute URL of specified file path.
     * @param {path} The relative file path, e.g.           schema/ab-core/views/process-navigator/logout-preauth.htm
     * @return The URL, e.g. http://localhost:8080/archibus/schema/ab-core/views/process-navigator/logout-preauth.htm
     */
    getUrlForPath: function(path) {
        return this.getBaseUrl() + '/' + path;
    },

    // ----------------------- support for app controllers ----------------------------------------

    /**
     * Static factory method. Creates new controller object.
     * @param {name} Controller name.
     * @param {config} Controller configuration.
     */
    createController: function(id, config) {
        var controllerClass = Ab.view.Controller.extend(config);
        var controller = new (controllerClass);
        controller.extend = new Base().extend;
        return this.initController(id, controller);
    },
    
    /**
     * Static factory method. Creates a controller object that extends another (base) controller.
     * @param {name} Controller name.
     * @param {baseController} Base controller class.
     * @param {config} Controller configuration.
     */
    extendController: function(id, baseController, config) {
        var controller = new (baseController.extend(config));
        return this.initController(id, controller);
    },
    
    /**
     * Private method.
     */
    initController: function(id, controller) {
		controller.id = id;
        controller.view = this;
        this.controllers.add(id, controller);

        // set up Backbone.View properties
        controller.setElement(jQuery('body'), false);
        controller.delegateEvents(controller.events);

        if (controller.afterCreate) {
            controller.afterCreate();
        }
		
		// if controller is created after the view is fully loaded, 
		// still call the controller's lifecycle callbacks
		if (this.state === this.STATE_READY) {
			controller._afterViewLoad();
			controller.afterInitialDataFetch();
		}

        return controller;
    },

    // ----------------------- support for job progress dialog ------------------------------------
    
    /**
     * Static factory method. Open a dialog with the specified job's status
     * @param {jobId} Current Job's Id.
     */
    openJobStatusDialog: function(jobId){
	
		// call the WFR to get the job status 
        var result = Workflow.getJobStatus(jobId);
        
        if (result.code == 'executed') 
	    {
			// has any result returned from WFR?
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				result.data = eval('(' + result.jsonExpression + ')');
				var strJobStatus= this.getLocalizedString(Ab.view.View.z_MESSAGE_JOBSTATUS);
				strJobStatus = strJobStatus.replace(/jobId/g, jobId);
				
				//check if the job status div already exist, if so, remove it
	    		var job_status_div = Ext.get('job_status_div');
       			if (job_status_div == null) {
       				// create new job status DIV
       				var html = '<div id="job_status_div" class="x-hidden">'
			                 + '<div class="x-window-header"> </div>' 
			                 + '<div id="x-window-body">' + strJobStatus + result.data.jobStatus  + '</div>'
			                 + '</div>';
			        Ext.DomHelper.insertHtml('afterBegin', document.body, html);
        		} else {
        			var html = '<div class="x-window-header"> </div>' 
			                 + '<div id="x-window-body">' + strJobStatus + result.data.jobStatus  + '</div>';
        			// reset job status DIV content
        			Ext.DomHelper.overwrite(job_status_div, html, true);
        		}
        
            	if (!this.jobStatusDialog) {
            	
            		// create a new job status dialog
		            this.jobStatusDialog = new Ext.Window({
		                title: 'Job Status',
		                contentEl: 'job_status_div',
		                autoScroll: true,
		                collapsible: true,
						maximizable: true,
		                layout: 'fit',
		                width: 400,
		                height: 200,
		                closeAction: 'hide'
		            });
		        }
		       	
		       	// show the job status dialog
		        this.jobStatusDialog.show();
			}	    	
	   	}
        
    },
    
    /**
     * Static factory method. Hide the job status dialog window
     */
    closeJobStatusDialog: function(){
    	if (!this.jobStatusDialog) {
        	this.jobStatusDialog.hide();
        }
    }
}));

/**
 * Shortcut View reference.
 */
View = Ab.view.View;


/**
 * Shortcut compatibility reference.
 */
AFM = Ab;


/**
 * Contains view parameters for the controls that are based on the view format.
 * The view can be defined either by the AXVW view name, or by the table and fields.
 */
Ab.view.ViewDef = Base.extend({
    // view name
    viewName: null,

	// index into tableGroups within view definition. default to first (0th)
	tableGroupIndex: 0,
    
    // main table name
    tableName: null,
    
    // array of field names to be displayed
    fieldNames: null,

	// id of the datasource within the view, for multi-datasource views
	dataSourceId: null,

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
    constructor: function(viewName, tableGroupIndex, tableName, fieldNames, dataSourceId) {
        this.viewName = viewName;
        if (typeof tableName != 'undefined') {
            this.tableName = tableName;
            this.fieldNames = fieldNames;
        }
		this.tableGroupIndex = tableGroupIndex;
		if (typeof dataSourceId != 'undefined') {
			this.dataSourceId = dataSourceId;
		}
    },
    
    /**
     * Returns field name array in JSON format.
     */
    getFields: function() {
        return this.fieldNames;
    }
});


/**
 * Base class for application controllers.
 */
Ab.view.Controller = Backbone.View.extend({

    /**
     * Compatibility stub for legacy code that calls this.inherit() from afterViewLoad().
     */
    inherit: function() {
    },

    /**
     * Callback function called after the view is loaded. Do not override.
     */
    _afterViewLoad: function() {
        var controller = this;

        // auto-wire references to all view panels as this controller data members
        View.panels.eachKey(function (name) {
            var panel = View.panels.get(name);
            controller.autoWirePanel(panel);
        });
        
        // auto-wire references to all view data sources
        View.dataSources.eachKey(function (name) {
            var dataSource = View.dataSources.get(name);
            controller[name] = dataSource;
        });
        
        this.afterViewLoad();
    },
    
    /**
     * Callback function called after the layout is initialized.
     * Override this function to provide application-specific behavior.
     */
    afterLayout: function() {},

    /**
     * Callback function called after the view is loaded.
     * Override this function to provide application-specific behavior.
     */
    afterViewLoad: function() {},

    /**
     * Callback function called after the view is loaded and the initial data fetch is complate.
     * Controller equivalent to user_form_onload() function. 
     * Override this function to provide application-specific behavior.
     */
    afterInitialDataFetch: function() {},
    
    /**
     * Callback function called after the view is refreshed (i.e. its refresh() method is called).
     * Override this function to provide application-specific behavior.
     */
    afterRefresh: function(restriction, newRecord, clearRestriction) {},

    /**
     * Auto-wires all action and event handlers in specified panel to this controller.
     */
    autoWirePanel: function(panel) {
        var controller = this;

        // auto-wire panel reference, to be used as this.panelId in controller methods
        var name = panel.id;
        controller[name] = panel;

        // auto-wire event listeners for controller functions that match "panelId_onButtonId" 
        panel.actions.each(function (action) {
            var eventHandler = controller[name + '_on' + capitalizeFirst(action.id)];
            if (valueExists(eventHandler) && eventHandler.constructor == Function) {
                panel.addActionListener(action.id, eventHandler, controller);
            }
        });

        // auto-wire event listeners for controller functions that match "panelId_onButtonId" 
        if (panel.actionbar) {
            panel.actionbar.actions.each(function (action) {
                var eventHandler = controller[name + '_on' + capitalizeFirst(action.id)];
                if (valueExists(eventHandler) && eventHandler.constructor == Function) {
                    panel.addActionbarActionListener(action.id, eventHandler, controller);
                }
            });
        }
                
        // auto-wire event listeners for controller functions that match "panelId_eventName"
        panel.eventListeners.eachKey(function (eventName) {
            controller.autoWireEventListener(panel, eventName);
        });
        this.autoWireEventListener(panel, 'onClickItem');
        this.autoWireEventListener(panel, 'onMultipleSelectionChange');

        // auto-wire drag-and-drop event listeners if defined in the controller
        var dragDropListener = controller[name + '_onDragDrop'];
        if (valueExists(dragDropListener)) {
            panel.addDragDropListener(dragDropListener, controller);
        }
        var dragOverListener = controller[name + '_onDragOver'];
        if (valueExists(dragOverListener)) {
            panel.addDragOverListener(dragOverListener, controller);
        }

        if (panel.type == 'form') {
            this.autoWireFormFields(panel);
        } else if (panel.type == 'grid') {
            this.autoWireGridRows(panel);
        }
    },

	/**
	 * Auto-wire form per-field action listeners.
	 */
	autoWireFormFields: function(panel) {
        var controller = this;

        panel.fields.each(function (field) {
            field.actions.each(function (action) {
                controller.autoWireActionListener(panel, field, action);
            });
        });
        panel.fieldsets.each(function (fieldset) {
            fieldset.actions.each(function (action) {
                controller.autoWireActionListener(panel, fieldset, action);
            });
        });
    },
    
    /**
     * Auto-wire per-row grid action listeners.
     */
    autoWireGridRows: function(panel) {
        var controller = this;

        panel.gridRows.each(function (row) {
            row.actions.each(function (action) {
                controller.autoWireActionListener(panel, row, action);
            });
        });
    },

    /**
     * Helper method that auto-wires specified event listener to an action,
     * if the listener function that matches the action ID exists in the controller.
     * @param {Object} panel
     * @param {String} eventName    The event name, e.q. 'onClickitem'
     */
    autoWireEventListener: function(panel, eventName) {
        var listener = this[panel.id + '_' + eventName];
        if (valueExists(listener) && listener.constructor == Function) {
            panel.addEventListener(eventName, listener, this);
        }
    },
    
    /**
     * Helper method that auto-wires specified event listener to an action,
     * if the listener function that matches the action ID exists in the controller.
     * @param {Object} panel
     * @param {Object} parentObject
     * @param {Object} action
     */
    autoWireActionListener: function(panel, parentObject, action) {
        var eventHandlerName = panel.id + '_on' + capitalizeFirst(action.originalId);
        var eventHandler = this[eventHandlerName];
        
        if (!valueExists(eventHandler)) {
            eventHandlerName = panel.id + '_' + action.originalId + '_onClick';
            eventHandler = this[eventHandlerName];
        }
        
        if (valueExists(eventHandler) && eventHandler.constructor == Function) {
            var listener = eventHandler.createDelegate(this, [parentObject, action]);
            action.addListener(listener);
        }
    },

    on: function(events, callback) {
        View.eventAggregator.on(events, callback, this);
    },

    trigger: function(events, parameter1, parameter2, parameter3) {
        View.eventAggregator.trigger(events, parameter1, parameter2, parameter3);
    }
});

/**
 * Returns a copy of the input string with capitalized first character.
 * @param {Object} s
 */
function capitalizeFirst(s) {
    var result = s.substring(0, 1).toUpperCase() + s.substring(1, s.length);
    return result.replace('.', '_');
}

/**
 * Encapsulates a template defined in the view. The template HTML content is loaded as a part of
 * the HTML page inside a <script> tag.
 */
Ab.view.Template = Base.extend({

    // the template ID
    id: '',

    // the compiled template function
    template: null,

    /**
     * Constructor.
     * @param id
     */
    constructor: function(id) {
        this.id = id;
        var html   = jQuery('#' + id).html();
        this.template = Handlebars.compile(html);
    },

    /**
     * Evaluates the template with specified context.
     * @param context       The template evaluation context containing data values to render.
     */
    evaluate: function(context) {
        return this.template(context);
    },

    /**
     * Evaluates the template with specified context and renders the result as a child of specified DOM element.
     * @param context       The template evaluation context containing data values to render.
     * @param parentElement Optional: the DOM element to append the rendered HTML to.
     * @param position      Optional: 'before' to prepend the HTML before the first child of the parent element,
     *                      'after' to append the HTML after the last child of the parent element,
     *                      defaults to 'after'.
     */
    render: function(context, parentElement, position) {
        var html = this.evaluate(context);

        if (valueExists(parentElement)) {
            if ('before' === position) {
                jQuery(parentElement).prepend(html);
            } else {
                jQuery(parentElement).append(html);
            }
        }

        return html;
    }
});

/**
 * Provider of local storage that persists between different sessions of the same user.
 * There is only one global provider in the Web Central application instance.
 *
 * This implementation uses HTML5 LocalStorage, supported in  IE 8+, FF 3.5+, Chrome, and Safari.
 * Local storage is not supported in IE7 and below and FF 3.0 and below.
 * See http://coding.smashingmagazine.com/2010/10/11/local-storage-and-how-to-use-it/.
 *
 * Local storage stores all values as strings. We convert JS objects to JSON strings to store them.
 *
 * Stored values never expire. Users can clear local storage using the browser menu:
 * FF: Tools -> Clear Recent History -> Cookies
 * IE: Tools -> Delete Browsing History -> Cookies
 */
Ab.view.LocalStorageProvider = Base.extend({
    // no instance data or methods
}, {
    /**
     * Loads the data from local storage.
     */
    load: function(id, data) {
        if (localStorage) {
            // JSON.parse() is not supported in IE8-
            var json = eval('(' + localStorage.getItem(id) + ')');
            data.fromJSON(json);
        }
    },

    /**
     * Saves the data to local storage.
     */
    save: function(id, data) {
        if (localStorage) {
            // JSON.stringify() is not supported in IE8-
            localStorage.setItem(id, toJSON(data.toJSON()));
        }
    }
});

/**
 * View sidecar stores user preferences. Each panel can have its own sidecar instance.
 */
Ab.view.Sidecar = Backbone.Model.extend({
    /**
     * Default values of attributes.
     */
    defaults: {
        columns: [],
        levels: [],
        recentSearches: [],
        maxRecentSearches: 15
    },

    /**
     * Constructor.
     * @param attributes An object containing initial values of the attributes.
     */
    initialize: function(attributes) {
        // load from local storage
        this.load();

        // attach the add() method to the array instance to prevent duplicate or empty searches
        var max = this.get('maxRecentSearches');
        this.get('recentSearches').add = function(search) {
            var duplicate = null;
            for (var i = 0; i < this.length; i++) {
                if (this[i].equals(search)) {
                    duplicate = this[i];
                    break;
                }
            }

            if (!duplicate && search) {
                this.push(search);
            }

            if (this.length > max) {
                this.shift();
            }
        }
    },

    /**
     * De-serializes state of this object from JSON data.
     * @param data
     */
    fromJSON: function(data) {
        this.set(this.defaults);

        if (data) {
            this.set(data);

            var recentSearches = [];
            for (var i = 0; i < data.recentSearches.length; i++) {
                var search = new Ab.view.Restriction();
                search.fromJSON(data.recentSearches[i]);
                recentSearches.push(search);
            }
            this.set('recentSearches', recentSearches);
        }
    },

    /**
     * Serializes state of this object to JSON data.
     */
    toJSON: function() {
        var data = {};

        _.each(this.attributes, function(value, key) {
            if (value instanceof Backbone.Collection) {
                data[key] = value.toJSON();
            } else {
                data[key] = _.clone(value);
            }
        });

        data.recentSearches = [];
        _.each(this.get('recentSearches'), function(search) {
            data.recentSearches.push(search.toJSON());
        });

        return data;
    },

    /**
     * Loads the sidecar from the local storage provider.
     */
    load: function() {
        Ab.view.LocalStorageProvider.load(this.get('panelId'), this);
    },

    /**
     * Saves the sidecar to the local storage provider.
     */
    save: function() {
        Ab.view.LocalStorageProvider.save(this.get('panelId'), this);
    }
});
