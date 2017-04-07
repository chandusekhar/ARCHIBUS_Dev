/**
 * Page Navigation Project
 *
 * Initialization, loading and event handling for the Alerts List buckets.
 * ab-pgnav-alerts-list.js
 *
 * @author Steven Meyer
 * @since V 21.1
 */

/**
 * Loop thru each bucket having class alertsList,
 * Fill in the list for the bucket's scorecard and granularity attributes.
 */
function loadAlertsBuckets() {
	$(".alertsList").each( function(n) {
        var elBucket = $(this).parents(".bucket-process").attr("id");
        var elDisplayControl = elBucket + '_alertsList_' + n;
        $(this).attr("id", elDisplayControl);

        var scoreCardInput = $(this).attr("scorecard");
        var granularityInput = $(this).attr("granularity");

        var parameters = {
            'controlType': 'alertsList',
            'scorecard': scoreCardInput,
            'granularity': granularityInput
        };

        var alertsRecords = getMetricsRecordsForScorecardAndGranularity(parameters);
        alertsRecords = sortAlertsRecords(alertsRecords);
        drawAlertsList(elDisplayControl, alertsRecords, n);
    });
}

/**
 * Return the collection of alerts records for the parameters' scorecard and granularity.
 *
 * @param parameters
 * @return {*}
 */
function getMetricsRecordsForScorecardAndGranularity(parameters) {
    try {
        var result = Ab.workflow.Workflow.callMethod('AbCommonResources-MetricsService-getTrendValuesForScorecard', parameters.scorecard, parameters.granularity);

        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
            result = false;
        }
        else if (result.data) {
            result = result.data;
        }
        else {
            result = false;
        }
    }
    catch (e) {
        Workflow.handleError(e);
        result = false;
    }

    return result;
}


/**
 * Return the collection of records sorted by stoplight color, red before yellow before green.
 *
 * @param unsortedRecords
 */
function sortAlertsRecords(unsortedRecords) {
    var sortedRecords = [];
    var mediumRecords = [];
    var lowRecords = [];

    for (var rowNum = 0, record; record = unsortedRecords[rowNum]; rowNum++) {
        if (!record.stoplightColor){ continue;}

        var alertBulletColor = record.stoplightColor;
        if (alertBulletColor.toLowerCase()  === 'red') {
            sortedRecords.push(unsortedRecords[rowNum]);
        }
        else if (alertBulletColor === 'yellow') {
            mediumRecords.push(unsortedRecords[rowNum]);
        }
        else {
            lowRecords.push(unsortedRecords[rowNum]);
        }
    }

    for (var i = 0, mediumRecord; mediumRecord = mediumRecords[i]; i++) {
        sortedRecords.push(mediumRecord);
    }

    for (var j = 0, lowRecord; lowRecord = lowRecords[j]; j++) {
        sortedRecords.push(lowRecord);
    }

    return sortedRecords;
}

/**
 * Construct the HTML for the alertsList control and insert it into the document.
 * After forming single-page list from all records, measure height of list.
 * If its taller than bucket height break it into pages and add navi h-scroller.
 *
 * @param displayControlId
 * @param alertsRecords
 * @param n
 */
function drawAlertsList(displayControlId, alertsRecords, n) {
    var displayControlElement = $("#" + displayControlId);
    displayControlElement.empty();

    var pageIndex = 1;
    var pageIdPrefix = displayControlId + '_page';
    var rowIdPrefix = displayControlId.substring(displayControlId.indexOf('_') + 1);
    rowIdPrefix = rowIdPrefix.substring(rowIdPrefix.indexOf('_') + 1);

    var itemsHtmlString = formAlertsItemsString(pageIdPrefix, rowIdPrefix, pageIndex, alertsRecords);
    displayControlElement.append(itemsHtmlString);

    var allowableBucketContentHeight = getBucketContentHeight(displayControlId);
    var unalteredHeight = displayControlElement.height();
    var removeCount = 0;

    if (unalteredHeight > allowableBucketContentHeight) {
        for (var i = alertsRecords.length - 1; unalteredHeight > allowableBucketContentHeight; i--) {
            var findSelector = '#'+ rowIdPrefix + pageIndex + '_row_' + i;
            $(findSelector).remove();
            removeCount++;
            unalteredHeight = displayControlElement.height();
        }

        var pageSelector = '#'+ pageIdPrefix + pageIndex;
        var pageRowHeight = getPageRowHeight(pageSelector);
        $(pageSelector).wrap('<div class="scrollable-wrapper scrollable-wrapper-' + pageRowHeight + '"></div>');
        $(pageSelector).wrap('<div class="scrollable-root scrollable-' + pageRowHeight + '" id="' + rowIdPrefix + //pageIndex +
            '_scroller"></div>');
        $(pageSelector).wrap('<div class="items"></div>');

       appendAdditionalAlertsPages(allowableBucketContentHeight, pageIdPrefix, rowIdPrefix, pageIndex, alertsRecords, removeCount);

        displayControlElement.append('<div class="navi" id="alertsNavi_' + n + '"></div>');
        $('#' + rowIdPrefix + '_scroller').scrollable({vertical: false, mousewheel: true}).navigator("#alertsNavi_" + n);
    }
}

/**
 * Return the metrics records formatted as an HTML list collection.
 *
 * @param pageIdPrefix part of the list element's id
 * @param rowIdPrefix part of the list item element's id
 * @param pageIndex part of the list and list item elements' ids
 * @param alertsRecords metrics records to be formatted into the HTML list
 *
 * @return {String}
 */
function formAlertsItemsString(pageIdPrefix, rowIdPrefix, pageIndex, alertsRecords) {
    var itemsHtmlString = '<ol id="' + pageIdPrefix + pageIndex +'" class="alert-items">';
    var emptyListLength = itemsHtmlString.length;
    var recordCount = alertsRecords.length;
    var record;

    for (var rowNum = 0; rowNum < recordCount; rowNum++) {
        record = alertsRecords[rowNum];
        if (!record.metricTitle) { continue; }

        var alertText = record.metricTitle;
        var alertsCount = record.metricValue;
        
        var alertBulletColor = record.stoplightColor.toLowerCase();
        var alertBulletClass = 'alert-low';
        if (alertBulletColor === 'red') {
            alertBulletClass = 'alert-high';
        }
        else if (alertBulletColor === 'yellow') {
            alertBulletClass = 'alert-medium';
        }

        var drilldownAttribute = record.drillDownView;
        drilldownAttribute = valueExists(drilldownAttribute) ? ' rel="' + drilldownAttribute + '" onMouseUp="openAlertDrilldown(this, event);"' : '';

        itemsHtmlString += '<li id="' + rowIdPrefix + pageIndex +'_row_' + rowNum + '" class="' + alertBulletClass + '"' +
            drilldownAttribute + '>';
        if (drilldownAttribute.length > 0) {
            itemsHtmlString += '<a>';
        }
        itemsHtmlString += '<span class="alert-description">[' + alertsCount + '] ' + alertText + '</span>';
        if (drilldownAttribute.length > 0) {
            itemsHtmlString += '</a>';
        }
        itemsHtmlString += '</li>';
    }

    if (emptyListLength === itemsHtmlString.length) {
        itemsHtmlString += '<li >' + getLocalizedString(pageNavStrings.z_PAGENAV_BUCKET_NODATA) +' </li>';
    }

    itemsHtmlString += '</ol>';

    return itemsHtmlString;
}

/**
 * Open the drilldown view in a new tab or window (relying on user settings).
 *
 * @param elem
 * @param event
 * @return {Boolean}
 */
function openAlertDrilldown(elem, event) {
    var popupViewNameSuffix = '-popup.axvw';

    if (signOutOnTimeOut()) { return false; }

    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }
    if (event.button === 2 || event.which === 3)
    {
        return false;
    }

    var drilldownViewFile = $(elem).attr('rel');
    if (!drilldownViewFile) {
        drilldownViewFile = $(elem).parents('li').attr('rel');
    }
    if (drilldownViewFile) {
        var drilldownSource = PageNavUserInfo.webAppContextPath + drilldownViewFile;

        // open in modal dialog
        if (drilldownViewFile.indexOf(popupViewNameSuffix) === drilldownViewFile.length - popupViewNameSuffix.length) {
            // redesign for Bali4
            var newDialog = '<div id="alert-drilldown" style="padding:0;">' +
                '<iframe id="alert-drilldown-frame" src="' + drilldownSource + '" width="99%" height="99%"></iframe>' +
                '</div>';

            var windowElement = $(window);
            var drilldown = $(newDialog).dialog({
                autoOpen: false,
                height: windowElement.height() - 12,
                width: windowElement.width() - 14,
                modal: true,
                open: function () {
                    $(".ui-dialog-titlebar-close").show();

                    var drilldownFrame = $("#alert-drilldown-frame")[0];
                    var drilldownTitleElemText = $(drilldownFrame).contents().find("#viewToolbar_title").text();
                    $(this).dialog("option", "title", drilldownTitleElemText);
                },
                close: function () {
                    $("#alert-drilldown").remove();
                }
            });

            drilldown.dialog('open');
        }
        // open in new window (tab or browser window)
        else {
            window.open(drilldownSource);
        }
    }
}

