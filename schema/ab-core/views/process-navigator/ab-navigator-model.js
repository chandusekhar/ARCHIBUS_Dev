/**
 * Declare the namespace for the navigator JS classes.
 */
Ab.namespace('navigator');

/**
 * Base class for navigator records.
 */
Ab.navigator.Record = Base.extend({
    
    // Ab.navigator.Model
    model: null,
    
    // logical level name, e.q. "product"
    name: '',
    
    // translated level title, e.q. 'Products'
    title: '',
    
    // table name, e.q. 'afm_products'
    tableName: '',
    
    // PK field name, e.q. 'product_id'
    keyFieldName: '',
    
    // title field name, e.q. 'title'
    titleFieldName: '',

    values: null,    
    
    // @begin_translatable
    z_NAVIGATORPROCESS_KEY: 'Key',
    z_NAVIGATORPROCESS_HELPLINK: 'Help Link',
    z_NAVIGATORPROCESS_SUMMARY: 'Summary',
    z_NAVIGATORPROCESS_DASHBOARD_LAYOUT: 'Dashboard Layout',
    z_NAVIGATORPROCESS_DASHBOARD_VIEW: 'Dashboard View',
    z_NAVIGATORPROCESS_TASK: 'Task',
    z_NAVIGATORPROCESS_TASK_FILE: 'Task File',
    z_NAVIGATORPROCESS_ACTIVITY_FOLDER: 'Activity Folder',
    z_NAVIGATORPROCESS_HOTLIST_UID: 'Hotlist User Name',
    z_NAVIGATORPROCESS_HOTLIST_SECIRUTY_GROUP: 'Hotlist Security Group',
    z_NAVIGATORPROCESS_PATH: 'Path',
    z_NAVIGATORPROCESS_URL: 'URL',
    // @end_translatable
    
    /**
     * Constructor.
     */
    constructor: function(model, name, title, tableName, keyFieldName, titleFieldName, values) {
        this.model = model;
        this.name = name;
        this.title = title;
        this.values = values;
        this.tableName = tableName;
        this.keyFieldName = keyFieldName;
        this.titleFieldName = titleFieldName;
    },
    
    getValue: function(name) {
        return this.values[name];  
    },
    getKey: function() {
        return this.getValue(this.tableName + '.' + this.keyFieldName);
    }, 
    getTitle: function() {
        return this.getValue(this.tableName + '.' + this.titleFieldName);
    }, 
    getIcon: function() {
        return this.getValue(this.tableName + '.icon_small');
    },
    getHelpSystem: function() {
    		return (this.tableName != 'afm_products') ? this.getValue(this.tableName + '.help_system.raw') : '';
    },
    getHelpLink: function() {
        var helpLink = this.getValue(this.tableName + '.help_link');
        var helpSystem = this.getHelpSystem();
        var prefix = (helpSystem == 'SYSTEM') ? View.preferences.abSchemaSystemMgmtHelpFolder : View.preferences.abSchemaSystemHelpFolder;
        prefix = prefix.replace(View.user.helpExtension, '');
        helpLink = helpLink.replace('#Attribute%//@abSchemaSystemHelpFolder%', prefix);
        //helpLink = helpLink.replace('#Attribute%/*/preferences/userAccount/@helpExtension%', View.user.helpExtension);
        helpLink = helpLink.replace('#Attribute%/*/preferences/userAccount/@helpExtension%', '');
        helpLink = helpLink.replace(/\\/g, "/");
        return helpLink;
    },
    getSummary: function() {
        var summary = '';
        var style = Ext.isIE ? 'width:200px;' : '';
        var image = this.getValue(this.tableName + '.icon_large');
        if (valueExistsNotEmpty(image)) {
            summary += '<div style="float:left;padding-right:8px;"><img alt="' + this.tableName + '" src="' + View.contextPath + '/schema/ab-system/graphics/' + image + '"></img></div>';
        }
        summary += this.wrapTextIntoDiv('<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_SUMMARY) + ':</b> ' + this.getValue(this.tableName + '.summary'));
        return summary;
    }, 
    getDetails: function() {
        return this.wrapTextIntoDiv('<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_KEY) + ':</b> ' + this.getKey() + '<br/>'
                                  + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_HELPLINK) + ':</b> ' + this.getHelpLink());
    },
    wrapTextIntoDiv: function(text) {
        var style = Ext.isIE ? 'width:200px;' : '';
        return '<div style="float:clear;' + style + '">' + text + '</div>';
    }
});

Ab.navigator.ProductRecord = Ab.navigator.Record.extend({
    constructor: function(model, values) {
        this.inherit(model, 'product', 'Products', 'afm_products', 'product_id', 'title', values);
    }
});

Ab.navigator.ActivityRecord = Ab.navigator.Record.extend({
    constructor: function(model, values) {
        this.inherit(model, 'activity', 'Activities', 'afm_activities', 'activity_id', 'title', values);
    }
});

Ab.navigator.ProcessRecord = Ab.navigator.Record.extend({
    constructor: function(model, values) {
        this.inherit(model, 'process', 'Processes or Roles', 'afm_processes', 'process_id', 'title', values);
    },

    getDashboardLayout: function() {
        return this.getValue('afm_processes.dashboard_layout');
    },
    
    getDashboardView: function() {
        return this.getValue('afm_processes.dashboard_view');
    },

    getDetails: function() {
        return this.wrapTextIntoDiv('<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_KEY) + ':</b> ' + this.getKey() + '<br/>'
                                  + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_HELPLINK) + ':</b> ' + this.getHelpLink() + '<br/>'
                                  + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_DASHBOARD_LAYOUT) + '</b> ' + this.getDashboardLayout() + '<br/>'
                                  + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_DASHBOARD_VIEW) + ':</b> ' + this.getDashboardLayout() + '<br/>');
    }
});

Ab.navigator.TaskRecord = Ab.navigator.Record.extend({
    constructor: function(model, values) {
        this.inherit(model, 'task', 'Tasks', 'afm_ptasks', 'task_id', 'task_id', values);
    },
    
    getTaskFile: function() {
        return this.getValue('afm_ptasks.task_file');
    },
    
    isLabel: function() {
        return (this.getValue(this.tableName + '.task_type.raw') === 'LABEL');
    },
  
    /**
     * Return extra information for specific task record, to be displayed as tooltip.
     */
    getDetails: function(level, record) {
        var info = '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_TASK) + ':</b> ' + this.getKey() + '<br/>'
                 + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_TASK_FILE) + ':</b> ' + this.getValue('afm_ptasks.task_file') + '<br/>'
                 + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_ACTIVITY_FOLDER) + ':</b> ' + this.model.selectedActivityFolder + '<br/>';
        var isHotlist = this.getValue('afm_ptasks.is_hotlist');
        if (isHotlist === true || isHotlist === 'true') {
             info = info + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_HOTLIST_UID) + ':</b> ' + this.getValue('afm_ptasks.hotlist_user_name') + '<br/>'
                         + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_HOTLIST_SECIRUTY_GROUP) + ':</b> ' + this.getValue('afm_ptasks.security_group');
        }
        return this.wrapTextIntoDiv(info);
    },
    
    /**
     * Returns task information:
     * 1. Task path, for example: 
     *    Move Management/Enterprise Move Management/Craftsperson/Examine Individual Moves
     * 2. Task URL, for example:
     *    http://zepp:8080/archibus/schema/ab-move-examine.axvw
     */
    getInfo: function() {
        var info = '';
        
        var path = '';
        var recordsets = this.model.recordsetStack;
        for (var i = 0; i < recordsets.length; i++) {
            var record = recordsets[i].getSelectedRecord();
            if (i > 0) {
                path = path + ' / ';
            }
            path = path + record.getTitle();
        }
        info = '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_PATH) + ':</b> ' + path + '<br/>';
        
        var task_file = this.getValue('afm_ptasks.task_file');
        var url = View.getUrlForPath(task_file);
        info = info + '<b>' + Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_URL) + ':</b> ' + url;
        
        return info;
    }
});

/**
 * Recordset contains navigator records for specific level (product|activity|process|task)
 * and a selected record index.
 */
Ab.navigator.Recordset = Base.extend({
    
    // Ab.navigator.Model
    model: null,
    
    // logical level name, e.q. "product"
    name: '',
    
    // translated level title, e.q. 'Products'
    title: '',

    // array of Ab.navigator.Record objects
    records: null,    
    
    // selected record index
    selectedIndex: 0,

    /**
     * Constructor.
     */
    constructor: function(model, name, title, records) {
        this.model = model;
        this.name = name;
        this.title = title;
        this.records = records;
    },
    
    /**
     * Sets selection index by name of the product/activity/process/task.
     */
    setSelected: function(key) {
        for (var index = 0; index < this.records.length; index++) {
            if (this.records[index].getKey() === key) {
                this.setSelectedIndex(index);
                break;
            }
        }
    },
    
    /**
     * Set selection index for specified level.
     */
    setSelectedIndex: function(index) {
        this.selectedIndex = index;
        
        if (this.name === 'activity') {
            var selectedRecord = this.getSelectedRecord();
            if (selectedRecord) {
                this.model.selectedActivityFolder = selectedRecord.getValue('afm_activities.subfolder');
            }
        }
    },
    
    /**
     * Return selected record.
     */
    getSelectedRecord: function() {
        return this.records[this.selectedIndex];
    },
    
    /**
     * Returns ID of the navigator item representing the selected record (eg. "task_0").
     */
    getSelectedRecordId: function() {
        var record = this.getSelectedRecord();
        return record.name + '_' + this.selectedIndex;
    }
});

/**
 * Navigator model is a non-visual object that holds the data records displayed by the navigator
 * and its state variables, and provides an API to access and update the state.
 */
Ab.navigator.Model = Base.extend({
	
	// contains recordsets for loaded navigator levels (product, activity, process, task)
	// levels can be skipped - if there is only one process per activity, the process recordset is not loaded 
	// array<Ab.navigator.Recordset>
	recordsetStack: null,
    
    // currently displayed level
    currentLevel: 0,
    
    // subfolder name for selected activity
    selectedActivityFolder: '',
    
    // @begin_translatable
    z_NAVIGATORPROCESS_PRODUCTS_TITLE: 'Products',
    z_NAVIGATORPROCESS_ACTS_TITLE: 'Applications',
    z_NAVIGATORPROCESS_ROLES_TITLE: 'Processes or Roles',
    z_NAVIGATORPROCESS_TASKS_TITLE: 'Tasks',    
    // @end_translatable
    
    
    // array of level titles
    level_defs: null,
    /**
     * Constructor.
     */
    constructor: function() {
    	this.recordsetStack = [];
    	this.selectionStack = [];
    	this.currentLevel = 0;

    	this.level_defs = {
            product: {title: Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_PRODUCTS_TITLE), table: 'afm_products'}, 
            activity: {title: Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_ACTS_TITLE), table: 'afm_activities'}, 
            process: {title: Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_ROLES_TITLE), table: 'afm_processes'},
            task: {title: Ab.view.View.getLocalizedString(this.z_NAVIGATORPROCESS_TASKS_TITLE), table: 'afm_ptasks'}
         };
    	
    },
    
    /**
     * Add array of records for specified level.
     * If level records are already stored, replace them with new records.
     */
    setLevelRecords: function(level, levelName, jsonRecords) {
        var levelTitle = this.getLevelTitle(levelName);
        var records = [];
        for (var i = 0; i < jsonRecords.length; i++) {
            var jsonRecord = jsonRecords[i];
            var record = null;
            switch (levelName) {
                case 'product':  record = new Ab.navigator.ProductRecord(this, jsonRecord); break;
                case 'activity': record = new Ab.navigator.ActivityRecord(this, jsonRecord); break;
                case 'process':  record = new Ab.navigator.ProcessRecord(this, jsonRecord); break;
                case 'task':     record = new Ab.navigator.TaskRecord(this, jsonRecord); break;
            }
            records.push(record);
        }
        this.recordsetStack[level] = new Ab.navigator.Recordset(this, levelName, levelTitle, records);
    },
    
    /**
     * Return array of records for specified level.
     */
    getLevelRecords: function(level) {
    	return this.recordsetStack[level];
    },
    
    /**
     * Return last selected record on the parent level.
     */
    getSelectedRecord: function(level) {
        return this.getLevelRecords(level).getSelectedRecord();
    },
    
    /**
     * Return level name, e.q. 'product'.
     */
    getLevelName: function(level) {
        var name = 'product';
        if (level > 0) {
	        var levelRecords = this.getLevelRecords(level - 1);
	        for (var i = 0; i < Ab.navigator.Model.LEVEL_NAMES.length - 1; i++) {
	            if (Ab.navigator.Model.LEVEL_NAMES[i] === levelRecords.name) {
	               name = Ab.navigator.Model.LEVEL_NAMES[i + 1];
	               break;
	            }
	        }
        }
        return name;
    },
    
    /**
     * Return the name of the level after specified level.
     * @param {levelName} name of the current level.
     */
    getNextLevelName: function(levelName) {
        if (!valueExists(levelName)) {
	        levelName = this.getLevelRecords(this.currentLevel).name;
        }
        var nextLevelName = '';
        for (var i = 0; i < Ab.navigator.Model.LEVEL_NAMES.length - 1; i++) {
            if (Ab.navigator.Model.LEVEL_NAMES[i] === levelName) {
               nextLevelName = Ab.navigator.Model.LEVEL_NAMES[i + 1];
               break;
            }
        }
        return nextLevelName;
    },
    
    /**
     * Return localized level title, e.q. 'Products'.
     */
    getLevelTitle: function(levelName) {
        return this.level_defs[levelName].title;
    },
    
    /**
     * Return level main table.
     */
    getLevelTable: function(levelName) {
        return this.level_defs[levelName].table;
    }
}, {
    // array of level names
    LEVEL_NAMES: ['product', 'activity', 'process', 'task']
});
