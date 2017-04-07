/**
 * Declare the namespace for the navigator JS classes.
 */
Ab.namespace('navigator');

/**
 * Base controller class for Navigator and Dashboard controllers. 
 * The controller is a non-visual object that loads the navigator model and updates the view.
 */
Ab.navigator.BaseController = Base.extend({
	
	// reference to the Ab.view.ViewPanel that displays content views
	viewPanel: null,
	
	// reference to the Ab.navigator.Model
	model: null,
	
	// parent view name
	viewName: null,
	
	// prefix of the data source names to be used to read the model
	dataSourcePrefix: '',
	
    // false if there are no activities for the current user
    hasActivities: true,

	/**
	 * Constructor.
	 */
	constructor: function(viewName, dataSourcePrefix, viewPanel) {
	    this.viewName = viewName;
	    this.dataSourcePrefix = dataSourcePrefix;
        this.viewPanel = viewPanel;
		this.model = new Ab.navigator.Model();
	},
	
	/**
	 * Load records for the current level.
	 * @param {restriction} optional restriction; if not specified, the selected record PK is used.
	 */
	loadLevel: function(levelName, restriction) {
	    var sortField = this.model.getLevelTable(levelName) + '.display_order';
	    var parameters = {
	        viewName: this.viewName,
	        dataSourceId: this.dataSourcePrefix + levelName + '_ds',
	        groupIndex: 0,
	        version: '2',
	        sortValues: toJSON([{fieldName: sortField, sortOrder: 1}]),
	        useHierarchicalSecurityRestriction: true
	    };
	    
        var level = this.model.currentLevel;
	    if (level > 0) {
	        var parentRecord = this.model.getSelectedRecord(level - 1);
	        if (!valueExists(restriction)) {
	            restriction = parentRecord.values;
	        }
	        // KB 3028656
            // data source will map this to afm_ptasks.hot_user_name - remove
            delete restriction['afm_userprocs.user_name'];
            // data source will add those extra process_id value (some empty??) as restriction??
            delete restriction['afm_userprocs.process_id'];
            delete restriction['afm_roleprocs.process_id'];
	    }
		if (valueExists(restriction)) {
			parameters.restriction = toJSON(restriction);
		}
	    
		try {
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            this.model.setLevelRecords(level, levelName, result.data.records);
            this.afterLoadLevel(level, levelName, result);
            return true;
	    } catch (e) {
	    	Workflow.handleError(e);
	    	return false;
	    }
	},
	
	afterLoadLevel: function(level, levelName, result) {
		// nothing to do in the base class
	},

    /**
     * Updates the hasActivities property based on the loaded model.
     */	
	afterLoad: function() {
        var recordset = this.model.getLevelRecords(0);
        this.hasActivities = recordset.records.length > 0;
	},
    
    /**
     * Loads content view.
     * @param {Object} viewName
     */
    loadContentView: function(viewName, record) {
        this.viewPanel.taskRecord = record;
        
    	var activityId = record.getValue('afm_ptasks.activity_id');
    	if (!valueExists(activityId)) {
    		activityId = record.getValue('afm_processes.activity_id');
    	}
    	var processId = record.getValue('afm_ptasks.process_id');
    	if (!valueExists(processId)) {
    		processId = record.getValue('afm_processes.process_id');
    	}
    	var taskId = record.getValue('afm_ptasks.task_id');
    	
		this.viewPanel.taskInfo = {
		    activityId: activityId,
		    processId: processId,
		    taskId: taskId
		};
    
        this.viewPanel.addEventListener('afterLoad', this.afterContentViewLoad.createDelegate(this, [record]));
        this.viewPanel.loadView.defer(1000, this.viewPanel, [viewName]);
    },
    
    /**
     * Called after content view is loaded.
     * @param {Object} process or task record.
     */
    afterContentViewLoad: function(record) {
        this.viewPanel.removeEventListener('afterLoad');

        var dashboardController = this.viewPanel.contentView.controllers.get('dashboardController');
        if (dashboardController) {
            if (record.name === 'task') {
                dashboardController.activityId = record.getValue('afm_ptasks.activity_id');
                dashboardController.processId = record.getValue('afm_ptasks.process_id');
            } else {
                dashboardController.activityId = record.getValue('afm_processes.activity_id');
                dashboardController.processId = record.getValue('afm_processes.process_id');
                dashboardController.dashboardView = record.getValue('afm_processes.dashboard_view');
                dashboardController.dashboardLayout = record.getValue('afm_processes.dashboard_layout');
            }
        }
    }
});


/**
 * Navigator controller is a non-visual object that loads the navigator model and updates the view.
 */
Ab.navigator.NavigatorController = Ab.navigator.BaseController.extend({
    
    // reference to the Ab.navigator.Navigator control
    navigatorControl: null, 
    
    selection: null,
    
    /**
     * Constructor.
     */
    constructor: function(viewName, dataSourcePrefix, viewPanel, navigatorControl) {
        this.inherit(viewName, dataSourcePrefix, viewPanel);
        
        this.navigatorControl = navigatorControl;
        this.navigatorControl.addEventListener('clickitem', this.onClickNavigatorItem.createDelegate(this));
        this.navigatorControl.addEventListener('addToDashboard', this.onAddToDashboard.createDelegate(this));
        this.navigatorControl.setModel(this.model);
        this.navigatorControl.setController(this);

        if (this.loadLevel('product')) {
	        this.navigatorControl.displayLevel();
        
	        this.afterLoad();
        }
    },
    
    afterLoadLevel: function(level, levelName, result) {
        if (result.data.records.length == 1 && levelName != 'task') {
            // skip level
            var singleRecord = this.model.getSelectedRecord(level);

			if (levelName == 'activity') {
	            this.model.selectedActivityFolder = singleRecord.getValue('afm_activities.subfolder');
			}
            var restriction = singleRecord.values;
            // data source will map this to afm_ptasks.hot_user_name - remove
            delete restriction['afm_userprocs.user_name'];
            
            levelName = this.model.getNextLevelName(levelName);
            this.model.currentLevel++;
            this.loadLevel(levelName, restriction);
        }
    },

    /**
     * Event handler is called when the user clicks on any navigator item, at any level.
     */
    onClickNavigatorItem: function(e, item, params) {
    	this.unselectCurrentTask();
        
        var recordset = this.model.getLevelRecords(this.model.currentLevel);
        recordset.setSelectedIndex(params.index);
        
        if (params.level < this.model.currentLevel) {
            // go up
            var selectedRecordset = this.model.getLevelRecords(params.level);
            if (selectedRecordset.records.length == 1) {
                // if the level on which the user clicked has one record (activities), go one level higher (domains)
                this.model.currentLevel = params.level - 1;
            } else {
                this.model.currentLevel = params.level;
            }
            if (this.model.currentLevel < 0) {
            	this.model.currentLevel = 0;
            }
            this.navigatorControl.displayLevel();
            
        } else if (params.record.name === 'task') {
            // select task
            this.selectTask(params.id, params.record);
            var taskFile = params.record.getTaskFile();            
            var viewName = (taskFile.substring(0, 4) == 'http') ? taskFile : View.contextPath + '/schema/' + taskFile;
            this.loadContentView(viewName, params.record);
            
        } else {
            // drill down
            this.drillDown();
        }
    },
    
    /**
     * Drills down from the current level to the next, using the current selection.
     */
    drillDown: function() {
        var nextLevelName = this.model.getNextLevelName();
        this.model.currentLevel++;
        this.loadLevel(nextLevelName);
        this.navigatorControl.displayLevel();
    },
    
    /**
     * Selects specified task.
     */
    selectTask: function(id, record) {
        this.selection = { id: id, record: record };
        this.navigatorControl.selectItem(id, record, true);
    },
    
    /**
     * Selects specified key and drills down.
     */
    selectItem: function(level, key) {
        if (this.model.currentLevel === level) {
            recordset = this.model.getLevelRecords(level);
            recordset.setSelected(key);
            
            if (level < 3) {
                this.drillDown();
            } else {
                this.selectTask(recordset.getSelectedRecordId(), recordset.getSelectedRecord());
            }
        }
    },

    /**
     * Un-selects the currently selected task, if any.
     */
    unselectCurrentTask: function() {
        if (this.selection) {
            this.navigatorControl.selectItem(this.selection.id, this.selection.record, false);
            this.selection = null;
        }
    },
	
	/**
	 * Returns true if the task view can be added to the current dashboard.
	 */
	canAddToDashboard: function(record) {
		return (this.viewPanel.contentView && this.viewPanel.contentView.type === 'dashboard');
	},
	
    /**
     * Add selected task item to the content dashboard.
     * @param {Object} item
     * @param {Object} params
     */
	onAddToDashboard: function(item, params) {
        var taskTitle = params.record.getTitle();
        var taskFile  = params.record.getTaskFile();
		var taskIcon  = params.record.getIcon();
		if (!valueExistsNotEmpty(taskIcon)) {
			taskIcon = 'ab-task-icon.gif';
		}
		
		var dashboardController = this.viewPanel.contentView.controllers.get('dashboardController');
		if (dashboardController) {
			dashboardController.addToDashboard(taskTitle, taskFile, taskIcon);
		} else {
			View.log('error', 'Dashboard view does not contain dashboardController');
		}
	},
	
	/**
	 * Highlights the activity/process/task that match specified view (task_file value).
	 */
	highlightTask: function(viewName) {
    	this.unselectCurrentTask();
    	
	    var dataSource = top.View.dataSources.get('taskByViewName_ds');
	    dataSource.addParameter('taskFile', viewName);
	    try {
	        var records = dataSource.getRecords();
	        if (records.length > 0) {
                var product_id = records[0].values['afm_ptasks.product_id'];
                var activity_id = records[0].values['afm_ptasks.activity_id'];
                var process_id = records[0].values['afm_ptasks.process_id'];
                var task_id = records[0].values['afm_ptasks.task_id'];
                
                this.selectItem(0, product_id);
                this.selectItem(1, activity_id);
                this.selectItem(2, process_id);
                this.selectItem(3, task_id);
                
                //View.alert(product_id + ' -- ' + activity_id + ' -- ' + process_id + ' -- ' + task_id);
	        }
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	}
});


/**
 * Navigator controller is a non-visual object that loads the navigator model and updates the view.
 */
Ab.navigator.DashboardController = Ab.navigator.BaseController.extend({
    
    // reference to the Ab.navigator.DashboardTabs control
    dashboardTabsControl: null,
    
    /**
     * Constructor.
     */
    constructor: function(viewName, dataSourcePrefix, viewPanel, dashboardTabsControl) {
        this.inherit(viewName, dataSourcePrefix, viewPanel);
        
        //this.navigatorType = 
        this.dashboardTabsControl = dashboardTabsControl;
        this.dashboardTabsControl.addEventListener('clickitem', this.onClickDashboardItem.createDelegate(this));
        this.dashboardTabsControl.setModel(this.model);

        if (this.loadDashboardLevels()) {
            this.afterLoad();
        }
    },
    
    /**
     * Load all dashboard tabs. 
     */
    loadDashboardLevels: function() {
        // load and create add activity tabs
        if (!this.loadLevel('activity')) {
        	return false;
        }
        
        this.dashboardTabsControl.addActivityTabs();

        // for each activity
        var recordset = this.model.getLevelRecords(0);
        this.model.currentLevel = 1;
        for (var i = 0; i < recordset.records.length; i++) {
            // get all items from the next level
            recordset.setSelectedIndex(i);
            this.loadLevel('process');

            // add next level items as dashboard tabs             
            this.dashboardTabsControl.addProcessTabs(i);
        }

        // finalize the dashboard control layout
        this.dashboardTabsControl.createTabs();
        
        return true;
    },

    /**
     * Event handler is called when the user clicks on any navigator item, at any level.
     */
    onClickDashboardItem: function(record) {
        if (record.name == 'process') {
            // if dashboard view name is specified
            var viewName = record.getDashboardView(); 
            if (valueExistsNotEmpty(viewName)) {
                this.loadContentView(viewName, record);
            }
        }            
    }
});

/**
 * Initializes navigator controls and controllers.
 * @param {navigatorType} Initial navigator type.
 */
function initNavigator(navigatorType, viewName) {
    var viewPanel = View.getControl('', 'viewContent');

    var navigatorControl = View.getControl('', 'processNavigator');
    var navigatorController = new Ab.navigator.NavigatorController(viewName, '', viewPanel, navigatorControl);
    
    var dashboardTabsControl = View.getControl('', 'dashboardTabs');
    if (dashboardTabsControl) {
        // disable the dashboard tabs so that they do not display the first dashboard view right away
        dashboardTabsControl.enable();
        var dashboardTabsController = new Ab.navigator.DashboardController(viewName, 'dash_', viewPanel, dashboardTabsControl);
    }

    // check whether requested navigator type has activities for the current user
    // if not, switch to the opposite type
    if (navigatorType == 'navigator' && !navigatorController.hasActivities) {
        navigatorType = 'dashboard';
    } else if (navigatorType == 'dashboard' && !dashboardTabsController.hasActivities) {
        navigatorType = 'navigator';
    } 

    var mainToolbar = View.getControl('', 'mainToolbar');

    mainToolbar.registerEventListeners();

    // display the Show Dashboard/Show Navigator button only if the current user has both types of activities
    if (dashboardTabsControl) {
		mainToolbar.setShowDashboard(navigatorController.hasActivities && dashboardTabsController.hasActivities);
        // mainToolbar.navigatorToolbar.setShowDashboard(navigatorController.hasActivities && dashboardTabsController.hasActivities);
    } else {
		mainToolbar.setShowDashboard(false);
        // mainToolbar.navigatorToolbar.setShowDashboard(false);
    }

	var isDashShown = mainToolbar.isDashboardMenuItemHidden();

	// For Bali 1 Navigation main toolbar, there is no 'toolbar' member. 
    mainToolbar.setNavigatorType(navigatorType);

	// signal to Ab.navigator.DashboardTabs that process tabs should be enabled
	mainToolbar.setFinishedLoading(true);


	if (navigatorType === 'navigator') {
		// BRG: Added to check for a pkey parameter and pass that into the view as well if found.
		var pkeyParam = top.location.parameters['pkey'];
		//alert(pkeyParam);
		var pkeyGet = "";
		if (valueExistsNotEmpty(pkeyParam)) {
			pkeyGet = "?pkey="+pkeyParam;
		}
	    // if the viewName URL parameter is specified, load the view    
	    viewName = top.location.parameters['viewName'];
		if (valueExistsNotEmpty(viewName)) {
			// load the view and pass the restriction obtained from URL query parameters
			viewPanel.loadView(viewName+pkeyGet, View.restriction);
			navigatorController.highlightTask(viewName);        
		}
	}
	else if (navigatorType === 'dashboard') {
        if (dashboardTabsControl.activityTabItems.length > 0) {
            dashboardTabsControl.activityTabItems[0].setActiveTab(0);
        }
	}

}