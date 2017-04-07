/**
 * Created by Meyer on 9/7/2015.
 *
 * ab-pgnav-manage-homepage-processes.js
 */

var pgnavProcessDescriptorController = View.createController('pgnavProcessDescriptorController', {

    /**
     * Flag telling whether descriptorDetailsForm
     * is showing a new, copy or pre-existing afm_processes record.
     * Both new and copy use a new record, but side effects of save afm_processes record are new -> save descriptor XML; copy -> copy the
     */
    processDetailsFormOperation: '',

    /**
     * The grid record selected to be opened in the form for the copy source.
     */
    processDetailsFormParentRecord: null,

    /**
     * Initialize the pageNavigationDescriptorDetails form to have the restricted values
     * for the hidden fields activity_id & process_type
     */
    descriptorDetailsForm_afterRefresh: function() {
        this.descriptorDetailsForm.setFieldValue('afm_processes.activity_id', 'AbDashboardPageNavigation');
        this.descriptorDetailsForm.setFieldValue('afm_processes.process_type', 'WEB-PAGENAV');
        this.setParentRecord();

        if (this.processDetailsFormOperation === 'copy') {
            var fieldValues = this.descriptorDetailsForm.getFieldValues();
            var valuesAreEmpty = this.verifyValuesEmpty(fieldValues);
            if (valuesAreEmpty) {
                this.setFormValuesFromParentRecord(this.processDetailsFormParentRecord);
            }
        }
    },

    /**
     * Before save:
     * ensure descriptor file name ends in '.xml'
     */
    descriptorDetailsForm_beforeSave: function() {
        var descriptorFileName = this.descriptorDetailsForm.getFieldValue('afm_processes.dashboard_view');
        var validFileName = Ab.homepage.EditorParser.ensureDescriptorFileNameValidity(descriptorFileName);

        if (descriptorFileName !== validFileName) {
            descriptorFileName = validFileName;
            this.descriptorDetailsForm.setFieldValue('afm_processes.dashboard_view', descriptorFileName);
        }
        // On edit existing process' properties, when descriptor filename is changed, save descriptor under new name.
        // TODO (and delete the old file? no.)
        if (this.processDetailsFormOperation !== 'copy' &&
            this.processDetailsFormParentRecord &&
            this.processDetailsFormParentRecord['afm_processes.dashboard_view'] !== descriptorFileName) {
            var descriptorToSave = Ab.homepage.EditorServices.fetchDescriptor(
                this.processDetailsFormParentRecord['afm_processes.activity_id'],
                this.processDetailsFormParentRecord['afm_processes.process_id'],
                this.processDetailsFormParentRecord['afm_processes.dashboard_view']);
            Ab.homepage.EditorServices.saveDescriptor(descriptorFileName, descriptorToSave.descriptorXml);
        }
    },

    /**
     * After home page process form is saved, perform any associated operation.
     * On new, save a descriptor XML file. Request insert of afm_roleprocs association record.
     * On copy, request server copy descriptor XML file. Association record create automatically.
     */
    descriptorDetailsForm_onSave: function() {
        var isSaved = false;
        if (this.descriptorDetailsForm.canSave() /* && this.descriptorDetailsForm.save() */) {
            var fieldVals = this.descriptorDetailsForm.getFieldValues();

            if (this.processDetailsFormOperation === 'new') {
                // TODO this will throw a wfr exception when the file cannot be written -> try - catch
                // TODO what is the protocol when the file exists - auto overwrite, auto preserve, or ask?
                // save new, blank, descriptor file
                Ab.homepage.EditorServices.saveDescriptor(fieldVals['afm_processes.dashboard_view'],
                    '<navigation-page><row height="three-quarters"></row></navigation-page>');
                Ab.homepage.EditorServices.createLinkingRoleProcsRecord(fieldVals);
            }
            else if (this.processDetailsFormOperation === 'copy') {
                fieldVals.originalDescriptorFileName = this.processDetailsFormParentRecord['afm_processes.dashboard_view'];
                Ab.homepage.EditorServices.copyDescriptorProcess(fieldVals);

                // TODO can the copy be done client-side without a separate service call def?
                // fetch originalDescriptor then save under new name. still need createLinkingRoleProcsRecord() call.
                // it would make service interface smaller.
            }
            // save descriptor after calling WFRs so exceptions preclude afm_processes record creation
            isSaved = this.descriptorDetailsForm.save();
        }
        return isSaved;
    },

    /**
     * Set the value of the process form parent record.
     */
    setParentRecord: function() {
        var index = this.homePageProcessGrid.selectedRowIndex;
        if (index >= 0) {
            this.processDetailsFormParentRecord = this.homePageProcessGrid.rows[index];
        }
        else {
            this.processDetailsFormParentRecord = null;
        }
    },

    /**
     * True when the process_id, title, and dashboard_view fields have been changed from their initial values.
     *
     * @param newFileName
     * @param newProcessId
     * @param newTitle
     * @returns {boolean}
     */
    verifyDescriptorPropertiesChanged: function(newFileName, newProcessId, newTitle) {
        var recordChanged = true;

        if (!this.processDetailsFormParentRecord) {
            View.showMessage(getMessage("parentRecordError"));
            recordChanged = false;
        }
        else if (this.processDetailsFormParentRecord['afm_processes.process_id'] === newProcessId) {
            recordChanged = false;
        }
        else if (this.processDetailsFormParentRecord['afm_processes.title'] === newTitle) {
            recordChanged = false;
        }
        else if (this.processDetailsFormParentRecord['afm_processes.dashboard_view'] === newFileName) {
            recordChanged = false;
        }

        return recordChanged;
    },

    /**
     * True when the user-editable non-defaulted fields are all empty.
     * @param fieldValues
     * @returns {boolean}
     */
    verifyValuesEmpty: function(fieldValues) {
        var valuesAreEmpty = true;
        for (var fieldName in fieldValues) {
            if ((fieldName === 'afm_processes.process_id' || fieldName === 'afm_processes.dashboard_view' || fieldName === 'afm_processes.title') &&
                fieldValues[fieldName]) {
                valuesAreEmpty = false;
                break;
            }
        }

        return valuesAreEmpty;
    },

    /**
     * Set the values of the user-editable non-defaulted fields.
     * @param record
     */
    setFormValuesFromParentRecord: function(record) {
        if (record) {
            this.descriptorDetailsForm.setFieldValue('afm_processes.process_id', record['afm_processes.process_id']);
            this.descriptorDetailsForm.setFieldValue('afm_processes.title', record['afm_processes.title']);
            this.descriptorDetailsForm.setFieldValue('afm_processes.dashboard_view', record['afm_processes.dashboard_view']);
            this.descriptorDetailsForm.setFieldValue('afm_processes.display_order',
                record['afm_processes.display_order.raw'] || record['afm_processes.display_order']);
            this.descriptorDetailsForm.setFieldValue('afm_processes.is_active',
                record['afm_processes.is_active.raw'] || record['afm_processes.is_active']);
            this.descriptorDetailsForm.setFieldValue('afm_processes.license_level',
                record['afm_processes.license_level.raw'] || record['afm_processes.license_level']);
        }
    }
});

/**
 *
 */
function refreshProcessGrid() {
    pgnavProcessDescriptorController.homePageProcessGrid.refresh();
}

/**
 * Request confirmation of the home page afm_processes record delete.
 * Perform the delete if confirmed, then refresh the grid.
 */
function confirmDeleteAndRefresh() {
    View.confirm(getMessage("confirmProcessDelete"), function (button) {
        if (button === 'yes') {
            var panel = pgnavProcessDescriptorController.homePageProcessGrid;
            if (panel != null && panel.selectedRowIndex >= 0) {
                var parameters = {
                    viewName: panel.viewDef.viewName,
                    groupIndex: (typeof panel.viewDef.tableGroupIndex === 'undefined') ? 0 : panel.viewDef.tableGroupIndex,
                    controlId: (typeof panel.panelId === 'undefined') ? panel.id : panel.panelId,
                    version: Ab.view.View.version,
                    dataSourceId: panel.dataSourceId
                };

                var row = panel.rows[panel.selectedRowIndex];
                if (row != null) {
                    var pKeyValues = panel.getPrimaryKeysForRow(row);
                    parameters.fieldValues = toJSON(pKeyValues);
                }

                var wfrResult = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters);
                if (wfrResult.code !== 'executed') {
                    Ab.workflow.Workflow.handleError(wfrResult);
                }
            }

            pgnavProcessDescriptorController.homePageProcessGrid.refresh();
        }
    });
}

/**
 * The flag pageNavigationDescriptorDetails_operation {new, copy, edit} denotes the operations on save of afm_processes record.
 * Descriptor file does not need to be created on save.
 * afm_processes record does need to be saved by saving the form programmatically.
 */
function initializeNewProcess() {
    pgnavProcessDescriptorController.processDetailsFormOperation = 'new';
}

/**
 * The flag pageNavigationDescriptorDetails_operation {new, copy, edit} denotes the operations on save of afm_processes record.
 * Descriptor file does need to be created on save.
 */
function initializeCopyProcess() {
    pgnavProcessDescriptorController.processDetailsFormOperation = 'copy';
}

/**
 * The flag pageNavigationDescriptorDetails_operation {new, copy, edit} denotes the operations on save of afm_processes record.
 * Descriptor file doesn't need to be created or persisted on save.
 */
function initializeEditProcess() {
    pgnavProcessDescriptorController.processDetailsFormOperation = 'edit';
}


