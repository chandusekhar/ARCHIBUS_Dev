/**
 * Created by Meyer on 10/18/2015.
 *
 * ab-pgnav-editor-contoller.js
 * Support for the home page editor.
 * Handle user interaction with the viewable HTML
 */
/**
 * Namespace for the home page editor JS classes.
 */
Ab.namespace('homepage');

/**
 * Respond to user interaction and control the processing of the Home Page Editor view.
 * Singleton.
 */
Ab.homepage.EditorController = new (Base.extend({
        /**
         * The number of column spans per row used in the layout.
         */
        maxColumnsPerRow: 4,

        /**
         * Fetch the descriptor XML, transform it into the view HTML and append that to the panel.
         *
         * @param descriptorProcessId
         * @param descriptorFileName
         */
        loadDescriptor: function (descriptorProcessId, descriptorFileName) {
            // fetch descriptor via WFR
            var descriptor = Ab.homepage.EditorServices.fetchDescriptor('', descriptorProcessId, descriptorFileName);
            this.loadDescriptorIntoEditor(descriptor);
        },

        /**
         * Using the descriptor object, load the descriptor.descriptorXml into the view and
         * set the descriptor.descriptorFileName into the data attribute.
         *
         * @param descriptor
         */
        loadDescriptorIntoEditor: function (descriptor) {
            var titleElem = jQuery('#pageEditorPanel_title');
            var processId = '';
            var currentDescriptorFile = '';
            var appTabView = jQuery('#applicationsTabView');
            jQuery(appTabView).empty();
            jQuery('#pageAttributes').data('abstractBlockCounter', '0');
            jQuery('#pageAttributes').data('pagePanelCounter', '0');

            if (descriptor != null && descriptor.descriptorXml != null && descriptor.descriptorXml.length > 0) {
                processId = decodeURI(descriptor.processId);
                currentDescriptorFile = descriptor.descriptorFileName;
                jQuery(appTabView).append(this.getViewFromDescriptorXml(descriptor.descriptorXml));
                jQuery(appTabView).show();

                this.initializeRowMovementControls();
                this.initializeRowHeightSelections();
                this.initializeRowDividerButtons();
                this.setRowNames();
                Ab.homepage.EditorSortable.initializeDragDropSortables();
            }

            jQuery('#pageAttributes').data('currentDescriptorProcess', processId);
            jQuery('#pageAttributes').data('currentDescriptorFile', currentDescriptorFile);
            jQuery(titleElem).text(processId);
            jQuery(titleElem).attr('title', currentDescriptorFile);
            pgnavPageEditorController.isDirty = false;
        },

        /**
         * Return the view HTML for the given descriptor XML.
         *
         * @param descriptorXml
         * @returns {string}
         */
        getViewFromDescriptorXml: function (descriptorXml) {
            // parse XML string into XML Document object and then into a page model object
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(descriptorXml, "text/xml");
            var pageModel = Ab.homepage.EditorParser.parseDescriptorToModel(xmlDoc);

            return Ab.homepage.EditorView.createDisplayFromModel(pageModel);
        },

        /**
         * Iterate over the row palettes and active-ate the correct height anchor for the row's height.
         */
        initializeRowHeightSelections: function () {
            jQuery('.row-palette').each(function () {
                var rowHeight = jQuery(this).data('height');
                var anchor = jQuery(this).find('a.row-height-' + rowHeight);
                jQuery(anchor).addClass('active');
            });
        },

        /**
         * Set the display style for the row shift up/down arrows
         * so that first row is only down and last row is only up.
         */
        initializeRowMovementControls: function () {
            var rowPalettes = jQuery('div.row-palette');
            var rowCount = rowPalettes.length;
            var rowIndex = 0;
            jQuery(rowPalettes).each(function () {
                var upArrow = jQuery(this).find('a.row-move-up');
                var downArrow = jQuery(this).find('a.row-move-down');

                jQuery(upArrow).css('display', (rowIndex == 0) ? 'none' : 'block');
                jQuery(downArrow).css('display', (rowIndex == (rowCount - 1)) ? 'none' : 'block');
                rowIndex++;
            });
        },

        /**
         * Iterate over the abstract nav blocks and hide any row palette's add-divider button
         * when the row is followed by a divider.
         */
        initializeRowDividerButtons: function() {
            var page = jQuery('#editorPage');
            var abstractBlocks = jQuery(page).children('div').filter('.page-row,.page-break-banner');
            var blockCount = abstractBlocks.length;
            for (var i = 1; i < blockCount; i++) {
                var block = abstractBlocks[i];
                var previous = abstractBlocks[i - 1];
                var addDividerButton = jQuery(previous).find('.page-divider-button');

                var displayValue = 'block';
                if (jQuery(block).hasClass("page-break-banner") && jQuery(previous).hasClass("page-row")) {
                    displayValue = 'none';
                }

                jQuery(addDividerButton).css('display', displayValue);
            }
        },

        /**
         * Delete Row
         * @param triggerElem
         */
        deleteRow: function (triggerElem) {
            var parentRow = jQuery(triggerElem).closest(".page-row");
            var controller = this;
            var message = getLocalizedString(Ab.homepage.EditorView.z_MESSAGE_CONFIRM_ROW_DELETE);

            View.confirm(message, function (button) {
                if (button === 'yes') {
                    pgnavPageEditorController.isDirty = true;
                    jQuery(parentRow).remove();
                    controller.initializeRowMovementControls();
                    controller.initializeRowDividerButtons();
                    controller.setRowNames();
                }
            });
        },

        /**
         * Remove the panel whose delete icon triggers this call.
         * @param triggerElem
         */
        deleteBucket: function (triggerElem) {
            var parentBucket = jQuery(triggerElem).closest(".bucket-process");
            var message = getLocalizedString(Ab.homepage.EditorView.z_MESSAGE_CONFIRM_PANEL_DELETE);

            var controller = this;

            View.confirm(message, function (button) {
                if (button === 'yes') {
                    pgnavPageEditorController.isDirty = true;
                    jQuery(parentBucket).remove();
                    controller.addNewBucketControlWhereNeeded();
                }
            });
        },

        /**
         * Duplicate the triggering panel.
         * @param triggerElem
         */
        duplicateBucket: function (triggerElem) {
            pgnavPageEditorController.isDirty = true;
            var sourceBucket = jQuery(triggerElem).closest(".bucket-process");
            var bucketConfig = {attributes: Ab.homepage.EditorParser.getBucketDataAttributes(sourceBucket, false)};

            var duplicatePanelHtml = Ab.homepage.EditorView.getBucketHtml(bucketConfig);
            jQuery(sourceBucket).after(duplicatePanelHtml);

            this.flowBucketsToMaxFourColumnsPerRow();
            this.initializeRowMovementControls();
            this.addNewBucketControlWhereNeeded();
            this.setRowNames();
            Ab.homepage.EditorSortable.initializeDragDropSortables();
        },

        /**
         * Add a page divider element after the row whose palette button triggered this action.
         * @param triggerElem
         */
        addPageDivider: function(triggerElem) {
            pgnavPageEditorController.isDirty = true;
            var triggerRow = jQuery(triggerElem).closest('div.page-row');
            var pageDividerHtml = Ab.homepage.EditorView.getPageDividerHtml({
                attributes: {
                    title: getLocalizedString(Ab.homepage.EditorView.z_TOOLTIP_ADDITIONAL_TASKS),
                    index: Ab.homepage.EditorView.getNextAbstractBlockIndex()
                }});
            jQuery(triggerRow).after(pageDividerHtml);
            jQuery(triggerElem).css('display','none');
        },

        /**
         * Display, and initialize, the page divider properties edit form.
         * pgnavPageEditorController.pageDividerForm_onSave handles feedback to HTML.
         * @param triggerElem
         */
        editPageDividerProperties: function(triggerElem) {
            var parentDivider = jQuery(triggerElem).closest(".page-break-banner");
            var dividerId = jQuery(parentDivider).attr('id');
            var dividerAttributes = Ab.homepage.EditorParser.getBucketDataAttributes(parentDivider, false);

            pgnavPageEditorController.pageDividerForm.showInWindow({
                width: 600,
                closeButton: true,
                modal: true,
                title: getLocalizedString(Ab.homepage.EditorView.z_TOOLTIP_DIVIDER_PROPERTIES)
            });
            pgnavPageEditorController.initializePageDividerForm(dividerAttributes, dividerId);
        },

        /**
         * Remove the page divider from the HTML and un-hide the add-divider button.
         * @param triggerElem
         */
        deletePageDivider: function(triggerElem) {
            var parentDivider = jQuery(triggerElem).closest(".page-break-banner");
            var message = getLocalizedString(Ab.homepage.EditorView.z_MESSAGE_CONFIRM_DIVIDER_DELETE);

            View.confirm(message, function (button) {
                if (button === 'yes') {
                    pgnavPageEditorController.isDirty = true;
                    // un-hide the previous row's 'add page divider' button
                    var previousRow = jQuery(parentDivider).prev();
                    var rowPalette =  jQuery(previousRow).find('.row-palette');
                    var button = jQuery(rowPalette).find('.page-divider-button');
                    jQuery(button).css('display', 'block');

                    jQuery(parentDivider).remove();
                }
            });
        },

        /**
         * Re-flow the layout of panels within rows to ensure a columnspan count <= 4 per row.
         * Iterate over all rows.
         * When a row's total colSpan > 4, shift its last bucket to the beginning of the next row.
         */
        flowBucketsToMaxFourColumnsPerRow: function () {
            var rows = jQuery('.editor-page').children('div.page-row');
            var rowCount = rows.length;
            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var row = jQuery(rows.get(rowIndex));
                var columnSpanCount = this.getRowBucketsColumnSpan(jQuery(row).children('.bucket-process'));
                while (columnSpanCount > this.maxColumnsPerRow) {
                    // when last row in rows[] -- no next -- make new row
                    if (rowIndex >= (rows.length - 1)) {
                        this.addEmptyRow();
                    }

                    var rowBuckets = jQuery(row).children('.bucket-process');
                    var rowBucketLast = jQuery(rowBuckets)[rowBuckets.length - 1];
                    var nextRowPalette = jQuery(rows.get(rowIndex + 1)).find('.row-palette');
                    jQuery(rowBucketLast).insertAfter(nextRowPalette);

                    rows = jQuery('.editor-page').children('div.page-row');
                    row = jQuery(rows.get(rowIndex));
                    columnSpanCount = this.getRowBucketsColumnSpan(jQuery(row).children('.bucket-process'))
                }
            }

            Ab.homepage.EditorSortable.initializeDragDropSortables();
        },

        /**
         * Swap the current row with the one above it.
         * @param triggerElem
         */
        shiftRowUp: function (triggerElem) {
            this.shiftRow(triggerElem, true);
        },

        /**
         * Swap the current row with the one below it.
         * @param triggerElem
         */
        shiftRowDown: function (triggerElem) {
            this.shiftRow(triggerElem, false);
        },

        /**
         * Swap the selected row with the one above or below it.
         * @param triggerElem DOM element
         * @param shiftUp boolean
         */
        shiftRow: function (triggerElem, shiftUp) {
            var rows = jQuery('.page-row');
            var triggerRow = jQuery(triggerElem).closest('div.page-row');
            var triggerRowId = jQuery(triggerRow).attr('id');

            var rowCount = rows.length;
            for (var i = 0; i < rowCount; i++) {
                var testRowId = jQuery(rows[i]).attr('id');
                if (triggerRowId === testRowId) {
                    pgnavPageEditorController.isDirty = true;
                    // TODO when triggerRow and previous/nextRow sandwich a divider keep the divider between the two rows after shift.
                    if (shiftUp) {
                        // exchange places of previousRow and triggerRow
                        jQuery(rows[i - 1]).before(jQuery(triggerRow));
                    }
                    else if ((i < rowCount - 1)) {
                        // exchange places of triggerRow and nextRow
                        jQuery(triggerRow).before(jQuery(rows[i + 1]));
                    }

                    this.initializeRowMovementControls();
                    this.initializeRowDividerButtons();
                    this.setRowNames();
                    break;
                }
            }
        },

        /**
         * Edit the properties of a process or app-specific bucket.
         *
         * @param triggerElem
         */
        editBucketProperties: function (triggerElem) {
            var parentBucket = jQuery(triggerElem).closest(".bucket-process");
            var bucketId = jQuery(parentBucket).attr('id');
            var bucketAttributes = Ab.homepage.EditorParser.getBucketDataAttributes(parentBucket, false);
            var dialogRestriction = this.getRestrictionFromAttributes(bucketAttributes);

            // set properties dialog height, default is 400
            var dialogHeight = 400;
            if ('horizontalBarChart' === bucketAttributes.controltype || 'pgnav-map' === bucketAttributes.controltype) {
                dialogHeight = 500;
            }

            // TODO get controller name dynamically r.t. hard-code the name here
            View.dialogRestriction = dialogRestriction;
            pgnavPageEditorController.bucketPropertiesForm.showInWindow({
                width: 600,
                closeButton: true,
                modal: true,
                height: dialogHeight,
                title: getLocalizedString(Ab.homepage.EditorView.z_LABEL_PROPERTIES) + ': ' + bucketAttributes.title
            });
            pgnavPageEditorController.initializeBucketPropertiesForm(dialogRestriction, bucketId);
        },

        /**
         * Show a view allowing creation and editing of a process containing tasks, a metric, etc.
         * Feed the resulting process back to the bucket as its process_id.
         * @param triggerElem
         */
        editBucketAssociate: function (triggerElem) {
            var parentBucket = jQuery(triggerElem).closest(".bucket-process");
            var parentBucketId = jQuery(parentBucket).attr('id');
            var bucketAttributes = Ab.homepage.EditorParser.getBucketDataAttributes(parentBucket, false);
            var restriction = this.getRestrictionFromAttributes(bucketAttributes);
            View.dialogRestriction = restriction;
            var controller = this;

            if ('process' === bucketAttributes.type && bucketAttributes.activity_id && bucketAttributes.process_id) {
                pgnavPageEditorController.assignedTasksGrid.showInWindow({
                    width: 1200,
                    modal: true,
                    closeButton: true,
                    title: getLocalizedString(Ab.homepage.EditorView.z_LABEL_TASKS_ASSIGNED) + ': ' + bucketAttributes.process_id
                });
                pgnavPageEditorController.assignedTasksGrid.refresh(restriction, false, false);
            }
            // show metrics scorecard definition dialogs
            else if ('processMetrics' === bucketAttributes.controltype || 'alertsList' === bucketAttributes.controltype) {
                View.openDialog('ab-metric-scorecard-def.axvw?scorecard=' + bucketAttributes.scorecard + '&parentview=homepageeditor', null, true, {
                    width: 1050,
                    height: 1200,
                    closeButton: false,
                    title: getLocalizedString(Ab.homepage.EditorView.z_LABEL_DEFINE_SCORECARD),
                    callback: function (currentValue) {
                        controller.updateAppSpecificScorecard(parentBucketId, currentValue);
                    }
                });
            }
            // show metrics definition dialogs
            else if ('horizontalBarChart' === bucketAttributes.controltype || 'pgnav-map' === bucketAttributes.controltype) {
                if (bucketAttributes.metricname) {
                    View.openDialog('ab-metric-metrics-def.axvw?metricname=' + bucketAttributes.metricname + '&parentview=homepageeditor', null, true, {
                        width: 1050,
                        height: 1200,
                        closeButton: false,
                        title: getLocalizedString(Ab.homepage.EditorView.z_LABEL_DEFINE_METRIC),
                        callback: function (currentValue) {
                            controller.updateAppSpecificMetric(parentBucketId, currentValue);
                        }
                    });
                }
                else if (bucketAttributes.viewname) {
                    View.showMessage(getLocalizedString(Ab.homepage.EditorView.z_TOOLTIP_VIEWNAME_CHART_EDIT));
                }
            }
            else if ('process' === bucketAttributes.type) {
                View.showMessage(getLocalizedString(Ab.homepage.EditorView.z_MESSAGE_ASSIGN_ACTIVITY_PROCESS));
            }
            else {
                View.showMessage(getLocalizedString(Ab.homepage.EditorView.z_MESSAGE_ASSIGN_CONTROL_TYPE));
            }
        },

        /**
         * Update the AppSpecific bucket's afm_metric_definitions.metric_name and refresh the display.
         * @param parentBucketId
         * @param currentValue
         */
        updateAppSpecificMetric: function(parentBucketId, currentValue) {
            pgnavPageEditorController.isDirty = true;
            var parentBucket = jQuery('#' + parentBucketId);
            jQuery(parentBucket).data('metricname', currentValue);
            var idSuffix = parentBucketId.substr('bucket_'.length);
            var fieldValues = jQuery(parentBucket).data();
            jQuery('#table_' + idSuffix).replaceWith(Ab.homepage.EditorView.getAppSpecificBucketPropertiesTable(idSuffix, fieldValues));
        },

        /**
         * Update the AppSepecific bucket's afm_metric_scard_defs.scorecard_code and refresh the display.
         * @param parentBucketId
         * @param currentValue
         */
        updateAppSpecificScorecard: function(parentBucketId, currentValue) {
            pgnavPageEditorController.isDirty = true;
            var parentBucket = jQuery('#' + parentBucketId);
            jQuery(parentBucket).data('scorecard', currentValue);
            var idSuffix = parentBucketId.substr('bucket_'.length);
            var fieldValues = jQuery(parentBucket).data();
            jQuery('#table_' + idSuffix).replaceWith(Ab.homepage.EditorView.getAppSpecificBucketPropertiesTable(idSuffix, fieldValues));
        },

        /**
         * Append a new bucket control to any row where there is room.
         * When there are 4 column spans worth of panels, remove any existing control.
         * Ensure control is last child of row.
         */
        addNewBucketControlWhereNeeded: function () {
            var rows = jQuery('.editor-page').children('div.page-row');
            var rowCount = rows.length;
            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                var row = jQuery(rows.get(rowIndex));
                var columnSpanCount = this.getRowBucketsColumnSpan(jQuery(row).children('.bucket-process'));
                var rowsNewBucketControl = jQuery(row).children('.new-panel-container');
                if (columnSpanCount < this.maxColumnsPerRow && rowsNewBucketControl.length === 0) {
                    jQuery(row).append(Ab.homepage.EditorView.getNewBucketControlHtml());
                }
                else if (columnSpanCount == this.maxColumnsPerRow && rowsNewBucketControl.length > 0) {
                    jQuery(rowsNewBucketControl).css('display', 'none');
                }
                else if (columnSpanCount < this.maxColumnsPerRow && rowsNewBucketControl.length === 1) {
                    // ensure new panel control ('.new-panel-container') is last child.
                    var rowChildren = jQuery(row).children();
                    var lastChild = rowChildren[rowChildren.length - 1];
                    if (jQuery(lastChild).hasClass('bucket-process')) {
                        jQuery(rowsNewBucketControl).remove();
                        jQuery(row).append(Ab.homepage.EditorView.getNewBucketControlHtml());
                    }
                    else if (jQuery(lastChild).hasClass('new-panel-container') && 'none' === jQuery(lastChild).css('display')) {
                        jQuery(lastChild).css('display', 'block');
                    }
                }
            }
        },

        /**
         * Add an empty row
         * // ? and then add an empty bucket to the new row. ?
         */
        addNewRow: function () {
            this.addEmptyRow();
            this.setRowNames();
            this.initializeRowMovementControls();
            //this.initializeRowDividerButtons();
            //this.initializeRowHeightSelections();
            Ab.homepage.EditorSortable.initializeDragDropSortables();
        },

        /**
         * Add an empty row (just a row palette) to the view
         * @returns {Number|jQuery}
         */
        addEmptyRow: function () {
            pgnavPageEditorController.isDirty = true;
            var newRowIndex =  Ab.homepage.EditorView.getNextAbstractBlockIndex();
            var rowPaletteConfig = {
                index: newRowIndex,
                attributes: {height: 'half'}
            };
            var newRowHtml = '<div class="page-row half-height" id="pageRow_' + newRowIndex + '">' +
                Ab.homepage.EditorView.getRowPaletteHtml(rowPaletteConfig) +

                // Ab.homepage.EditorView.getEmptyBucketHtml() +
                    
                Ab.homepage.EditorView.getNewBucketControlHtml() +
                '</div>';
            jQuery('#newRowControlContainer').before(newRowHtml);

            return newRowIndex;
        },

        /**
         * Handle the 'Add Bucket' action.
         *
         * @param triggerElem
         */
        addEmptyBucketToRow: function (triggerElem) {
            var rowElem = jQuery(triggerElem).closest('div.page-row');
            if (rowElem && rowElem.length > 0) {
                var columnSpan = this.getRowBucketsColumnSpan(jQuery(rowElem).children('.bucket-process'));
                // ensure total column spans before event < 4
                if (columnSpan >= this.maxColumnsPerRow) {
                    alert("You've had enough!");
                    return;
                }

                pgnavPageEditorController.isDirty = true;
                var rowNewBucketControl = jQuery(rowElem).find('.new-panel-container');
                jQuery(rowNewBucketControl).before(Ab.homepage.EditorView.getEmptyBucketHtml());

                columnSpan = this.getRowBucketsColumnSpan(jQuery(rowElem).children('.bucket-process'));
                if (columnSpan >= this.maxColumnsPerRow) {
                    jQuery(rowNewBucketControl).hide();
                }
            }
        },

        /**
         * Return the count of layout columns the bucket collection occupies.
         *
         * @param buckets
         * @returns {number}
         */
        getRowBucketsColumnSpan: function (buckets) {
            var columnSpan = 0;
            var bucketCount = buckets.length;
            for (var j = 0; j < bucketCount; j++) {
                columnSpan += this.getBucketColumnSpan(buckets[j]);
            }

            return columnSpan;
        },

        /**
         * Return the count of layout columns occupied by the single bucket.
         *
         * @param bucket
         * @returns {number}
         */
        getBucketColumnSpan: function (bucket) {
            var columnSpan = 1;

            var colSpnAttribute = bucket.attributes['columnSpan'] || bucket.attributes['columnspan'];
            var colSpnData = jQuery(bucket).data('columnspan') || jQuery(bucket).data('columnSpan');
            if ((colSpnAttribute && colSpnAttribute === '2') || (colSpnData && colSpnData === 2)) {
                columnSpan = 2;
            }

            return columnSpan;
        },

        /**
         * Set the row palette titles so that on reorder or delete, the 1-based sequential row number is displayed.
         */
        setRowNames: function () {
            var rowPalettes = jQuery('.row-palette');
            var index = 1;
            jQuery(rowPalettes).each(function (n) {
                var titleElem = jQuery(this).find('h2');
                var titleContent = jQuery(titleElem).html();
                var newContent = titleContent.substr(0, titleContent.indexOf(' ')) + ' ' + index + titleContent.substr(titleContent.indexOf('<a '));
                jQuery(titleElem).html(newContent);
                index++;
            });
        },

        /**
         * Change the height of the indexed row.
         *
         * @param triggerElem
         * @param rowIndex
         * @param height
         */
        setRowHeight: function (triggerElem, rowIndex, height) {
            pgnavPageEditorController.isDirty = true;
            var row = jQuery("#pageRow_" + rowIndex);
            var wrapperElem = jQuery(triggerElem).closest('div.bucket-wrapper');
            jQuery(row).removeClass("three-quarter-height half-height full-height");
            jQuery(row).addClass(height + "-height");
            jQuery(row).children(".row-palette").data('height', height);
            jQuery(wrapperElem).find('a.row-height').removeClass('active');
            jQuery(triggerElem).addClass('active');
        },

        /**
         * Return an Ab.view.Restriction whose clause are made from the data attributes of a bucket.
         *
         * @param bucketAttributes
         * @returns {Ab.view.Restriction}
         */
        getRestrictionFromAttributes: function (bucketAttributes) {
            var dialogRestriction = new Ab.view.Restriction();
            for (var attributeName in bucketAttributes) {
                if (bucketAttributes.hasOwnProperty(attributeName)) {
                    dialogRestriction.addClause('afm_ptasks.' + attributeName, bucketAttributes[attributeName], "=");
                }
            }

            return dialogRestriction;
        }
    })
);