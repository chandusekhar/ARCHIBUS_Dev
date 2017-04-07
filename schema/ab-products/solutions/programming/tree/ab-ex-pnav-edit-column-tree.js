/**
 * Controller for the Edit Navigator Tasks view.
 * This version uses custom ExtJS TreePanel extansion that displays columns in the tree.
 * The extension classes are defined in ab-column-tree.js.
 */
var editNavigatorTasksController = View.createController('editNavigatorTasks', {

    /**
     * This function is called after the view is loaded and all panels are constructed,
     * but before initial data fetch.
     */
    afterViewLoad: function() {
        this.createTree();
    },
    
    // ----------------------- UI update methods --------------------------------------------------
    
    /**
     * Creates tree and adds all activity nodes.
     */
    createTree: function() {
        // set up column definitions
        this.columns = [{
            header: getMessage('ColumnName'),
            width: 300,
            dataIndex: 'id'
        }, {
            header: getMessage('ColumnTitle'),
            width: 300,
            dataIndex: 'title'
        }, {
            header: getMessage('ColumnProcessType'),
            width: 100,
            dataIndex: 'process_type'
        }];            

        this.activityTreePanel = new Ext.tree.ColumnTree({
            el:'pnavEditColumnTree_activityTree',
            autoScroll: true,
            animate: true,
            border: false,
            enableDD: true,
            containerScroll: true,
            rootVisible: false,
            tbar: new Ext.Toolbar({
                items: ['Tree with Columns']
            }),
            bbar: new Ext.Toolbar(),
            // tree loader is an object that exposes load(node, callback) method to load children
            // create temp object that wraps the controller loadTreeNode() method as tree loader
            loader: {
                load: this.loadTreeNode.createDelegate(this),
                // specify custom UI provider for columns
                uiProviders: {
                    'col': Ext.tree.ColumnNodeUI
                }
            },
            columns: this.columns
        });
        
        var rootNode = new Ext.tree.TreeNode();
        this.activityTreePanel.setRootNode(rootNode);
        this.activityTreePanel.render();

        this.loadTreeNode(rootNode);
        this.pnavEditColumnTree_activityTree.setContentPanel(this.activityTreePanel);
    },
    
    /**
     * Creates tree node based on record field and appends it to specified parent node.
     */
    createTreeNode: function(type, parentNode, record, fieldNames) {
        var config = {
            // specify custom UI provider for the node columns
            uiProvider: Ext.tree.ColumnNodeUI
        };
        // add column values
        for (var i = 0; i < fieldNames.length; i++) {
            if (valueExists(fieldNames[i])) {
                config[this.columns[i].dataIndex] = record.getValue(fieldNames[i]);
            }
        }
        if (type == 'task') {
            config.listeners = {
                'click': this.pnavEditColumnTree_activityTree_task_onClick.createDelegate(this)
            };
        }
        var node = (type == 'task') 
            ? new Ext.tree.TreeNode(config) // task nodes are not expandable 
            : new Ext.tree.AsyncTreeNode(config);
        node.attributes['type'] = type;
        node.attributes['record'] = record;
        parentNode.appendChild(node);
    },
    
    /**
     * Called by Ext.tree.AsyncTreeNode instances to load children when the user expands the node.
     */
    loadTreeNode: function(node, callback) {
        // remove any existing children
        while (node.firstChild){
            node.removeChild(node.firstChild);
        }
        
        // decide which business method to call based on the node type
        var record = node.attributes['record'];
        var type = node.attributes['type'];
        try {
            if (node.parentNode == null) {
                // parent is root - load activities
                var dataSet = this.loadActivities();
                var activities = dataSet.records;
                for (var i = 0; i < activities.length; i++) {
                    this.createTreeNode('activity', node, activities[i], 
                        ['afm_activities.activity_id', 'afm_activities.title']);
                }
                if (dataSet.hasMoreRecords) {
                    this.activityTreePanel.getBottomToolbar().addText(getMessage('HasMoreActivities'));
                }
                
            } else if (type == 'activity') {
                // parent is activity - load processes
                var activityId = record.getValue('afm_activities.activity_id');
                var records = this.loadProcesses(activityId).records;
                for (var i = 0; i < records.length; i++) {
                    this.createTreeNode('process', node, records[i], 
                        ['afm_processes.process_id', 'afm_processes.title']);
                }
                
            } else if (type == 'process') {
                // parent is process - load tasks
                var activityId = record.getValue('afm_processes.activity_id');
                var processId = record.getValue('afm_processes.process_id');
                var records = this.loadTasks(activityId, processId).records;
                for (var i = 0; i < records.length; i++) {
                    this.createTreeNode('task', node, records[i], 
                        ['afm_ptasks.task_id', null, 'afm_ptasks.task_type']);
                }
            }
        } catch (e) {
            View.showMessage('error', getMessage('ErrorLoadTreeNode'), e.message, e.data);
        }

        // call Ext.tree.AsyncTreeNode callback to stop node animation
        if (valueExists(callback)) {        
            callback();
        }
    },
    
    // ----------------------- event listeners ----------------------------------------------------
    
    /**
     * Handles click event on the task tree node.
     */
    pnavEditColumnTree_activityTree_task_onClick: function(node) {
        var record = node.attributes['record'];
        this.pnavEditColumnTree_taskForm.refresh(record.toRestriction());
    },

    // ----------------------- business logic methods: no UI code beyond this point ---------------
    
    /**
     * Loads all activities.
     * @return Ab.data.Record[]
     */
    loadActivities: function() {
        var result = Workflow.call('AbCommonResources-getDataRecords', {
            viewName: 'ab-ex-pnav-edit',
            dataSourceId: 'pnavEditColumnTree_activityDs'
        });
        return result.dataSet;
    },
    
    /**
     * Loads all processes for specified activity.
     * @return Ab.data.Record[]
     */
    loadProcesses: function(activityId) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_processes.activity_id', activityId);
        var result = Workflow.call('AbCommonResources-getDataRecords', {
            viewName: 'ab-ex-pnav-edit',
            dataSourceId: 'pnavEditColumnTree_processDs',
            restriction: toJSON(restriction)
        });
        return result.dataSet;
    },
    
    /**
     * Loads all tasks for specified activity and process. 
     * If process is not specified, loads all tasks for activity. 
     * @return Ab.data.Record[]
     */
    loadTasks: function(activityId, processId) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_ptasks.activity_id', activityId);
        if (valueExists(processId)) {
            restriction.addClause('afm_ptasks.process_id', processId);
        }
        var result = Workflow.call('AbCommonResources-getDataRecords', {
            viewName: 'ab-ex-pnav-edit',
            dataSourceId: 'pnavEditColumnTree_taskDs',
            restriction: toJSON(restriction)
        });
        return result.dataSet;
    }
});
