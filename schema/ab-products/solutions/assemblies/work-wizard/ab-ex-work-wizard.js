View.createController('exWorkWizard', {

    /**
     * Group by configuration.
     */
    groupBy: null,

    /**
     * Initialize the controller state.
     */
    afterViewLoad: function() {
        this.groupBy = {
            // group work requests by status
            fieldName: 'wr.status',
            // display status codes in this order
            order: ['R', 'A', 'HA', 'HL', 'I', 'Com'],
            // call this function to style category headers
            getStyleForCategory: this.getStyleForCategory
        };
    },

    /**
     * Customize the grid.
     */
    afterInitialDataFetch: function() {
        // the grid needs the category configuration before it can display grouped records
    	this.wrList.setCategoryConfiguration(this.groupBy);
    	this.wrList.update();
    },

    /**
     * Customize grid actions and data after every refresh.
     */
    wrList_afterRefresh: function() {
        this.updateActionbarActions(this.wrList, this.groupBy);
        this.updateActions(this.wrList, this.groupBy);
        this.updateLocations(this.wrList);
    },

    /**
     * Update actions that apply to selected work requests.
     */
    wrList_onMultipleSelectionChange: function() {
        this.updateActionbarActions(this.wrList, this.groupBy);
    },

    // ----------------------- Helper methods ----------------------------------

    /**
     * Returns styling properties for category.
     */
    getStyleForCategory: function(record) {
    	var status = record.getValue('wr.status');
    	var color = '#000000';

        if (status == 'R') {
   		    color = '#A01F57';
        } else if (status == 'A') {
       		color = '#214CCE';
        } else if (status == 'AA') {
       		color = '#4682B4';
    	} else if (status == 'HA') {
    		color = '#CC3700';
        } else if (status == 'HL') {
       		color = '#CC3700';
    	} else if (status == 'I') {
    		color = '#4169E1';
        } else if (status == 'Com') {
    		color = '#6588F0';
    	}

    	return {
            color: color
        };
   },

    /**
     * Updates multiple selection actions.
     * @param panel The grid panel.
     * @param groupBy The grouping configuration.
     */
    updateActionbarActions: function(panel, groupBy) {
        panel.actionbar.actions.each(function (action) {
            action.show(true);
            action.enable(false);
        });

        var enabledActions = [];
        var status = this.getStatusCommonForSelectedRows(panel, groupBy);

        // enable actions for the same status
        if (status == 'R') {
            enabledActions = ['approve', 'reject'];
        } else if (status == 'A') {
            enabledActions = ['schedule', 'issue'];
        } else if (status == 'AA') {
            enabledActions = ['issue'];
        } else if (status == 'I' || status == 'HA' || status == 'HL') {
            enabledActions = [];
        } else if (status == 'Com') {
            enabledActions = [];
        }

        // if any rows are selected, enable comon actions
        if (panel.getSelectedGridRows().length > 0) {
            enabledActions = enabledActions.concat(['locate', 'summary']);
        }

        for (var i = 0; i < enabledActions.length; i++) {
            var action = panel.actionbar.getAction(enabledActions[i]);
            if (action) {
                action.enable(true);
                action.forceDisable(false);
            }
        }
    },

    /**
     * Returns the request status that is common for all selected rows. If there is no common status, returns null.
     * @param panel The grid panel.
     * @param groupBy The grouping configuration.
     */
    getStatusCommonForSelectedRows: function(panel, groupBy) {
        var commonStatus = null;

        var rows = panel.getSelectedGridRows();
        for (var i = 0; i < rows.length; i++) {
            var status = rows[i].getFieldValue(groupBy.fieldName);

            if (commonStatus == null) {
                // first status found - remember it
                commonStatus = status;
            } else if (commonStatus != status) {
                // a different status found - there is no single common status
                commonStatus = null;
                break;
            }
        }

        return commonStatus;
    },

    /**
     * Updates action titles and event handlers per request.
     * @param panel The grid panel.
     * @param groupBy The grouping configuration.
     */
    updateActions: function(panel, groupBy) {
        panel.gridRows.each(function(row) {
            var action1 = null;
            var action2 = null;

            var status = row.getFieldValue(groupBy.fieldName);
            if (status == 'R') {
                action1 = 'Approve';
                action2 = 'Reject';
            } else if (status == 'A') {
                action1 = 'Schedule';
                action2 = 'Issue';
            } else if (status == 'AA') {
                action1 = 'Issue';
            } else if (status == 'I' || status == 'HA' || status == 'HL') {
            } else if (status == 'Com') {
            }

            if (action1) {
                row.actions.get(3).setTitle(action1);
            } else {
                row.actions.get(3).show(false);
            }
            if (action2) {
                row.actions.get(4).setTitle(action2);
            } else {
                row.actions.get(4).show(false);
            }
        });
    },

    /**
     * Formats location column values.
     */
    updateLocations: function(panel) {
        panel.gridRows.each(function(row) {
            var locationText = '';

            var bl_id = row.getFieldValue('wr.bl_id');
            var fl_id = row.getFieldValue('wr.fl_id');
            var rm_id = row.getFieldValue('wr.rm_id');
            var location = row.getFieldValue('wr.location');

            if (bl_id) {
                locationText = bl_id;
            }
            if (fl_id) {
                locationText = locationText + '-' + fl_id;
            }
            if (rm_id) {
                locationText = locationText + '-' + rm_id;
            }
            if (location) {
                locationText = locationText + ', ' + location;
            }

            row.setFieldValue('wr.location', locationText);
        });
    },

    // ----------------------- Grid action handlers ---------------------------

    wrList_onAction1: function(panel, action) {
        var status = action.row.getFieldValue('wr.status');
        if (status == 'R') {
            this.onApprove(action);
        } else if (status == 'A') {
            this.onSchedule(action);
        }
    },

    wrList_onAction2: function(panel, action) {
        var status = action.row.getFieldValue('wr.status');
        if (status == 'R') {
            this.onReject(action);
        } else if (status == 'A') {
            this.onIssue(action);
        }
    },

    onApprove: function(action) {
        this.approvePanel.showInWindow({
            anchor: action.button.dom,
            width: 600,
            height: 250,
            title: getMessage('approve')
        });
    },

    onReject: function(action) {
        this.rejectPanel.showInWindow({
            anchor: action.button.dom,
            width: 600,
            height: 175,
            title: getMessage('reject')
        });
    },

    onSchedule: function(action) {
        this.schedulePanel.showInWindow({
            anchor: action.button.dom,
            width: 600,
            height: 175,
            title: getMessage('schedule')
        });
    },

    onIssue: function(action) {
        this.issuePanel.showInWindow({
            anchor: action.button.dom,
            width: 600,
            height: 175,
            title: getMessage('issue')
        });
    },

    wrList_onWr_location: function(panel, action) {
        var bl_id = action.row.getFieldValue('wr.bl_id');
        var fl_id = action.row.getFieldValue('wr.fl_id');
        var rm_id = action.row.getFieldValue('wr.rm_id');

        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', bl_id);
        restriction.addClause('rm.fl_id', fl_id);
        restriction.addClause('rm.rm_id', rm_id);

        View.openDialog('ab-ex-select-room.axvw', restriction);
    }
});