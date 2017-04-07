/**
 * Created by Meyer on 9/27/2015.
 *
 * ab-pgnav-manage-process-tasks.js
 */

var pgnavProcessTasksController = View.createController('pgnavProcessTasksController', {

    /**
     * Apply restriction to the grid
     */
    addTasks_console_onSearch: function () {
        var console = View.panels.get('addTasks_console');
        var taskGrid = View.panels.get('availableTasks_grid');
        taskGrid.refresh(console.getFieldRestriction());
        taskGrid.show(true);
    },


    /**
     * Handle the Copy Tasks event to make new afm_processes using the parent panel's activity and process.
     */
    addTasks_console_onCopy: function() {
        var selectedRecords = [];
        var dataSource = this.pageNavTasks_ds;
        this.availableTasks_grid.gridRows.each(function(row) {
            if (row.isSelected()) {
                var record = row.getRecord();
                // convert Ab.data.Record values into ARCHIBUS neutral format
                record = dataSource.processOutboundRecord(record);
                selectedRecords.push(record);
            }
        });

        if (selectedRecords.length === 0){
            View.showMessage(getMessage('noSelection'));
            return;
        }

        var actAndProc = getParentPanelKey();
        if (!actAndProc.activity_id || !actAndProc.process_id) {
            // TODO localize
            View.showMessage('Could not get activity and process from panel!');
            return;
        }

        // clone afm_ptasks records and change FK to parent process into parent panel's afm_processes PK
        var newTaskRecords = this.copySelectedRowsAsNewTasks(selectedRecords, actAndProc.activity_id, actAndProc.process_id);
        Ab.homepage.EditorServices.saveAddedProcessTasks(newTaskRecords, actAndProc);
        refreshParentPanel();
        //View.closeThisDialog();
		parent.View.closeDialog();
    },


    /**
     * Return a new set of objects, substituting activity_id and process_id
     * @param selectedRecords
     * @param activityId
     * @param processId
     * @returns {Array}
     */
    copySelectedRowsAsNewTasks: function(selectedRecords, activityId, processId) {
        var newTaskRecords = [];
        var maxDisplayOrder = parent.View.controllers.get('pgnavPageEditorController').getMaxExistingDisplayOrder();
        if (!maxDisplayOrder) maxDisplayOrder=0;
		var rowCount = selectedRecords.length;
        for (var i = 0; i < rowCount; i++) {
            var selectedRecord = selectedRecords[i];
            maxDisplayOrder += 100;
            selectedRecord.isNew = true;
            selectedRecord.setValue('afm_ptasks.activity_id', activityId);
            selectedRecord.setValue('afm_ptasks.process_id', processId);
            selectedRecord.setValue('afm_ptasks.display_order', maxDisplayOrder);
            // TODO set old values to {} ?
            selectedRecord.setOldValue('afm_ptasks.activity_id', activityId);
            selectedRecord.setOldValue('afm_ptasks.process_id', processId);
            newTaskRecords.push(selectedRecord);
        }

        return newTaskRecords;
    }
});

/**
 * Return an object holding the parent panel's activity_id and process_id.
 * @returns {{activity_id: *, process_id: *}}
 */
function getParentPanelKey() {
    var taskKey = {
        activity_id: '',
        process_id: '',
        title:''
    };

    var taskGrid = View.getOpenerView().panels.get('assignedTasksGrid');
    
	if (!taskGrid) {
		taskGrid = parent.View.panels.get('assignedTasksGrid');
	}
	var taskFilter = taskGrid.restriction;
    var clauseCount = taskFilter.clauses.length;
    for (var i = 0; i < clauseCount; i++) {
        var filterClause = taskFilter.clauses[i];
        if (filterClause.name === 'afm_ptasks.activity_id') {
            taskKey.activity_id = filterClause.value;
        }
        else if (filterClause.name === 'afm_ptasks.process_id') {
            taskKey.process_id = filterClause.value;
        }
        else if (filterClause.name === 'afm_ptasks.title') {
            taskKey.title = filterClause.value;
        }

        if (taskKey.activity_id && taskKey.process_id && taskKey.title) {
            break;
        }
    }

    return taskKey;
}

/**
 *
 */
function refreshParentPanel() {
    var parentView = View.getOpenerView();
    var taskGrid = parentView.panels.get('assignedTasksGrid');
	if (!taskGrid) {
		taskGrid = parent.View.panels.get('assignedTasksGrid');
	}
    taskGrid.refresh();
}

