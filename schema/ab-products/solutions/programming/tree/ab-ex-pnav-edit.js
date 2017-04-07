/**
 * Controller for the Edit Navigator Tasks view.
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
        this.activityTreePanel = new Ext.tree.TreePanel({
            el: 'pnavEdit_activityTree',
            autoScroll: true,
            animate: true,
            border: false,
            enableDD: true,
            containerScroll: true,
            rootVisible: false,
            tbar: new Ext.Toolbar({
                items: ['Tree']
            }),
            bbar: new Ext.Toolbar(),
            // tree loader is an object that exposes load(node, callback) method to load children
            // create temp object that wraps the controller loadTreeNode() method as tree loader
            loader: {load: this.loadTreeNode.createDelegate(this)}
        });
        var rootNode = new Ext.tree.TreeNode();
        this.activityTreePanel.setRootNode(rootNode);
        this.activityTreePanel.render();
        
        this.loadTreeNode(rootNode);
        this.pnavEdit_activityTree.setContentPanel(this.activityTreePanel);
    },
    
    /**
     * Creates tree node based on record field and appends it to specified parent node.
     */
    createTreeNode: function(type, parentNode, record, textFieldName) {
        var config = {
            text: record.getValue(textFieldName)
        };
        if (type == 'task') {
            config.listeners = {
                'click': this.pnavEdit_activityTree_task_onClick.createDelegate(this)
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
                    this.createTreeNode('activity', node, activities[i], 'afm_activities.activity_id');
                }
                if (dataSet.hasMoreRecords) {
                    this.activityTreePanel.getBottomToolbar().addText(getMessage('HasMoreActivities'));
                }
                
            } else if (type == 'activity') {
                // parent is activity - load processes
                var activityId = record.getValue('afm_activities.activity_id');
                var records = this.loadProcesses(activityId).records;
                for (var i = 0; i < records.length; i++) {
                    this.createTreeNode('process', node, records[i], 'afm_processes.process_id');
                }
                
            } else if (type == 'process') {
                // parent is process - load tasks
                var activityId = record.getValue('afm_processes.activity_id');
                var processId = record.getValue('afm_processes.process_id');
                var records = this.loadTasks(activityId, processId).records;
                for (var i = 0; i < records.length; i++) {
                    this.createTreeNode('task', node, records[i], 'afm_ptasks.task_id');
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
    pnavEdit_activityTree_task_onClick: function(node) {
        var record = node.attributes['record'];
        this.pnavEdit_taskForm.refresh(record.toRestriction());
    },

    // ----------------------- business logic methods: no UI code beyond this point ---------------
    
    /**
     * Loads all activities.
     * @return Ab.data.Record[]
     */
    loadActivities: function() {
        return this.pnavEdit_activityDs.getRecords();
    },
    
    /**
     * Loads all processes for specified activity.
     * @return Ab.data.Record[]
     */
    loadProcesses: function(activityId) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_processes.activity_id', activityId);
        return this.pnavEdit_processDs.getRecords(restriction);
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
        return this.pnavEdit_taskDs.getRecords(restriction);
    }
});
