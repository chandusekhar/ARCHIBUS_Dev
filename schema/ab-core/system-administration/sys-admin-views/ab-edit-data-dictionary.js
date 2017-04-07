/**
 * Data dictionary controller to copy table and fields
 */
var dataDictionaryController = View.createController('dataDictionaryController', {
    /**
     * Opens form to add new field restricted by table_name
     */
    abEditDataDictionary_flds_onNew: function () {
        var panelRestriction = this.abEditDataDictionary_flds.restriction;
        if (!valueExists(panelRestriction.clauses)) {
            var tableName = panelRestriction['afm_tbls.table_name'];
            panelRestriction = new Ab.view.Restriction();
            panelRestriction.addClause('afm_flds.table_name', tableName);
        }
        this.abEditDataDictionary_flds_form.newRecord = true;
        this.abEditDataDictionary_flds_form.refresh(panelRestriction);
        this.abEditDataDictionary_flds_form.showInWindow({});
    },
    /**
     * Copy table action.
     * @param row
     */
    abEditDataDictionary_tbls_onCopyTable: function (row) {
        var fromTable = row.getRecord().getValue('afm_tbls.table_name');
        this.showCopyDataPanel(fromTable, 'copyTable');
    },
    /**
     * Copy table validation action.
     */
    copyDataPanel_onCopyTable: function () {
        if (this.copyDataPanel.canSave()) {
            var fromTable = this.copyDataPanel.getFieldValue('fromTable'),
                toTable = this.copyDataPanel.getFieldValue('toTable');
            if (this.isTableDefined(toTable)) {
                View.showMessage(getMessage('tableAlreadyDefined'));
                return;
            }
            this.copyTable(fromTable, toTable);
        }
    },
    /**
     * Call copy table WFR.
     * @param fromTable
     * @param toTable
     */
    copyTable: function (fromTable, toTable) {
        try {
            var result = Workflow.callMethod('AbSystemAdministration-DataDictionaryService-copyTable', fromTable, toTable);
            if (result.code == 'executed') {
                View.panels.get('copyDataPanel').closeWindow();
                View.showMessage(String.format(getMessage('newTableCreated'), toTable, fromTable));
                View.panels.get('abEditDataDictionary_tbls').refresh();
            }
        }
        catch (e) {
            Workflow.handleError(e);
        }
    },
    /**
     * Copy fields action.
     */
    abEditDataDictionary_flds_onCopyFields: function () {
        var records = this.abEditDataDictionary_flds.getSelectedRecords();
        if (records.length == 0) {
            View.showMessage(getMessage('noRecordSelected'));
            return;
        }
        var fromTable = records[0].getValue('afm_flds.table_name');
        this.showCopyDataPanel(fromTable, 'copyTableFields');
    },
    /**
     * Copy fields action validation.
     */
    copyDataPanel_onCopyFields: function () {
        if (this.copyDataPanel.canSave()) {
            var fromTable = this.copyDataPanel.getFieldValue('fromTable'),
                toTable = this.copyDataPanel.getFieldValue('toTable');
            var fieldsToCopy = [];
            var records = this.abEditDataDictionary_flds.getSelectedRecords();
            for (var i = 0; i < records.length; i++) {
                var fieldName = records[i].getValue('afm_flds.field_name');
                fieldsToCopy.push({
                    field_name: fieldName,
                    action: 'copy'
                });
            }
            this.copyFields(fromTable, toTable, fieldsToCopy, true);
        }
    },
    /**
     *  Call copy fields WFR.
     * @param fromTable
     * @param toTable
     * @param fieldsToCopy - selected fields
     * @param checkFieldsForActions - check fields are already defined in data dictionary
     */
    copyFields: function (fromTable, toTable, fieldsToCopy, checkFieldsForActions) {
        try {
            var result = Workflow.callMethod('AbSystemAdministration-DataDictionaryService-copyFields', fromTable, toTable, fieldsToCopy, checkFieldsForActions);
            if (result.code == 'executed') {
                View.panels.get('copyDataPanel').closeWindow();
                View.panels.get('copyFieldsActionPanel').closeWindow();
                if (valueExistsNotEmpty(result.jsonExpression)) {
                    // create grid result with field actions
                    var fieldsToOverwrite = eval('(' + result.jsonExpression + ')');
                    this.showFieldActions(fromTable, toTable, fieldsToOverwrite);
                } else {
                    View.showMessage(String.format(getMessage('fieldsSuccessfullyCopied'), toTable));
                    //View.panels.get('abEditDataDictionary_tbls').setFilterValue('afm_tbls.table_name', toTable);
                    View.panels.get('abEditDataDictionary_tbls').refresh();
                    View.panels.get('abEditDataDictionary_flds').refresh(new Ab.view.Restriction({'afm_flds.table_name': toTable}));
                }
            }
        }
        catch (e) {
            Workflow.handleError(e);
        }
    },
    /**
     * Show fields actions panel.
     * @param fromTable
     * @param toTable
     * @param fieldsToOverwrite {fieldName: fieldName, action: action (copy, keep, overwrite)}
     */
    showFieldActions: function (fromTable, toTable, fieldsToOverwrite) {
        var fieldsRestriction = [];
        for (var i = 0; i < fieldsToOverwrite.length; i++) {
            fieldsRestriction.push(fieldsToOverwrite[i].field_name);
        }
        this.fieldsToOverwrite = fieldsToOverwrite;

        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_flds.table_name', fromTable);
        restriction.addClause('afm_flds.field_name', fieldsRestriction, 'IN');

        this.copyFieldsActionPanel.clearParameters();
        this.copyFieldsActionPanel.addParameter('toTable', toTable);

        this.copyFieldsActionPanel.refresh(restriction);
        this.copyFieldsActionPanel.copyFieldsParameters = {
            fromTable: fromTable,
            toTable: toTable
        };
        this.copyFieldsActionPanel.showInWindow({
            x: 200,
            y: 200,
            modal: true,
            closeButton: true
        });
        this.copyFieldsActionPanel.setTitle(this.copyFieldsActionPanel.getTitle() + ' ' + toTable);
    },
    /**
     * Modify column row values and set buttons visibility.
     * @param panel
     */
    copyFieldsActionPanel_afterRefresh: function (panel) {
        var fieldsToOverwrite = dataDictionaryController.fieldsToOverwrite;
        panel.gridRows.each(function (row) {
            var fieldName = row.getFieldValue('afm_flds.field_name');
            for (var i = 0; i < fieldsToOverwrite.length; i++) {
                if (fieldName === fieldsToOverwrite[i].field_name) {
                    var isDefined2 = row.getFieldValue('afm_flds.is_defined') == 1;
                    var isDefinedLabel = isDefined2 ? getMessage('isDefined') : getMessage('isNotDefined');
                    row.cells.get('afm_flds.is_defined').dom.innerHTML = isDefinedLabel;

                    if (!isDefined2) {
                        row.cells.get('keep').getEl().setVisible(false);
                        row.cells.get('overwrite').getEl().setVisible(false)
                    }
                }
            }
        });
    },
    /**
     * On keep existing action.
     * @param row
     */
    onKeepActionRow: function (row) {
        var btnKeep = row.row.cells.get('keep').getEl();
        btnKeep.addClass('x-item-disabled');
        btnKeep.set({disabled: 'disabled'});

        var btnOverwrite = row.row.cells.get('overwrite').getEl();
        if (btnOverwrite.is('[disabled]')) {
            btnOverwrite.set({disabled: false});
            btnOverwrite.removeClass('x-item-disabled');
        }
    },
    /**
     * On overwrite action.
     * @param row
     */
    onOverwriteActionRow: function (row) {
        var btnOverwrite = row.row.cells.get('overwrite').getEl();
        btnOverwrite.addClass('x-item-disabled');
        btnOverwrite.set({disabled: 'disabled'});

        var btnKeep = row.row.cells.get('keep').getEl();
        if (btnKeep.is('[disabled]')) {
            btnKeep.set({disabled: false});
            btnKeep.removeClass('x-item-disabled');
        }
    },
    /**
     * On apply action copy or overwrite fields.
     */
    copyFieldsActionPanel_onApply: function () {
        var fieldsToCopy = [];
        var gridRows = this.copyFieldsActionPanel.gridRows;
        var canApply = true;
        for (var i = 0; i < gridRows.length; i++) {
            var row = gridRows.get(i);
            var fieldName = row.getFieldValue('afm_flds.field_name');
            var btnKeep = row.cells.get('keep').getEl();
            var btnOverwrite = row.cells.get('overwrite').getEl();
            var isKeepAction = btnKeep.is('[disabled]');
            var isOverwriteAction = btnOverwrite.is('[disabled]');
            if (btnKeep.isVisible() && btnOverwrite.isVisible()
                && !isKeepAction && !isOverwriteAction) {
                canApply = false;
                break;
            }
            var action = 'copy';
            if (isKeepAction) {
                action = 'keep';
            } else if (isOverwriteAction) {
                action = 'overwrite';
            }
            fieldsToCopy.push({
                field_name: fieldName,
                action: action
            })
        }
        if (!canApply) {
            View.showMessage(getMessage('noFieldAction'));
            return;
        }
        var copyFieldsParameters = this.copyFieldsActionPanel.copyFieldsParameters;
        this.copyFields(copyFieldsParameters.fromTable, copyFieldsParameters.toTable, fieldsToCopy, false);
    },
    /**
     * Show copy table/field dialog.
     * @param fromTable
     * @param type
     */
    showCopyDataPanel: function (fromTable, type) {
        this.copyDataPanel.clearValidationResult();
        this.copyDataPanel.setFieldValue('fromTable', fromTable);
        this.copyDataPanel.setFieldValue('toTable', '');
        this.copyDataPanel.showInWindow({
            width: 400,
            height: 250,
            x: 200,
            y: 200,
            modal: true,
            closeButton: true
        });
        this.copyDataPanel.actions.get('copyTable').show('copyTable' === type);
        this.copyDataPanel.actions.get('copyFields').show('copyTableFields' === type);
    },
    /**
     * Check if a table is defined in data dictionary.
     * @param tableName
     * @returns {boolean}
     */
    isTableDefined: function (tableName) {
        this.isTableDefined_ds.clearParameters();
        this.isTableDefined_ds.addParameter('tableName', tableName);
        var isDefined = this.isTableDefined_ds.getRecord().values['afm_tbls.is_defined'];
        if (!valueExistsNotEmpty(isDefined)) {
            // for older DB.
            isDefined = this.isTableDefined_ds.getRecord().records[0].values['afm_tbls.is_defined'];
        }
        return (isDefined == 1) ? true : false;
    }
});