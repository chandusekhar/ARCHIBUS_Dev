/**
 * Display options controller.
 * Three panel with options: panelA, panelB and panelC.
 * Each panel has several options checkboxes.
 */
View.createController('displayOptionsController', {
    // panel region
    panelId: null,
    // panel options
    options: null,
    // current selected tree node
    crtTreeNode: null,
    //event triggered on select panel options.
    events: {
        'click [type="checkbox"][name="displayOptionsPanel_panelA"]': function (e) {
            this.applyOptions('panelA', e.currentTarget);
        },
        'click [type="checkbox"][name="displayOptionsPanel_panelB"]': function (e) {
            this.applyOptions('panelB', e.currentTarget);
        },
        'click [type="checkbox"][name="displayOptionsPanel_panelC"]': function (e) {
            this.applyOptions('panelC', e.currentTarget);
        }
    },
    /**
     * PanelB always has an option checked because it's the center region.
     */
    applyOptions: function (location, option) {
        var form = document.forms['displayOptionsPanel_form'];
        var buttonGroupName = this.displayOptionsPanel.getFieldElementName(location);
        var buttonGroup = form[buttonGroupName];
        if (buttonGroup) {
            if (buttonGroup.length) {
                for (var i = 0; i < buttonGroup.length; i++) {
                    if (buttonGroup[i].value === option.value) {
                        var checked = option.checked;
                        if ('panelB' === location) {
                            checked = true;
                        }
                        buttonGroup[i].checked = checked;
                    } else {
                        buttonGroup[i].checked = false;
                    }
                }
            } else {
                buttonGroup.checked = false;
            }
        }
    },
    displayOptionsPanel_onSave: function () {
        this.saveOptionValue('panelA');
        this.saveOptionValue('panelB');
        this.saveOptionValue('panelC');
        DisplayPanelConfiguration.updatePanelDisplayConfig(this.panelId, this.options);
        this.displayOptionsPanel.closeWindow();
    },
    saveOptionValue: function (location) {
        var checkBoxesValues = this.displayOptionsPanel.getCheckboxValues(location);
        var value = '';
        if (checkBoxesValues.length > 0) {
            value = checkBoxesValues[0];
        }
        this.options[location]['panelType'] = value;
    },
    showDisplayOptions: function (panelId) {
        this.displayOptionsPanel.showInWindow({
            width: 750,
            height: 150,
            x: 300,
            y: 300,
            closeButton: false
        });
        this.panelId = panelId;
        this.options = DisplayPanelConfiguration.getDisplayOptions(this.panelId);
        this.applyCheckboxOptions('panelA');
        this.applyCheckboxOptions('panelB');
        this.applyCheckboxOptions('panelC');
    },
    applyCheckboxOptions: function (location) {
        var option = this.options[location];
        var visible = option['visible'];
        var trFieldCell = jQuery('#ShowdisplayOptionsPanel_' + location + 'Title').parent().parent();
        if (valueExists(visible) && visible == false) {
            trFieldCell.hide();
        } else {
            trFieldCell.show();
        }
        this.displayOptionsPanel.setFieldValue(location, option['panelType']);
    }
});
/**
 * Display panels options.
 */
function configDisplayPanel(panelId) {
    View.controllers.get('displayOptionsController').showDisplayOptions(panelId);
}
/**
 * Configuration panels. Contains methods to add, update and display panels.
 */
DisplayPanelConfiguration = new (Base.extend({
    panels: new Ext.util.MixedCollection(),
    addPanelDisplayConfig: function (panelId, options) {
        this.panels.add(panelId, options);
    },
    updatePanelDisplayConfig: function (panelId, options) {
        this.panels.replace(panelId, options);
    },
    getDisplayOptions: function (panelId) {
        var panel = this.panels.get(panelId);
        if (panel) {
            return panel;
        } else {
            return null;
        }
    },
    getOptionLocation: function (panelId, location) {
        var options = this.getDisplayOptions(panelId);
        return options[location];
    },
    initPanel: function (panelId, location) {
        return new DisplayPanel(location, this.getOptionLocation(panelId, location));
    },
    displayPanels: function (panelId, restriction, crtTreeNode) {
        var panelA = this.initPanel(panelId, 'panelA');
        panelA.display(restriction, crtTreeNode);
        var panelB = this.initPanel(panelId, 'panelB');
        panelB.display(restriction, crtTreeNode);
        var panelC = this.initPanel(panelId, 'panelC');
        panelC.display(restriction, crtTreeNode);
        this.manageLayout(valueExistsNotEmpty(panelA.type), valueExistsNotEmpty(panelB.type), valueExistsNotEmpty(panelC.type));
    },
    displayDrawingPanel: function (panelId, eqId, action) {
        var parameters = new Ab.view.ConfigObject();
        parameters['eqId'] = eqId;
        parameters['action'] = action;
        var record = View.dataSources.get('eqCommonDs').getRecord(new Ab.view.Restriction({'eq.eq_id': eqId}));
        var blId = record.getValue('eq.bl_id');
        var flId = record.getValue('eq.fl_id');
        if (valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)) {
            parameters['blId'] = blId;
            parameters['flId'] = flId;
            if ('locate' === action) {
                parameters['rmId'] = record.getValue('eq.rm_id');
            }
        }
        parameters['zoom'] = 'highlight' === action ? false : true;
        if (panelId) {
            var panel = View.panels.get('abEqSysInfo_' + panelId);
            panel.assetParameters = parameters;
            var controller = panel.getContentFrame().View.controllers.get(0);
            // if drawing was already opened, just refresh the view
            if (controller) {
                controller.afterInitialDataFetch();
                panel.getContentFrame().View.controllers.get('assetDwgController').afterInitialDataFetch();
            } else {
                panel.loadView('ab-eq-system-drawing-config.axvw', null, null);
            }
            var layout = View.getLayoutManager('detailsLayout');
            if ('panelA' === panelId && layout.isRegionCollapsed('west')) {
                layout.expandRegion('west');
            } else if ('panelC' === panelId && layout.isRegionCollapsed('east')) {
                layout.expandRegion('east');
            }
        } else {
            View.openDialog('ab-eq-system-drawing-config.axvw', false, null, {
                assetParameters: parameters
            });
        }
    },
    manageLayout: function (showPanelA, showPanelB, showPanelC) {
        var layout = View.getLayoutManager('detailsLayout');
        if (layout.isRegionCollapsed('west') && showPanelA) {
            layout.expandRegion('west');
        } else {
            if (!showPanelA) {
                layout.collapseRegion('west');
            }
        }
        if (layout.isRegionCollapsed('east') && showPanelC) {
            layout.expandRegion('east');
        } else {
            if (!showPanelC) {
                layout.collapseRegion('east');
            }
        }
    }
}));
/**
 * Display panel configuration.
 */
DisplayPanel = Base.extend({
    type: null,
    visible: null,
    file: null,
    constructor: function (id, options) {
        this.id = id;
        this.type = options['panelType'];
        this.visible = options['visible'];
        this.file = this.getPanelFile(this.type);
    },
    getPanelFile: function (panelType) {
        var panelFile = '';
        switch (panelType) {
            case 'dependency':
                panelFile = 'ab-eq-system-dependency.axvw';
                break;
            case 'profile':
                panelFile = 'ab-eq-system-profile.axvw';
                break;
            case 'inventory':
                panelFile = 'ab-eq-system-inventory-tree.axvw';
                break;
            case 'drawing':
                panelFile = 'ab-eq-system-drawing-config.axvw';
                break;
            case 'dependent':
                panelFile = 'ab-eq-system-dependent.axvw';
                break;
        }
        return panelFile;
    },
    getPanel: function () {
        return View.panels.get('abEqSysInfo_' + this.id);
    },
    display: function (eqId, crtTreeNode) {
        var panel = this.getPanel();
        if (valueExists(panel)) {
            if (this.visible && valueExistsNotEmpty(this.file)) {
                panel.assetParameters = this.getPanelParameters(eqId, crtTreeNode);
                var controller = panel.getContentFrame().View.controllers.get(0);
                // if view was already opened, just refresh the view
                if (valueExistsNotEmpty(controller) && controller && (controller.id.toLowerCase().indexOf(this.type) > 0)) {
                    controller.afterInitialDataFetch();
                    if ('drawing' === this.type) {
                        panel.getContentFrame().View.controllers.get('assetDwgController').afterInitialDataFetch();
                    }
                } else {
                    panel.loadView(this.file, null, null);
                }
            } else {
                panel.loadView('ab-blank.axvw', null, null);
            }
        }
    },
    getPanelParameters: function (eqId, crtTreeNode) {
        var parameters = new Ab.view.ConfigObject();
        parameters['eqId'] = eqId;
        switch (this.type) {
            case 'dependency':
                parameters['restriction'] = new Ab.view.Restriction({'eq_system.eq_id_master': eqId});
                break;
            case 'profile':
                parameters['restriction'] = new Ab.view.Restriction({'eq.eq_id': eqId});
                break;
            case 'inventory':
                break;
            case 'drawing':
                var record = View.dataSources.get('eqCommonDs').getRecord(new Ab.view.Restriction({'eq.eq_id': eqId}));
                var blId = record.getValue('eq.bl_id');
                var flId = record.getValue('eq.fl_id');
                if (valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)) {
                    parameters['blId'] = blId;
                    parameters['flId'] = flId;
                    parameters['rmId'] = record.getValue('eq.rm_id');
                }
                break;
            case 'dependent':
                parameters['crtTreeNode'] = crtTreeNode;
                parameters['restriction'] = new Ab.view.Restriction({'eq_system.eq_id_master': eqId});
                break;
        }
        return parameters;
    }
});