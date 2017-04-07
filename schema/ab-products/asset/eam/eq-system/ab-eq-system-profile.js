View.createController('abProfileEquipmentController', {
    // selected equipment id
    eqId: null,
    afterInitialDataFetch: function () {
        var parameters = null;
        if (valueExists(this.view.parentViewPanel) && valueExists(this.view.parentViewPanel.assetParameters)) {
            parameters = this.view.parentViewPanel.assetParameters;
            this.eqId = parameters.getConfigParameterIfExists('eqId');
            var restriction = parameters.getConfigParameterIfExists('restriction');
            this.abProfileEquipment_form.refresh(restriction);
            this.teamPanel.refresh(new Ab.view.Restriction({'team.eq_id': this.eqId}));
            this.eqRmPanel.refresh(new Ab.view.Restriction({'eq_rm.eq_id': this.eqId}));
        }
    },
    /**
     * Set equipment image.
     */
    abProfileEquipment_form_afterRefresh: function () {
        if (valueExistsNotEmpty(this.abProfileEquipment_form.getFieldValue('eqstd.doc_graphic'))) {
            this.abProfileEquipment_form.showImageDoc('image_field', 'eqstd.eq_std', 'eqstd.doc_graphic');
        } else {
            this.abProfileEquipment_form.fields.get(this.abProfileEquipment_form.fields.indexOfKey('image_field')).dom.src = null;
            this.abProfileEquipment_form.fields.get(this.abProfileEquipment_form.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
        }
    },
    abProfileEquipment_form_onEdit: function () {
        View.getOpenerView().openDialog('ab-eq-edit-form.axvw', this.abProfileEquipment_form.restriction, false, {
            width: 1024,
            height: 800,
            closeButton: true,
            callback: function () {
                View.panels.get('abProfileEquipment_form').refresh();
            }
        });
    },
    abProfileEquipment_form_onCreateAction: function () {
        var record = new Ab.data.Record({
            'bl.asset_type': 'eq',
            'bl.asset_id': this.eqId
        }, false);
    	View.getOpenerWindow().assignAsset('eq', record);
    },
    teamPanel_onAdd: function () {
        this.onShowTeamDetails(this.teamPanel.restriction, true);
    },
    showTeamDetails: function (selectedRecord) {
        var pKeyValue = selectedRecord.getValue('team.autonumbered_id');
        this.onShowTeamDetails(new Ab.view.Restriction({'team.autonumbered_id': pKeyValue}), false);
    },
    onShowTeamDetails: function (restriction, newRecord) {
        View.getOpenerView().openDialog('ab-eq-system-team-support.axvw', restriction, newRecord, {
            closeButton: true,
            callback: function () {
                View.closeThisDialog();
                View.panels.get('teamPanel').refresh();
            }
        });
    },
    eqRmPanel_onAdd: function () {
        this.showSpaceServed(new Ab.view.Restriction({'eq_rm.eq_id': this.eqId}), true);
    },
    showSpaceServedDetails: function (selectedRecord) {
        var restriction = new Ab.view.Restriction({'eq_rm.eq_id': this.eqId});
        restriction.addClause('eq_rm.bl_fl_rm', selectedRecord.getValue('eq_rm.bl_fl_rm'));
        this.showSpaceServed(restriction, false);
    },
    showSpaceServed: function (restriction, newRecord) {
        View.getOpenerView().openDialog('ab-eq-system-space-served.axvw', restriction, newRecord, {
            closeButton: true,
            callback: function () {
                View.closeThisDialog();
                View.panels.get('eqRmPanel').refresh();
            }
        });
    }
});
function selectTeamMember(context) {
    var parentPanel = View.panels.get(context.command.parentPanelId);
    var selectedRecord = parentPanel.gridRows.get(parentPanel.selectedRowIndex).getRecord();
    View.controllers.get('abProfileEquipmentController').showTeamDetails(selectedRecord);
}
function selectSpaceServed(row) {
    View.controllers.get('abProfileEquipmentController').showSpaceServedDetails(row.row.getRecord());
}
function showDrawingAction(action) {
    var controller = View.controllers.get('abProfileEquipmentController'),
        eqId = controller.abProfileEquipment_form.getFieldValue('eq.eq_id');
    var openerView = View.getOpenerView();
    var panelId = getDrawingPanelController(openerView.controllers.get('displayOptionsController'));
    openerView.getWindow().DisplayPanelConfiguration.displayDrawingPanel(panelId, eqId, action);
}
/**
 * Check if drawing panel is displayed.
 */
function getDrawingPanelController(displayOptionsController) {
    var panels = ['panelA', 'panelB', 'panelC'];
    var availablePanel = null;
    for (var i = 0; i < panels.length; i++) {
        var panelName = 'abEqSysInfo_' + panels[i];
        var frame = displayOptionsController[panelName] && displayOptionsController[panelName].getContentFrame();
        if (frame) {
            var viewName = frame.View.originalRequestURL.substring(View.originalRequestURL.lastIndexOf('/') + 1);
            if ('ab-blank.axvw' === viewName || 'ab-eq-system-drawing-config.axvw' === viewName) {
                availablePanel = panels[i];
            }
        }
    }
    return availablePanel;
}