View.createController('abEamViewMarkupActionsController', {
    callBack: null,
    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callBack = View.parameters.callback;
        }
    },
    afterInitialDataFetch: function () {
        var clauses = View.restriction.clauses;
        var title = ' ',
            instructions = '';
        for (var i = 0; i < clauses.length; i++) {
            title += clauses[i].value;
            if (clauses[i].name.indexOf('fl') == 0) {
                instructions = String.format(getMessage('instruction1'), getMessage('selectedBlFl'));
            } else if (clauses[i].name.indexOf('project') == 0) {
                instructions = String.format(getMessage('instruction1'), getMessage('selectedProject'));
            } else if (clauses[i].name.indexOf('work_pkgs') == 0) {
                instructions = String.format(getMessage('instruction1'), getMessage('selectedWrkPkg'));
            } else if (clauses[i].name.indexOf('activity_log') == 0) {
                instructions = String.format(getMessage('instruction1'), getMessage('selectedAction'));
            }
            if (clauses.length > 0 && i < clauses.length - 1) {
                title += ' - ';
            }
        }
        this.abEamViewMarkItemGrid.refresh();
        this.abEamViewMarkItemGrid.setTitle(getMessage('panelTitle') + title);
        this.abEamViewMarkItemGrid.setInstructions(instructions + " " + getMessage('instruction2'));
    },

    abEamViewMarkItemGrid_select_onClick: function (row) {
        var actionId = row.record["activity_log.activity_log_id.key"],
            actionTitle = row.record["activity_log.action_title"],
            blId = row.record["activity_log.bl_id"],
            flId = row.record["activity_log.fl_id"],
            docFileName = row.record["activity_log.doc4"];

        if (this.callBack) {
            this.callBack(actionId, actionTitle, docFileName, blId, flId);
        }
        View.closeThisDialog();
    }
});