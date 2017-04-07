/**
 * Created by Meyer on 9/30/2015.
 *
 * Home page editor view support.
 */
var pgnavPageEditorController = View.createController('pgnavPageEditorController', {

    /**
     * ID of the parent bucket launching an edit form.
     */
    parentBucketId: '',

    /**
     * An array of background CSS rules from quiet.css for use in the process bucket properties form.
     */
    backgroundShadingStyles: [],

    /**
     * Base Map Layers allowed for an ESRI map implementation.
     */
    esriBaseLayers: [
        pageNavStrings.z_PAGENAV_MAP_WORLD_IMAGERY,
        pageNavStrings.z_PAGENAV_MAP_WORLD_IMAGERY_WITH_LABELS,
        pageNavStrings.z_PAGENAV_MAP_WORLD_LIGHT_GRAY_BASE,
        pageNavStrings.z_PAGENAV_MAP_WORLD_DARK_GRAY_BASE,
        pageNavStrings.z_PAGENAV_MAP_WORLD_STREET_MAP,
        pageNavStrings.z_PAGENAV_MAP_WORLD_SHADED_RELIEF,
        pageNavStrings.z_PAGENAV_MAP_WORLD_TOPOGRAPHIC_MAP,
        pageNavStrings.z_PAGENAV_MAP_NATGEO_WORLD_MAP,
        pageNavStrings.z_PAGENAV_MAP_OCEAN_BASEMAP
    ],

    /**
     * Base Map Layers allowed for an Google map implementation.
     */
    googleBaseLayers: [
        pageNavStrings.z_PAGENAV_MAP_ROADMAP,
        pageNavStrings.z_PAGENAV_MAP_SATELLITE,
        pageNavStrings.z_PAGENAV_MAP_HYBRID,
        pageNavStrings.z_PAGENAV_MAP_TERRAIN
    ],

    /**
     * Collection of grid rows from the Process tab. Provides selectValue dropdown values for the Open dialog.
     */
    afmProcessesRows: '',


    isDirty: false,

    /**
     * After the view has loaded
     * if opened from user menu, process the url params to load a descriptor and disable titlebar buttons.
     */
    afterViewLoad: function() {
        var descriptorFileName = this.getUrlParameterValue('descriptorfile');
        var processId = this.getUrlParameterValue('processid');
        var parentTab = this.view.getParentTab();

        if (descriptorFileName) {
            var descriptor = Ab.homepage.EditorServices.fetchDescriptor('', processId, descriptorFileName);
            Ab.homepage.EditorController.loadDescriptorIntoEditor(descriptor);

            // disable titlebar buttons that are not valid in single tab case.
            this.pageEditorPanel.enableButton('newPage', false);
            this.pageEditorPanel.enableButton('openPage', false);
            this.pageEditorPanel.enableButton('savePageAs', false);
            this.pageEditorPanel.enableButton('publishAll', false);
        }
        else if (!this.view.restriction && (parentTab && !parentTab.restriction)) {
            this.loadNewPage();
        }
    },

    /**
     * When page refreshes clear editor or load descriptor.
     * @param vwRestriction
     * @param newRecord
     * @param clearRestriction
     */
    afterRefresh: function(vwRestriction) {
        var currentDescriptorProcess = jQuery('#pageAttributes').data('currentDescriptorProcess');
        var descriptorProcess = vwRestriction ? vwRestriction['afm_processes.process_id'] : null;

        if (!descriptorProcess && !currentDescriptorProcess) {
            //this.clearEditor();
            this.loadNewPage();
        }
        else if (descriptorProcess && currentDescriptorProcess != descriptorProcess) {
            this.clearEditor();
            var descriptor = Ab.homepage.EditorServices.fetchDescriptor(vwRestriction['afm_processes.activity_id'], descriptorProcess, '');
            Ab.homepage.EditorController.loadDescriptorIntoEditor(descriptor);
        }
    },

    /**
     * Return the value of the URL parameter named by the input.
     * Returns empty string if no parameter is found.
     * @param parameterName
     */
     getUrlParameterValue: function(parameterName) {
        var parameterValue = '';

        if (location.search.indexOf('?') >= 0) {
            var params = location.search.substr(location.search.indexOf('?') + 1);
            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var temp = params[i].split('=');
                if (temp[0] === parameterName) {
                    parameterValue = temp[1];
                    break;
                }
            }
        }

        return parameterValue;
    },

    /**
     * Transfer the process tab's records into this view environment,
     * to be used for 'Open Page's select values
     */
    setExistingProcessRecords: function() {
        var processTab = this.view.parentTab.parentPanel.findTab('abPageNavManageHomePages_processes');
        var processTabController = processTab.getContentFrame().View.controllers.get('pgnavProcessDescriptorController');
        this.afmProcessesRows = processTabController.homePageProcessGrid.rows;
    },

    /**
     * Handle 'New' button click.
     */
    pageEditorPanel_onNewPage : function() {
        if (this.isDirty) {
            var controller = this;
            View.confirm(getMessage("continueAndLoseEditsMessage"), function (button) {
                if (button === 'yes') {
                    controller.handleNewPageAction(controller);
                }
            });
        }
        else {
            this.handleNewPageAction(this);
        }
    },

    /**
     * Perform the actual New Page action.
     * @param viewController
     */
    handleNewPageAction: function(viewController) {
        for (var i = 0, tab; tab = viewController.view.parentTab.parentPanel.tabs[i]; i++) {
            tab.restriction = null;
        }
        viewController.loadNewPage();
    },

    /**
     * Load an 'empty' descriptor into the editor.
     * @param process
     * @param fileName
     */
    loadNewPage: function(process, fileName) {
        Ab.homepage.EditorController.loadDescriptorIntoEditor({
            descriptorFileName: fileName || '',
            processId: process || '',
            descriptorXml: '<navigation-page><row height="three-quarters"></row></navigation-page>'
        });
    },

    /**
     * Handle 'Open' button click.
     * Open dialog to set the descriptor process, title OR file name.
     */
    pageEditorPanel_onOpenPage: function() {
        if (this.isDirty) {
            var controller = this;
            View.confirm(getMessage("continueAndLoseEditsMessage"), function (button) {
                if (button === 'yes') {
                    controller.handleOpenPageAction();
                }
            });
        }
        else {
            this.handleOpenPageAction();
        }
    },

    /**
     * Perform the actual new page action.
     */
    handleOpenPageAction: function() {
        this.descriptorOpenForm.clear();
        this.setExistingProcessRecords();

        this.descriptorOpenForm.showInWindow({
            width: 600,
            closeButton: true,
            modal: true,
            title: getMessage('openPageFormTitle')
        });

        this.setDescriptorOpenFormFieldOptions();
    },

    /**
     * Set the select field elements' options of the descriptorOpenForm using the records in
     * the process tab's afm_processes grid.
     * This controller afmProcessesRows field holds existing rows from processes tab to fill selectValues.
     * TODO this only needs to be reset when the view is opened/refreshed and when a SaveAs... happens.
     */
    setDescriptorOpenFormFieldOptions: function() {
        var processOptions = '<option value=""> </option>';
        var titleOptions = '<option value=""> </option>';
        var descriptorFileOptions = '<option value=""> </option>';

        var processRowCount = this.afmProcessesRows.length;
        for (var i = 0; i < processRowCount; i++) {
            var row = this.afmProcessesRows[i];
            var descriptorFile = row['afm_processes.dashboard_view'];
            // skip applications page record
            if (descriptorFile) {
                processOptions += '<option value="' + row['afm_processes.process_id'] + '">' + row['afm_processes.process_id'] + '</option>'
                titleOptions += '<option value="' + row['afm_processes.title'] + '">' + row['afm_processes.title'] + '</option>'
                descriptorFileOptions += '<option value="' + descriptorFile + '">' + descriptorFile + '</option>'
            }
        }

        var processIdSelectElement = jQuery('#descriptorOpenForm_afm_processes\\.process_id');
        var titleSelectElement = jQuery('#descriptorOpenForm_afm_processes\\.title');
        var descriptorFileSelectElement = jQuery('#descriptorOpenForm_afm_processes\\.dashboard_view');

        processIdSelectElement.empty();
        processIdSelectElement.append(processOptions);
        titleSelectElement.empty();
        titleSelectElement.append(titleOptions);
        descriptorFileSelectElement.empty();
        descriptorFileSelectElement.append(descriptorFileOptions);
    },

    /**
     * Handle 'Save' button click.
     * Save the descriptor to the server.
     */
    pageEditorPanel_onSavePage: function() {
        var descriptorFileName = jQuery('#pageAttributes').data('currentDescriptorFile');
        var processId = jQuery('#pageAttributes').data('currentDescriptorProcess');

        // isNew? - name not set yet, enter dialog to set props
        if (descriptorFileName) {
            this.saveEditedDescriptor(descriptorFileName);
            View.showMessage(String.format(getMessage('descriptorSavedMessage'), processId));
        }
        else {
            this.showDescriptorDetailsFormInWindow("newPageFormTitle");
            this.setDescriptorFormIsPublish('false');
        }
    },

    /**
     * Handle 'Save As...' button click.
     */
    pageEditorPanel_onSavePageAs: function() {
        this.showDescriptorDetailsFormInWindow("savePageAsFormTitle");
        this.setDescriptorFormIsPublish('false');
    },

    /**
     * Handle 'Clear' button click.
     */
    pageEditorPanel_onClearPage: function() {
        if (this.isDirty) {
            var controller = this;
            View.confirm(getMessage("continueAndLoseEditsMessage"), function (button) {
                if (button === 'yes') {
                    controller.handleClearPageAction();
                }
            });
        }
        else {
            this.handleClearPageAction();
        }
    },

    /**
     * Perform the actual Clear Page action.
     */
    handleClearPageAction: function() {
        var processId = jQuery('#pageAttributes').data('currentDescriptorProcess');
        var fileName = jQuery('#pageAttributes').data('currentDescriptorFile');
        this.loadNewPage(processId, fileName);
    },

    /**
     * Handle 'Publish' button click.
     */
    pageEditorPanel_onPublishPage: function() {
        var descriptorFileName = jQuery('#pageAttributes').data('currentDescriptorFile');
        if (descriptorFileName) {
            var processId = jQuery('#pageAttributes').data('currentDescriptorProcess');
            var title = jQuery('#pageEditorPanel_title').text();
            this.saveAndPublish(descriptorFileName, processId, title);
        }
        else {
            this.showDescriptorDetailsFormInWindow("publishPageFormTitle");
            this.setDescriptorFormIsPublish('one');
        }
    },

    /**
     * Publish all pages for all roles.
     * TODO add a progress bar or at least change the cursor for long process
     */
    pageEditorPanel_onPublishAll: function() {
        var descriptorFileName = jQuery('#pageAttributes').data('currentDescriptorFile');
        if (descriptorFileName) {
            this.editorPublishAll();
        }
        else {
            this.showDescriptorDetailsFormInWindow("publishPageFormTitle");
            this.setDescriptorFormIsPublish('all');
        }
    },

    /**
     * Open the descriptorDetailsForm in a new dialog window.
     * @param messageName View message title to use for dialog
     */
    showDescriptorDetailsFormInWindow: function(messageName) {
        this.descriptorDetailsForm.clear();
        this.descriptorDetailsForm.showInWindow({
            width: 600,
            closeButton: true,
            modal: true,
            newRecord: true,
            restriction: {},
            title: getMessage(messageName)
        });
    },

    /**
     * Perform the Publish All action.
     */
    editorPublishAll: function() {
        try {
            var wfrResult = Workflow.runRuleAndReturnResult('AbCommonResources-generateNavigationPagesForRole', {
                viewName: "ab-publish-navigation-pages.axvw",
                dataSourceId: "pageNavigationRoles_ds",
                controlId: "pageNavigationRolesGrid",
                doPublishAll: true,
                version: Ab.view.View.version,
                groupIndex: 0
                }
            );

            // wfrResult.data.value holds the error count
            if (wfrResult.code == 'executed' && wfrResult.data.value == 0) {
                View.showMessage(wfrResult.data.message);
            }
            else {
                Ab.workflow.Workflow.handleError(wfrResult);
            }
        }
        catch (e) {
            Workflow.handleError(e);
        }
    },

    /**
     * Utility packaging save AND publish steps.
     * @param descriptorFileName
     * @param processId
     * @param title
     */
    saveAndPublish: function(descriptorFileName, processId, title) {
        // call wfr to publish only this descriptor
        this.saveEditedDescriptor(descriptorFileName);
        if (Ab.homepage.EditorServices.publishDescriptor(descriptorFileName, processId, title)) {
            View.showMessage(String.format(getMessage('descriptorPublishedMessage'), processId));
        }
    },

    /**
     * Before save:
     * ensure descriptor file name ends in '.xml';
     * set the activity id.
     */
    descriptorDetailsForm_beforeSave: function() {
        var descriptorFileName = this.descriptorDetailsForm.getFieldValue('afm_processes.dashboard_view');
        var validFileName = Ab.homepage.EditorParser.ensureDescriptorFileNameValidity(descriptorFileName);
        if (descriptorFileName !== validFileName) {
            this.descriptorDetailsForm.setFieldValue('afm_processes.dashboard_view', validFileName);
        }
        this.descriptorDetailsForm.setFieldValue('afm_processes.activity_id', 'AbDashboardPageNavigation');
    },

    /**
     * Handle the save command event to both save the form and save the descriptor XML.
     */
    descriptorDetailsForm_onSave: function() {
        var fieldValues = this.descriptorDetailsForm.getFieldValues();
        var toBePublished = fieldValues['afm_processes.is_publish'];

        if (this.descriptorDetailsForm.canSave()) {
            fieldValues = this.descriptorDetailsForm.getFieldValues();
            var processId = fieldValues['afm_processes.process_id'];
            var descriptorFileName = fieldValues['afm_processes.dashboard_view'];
            // save descriptor file
            this.saveEditedDescriptor(descriptorFileName);
            // save descriptor process
            this.descriptorDetailsForm.save();

            var titleElem = jQuery('#pageEditorPanel_title');
            jQuery('#pageAttributes').data('currentDescriptorProcess', processId);
            jQuery('#pageAttributes').data('currentDescriptorFile', descriptorFileName);
            jQuery(titleElem).text(processId);
            jQuery(titleElem).attr('title', descriptorFileName);

            var wfrResult = Ab.homepage.EditorServices.createLinkingRoleProcsRecord(fieldValues);
            if (wfrResult === "executed") {
                if (toBePublished === 'one' &&
                    Ab.homepage.EditorServices.publishDescriptor(descriptorFileName, processId, fieldValues['afm_processes.title'])) {
                    View.showMessage(String.format(getMessage('descriptorPublishedMessage'), processId));
                }
                else if (toBePublished === 'all') {
                    this.editorPublishAll();
                }
                else {
                    View.showMessage(String.format(getMessage('descriptorSavedMessage'), processId));
                }
            }
        }
    },

    /**
     * Handle a click on the descriptorOpenForm's 'Open' button
     */
    descriptorOpenForm_onOpen: function() {
        var fieldValues = this.descriptorOpenForm.getFieldValues();
        this.openDescriptorFromFields(fieldValues);
    },

    /**
     * Open the descriptor named in the form field values.
     *
     * @param fieldValues
     */
    openDescriptorFromFields: function(fieldValues) {
        // use a single value from the form to get whole afmProcessesRecord, fill in BOTH processId and fileName
        var processRecord = this.getProcesRecordFromFieldValues(fieldValues);
        if (processRecord.process_id || processRecord.title || processRecord.fileName ) {
            Ab.homepage.EditorController.loadDescriptor(processRecord.process_id, processRecord.fileName);
            jQuery("#pageAttributes").data( "currentDescriptorFile", processRecord.fileName );
        }
        else {
            View.showMessage(getMessage('fieldSelectionRequiredMessage'));
        }
    },

    /**
     * Return the whole afmProcessesRecord, fill in BOTH processId and fileName
     * @param fieldValues
     * @returns {{process_id: string, title: string, fileName: string}}
     */
    getProcesRecordFromFieldValues: function(fieldValues) {
        var processRecord = {process_id: '', title: '', fileName: ''};
        var processId = fieldValues['afm_processes.process_id'];
        var title = fieldValues['afm_processes.title'];
        var fileName = fieldValues['afm_processes.dashboard_view'];

        var processRowCount = this.afmProcessesRows.length;
        for (var i = 0; i < processRowCount; i++) {
            var row = this.afmProcessesRows[i];
            if ((processId && processId === row['afm_processes.process_id']) ||
                (title && title === row['afm_processes.title']) ||
                (fileName && fileName === row['afm_processes.dashboard_view'])) {
                processRecord.process_id = row['afm_processes.process_id'];
                processRecord.title = row['afm_processes.title'];
                processRecord.fileName = row['afm_processes.dashboard_view'];
                break;
            }
        }

        return processRecord;
    },

    /**
     * Set the bucket properties edit form fields to the values of the restriction.
     * @param restriction
     * @param bucketId
     */
    initializeBucketPropertiesForm: function(restriction, bucketId) {
        this.parentBucketId = bucketId;
        this.localizeBaseLayersIfNeeded();
        this.fillBackgroundStylesIfNeeded();
        this.setBackgroundSelectOptions('#bucketPropertiesForm_body');

        this.setBucketPropertiesFormValues(restriction);
        this.initializeBucketPropertiesFormDisplay();
        // hide/show fields per control type
        this.bucketPropertiesForm_bucketTypeChanged();
        shadingChanged(null);

        var currentTypeSelection = this.bucketPropertiesForm.getFieldValue('afm_ptasks.type');
        this.bucketPropertiesForm.enableField('afm_ptasks.type', ("" === currentTypeSelection));
    },

    /**
     * Set the bucket properties edit form's fields initial hide/show.
     */
    initializeBucketPropertiesFormDisplay: function() {
        showAbstractBucketProperties(true);
        showConcreteProperties(false);
        resetShadingBackground();
    },

    /**
     * Initialize the bucket properties form field values
     * using the restriction set with the bucket attributes.
     * @param restriction
     */
    setBucketPropertiesFormValues: function(restriction) {
        if (!restriction || !restriction.clauses) { return; }

        this.clearBucketPropertiesFormValues();
        for (var i = 0; i < restriction.clauses.length; i++) {
            var clause = restriction.clauses[i];
            var fieldName =  clause.name.indexOf('-id') > 0 ?  clause.name.replace('-id', '_id') : clause.name;
            var fieldValue = clause.value;
            this.bucketPropertiesForm.setFieldValue(fieldName, fieldValue, fieldValue, false);
        }
    },

    /**
     * Localize the values used in the base map layer combobox.
     */
    localizeBaseLayersIfNeeded: function() {
        if (this.backgroundShadingStyles.length === 0) {
            var arrayLength = this.esriBaseLayers.length;
            for (var i = 0; i < arrayLength; i++) {
                this.esriBaseLayers[i] = getLocalizedString(this.esriBaseLayers[i]);
            }
            arrayLength = this.googleBaseLayers.length;
            for (var j = 0; j < arrayLength; j++) {
                this.googleBaseLayers[j] = getLocalizedString(this.googleBaseLayers[j]);
            }
        }
    },

    /**
     * Load the backgroundShadingStyles Array the first time.
     */
    fillBackgroundStylesIfNeeded: function() {
        if (this.backgroundShadingStyles.length === 0) {
            this.backgroundShadingStyles = this.getBackgroundShadingStyles();
        }
    },

    /**
     * Return an array of all the possible background shading styles.
     * Array elements are keyed by the style selector.
     * [{key: '.bucket-background-light-lblue', value: 'background-color: #dbe5f1;'}]
     *
     * @returns {Array}
     */
    getBackgroundShadingStyles: function () {
        var shadingRules = [];
        var styleSheets = document.styleSheets;
        var styleSheetsLength = styleSheets.length;
        for (var i = 0; i < styleSheetsLength; i++) {
            // only need to inspect quiet.css
            if (!styleSheets[i].href || styleSheets[i].href.indexOf('/quiet.css') === -1) {
                continue;
            }

            var styleRules = styleSheets[i].rules || styleSheets[i].cssRules || [];
            var rulesLength = styleRules.length;
            for (var j = 0; j < rulesLength; j++) {
                var selector = styleRules[j].selectorText;

                // skip mediaRules, fontFaceRules, etc.
                if (selector && selector.indexOf('.bucket-background-') === 0) {
                    var valueObj = (styleRules[j].cssText) ? styleRules[j].cssText : styleRules[j].style.cssText;
                    valueObj = valueObj.substring(valueObj.indexOf('{') + 1, valueObj.indexOf('}')).trim();
                    shadingRules.push({key: selector.substr(1), value: valueObj});
                }
            }
        }

        return shadingRules;
    },

    /**
     * Set the option elements within the background shading select element.
     * @param formTableId
     */
    setBackgroundSelectOptions: function(formTableId) {
        var controller = this;
        var formTable = jQuery(formTableId);
        jQuery(formTable).find('select').each(function () {
            var selectId = jQuery(this).attr('id');
            if (selectId.indexOf('backgroundshading') > 0) {
                // if initialized -> noop.
                var selectOptions = jQuery(this).html();
                if (selectOptions.indexOf('bucket-background') < 0) {
                    var optionsHtml = '<option value=""> </option>';
                    var shadingCount = controller.backgroundShadingStyles.length;
                    var prefixCount = 'bucket-background-'.length;
                    for (var i = 0; i < shadingCount; i++) {
                        var backgroundShading = controller.backgroundShadingStyles[i];
                        optionsHtml += '<option value="' + backgroundShading.key + '" class="' + backgroundShading.key + '">' +
                                // KB 3053191 Only show color, not textual name from CSS file.
                                // backgroundShading.key.substr(prefixCount) +
                            '</option>';
                    }
                    jQuery(this).html(optionsHtml);
                }
            }
        });
    },

    /**
     * Handle the bucket's bucket type selector's change event.
     * @param triggerElem
     */
    bucketPropertiesForm_bucketTypeChanged: function(triggerElem) {
        var currentTypeSelection = this.bucketPropertiesForm.getFieldValue('afm_ptasks.type');

        if ("process" === currentTypeSelection) {
            showProcessBucketProperties(true);
            // KB 3053282
            // this.bucketPropertiesForm.enableField('afm_ptasks.activity_id', false);
        }
        else if ("app-specific" === currentTypeSelection) {
            showAppSpecificBucketProperties(true);
            controlTypeChangedIfNotNull();
        }
        else if ("favorites" === currentTypeSelection) {
            showConcreteProperties(false);
            showAccompanyingProperties(true);
        }
    },

    /**
     * Feed the modified property values back into the bucket HTML.
     */
    bucketPropertiesForm_onSave: function() {
        this.isDirty = true;
        var fieldValues = this.bucketPropertiesForm.getFieldValues();
        // feed this back into the bucket's HTML (both data attributes and visible table)
        // see ab-pgnav-editor-view.js getProcessBucketHtml()
        this.updateEditedBucketProperties(this.parentBucketId, fieldValues);
    },

    /**
     * Feed the property values from the edit form back into the bucket properties and data attributes.
     * @param bucketId
     * @param fieldValues
     */
    updateEditedBucketProperties: function (bucketId, fieldValues) {
        var bucketElem = jQuery('#' + bucketId);
        var bucketType = fieldValues['afm_ptasks.type'];

        // update bucket div's data attributes
        this.updateBucketDataValues(bucketElem, fieldValues);
        // update buckets title and menu
        this.updateBucketTitlebar(bucketElem, fieldValues['afm_ptasks.title']);

        // update buckets displayed properties values
        var idSuffix = bucketId.substr('bucket_'.length);
        var updatedPropertiesTable = '';
        if (bucketType === 'process') {
            updatedPropertiesTable = Ab.homepage.EditorView.getProcessBucketPropertiesTable(idSuffix,
                fieldValues['afm_ptasks.activity_id'], fieldValues['afm_ptasks.process_id'], '');
        }
        else if (bucketType === 'favorites') {
            updatedPropertiesTable = Ab.homepage.EditorView.getFavoritesBucketPropertiesTable();
            // update associate action button
            var assocButtonElem = jQuery(bucketElem).find('.assoc-button');
            if (assocButtonElem) {
                jQuery(assocButtonElem).attr('disabled', 'disabled');
                jQuery(assocButtonElem).attr('title', getLocalizedString(Ab.homepage.EditorView.z_TOOLTIP_FAVORITES_EDIT));

            }
        }
        else {
            updatedPropertiesTable = Ab.homepage.EditorView.getAppSpecificBucketPropertiesTable(idSuffix,
                jQuery(bucketElem).data());
            // update associate action button's label
            var labelSpan = jQuery(bucketElem).find('.assoc-button > span');
            if (labelSpan) {
                jQuery(labelSpan).text(getLocalizedString(Ab.homepage.EditorView.z_LABEL_EDIT_METRICS));
            }
        }

        jQuery('#table_' + idSuffix).replaceWith(updatedPropertiesTable);

    },

    /**
     * Modify the bucket element's 'data-' values with the, potentially modified, field values.
     * @param bucketElem
     * @param fieldValues
     */
    updateBucketDataValues: function (bucketElem, fieldValues) {
        var previousValues = Ab.homepage.EditorParser.getBucketDataAttributes(bucketElem, false);

        // update bucket div's data attributes
        for (var attributeName in fieldValues) {
            var shortname = attributeName.substr(attributeName.indexOf('.') + 1);

            if (previousValues[shortname] && fieldValues[attributeName] &&
                fieldValues[attributeName] !== previousValues[shortname]) {
                jQuery(bucketElem).data(shortname, fieldValues[attributeName]);
                //valuesChanged = true;
            }
            else if (!previousValues[shortname]) {
                jQuery(bucketElem).data(shortname, fieldValues[attributeName]);
                //valuesAdded = true;
            }
        }
    },

    /**
     * Modify a bucket's title and menu
     * @param bucketElem
     * @param title
     */
    updateBucketTitlebar: function (bucketElem, title) {
        var titleElem = jQuery(bucketElem).children('h2');
        var menuElem = jQuery(titleElem).children('table.bucket-title-menu');
        jQuery(titleElem).text(title);
        jQuery(titleElem).append(menuElem);
    },

    /**
     * Set the edit form field values to their initial state.
     */
    clearBucketPropertiesFormValues: function() {
        this.bucketPropertiesForm.clear();
        this.bucketPropertiesForm.setFieldValue('afm_ptasks.title', 'Title');
    },

    /**
     * Handle the 'Add Tasks' click - open pTasks dialog.
     */
    assignedTasksGrid_onAddBucketTask: function() {
        View.openDialog('ab-pgnav-manage-process-tasks.axvw', null, true, {
            width: 1050,
            height: 1200,
            displayOrder: this.getMaxExistingDisplayOrder(),
            closeButton: false,
            title: getMessage("processTasksActionTitle")
        });
    },

    /**
     * Return the maximum afm_ptasks.display_order in the Assigned Tasks grid.
     * @returns {number}
     */
    getMaxExistingDisplayOrder: function() {
        var maxDisplayOrder = 0;
        var existingTaskRows = this.assignedTasksGrid.rows;
        var rowCount = existingTaskRows.length;
        for (var j = 0; j < rowCount; j++) {
            var taskDisplayOrder = parseInt(existingTaskRows[j]['afm_ptasks.display_order.raw'], 10);
            if (taskDisplayOrder > maxDisplayOrder) {
                maxDisplayOrder = taskDisplayOrder;
            }
        }

        return maxDisplayOrder;
    },

    /**
     * Clear the content from the current editor.
     */
    clearEditor: function () {
        jQuery('#applicationsTabView').empty();
        jQuery('#pageAttributes').data('currentDescriptorProcess','');
        jQuery('#pageAttributes').data('currentDescriptorFile','');
        jQuery('#pageEditorPanel_title').text('');
    },

    /**
     * Save the current content to the server as a descriptor file.
     */
     saveEditedDescriptor: function(descriptorFileName) {
        if (descriptorFileName) {
            var descriptorToSave = Ab.homepage.EditorParser.parseDisplayToXml();
            Ab.homepage.EditorServices.saveDescriptor(descriptorFileName, descriptorToSave);
            this.isDirty = false;
        }
        else {
            View.showMessage(getMessage("noDescriptorMessage"));
        }
    },

    /**
     * Set the form values from the divider div's data attributes.
     * @param dividerAttributes
     * @param dividerId
     */
    initializePageDividerForm: function(dividerAttributes, dividerId) {
        this.parentBucketId = dividerId;
        this.fillBackgroundStylesIfNeeded();
        this.setBackgroundSelectOptions('#pageDividerForm_body');
        var dividerTitle = dividerAttributes['title'];
        var dividerBackground = dividerAttributes['backgroundshading'];
        // this.pageDividerForm.setFieldValue();
        this.pageDividerForm.setFieldValue('afm_ptasks.title', dividerTitle);
        this.pageDividerForm.setFieldValue('afm_ptasks.backgroundshading', dividerBackground);
    },

    /**
     * Handle save action,
     */
    pageDividerForm_onSave: function() {
        this.isDirty = true;
        var fieldValues = this.pageDividerForm.getFieldValues();
        // feed this back into the divider's HTML
        this.updatePageDividerProperties(this.parentBucketId, fieldValues);
    },

    /**
     * Feed the field avlues back into the HTML.
     * @param dividerId
     * @param fieldValues
     */
    updatePageDividerProperties: function(dividerId, fieldValues) {
        var dividerElem = jQuery('#' + dividerId);
        var textNode = jQuery(dividerElem).find("div.page-break-archibus > span");
        if (textNode.length === 1) {
            textNode[0].innerHTML = fieldValues['afm_ptasks.title'];
        }

        // TODO instead iterate over fieldValues and set data attribute for each
        jQuery('#' + dividerId).data('title', fieldValues['afm_ptasks.title']);
        jQuery('#' + dividerId).data('backgroundshading', fieldValues['afm_ptasks.backgroundshading']);
    },

    /**
     * Set the value for the 'hidden' field flag denoting whether or not to publish after dialog is saved.
     * Ensure field is hidden after value is set
     * @param isPub
     */
    setDescriptorFormIsPublish: function(isPub){
        this.descriptorDetailsForm.setFieldValue('afm_processes.is_publish', isPub);
        this.descriptorDetailsForm.showField('afm_processes.is_publish', false);
    }
});


/**
 * Handle the properties form's bucket's bucket type selector's change event.
 * @param triggerElem
 */
function bucketTypeChanged(triggerElem) {
    pgnavPageEditorController.bucketPropertiesForm_bucketTypeChanged(triggerElem);
}

/**
 * When the control_type field is non-empty
 * trigger the control type changed handler.
 */
function controlTypeChangedIfNotNull() {
    var currentControlType = pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.controltype');
    if (currentControlType && currentControlType.length > 0) {
        controlTypeChanged();
    }
}

/**
 * Handle the bucket's app-specific control selector's change event.
 * see ab-select-value.js use of actionListener in saveSelectedValue()
 * @param triggerElem
 * @param selectedValue
 * @param previousValue
 */
function controlTypeChanged(triggerElem, selectedValue, previousValue) {
    var currentSelection = pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.controltype');
    pgnavPageEditorController.bucketPropertiesForm.showField('afm_ptasks.tooltip', true);
    pgnavPageEditorController.bucketPropertiesForm.showField('afm_ptasks.backgroundshading', true);
    //alert('Control type changed to: ' + currentSelection);

    if ("processMetrics" === currentSelection) {
        showBucketPropFields({
            'afm_ptasks.metricname': false,
            'afm_ptasks.scorecard': true,
            'afm_ptasks.granularity': true,
            'afm_ptasks.usestoplightcolors': true,
            'afm_ptasks.columnspan': true
        });
    }
    else if ("alertsList" === currentSelection) {
        showBucketPropFields({
            'afm_ptasks.metricname': false,
            'afm_ptasks.scorecard': true,
            'afm_ptasks.granularity': true,
            'afm_ptasks.columnspan': false
        });
    }
    // metric values chart
    else if ("horizontalBarChart" === currentSelection) {
        showBarChartBasedOnMetricOrView(triggerElem, selectedValue);
    }
    // top-5 bar chart
    else if ("top5BarChart" === currentSelection) {
        showBucketPropFields({
            'afm_ptasks.metricname': false,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': false,
            'afm_ptasks.viewname': true,
            'afm_ptasks.datasourceid': true,
            'afm_ptasks.labelfield': true,
            'afm_ptasks.valuefield': true,
            'afm_ptasks.columnspan': false
        });
    }
    else if ("pgnav-map" === currentSelection) {
        showBucketPropFields({
            'afm_ptasks.metricname': true,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': true,
            'afm_ptasks.granularitylocation': true,
            'afm_ptasks.mapimplementation': true,
            'afm_ptasks.basemaplayer': true,
            'afm_ptasks.markerradius': true,
            'afm_ptasks.usestoplightcolors': true,
            'afm_ptasks.columnspan': true
        });
    }
    else {
        showBucketPropFields({
            'afm_ptasks.metricname': false,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': false,
            'afm_ptasks.columnspan': false
        });
    }
}

/**
 * Horizontal Bar Chart based on Metric Name, View Name, or still undecided -- show and hide relevant fields.
 * @param triggerElem
 * @param selectedValue
 */
function showBarChartBasedOnMetricOrView(triggerElem, selectedValue) {
    var metricName = selectedValue || pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.metricname');
    var viewName = pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.viewname');
    if (metricName && !viewName) {
        showBucketPropFields({
            'afm_ptasks.metricname': true,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': true,
            'afm_ptasks.sortorder': true,
            'afm_ptasks.valueontop': true,
            'afm_ptasks.recordlimit': true,
            'afm_ptasks.usestoplightcolors': true,
            'afm_ptasks.viewname': false,
            'afm_ptasks.datasourceid': false,
            'afm_ptasks.labelfield': false,
            'afm_ptasks.valuefield': false,
            'afm_ptasks.columnspan': false
        });
    }
    else if (viewName && !metricName) {
        showBucketPropFields({
            'afm_ptasks.metricname': false,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': false,
            'afm_ptasks.sortorder': false,
            'afm_ptasks.valueontop': false,
            'afm_ptasks.recordlimit': false,
            'afm_ptasks.usestoplightcolors': false,
            'afm_ptasks.viewname': true,
            'afm_ptasks.datasourceid': true,
            'afm_ptasks.labelfield': true,
            'afm_ptasks.valuefield': true,
            'afm_ptasks.columnspan': false
        });
    }
    else {
        showBucketPropFields({
            'afm_ptasks.metricname': true,
            'afm_ptasks.scorecard': false,
            'afm_ptasks.granularity': true,
            'afm_ptasks.viewname': true,
            'afm_ptasks.datasourceid': true,
            'afm_ptasks.labelfield': false,
            'afm_ptasks.valuefield': false,
            'afm_ptasks.sortorder': false,
            'afm_ptasks.valueontop': false,
            'afm_ptasks.recordlimit': false,
            'afm_ptasks.usestoplightcolors': false,
            'afm_ptasks.columnspan': false
        });
    }
}

/**
 * Display or hide the fields used by all bucket types.
 * @param show
 */
function showAbstractBucketProperties(show) {
    showBucketPropFields({
        'afm_ptasks.title': show,
        'afm_ptasks.type': show
    });
}

/**
 * Display or hide the fields used by specific bucket types.
 * @param show
 */
function showConcreteProperties(show) {
    showBucketPropFields({
        'afm_ptasks.activity_id': show,
        'afm_ptasks.process_id': show,
        'afm_ptasks.controltype': show,
        'afm_ptasks.scorecard': show,
        'afm_ptasks.granularity': show,
        'afm_ptasks.metricname': show,
        'afm_ptasks.tooltip': show,
        'afm_ptasks.columnspan': show,
        'afm_ptasks.backgroundshading': show,
        'afm_ptasks.usestoplightcolors': show,
        'afm_ptasks.granularitylocation': show,
        'afm_ptasks.mapimplementation': show,
        'afm_ptasks.basemaplayer': show,
        'afm_ptasks.markerradius': show,
        'afm_ptasks.viewname': show,
        'afm_ptasks.datasourceid': show,
        'afm_ptasks.labelfield': show,
        'afm_ptasks.valuefield': show,
        'afm_ptasks.abbreviatevalues': show,
        'afm_ptasks.recordlimit': show,
        'afm_ptasks.valueontop': show,
        'afm_ptasks.sortorder': show
    });
}

function showAccompanyingProperties(show) {
    showBucketPropFields({
        'afm_ptasks.tooltip': show,
        'afm_ptasks.backgroundshading': show,
    });
}

/**
 * Display or hide the fields used by the process bucket type.
 * @param show
 */
function showProcessBucketProperties(show) {
    showBucketPropFields({
        'afm_ptasks.activity_id': show,
        'afm_ptasks.process_id': show,
        'afm_ptasks.tooltip': show,
        'afm_ptasks.backgroundshading': show,
        'afm_ptasks.controltype': !show,
        'afm_ptasks.scorecard': !show,
        'afm_ptasks.granularity': !show,
        'afm_ptasks.metricname': !show,
        'afm_ptasks.columnspan': !show,
        'afm_ptasks.usestoplightcolors': !show,
        'afm_ptasks.granularitylocation': !show,
        'afm_ptasks.mapimplementation': !show,
        'afm_ptasks.basemaplayer': !show,
        'afm_ptasks.markerradius': !show,
        'afm_ptasks.viewname': !show,
        'afm_ptasks.datasourceid': !show,
        'afm_ptasks.labelfield': !show,
        'afm_ptasks.valuefield': !show,
        'afm_ptasks.abbreviatevalues': !show,
        'afm_ptasks.recordlimit': !show,
        'afm_ptasks.valueontop': !show,
        'afm_ptasks.sortorder': !show
    });
}

/**
 * Display or hide the fields used by the app-specific bucket type.
 * @param show
 */
function showAppSpecificBucketProperties(show) {
    showBucketPropFields({
        'afm_ptasks.activity_id': !show,
        'afm_ptasks.process_id': !show,
        'afm_ptasks.controltype': show,
        'afm_ptasks.tooltip': show,
        'afm_ptasks.backgroundshading': show,
        'afm_ptasks.scorecard': !show,
        'afm_ptasks.granularity': !show,
        'afm_ptasks.metricname': !show,
        'afm_ptasks.columnspan': !show,
        'afm_ptasks.usestoplightcolors': !show,
        'afm_ptasks.granularitylocation': !show,
        'afm_ptasks.mapimplementation': !show,
        'afm_ptasks.basemaplayer': !show,
        'afm_ptasks.markerradius': !show,
        'afm_ptasks.viewname': !show,
        'afm_ptasks.datasourceid': !show,
        'afm_ptasks.labelfield': !show,
        'afm_ptasks.valuefield': !show,
        'afm_ptasks.abbreviatevalues': !show,
        'afm_ptasks.recordlimit': !show,
        'afm_ptasks.valueontop': !show,
        'afm_ptasks.sortorder': !show
    });
}

/**
 * Handle the change in the afm_ptasks.mapimplementation (ESRI vs. Google) event
 * to present the appropriate base map layer choices.
 * @param triggerElem
 */
function mapImplementationChanged(triggerElem) {
    var mapImplementation = pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.mapimplementation');
    var valueArray = 'esri' === mapImplementation ?
        pgnavPageEditorController.esriBaseLayers :
        pgnavPageEditorController.googleBaseLayers;
    var formTable = jQuery('#bucketPropertiesForm_body');

    jQuery(formTable).find('select').each(function () {
        var selectId = jQuery(this).attr('id');
        if (selectId.indexOf('basemaplayer') > 0) {
            var optionsHtml = '<option value=""> </option>';
            var valuesCount = valueArray.length;
            for (var i = 0; i < valuesCount; i++) {
                optionsHtml += '<option value="' + valueArray[i] + '">' + valueArray[i] + '</option>';
            }

            jQuery(this).html(optionsHtml);
        }});
}

/**
 * Handle the change of the backgroundshading selected value
 * to change the background color of the form element itself.
 * @param triggerElem
 */
function shadingChanged(triggerElem) {
    var selectedShading = pgnavPageEditorController.bucketPropertiesForm.getFieldValue('afm_ptasks.backgroundshading');
    var formTable = jQuery('#bucketPropertiesForm_body');
    var bkgStyles = pgnavPageEditorController.backgroundShadingStyles;
    var styleCount = bkgStyles.length;

    jQuery(formTable).find('select').each(function () {
        var selectId = jQuery(this).attr('id');
        if (selectId.indexOf('backgroundshading') > 0) {
            for (var i = 0; i < styleCount; i++) {
                if (selectedShading === bkgStyles[i].key) {
                    var selectedBackground = bkgStyles[i].value;
                    jQuery(this).attr('style', 'background:' + selectedBackground.substr(selectedBackground.indexOf(':') + 1 ));
                    break;
                }
            }
        }
    });
}

/**
 * Reset the background color of the backgroundshading select element.
 */
function resetShadingBackground() {
    var formTable = jQuery('#bucketPropertiesForm_body');
    jQuery(formTable).find('select').each(function () {
        var selectId = jQuery(this).attr('id');
        if (selectId.indexOf('backgroundshading') > 0) {
            jQuery(this).attr('style', 'background:#fff');
        }
    });
}

/**
 * Iterate over the fields object and show or hide the field.
 * Each fields property is a fieldName whose value is true or false (show or hide).
 * @param fields
 */
function showBucketPropFields(fields) {
    for (var fieldName in fields) {
        pgnavPageEditorController.bucketPropertiesForm.showField(fieldName, fields[fieldName]);
    }
}

/**
 * Refresh the process bucket's assigned task dialog grid.
 */
function refreshAssignedTasksGrid() {
    pgnavPageEditorController.assignedTasksGrid.refresh();
}

/**
 * Request confirmation of the assigned afm_ptasks record delete.
 * Perform the delete if confirmed, then refresh the grid.
 */
function confirmDeleteAndRefresh() {
    View.confirm(getMessage("confirmPtaskDelete"), function (button) {
        if (button === 'yes') {
            var panel = pgnavPageEditorController.assignedTasksGrid;
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

            pgnavPageEditorController.assignedTasksGrid.refresh();
        }
    });
}

