View.createController('abSpPfolioMarkItemCtrl', {
    events: {
        'click input[type=checkbox]': function () {
            this.abEamMarkItemConsole_onCheckBoxClicked();
        }
    },
    projectId: null,
    actionId: null,
    blId: null,
    flId: null,
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callback = View.parameters.callback;
            this.projectId = View.parameters.projectId;
            this.blId = View.parameters.blId;
            this.flId = View.parameters.flId;
        }
    },
    afterInitialDataFetch: function () {
        this.abEamMarkItemConsole.setFieldValue('activity_log.bl_id', this.blId);
        this.abEamMarkItemConsole.setFieldValue('activity_log.fl_id', this.flId);
        this.abEamMarkItemConsole_onShow();
    },
    abEamMarkItemConsole_onShow: function () {
        var restriction = this.abEamMarkItemConsole.getFieldRestriction();
        restriction.addClause("activity_log.project_id", this.projectId);
        this.abEamMarkItemGrid.refresh(restriction);
    },
    abEamMarkItemConsole_onCheckBoxClicked: function () {
        var isFloorNotRequired = $('noFloor').checked;
        if (isFloorNotRequired == true) {
            this.abEamMarkItemConsole.clear();
            this.abEamMarkItemConsole.enableField("activity_log.bl_id", false);
            this.abEamMarkItemConsole.enableField("activity_log.fl_id", false);
            this.abEamMarkItemConsole.enableField("activity_log.activity_type", false);
            this.abEamMarkItemConsole_onShow();
        }
        else {
            this.abEamMarkItemConsole.enableField("activity_log.bl_id", true);
            this.abEamMarkItemConsole.enableField("activity_log.fl_id", true);
            this.abEamMarkItemConsole.enableField("activity_log.activity_type", true);
        }
    },
    abEamMarkItemGrid_afterRefresh: function () {
        var grid = this.abEamMarkItemGrid;
        grid.gridRows.each(function (row) {
            var hadRedline = row.getRecord().getValue('activity_log.hadRedline');
            if (hadRedline == 1) {
                row.actions.get("markUp").setTitle(getMessage("edit"));
            } else {
                row.actions.get("markUp").setTitle(getMessage("create"));
                row.actions.get("delete").show(false);
            }
        });
    },
    abEamMarkItemGrid_markUp_onClick: function (row) {
        this.actionId = row.record["activity_log.activity_log_id.key"];
        this.blId = row.record["activity_log.bl_id"];
        this.flId = row.record["activity_log.fl_id"];
        this.openMarkUpDialog();
    },
    abEamMarkItemGrid_delete_onClick: function (row) {
        this.actionId = row.record["activity_log.activity_log_id.key"];
        var controller = this;
        //add confirm when on delete.
        View.confirm(getMessage("delete"), function (button) {
            if (button == 'yes') {
                var restriction = new Ab.view.Restriction();
                restriction.addClause("afm_redlines.activity_log_id", controller.actionId);
                var records = controller.abEamActionRedlineDS.getRecords(restriction);
                if (records && records.length > 0) {
                    controller.abEamActionRedlineDS.deleteRecord(records[0]);
                }
                controller.abEamMarkItemGrid.refresh();
            }
        });
    },
    abEamMarkItemGrid_onAddNew: function () {
        this.abEamMarkItemForm.refresh(null, true);
        var blId = this.abEamMarkItemConsole.getFieldValue('activity_log.bl_id'),
            flId = this.abEamMarkItemConsole.getFieldValue('activity_log.fl_id');
        this.abEamMarkItemForm.setFieldValue("activity_log.bl_id", blId);
        this.abEamMarkItemForm.setFieldValue("activity_log.fl_id", flId);
        this.abEamMarkItemForm.showInWindow({
            x: 400,
            y: 200,
            width: 800,
            height: 600,
            title: getMessage("add"),
            modal: true
        });
    },
    abEamMarkItemForm_onSave: function () {
        this.abEamMarkItemForm.setFieldValue("activity_log.project_id", this.projectId);
        var isCreateNew = this.abEamMarkItemForm.newRecord;
        if (this.abEamMarkItemForm.canSave()) {
            var result = this.abEamMarkItemDS.saveRecord(this.abEamMarkItemForm.getRecord());
            this.abEamMarkItemForm.closeWindow();
            //after saving a new action item, directly open the mark up view.
            if (isCreateNew) {
                this.openMarkUpView(result.getValue("activity_log.activity_log_id"),
                    this.abEamMarkItemForm.getFieldValue("activity_log.bl_id"),
                    this.abEamMarkItemForm.getFieldValue("activity_log.fl_id"));
            }
            this.abEamMarkItemGrid.refresh();
        }
    },
    openMarkUpView: function (actionId, blId, flId) {
        this.actionId = actionId;
        this.blId = blId;
        this.flId = flId;
        this.openMarkUpDialog();
    },
    openMarkUpDialog: function () {
        View.openDialog('ab-sp-pfolio-mark-act-item-svg.axvw', null, true, {
            maximize: true,
            closeButton: false,
            callback: function () {
                View.closeDialog();
                View.controllers.get('abSpPfolioMarkItemCtrl').abEamMarkItemGrid.refresh();
            }
        });
    }
});