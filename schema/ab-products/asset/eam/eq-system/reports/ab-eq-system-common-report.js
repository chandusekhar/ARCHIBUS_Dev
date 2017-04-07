View.createController('abEqSystemReportController', {
    selectedEquipmentId: null,
    selectedSystemName: null,
    filterRestriction: null,
    afterViewLoad: function () {
        if (this.eq_system_panel.multipleSelectionEnabled) {
            this.eq_system_panel.addEventListener('onMultipleSelectionChange', this.onChangeMultipleSelection);
        }
        // use unique value per level
        this.eq_system_panel.afterCreateDataRows = function (parentElement, columns) {
            if ('eqSystemDependent_ds' === this.dataSourceId) {
                /**
                 * Check if list contains element.
                 */
                function containsElement(list, obj) {
                    var i = list.length;
                    while (i--) {
                        if (list[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                }

                var rows = this.gridRows;
                var previousIndexes = [];
                var fields = ['eq_system.level1', 'eq_system.level2', 'eq_system.level3', 'eq_system.level4', 'eq_system.level5',
                    'eq_system.level6', 'eq_system.level7', 'eq_system.level8', 'eq_system.level9', 'eq_system.level10'];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows.get(i);
                    var currentIndex = i;
                    var previousRow = null;
                    if (i > 0) {
                        previousRow = rows.get(currentIndex - 1);
                        if (previousRow) {
                            previousIndexes.push(previousRow);
                        }
                    }
                    // set cell values to empty strings if there are duplicate values per level
                    row.cells.each(function (cell) {
                        var value = cell.row.getFieldValue(cell.column.id);
                        if (containsElement(fields, cell.column.id) && valueExistsNotEmpty(value) && valueExists(previousRow)) {
                            if (row.getIndex() !== previousRow.getIndex()) {
                                var previousValue = previousRow.getFieldValue(cell.column.id);
                                if (previousValue === value) {
                                    cell.dom.textContent = '';
                                }
                            }
                        }
                    });
                }
            }
        }
    },
    afterInitialDataFetch: function () {
        // get view location
        this.getInitialParameters();
        if (valueExistsNotEmpty(this.selectedEquipmentId)) {
            if (this.equipment_panel) {
                this.equipment_panel.setFilterValue("eq.eq_id", this.selectedEquipmentId);
            }
            this.eq_system_panel.addParameter('eqid', this.selectedEquipmentId);
            this.eq_system_panel.refresh();
        }
        if (valueExistsNotEmpty(this.filterRestriction)) {
            this.equipment_panel.addParameter('filterRestriction', this.filterRestriction);
        }
        if (this.equipment_panel) {
            this.equipment_panel.refresh();
        }
    },
    getInitialParameters: function () {
        if (valueExistsNotEmpty(View.parameters)) {
            if (valueExistsNotEmpty(View.parameters["selectedEquipmentId"])) {
                this.selectedEquipmentId = View.parameters["selectedEquipmentId"];
            }
            if (valueExistsNotEmpty(View.parameters["selectedSystemName"])) {
                this.selectedSystemName = View.parameters["selectedSystemName"];
            }
            if (valueExistsNotEmpty(View.parameters["filterRestriction"])) {
                this.filterRestriction = View.parameters["filterRestriction"];
            }
        }
    },
    eq_system_panel_afterRefresh: function (panel) {
        if (panel.dataSourceId != 'rooms_served_ds') {
            var title = panel.getTitle() + ": " + this.selectedEquipmentId;
            if (valueExistsNotEmpty(this.selectedSystemName)) {
                title += " - " + this.selectedSystemName;
            }
            panel.setTitle(title);
        }
    },
    onChangeMultipleSelection: function (row) {
        var emPanel = View.panels.get('rooms_employees_pn');
        var selectedRecords = View.panels.get('eq_system_panel').getPrimaryKeysForSelectedRows();
        if (selectedRecords.length > 0) {
            var restriction = '';
            for (var i = 0; i < selectedRecords.length; i++) {
                restriction += "(em.bl_id='" + selectedRecords[i]['rm.bl_id'] + "'";
                restriction += " AND em.fl_id='" + selectedRecords[i]['rm.fl_id'] + "'";
                restriction += " AND em.rm_id='" + selectedRecords[i]['rm.rm_id'] + "')";
                if (i < selectedRecords.length - 1) {
                    restriction += " OR ";
                }
            }
            emPanel.refresh(restriction);
        } else {
            emPanel.show(false);
        }
    },
    selectEquipment: function (eqId) {
        this.eq_system_panel.addParameter('eqid', eqId);
        this.eq_system_panel.refresh();
    }
});
function onSelectEquipment(row) {
    var eqId = row.row.getRecord().getValue('eq.eq_id');
    View.controllers.get('abEqSystemReportController').selectEquipment(eqId);
}