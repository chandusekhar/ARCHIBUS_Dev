
View.createController('exRadio', {

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'change #exRadioForm_costTypeList': function() {
            this.exRadioForm_onShowSelectedListValue();
        },
        'click input[type=radio]': function(input) {
            if (input.currentTarget.name === 'exRadioForm_costTypeRadio') {
                this.exRadioForm_onShowSelectedRadioValue();
            }
        },
        'click input[type=checkbox]': function() {
            this.exRadioForm_onShowSelectedCheckboxValues();
        }
    },

    /**
     * The Save action.
     */
    saveAction: null,

    /**
     * Disable the Save action until the user loads a record into the form.
     */
    afterInitialDataFetch: function() {
        this.saveAction = this.exRadioForm.fieldsets.get(0).actions.get('saveStatus');
        this.saveAction.show(false);
    },

    /**
     * Loads the status value from the database into the radio buttons field.
     */
    exRadioForm_onLoadStatus: function() {
        this.exRadioForm.refresh();
        this.saveAction.show(true);
    },

    /**
     * Saves the status value from the radio buttons field to the database.
     */
    exRadioForm_onSaveStatus: function() {
        var record = this.exRadioForm.getRecord();
        // remove custom field values
        record.removeValue('costTypeList');
        record.removeValue('costTypeRadio');
        record.removeValue('costTypeCheckbox');
        this.exRadioDS.saveRecord(record);
    },

    /**
     * Shows how to modify a custom drop-down list.
     */
    exRadioForm_onModifyList: function() {
        var field = this.exRadioForm.fields.get('costTypeList');
        // clear all options in the list
        field.clearOptions();
        // add new options
        field.addOption('option1', 'Option 1');
        field.addOption('option2', 'Option 2');
        field.addOption('option3', 'Option 3');
    },

    /**
     * Shows how to get the value selected in the drop-down list.
     */
    exRadioForm_onShowSelectedListValue: function() {
        var value = this.exRadioForm.getFieldValue('costTypeList');
        View.alert('Selected value: ' + value);
    },

    /**
     * Shows how to get the value of selected radio button.
     */
    exRadioForm_onShowSelectedRadioValue: function() {
        var value = this.exRadioForm.getFieldValue('costTypeRadio');
        View.alert('Selected value: ' + value);
    },

    /**
     * Shows how to get values of selected checkboxes.
     */
    exRadioForm_onShowSelectedCheckboxValues: function() {
        var values = this.exRadioForm.getCheckboxValues('costTypeCheckbox');
        View.alert('Selected values: ' + values);
    }
});