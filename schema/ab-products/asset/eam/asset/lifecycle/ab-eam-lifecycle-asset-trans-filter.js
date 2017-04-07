/**
 * Assets transactions filter controller
 */
var abEamAssetTransFilterCtrl = View.createController('abEamAssetTransFilterCtrl', {
    // filter basic config object
    filterConfig: null,

    // callBack function for onFilter event
    onFilterCallback: null,

    // restriction with current values
    restriction: null,
    /**
     * Initialize filter config by asset type. Called from opener view.
     * @param filterConfig
     */
    initializeConfigObjects: function (filterConfig) {
        this.filterConfig = filterConfig;
    },
    /**
     * Initialize filter by asset type. Called from opener view.
     * @param assetType
     */
    initializeFilter: function (assetType) {
        this.customizeFilterPanel(this.filterConfig);
        this.setAssetStatus(assetType);
        if (valueExists(View.getParentTab())
            && valueExists(View.getParentTab().parameters)) {
            var collapsedFilter = View.getParentTab().parameters.collapsedFilter;
            View.panels.get('abEamAssetTransFilter').setCollapsed(collapsedFilter);
        }
    },
    /**
     * Set asset status selections field.
     * @param assetType
     */
    setAssetStatus: function (assetType) {
        var filterPanel = View.panels.get('abEamAssetTransFilter');
        var statusDSHelper = View.dataSources.get('abAssetStatus_ds');
        var enumValues = statusDSHelper.fieldDefs.get(assetType + ".status").enumValues;
        var statusField = filterPanel.fields.get('asset_trans.status');
        if (statusField) {
            // remove all options
            statusField.clearOptions();
            statusField.addOption('', '');
            // add new options
            for (var opt in enumValues) {
                statusField.addOption(opt, enumValues[opt]);
            }
        }
    },
    /**
     * Customize filter fields.
     * @param fieldsConfig
     * @param restriction
     */
    customizeFilterPanel: function (fieldsConfig, restriction) {
        var filterPanel = View.panels.get('abEamAssetTransFilter');
        var controller = this;
        fieldsConfig.each(function (field) {
            if (valueExists(field.fieldConfig)) {
                var fieldConfig = field.fieldConfig;
                if (fieldConfig.type == 'enumList') {
                    controller.customizeDropDownField(filterPanel, field.id, fieldConfig);
                } else if (fieldConfig.type == 'checkbox') {
                    controller.customizeCheckboxField(filterPanel, field.id, fieldConfig);
                } else {
                    controller.customizeField(filterPanel, field.id, fieldConfig);
                }
            }
            if (valueExists(restriction)) {
                var clause = restriction.findClause(field.id);
                if (clause && clause.value) {
                    filterPanel.setFieldValue(field.id, clause.value);
                }
            }
        });
    },
    /**
     * Apply filter.
     * @returns {boolean} if filter si not validated
     */
    abEamAssetTransFilter_onFilter: function () {
        if (!this.validateFilter()) {
            return false;
        }
        var restriction = this.getFilterRestriction();
        this.restriction = restriction;

        // call callback function
        if (this.onFilterCallback) {
            this.onFilterCallback(restriction);
        }
    },
    /**
     * Clear filter values.
     */
    abEamAssetTransFilter_onClear: function () {
        // clear basic
        var filterPanel = View.panels.get('abEamAssetTransFilter');
        filterPanel.clear();
    },
    /**
     * Validate filter settings.
     * @returns {boolean}
     */
    validateFilter: function () {
        return true;
    },
    /**
     * read filter values and return restriction object
     * @returns {*} sql restriction
     */
    getFilterRestriction: function () {
        var restriction = "1=1 ";
        var filterPanel = View.panels.get('abEamAssetTransFilter');
        filterPanel.fields.each(function (field) {
            var id = field.getId();
            if (valueExists(field.fieldDef)
                && id != 'dummy_field'
                && valueExistsNotEmpty(filterPanel.getFieldValue(id))) {
                if (filterPanel.hasFieldMultipleValues(id)) {
                    var values = filterPanel.getFieldMultipleValues(id);
                    restriction += " AND " + id + " IN ('" + values.join("','") + "')";
                } else if (field.fieldDef.controlType == 'checkBox') {
                    var values = filterPanel.getCheckboxValues(id);
                    restriction += " AND " + id + " IN ('" + values.join("','") + "')";
                } else {
                    var value = filterPanel.getFieldValue(id);
                    if (field.fieldDef.isDate) {
                        if ('asset_trans.date_trans.from' === id) {
                            restriction += " AND asset_trans.date_trans >= ${sql.date('" + value + "')}";
                        } else if ('asset_trans.date_trans.to' === id) {
                            restriction += " AND asset_trans.date_trans <= ${sql.date('" + value + "')}";
                        }
                    } else if (field.fieldDef.controlType == 'comboBox' || field.fieldDef.isEnum) {
                        restriction += " AND " + id + " ='" + value + "'";
                    } else {
                        restriction += " AND " + id + " LIKE '%" + value + "%'";
                    }
                }
            }
        });
        return restriction;
    },
    /**
     * Customize field.
     * @param panel
     * @param fieldId
     * @param fieldConfig
     * @returns {boolean} hide field if it is config
     */
    customizeField: function (panel, fieldId, fieldConfig) {
        if (fieldConfig.hidden) {
            panel.showField(fieldId, false);
            var fieldEl = panel.getFieldElement(fieldId);
            if (fieldEl.nextElementSibling && fieldEl.nextElementSibling.tagName.toUpperCase() == 'IMG') {
                panel.showElement(fieldEl.nextElementSibling, false);
            }
            return true;
        }
        // set default value
        if (valueExists(fieldConfig.dfltValue)) {
            panel.setFieldValue(fieldId, fieldConfig.dfltValue);
        }
        // disable field if required
        if (fieldConfig.readOnly) {
            panel.enableField(fieldId, false);
        }
    },
    /**
     * Customize dropdown field.
     * fieldConfig:{
	 * 		type: enumList,
	 * 		hidden: false,
	 * 		readOnly: false,
	 * 		dfltValue: 'allOpen',
	 * 		values: {'Proposed': 'Proposed', 'Requested': 'Requested'},
	 * 		hasEmptyOption: false
	 *  }
     */
    customizeDropDownField: function (panel, fieldId, fieldConfig) {
        var field = panel.fields.get(fieldId);
        if (fieldConfig.hidden) {
            panel.showField(fieldId, false);
            return true;
        }
        // customize field option
        if (valueExists(fieldConfig.values)) {
            // remove all options
            field.clearOptions();
            // add new options
            for (var opt in fieldConfig.values) {
                var optTitle = valueExistsNotEmpty(fieldConfig.values[opt]) ? getMessage(fieldConfig.values[opt]) : field.config.enumValues[opt];
                field.addOption(opt, optTitle);
            }
        }
        if (!fieldConfig.hasEmptyOption) {
            field.removeOptions({'': ''});
        }
        // set default value
        if (valueExists(fieldConfig.dfltValue)) {
            panel.setFieldValue(fieldId, fieldConfig.dfltValue);
        }
        // disable field if required
        if (fieldConfig.readOnly) {
            panel.enableField(fieldId, false);
        }
    },
    /**
     * customize checkbox field.
     */
    customizeCheckboxField: function (panel, fieldId, fieldConfig) {
        if (fieldConfig.hidden) {
            panel.showField(fieldId, false);
            return true;
        }
        // set default value
        if (valueExists(fieldConfig.dfltValue)) {
            $('chk_' + fieldId).checked = fieldConfig.dfltValue == 'checked';
        }
    }
});