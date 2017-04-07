/**
 * Created by Meyer on 10/18/2015.
 *
 * ab-pgnav-editor-view.js
 * Support for the home page editor.
 * Manage the viewable HTML representing the home page and its editing controls
 */
/**
 * Namespace for the home page editor JS classes.
 */
Ab.namespace('homepage');

/**
 * View utilities for the Home Page Editor.
 * Singleton class of functions that manipulate the HTML in the document.
 */
Ab.homepage.EditorView = new (Base.extend({

        // @begin_translatable
        z_LABEL_TITLE: 'Title',
        z_LABEL_EDIT: 'Edit',
        z_LABEL_EDIT_PROPERTIES: 'Edit Properties',
        z_LABEL_EDIT_TASKS: 'Edit Tasks',
        z_LABEL_EDIT_METRICS: 'Edit Metrics',
        z_LABEL_BACK_TO_TOP: 'Back to Top',
        z_LABEL_ROW: 'Row',
        z_LABEL_NEW_PANEL: 'New Panel',
        z_LABEL_NEW_ROW: 'New Row',
        z_LABEL_PROCESS: 'Process',
        z_LABEL_CONTROL_TYPE: 'Control Type',
        z_LABEL_PROPERTIES: 'Properties',
        z_LABEL_TASKS_ASSIGNED: 'Tasks Assigned',
        z_LABEL_DEFINE_SCORECARD: 'Define Scorecard',
        z_LABEL_DEFINE_METRIC: 'Define Metric',
        z_MESSAGE_CONFIRM_DIVIDER_DELETE: 'Do you really want to delete this page divider?',
        z_MESSAGE_CONFIRM_ROW_DELETE: 'Do you really want to delete this whole row?',
        z_MESSAGE_CONFIRM_PANEL_DELETE: 'Do you really want to delete this panel?',
        z_MESSAGE_ASSIGN_ACTIVITY_PROCESS: 'Assign an activity and process.',
        z_MESSAGE_ASSIGN_CONTROL_TYPE: 'Assign a type and control type.',
        z_TOOLTIP_ADDITIONAL_TASKS: 'Additional Tasks',
        z_TOOLTIP_DIVIDER_PROPERTIES: 'Page Divider Properties',
        z_TOOLTIP_DELETE_ROW: 'Delete row',
        z_TOOLTIP_DUPLICATE_PANEL: 'Duplicate panel',
        z_TOOLTIP_DELETE_PANEL: 'Delete panel',
        z_TOOLTIP_VIEWNAME_CHART_EDIT: 'A chart based on viewname and datasource is completely editable in the properties form.',
        z_TOOLTIP_FAVORITES_EDIT: 'A favorites panel is completely editable in the properties form.',
        z_TOOLTIP_MOVE_UP: 'Move up',
        z_TOOLTIP_MOVE_DOWN: 'Move down',
        z_TOOLTIP_HALF_HEIGHT: 'Half height',
        z_TOOLTIP_THREE_QUARTER_HEIGHT: 'Three quarter height',
        z_TOOLTIP_FULL_HEIGHT: 'Full height',
        z_TOOLTIP_ADD_PANEL: 'Add a new panel',
        z_TOOLTIP_ADD_ROW: 'Add a new row',
        z_TOOLTIP_ADD_PAGE_DIVIDER: 'Add page divider',
        z_TOOLTIP_DELETE_DIVIDER: 'Delete divider',
        // @end_translatable

        /**
         * Return the HTML to display a page model.
         *
         * @param descriptorModel
         */
        createDisplayFromModel: function (descriptorModel) {
            var displayHtml = '<div class="nav-pages"><div id="editorPage" class="editor-page">';
            var blocks = descriptorModel.abstractNavBlocks;
            var blockCount = blocks.length;

            for (var i = 0; i < blockCount; i++) {
                var block = blocks[i];
                if ("page-divider" === block.type) {
                    displayHtml += this.getPageDividerHtml(block);
                }
                else if ("row" === block.type) {
                    displayHtml += this.getPageRowHtml(block, this.getNextAbstractBlockIndex());
                }
                else if ("rule" === block.type) {
                    // TODO
                    ///displayHtml += getHorizontalRuleHtml(block);
                }
            }

            displayHtml += this.getNewRowControlHtml() +
                '</div></div>';

            return displayHtml;
        },

        /**
         * Return the HTML for one page divider element.
         *
         * @param block
         * @returns {string}
         */
        getPageDividerHtml: function (block) {
            // add data attributes including title, backgroundshading -- all editable properties.
            var backgroundshading = block.attributes.backgroundshading ? block.attributes.backgroundshading : '';

            return '<div class="page-break-banner"  id="pageDivider_' + block.index + '" data-title="' + block.attributes.title +
                '" data-backgroundshading="' + backgroundshading + '">' +
                '<div class="page-break-palette">' +
                '<button type="button" class="page-divider-properties" onmouseup="Ab.homepage.EditorController.editPageDividerProperties(this);">' +
                '<span>' + getLocalizedString(this.z_LABEL_EDIT) + '</span></button>' +
                '<a class="page-divider-delete bucket-image-delete" onmouseup="Ab.homepage.EditorController.deletePageDivider(this)"' +
                'title="' + getLocalizedString(this.z_TOOLTIP_DELETE_DIVIDER) + '"/>' +
                '</div>' +
                '<div class="page-break-archibus">' +
                '<div class="page-break-logo"></div>' +
                '<span>' + block.attributes.title + '</span>' +
                '</div>' +
                '<a class="page-top-link" onClick="goToTop();">' + getLocalizedString(this.z_LABEL_BACK_TO_TOP) + '</a>' +
                '</div>';
        },

        /**
         * Return the HTML for one whole row, including row palette & buckets.
         *
         * @param rowBlock
         * @param rowIndex
         * @returns {string}
         */
        getPageRowHtml: function (rowBlock, rowIndex) {
            var rowHeight = rowBlock.attributes.height;
            var displayHtml = '<div class="page-row ' + rowHeight + '-height" id="pageRow_' + rowIndex + '">';

            // row palette
            displayHtml += this.getRowPaletteHtml({
                index: rowIndex,
                attributes: {height: rowHeight}
            });

            // buckets
            var columnSpan = 0;
            var bucketCount = rowBlock.buckets.length;
            for (var j = 0; j < bucketCount; j++) {
                displayHtml += this.getBucketHtml(rowBlock.buckets[j]);
                columnSpan += Ab.homepage.EditorController.getBucketColumnSpan(rowBlock.buckets[j]);
            }

            // new bucket button
            if (rowBlock.buckets.length < 4 && columnSpan < 4) {
                displayHtml += this.getNewBucketControlHtml();
            }
            displayHtml += '</div>';

            return displayHtml;
        },

        /**
         * Return the HTML for a row palette.
         *
         * @param bucketConfig
         * @returns {string}
         */
        getRowPaletteHtml: function (bucketConfig) {
            var attributes = bucketConfig.attributes;
            var index = bucketConfig.index;

            var rowPaletteHtml = '<div id="rowPalette_' + index + '" class="row-palette"';
            rowPaletteHtml += this.getElementDataAttributesHtml(attributes);
            rowPaletteHtml += ' oncontextmenu="return false;">';
            rowPaletteHtml += '<h2 class="process-title">' + getLocalizedString(this.z_LABEL_ROW) + index +
                '<a class="row-palette-title-menu bucket-image-delete" onmouseup="Ab.homepage.EditorController.deleteRow(this)" ' +
                'title="' + getLocalizedString(this.z_TOOLTIP_DELETE_ROW) + '"></a>' +
                '</h2>' +
                '<div class="bucket-wrapper" id="wrapper_rowPalette_' + index + '">' +
                '<table class="row-palette-controls">' +
                '<tr>' +
                '<td class="row-palette-shift"><a class="row-move-up" title="' + getLocalizedString(this.z_TOOLTIP_MOVE_UP) +
                '" onmouseup="Ab.homepage.EditorController.shiftRowUp(this)" ></a></td>' +
                '<td><a class="row-move-down" title="' + getLocalizedString(this.z_TOOLTIP_MOVE_DOWN) +
                '" onmouseup="Ab.homepage.EditorController.shiftRowDown(this)" /></td>' +
                '</tr>';
            rowPaletteHtml +=
                '<tr><td>&nbsp;</td></tr>' +
                '<tr><td colspan="2"><a class="row-height row-height-half" title="' + getLocalizedString(this.z_TOOLTIP_HALF_HEIGHT) +
                '" onmouseup="Ab.homepage.EditorController.setRowHeight(this,' + index + ',\'half\')"></a></td></tr>' +
                '<tr><td colspan="2"><a class="row-height row-height-three-quarter" title="' + getLocalizedString(this.z_TOOLTIP_THREE_QUARTER_HEIGHT) +
                '" onmouseup="Ab.homepage.EditorController.setRowHeight(this,' + index + ',\'three-quarter\')"></a></td></tr>' +
                '<tr><td colspan="2"><a class="row-height row-height-full" title="' + getLocalizedString(this.z_TOOLTIP_FULL_HEIGHT) +
                '" onmouseup="Ab.homepage.EditorController.setRowHeight(this,' + index + ',\'full\')"></a></td></tr>' +
                '</table>';
            rowPaletteHtml += '<table class="row-palette-divider-button">' +
                '<tr><td>' +
                '<a class="page-divider-button" title="' + getLocalizedString(this.z_TOOLTIP_ADD_PAGE_DIVIDER) +
                '" onmouseup="Ab.homepage.EditorController.addPageDivider(this)"></a>' +
                '</td></tr>' +
                '</table>';
            rowPaletteHtml += '</div>' +
                '</div>';

            return rowPaletteHtml;
        },

        /**
         * Return a string of HTML data attributes for including within an element tag.
         *
         * @param attributes
         * @returns {string}
         */
        getElementDataAttributesHtml: function (attributes) {
            var dataAttributesHtml = '';
            for (var attributeName in attributes) {
                if (attributes.hasOwnProperty(attributeName)) {
                    dataAttributesHtml += ' data-' + attributeName + '="' + attributes[attributeName] + '"';
                }
            }

            return dataAttributesHtml;
        },

        /**
         * Return the HTML for displaying one bucket
         *
         * @param bucket
         * @returns {string}
         */
        getBucketHtml: function (bucket) {
            var bucketHtml = '';
            var bucketType = bucket.attributes.type;

            if ("process" === bucketType) {
                bucketHtml = this.getProcessBucketHtml(bucket);
            }
            else if ("app-specific" === bucketType) {
                bucketHtml = this.getAppSpecificBucketHtml(bucket);
            }
            else if ("favorites" === bucketType) {
                bucketHtml = this.getFavoritesBucketHtml(bucket);
            }
            return bucketHtml;
        },

        /**
         * Return the HTML for one process bucket in the model.
         *
         * @param bucket
         * @returns {string}
         */
        getProcessBucketHtml: function (bucket) {
            var attributes = bucket.attributes;
            var activityId = attributes.activityid || attributes.activity_id ;
            var processId = attributes.processid || attributes.process_id;
            var idSuffix = activityId + '_' + getCamelCasedString(processId) + '_b_' + this.getNextPanelIndex();

            var bucketHtml = '<div id="bucket_' + idSuffix + '" class="bucket-process"' +
                this.getElementDataAttributesHtml(attributes) +
                ' oncontextmenu="return false;">' +
                this.getBucketTitleHtml(attributes);

            bucketHtml += '<div class="bucket-wrapper process-bucket" id="wrapper_' + idSuffix + '">' +
                this.getProcessBucketPropertiesTable(idSuffix, activityId, processId, attributes.controltype) +
                this.getBucketActionsTable(attributes) +
                '</div></div>';

            return bucketHtml;
        },

        /**
         * Return the abstractBlock counter,
         * after incrementing and storing the new value back to the document data attribute.
         * Abstract blocks include rows that can contain panels; page dividers; horizontal rules.
         *
         * @returns {*}
         */
        getNextAbstractBlockIndex: function() {
            var pageAttributes = jQuery('#pageAttributes');
            var maxBlockIndex = jQuery(pageAttributes).data('abstractBlockCounter');
            jQuery(pageAttributes).data('abstractBlockCounter', ++maxBlockIndex);

            return maxBlockIndex;
        },

        /**
         * Return the panelIndex counter,
         * after incrementing and storing the new value back to the document data attribute.
         * @returns {*}
         */
        getNextPanelIndex: function() {
            var pageAttributes = jQuery('#pageAttributes');
            var maxPanelIndex = jQuery(pageAttributes).data('pagePanelCounter');
            jQuery(pageAttributes).data('pagePanelCounter', ++maxPanelIndex);

            return maxPanelIndex;
        },

        /**
         * Return the HTML for one app-specific bucket.
         * @param bucket
         * @returns {string}
         */
        getAppSpecificBucketHtml: function (bucket) {
            var attributes = bucket.attributes;
            var idSuffix = getCamelCasedString(attributes.title) + '_b_' + this.getNextPanelIndex();
            // TODO handle triple-wide or full-width if we allow
            var columnSpan = attributes.columnspan;
            var bucketCssClass = (columnSpan && (columnSpan === 2 || columnSpan === "2")) ? 'bucket-process double-wide' : 'bucket-process';

            var bucketHtml = '<div id="bucket_' + idSuffix + '" class="' + bucketCssClass + '"' +
                this.getElementDataAttributesHtml(attributes) +
                ' oncontextmenu="return false;">' +
                this.getBucketTitleHtml(attributes);

            bucketHtml += '<div class="bucket-wrapper app-specific-bucket" id="wrapper_' + idSuffix + '">' +
                this.getAppSpecificBucketPropertiesTable(idSuffix, attributes) +
                this.getBucketActionsTable(attributes) +
                '</div></div>';

            return bucketHtml;
        },

        /**
         * Return the HTML for one favorites bucket.
         *
         * @param bucket
         * @returns {string}
         */
        getFavoritesBucketHtml: function (bucket) {
            var panelIndex = this.getNextPanelIndex();
            var bucketHtml = '<div id="homeFavoritesBucket_f_' + panelIndex + '" class="bucket-process" ' +
                this.getElementDataAttributesHtml(bucket.attributes) +
                'oncontextmenu="return false;">';
            bucketHtml += this.getBucketTitleHtml(bucket.attributes);

            bucketHtml += '<div class="bucket-wrapper favorites-bucket" id="wrapper_favorites_' + panelIndex + '">' +
                this.getFavoritesBucketPropertiesTable() +
                this.getBucketActionsTable(bucket.attributes) +
                '</div></div>';

            return bucketHtml;
        },

        /**
         * Return the HTML for a panel title ( a panel of any type )
         * @param attributes
         * @returns {string}
         */
        getBucketTitleHtml: function (attributes) {
            var attrTitle = attributes.title;
            var displayTitle = attrTitle;
            // TODO make the real calculation (font, width, etc. simulation and removal)
            if (attrTitle.length > 28 && (!attributes.columnspan || parseInt(attributes.columnspan, 10) < 2)) {
                displayTitle = attrTitle.substr(0,27) + '...';
            }

            var titleHtml = '<h2 class="process-title" title="' + attributes.tooltip + '">' +
                '<span class="bucket-title" title="' + attrTitle + '">' + displayTitle + '</span>' +
                '<table class="bucket-title-menu">' +
                '<tr><td>';

            if ('process' === attributes.type || 'app-specific' === attributes.type) {
                titleHtml += '<a class="bucket-image-duplicate panel-title-button" title="' + getLocalizedString(this.z_TOOLTIP_DUPLICATE_PANEL) +
                    '" onmouseup="Ab.homepage.EditorController.duplicateBucket(this)"/>' +
                    '</td><td>';
            }

            titleHtml += '<a class="bucket-image-delete panel-title-button" title="' + getLocalizedString(this.z_TOOLTIP_DELETE_PANEL) +
                '" onmouseup="Ab.homepage.EditorController.deleteBucket(this)"/>' +
                '</td></tr>' +
                '</table></h2>';

            return titleHtml;
        },

        /**
         * Return the HTML table showing a process bucket's activity + process ids.
         * @param idSuffix
         * @param activityId
         * @param processId
         * @param controltype
         * @returns {string}
         */
        getProcessBucketPropertiesTable: function (idSuffix, activityId, processId, controltype) {
            var activity = activityId ? activityId : "";
            var process = processId ? processId : "";
            return '<table id="table_' + idSuffix + '" class="bucket-properties-table">' +
                '<tr> <td><b>' + getLocalizedString(this.z_LABEL_PROCESS) + ': </b></td></tr>' +
                '<tr><td>' + activity + '</td></tr>' +
                '<tr><td>' + process + '</td></tr>' +

                this.getBucketTypeImageHTML(controltype) +

                '</table>';
        },

        /**
         * Return the HTML table showing the displayed app-specific properties for the bucket.
         * @param idSuffix
         * @param attributes
         * @returns {string}
         */
        getAppSpecificBucketPropertiesTable: function (idSuffix, attributes) {
            var tableHtml = '<table id="table_' + idSuffix + '" class="bucket-properties-table">' +
                ' <tr> <td><b>' + getLocalizedString(this.z_LABEL_CONTROL_TYPE) + ':</b></td></tr>' +
                '<tr><td>' + attributes.controltype + '</td> </tr>';

            if (attributes.scorecard) {
                tableHtml += '<tr>' +
                        ///'<td><b>Scorecard: </b></td></tr>' +
                    '<tr><td>' + attributes.scorecard + '</td> </tr>';
            }
            if (attributes.metricname) {
                tableHtml += '<tr>' +
                        ///'<td><b>Metric Name: </b></td></tr>' +
                    '<tr><td>' + attributes.metricname + '</td> </tr>';
            }
            if (attributes.granularity) {
                tableHtml += '<tr>' +
                        ///'<td><b>Granularity: </b></td></tr>' +
                    '<tr><td>' + attributes.granularity + '</td></tr>';
            }

            tableHtml += this.getBucketTypeImageHTML(attributes.controltype);
            tableHtml += '</table>';

            return tableHtml;
        },

        /**
         * Return the displayable contents of a favorites panel.
         * @returns {string}
         */
        getFavoritesBucketPropertiesTable: function () {
            return '<div class="favorites-drop-target">' +
                '<span class="favorites-add-target"></span>' +
                '<span class="favorites-delete-target">&nbsp;</span>' +
                '</div>' +
                '<div class="favorites"></div>';
        },

        /**
         * Return a table row holding the appropriate sample app-specific control image.
         * @param controlType
         * @returns {string}
         */
        getBucketTypeImageHTML: function (controlType) {
            var bucketImageHtml = '<tr><td>';

            if (!controlType || '' === controlType) {
                bucketImageHtml += '<a class="bucket-thumbnail-process" ></a>';
            }
            else if (controlType === 'processMetrics') {
                bucketImageHtml += '<a class="bucket-thumbnail-metrics-scorecard" ></a>';
            }
            else if (controlType === 'horizontalBarChart') {
                bucketImageHtml += '<a class="bucket-thumbnail-bar-chart" ></a>';
            }
            else if (controlType === 'alertsList') {
                bucketImageHtml += '<a class="bucket-thumbnail-alerts-list" ></a>';
            }
            else if (controlType === 'metricsChart') {
                bucketImageHtml += '<a class="bucket-thumbnail-metric-chart" ></a>';
            }
            else if (controlType === 'pgnav-map') {
                bucketImageHtml += '<a class="bucket-thumbnail-map" ></a>';
            }
            // TODO and favorites?

            bucketImageHtml += '</td></tr>';

            return bucketImageHtml;
        },

        /**
         * Return the HTML of the two control elements (buttons) accessing
         * the bucket properties and associated tasks/metrics/etc.
         *
         * @param attributes
         * @returns {string}
         */
        getBucketActionsTable: function (attributes) {
            var disableAssociateButton = '';
            var associateTooltip = '';
            var labelText = "app-specific" === attributes.type ?
                [getLocalizedString(Ab.homepage.EditorView.z_LABEL_EDIT_PROPERTIES), getLocalizedString(Ab.homepage.EditorView.z_LABEL_EDIT_METRICS)]:
                [getLocalizedString(Ab.homepage.EditorView.z_LABEL_EDIT_PROPERTIES), getLocalizedString(Ab.homepage.EditorView.z_LABEL_EDIT_TASKS)];

            // a bar chart based on viewname, datasourceId, etc. is editable completely through the properties form.
            if ('horizontalBarChart' === attributes.controltype && attributes.viewname) {
                disableAssociateButton = ' disabled="disabled"';
                associateTooltip = ' title="' + getLocalizedString(this.z_TOOLTIP_VIEWNAME_CHART_EDIT) + '"';
            }
            else if ('favorites' === attributes.type) {
                disableAssociateButton = ' disabled="disabled"';
                associateTooltip = ' title="' + getLocalizedString(this.z_TOOLTIP_FAVORITES_EDIT) + '"';
            }

            return '<table class="bucket-properties-buttons">' +
                '<tr>' +
                '<td><button type="button" class="prop-button" onclick="Ab.homepage.EditorController.editBucketProperties(this);">' +
                '<span>' + labelText[0] + '</span></button></td>' +
                '<td class="spacer">&nbsp;</td>' +
                '<td><button type="button" class="assoc-button" onclick="Ab.homepage.EditorController.editBucketAssociate(this);"' +
                disableAssociateButton + associateTooltip + '><span>' + labelText[1] + '</span></button></td>' +
                '</tr>' +
                '</table>';
        },

        /**
         * Return the HTML for an initially empty bucket.
         *
         * @returns {string}
         */
        getEmptyBucketHtml: function () {
            var bucketConfig = {
                attributes: {
                    title: getLocalizedString(this.z_LABEL_TITLE),
                    type: '',
                    activityId: '',
                    processId: '',
                    scorecard: '',
                    metricname: '',
                    granularity: '',
                    columnspan: 1,
                    tooltip: ''
                }
            };

            return this.getProcessBucketHtml(bucketConfig);
        },

        /**
         * Return the HTML for the 'New Bucket' control
         * @returns {string}
         */
        getNewBucketControlHtml: function () {
            return '<div id="newBucketControlContainer_' + this.getNextPanelIndex() + '"  class="new-panel-container">' +
                '<button type="button" title="' + getLocalizedString(this.z_TOOLTIP_ADD_PANEL) +
                '" onclick="Ab.homepage.EditorController.addEmptyBucketToRow(this)">' +
                '<span>' + getLocalizedString(this.z_LABEL_NEW_PANEL) + '</span>' +
                '</button>' +
                '</div>';
        },

        /**
         * Return the HTML for the 'New Row' control
         * @returns {string}
         */
        getNewRowControlHtml: function () {
            return '<div id="newRowControlContainer" class="new-row-container">' +
                '<button type="button" title="' + getLocalizedString(this.z_TOOLTIP_ADD_ROW) +
                '" onclick="Ab.homepage.EditorController.addNewRow();" >' +
                '<span>' + getLocalizedString(this.z_LABEL_NEW_ROW) + '</span>' +
                '</button>' +
                '</div>';
        },

        /**
         * Set the display to hide or show the new row control.
         * @param show
         */
        showNewRowControl: function (show) {
            var displayStyle = show ? 'block' : 'none';
            jQuery('#newRowControlContainer').css('display', displayStyle);
        },

        /**
         * Set the display to hide or show the new bucket control.
         * @param show
         */
        showNewBucketControl: function (show) {
            var displayStyle = show ? 'block' : 'none';
            jQuery('.new-panel-container').css('display', displayStyle);
        }
    })
);

