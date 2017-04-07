/**
 * JavaScript handling the breaking of long task or alerts lists into horizontally scrollable pages.
 *
 *
 * @author Steven Meyer
 * @since V 21.2
 */


/**
 * Iterate over the pTask buckets and modify any single page lists that are taller than the bucket height
 * into multi-page lists with the horizontal scrolling navigator.
 */
function pageTallProcessBuckets(){
    $(".bucket-process > .bucket-wrapper").each( function(n) {
        var allowableUnpagedBucketHeight = getUnpagedBucketHeight(this, 'process');
        var allowableBucketHeight = allowableUnpagedBucketHeight - 25;
        var measuredBucketHeight = $(this).height();

        var taskGroupParentElements = $(this).children('ol.ptask-labels');

        if (measuredBucketHeight > allowableUnpagedBucketHeight && taskGroupParentElements.length > 0) {
            var taskGroupLabelElements = $(taskGroupParentElements).children('li');
            var taskGroupTaskElements = $(taskGroupParentElements).children('ol.process-tasks');

            var hasTaskGroupLabels = taskGroupTaskElements.length > 1;
            var breakTaskGroups = mustTaskGroupsBeDivided(this, allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements);

            var removedTaskElements = removePTaskElementsToCorrectHeight(allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements, hasTaskGroupLabels, breakTaskGroups, this);

            // add page wrappers
            var pageRootElement = taskGroupParentElements.get(0);
            var pageRowHeight = getPageRowHeight(pageRootElement);
            var bucketId = $(this).attr('id');
            $(pageRootElement).wrap('<div class="scrollable-wrapper scrollable-wrapper-' + pageRowHeight + '"></div>');
            $(pageRootElement).wrap('<div class="scrollable-root scrollable-' + pageRowHeight + '" id="' + bucketId + n + '_scroller"></div>');
            $(pageRootElement).wrap('<div class="items"></div>');

            appendAdditionalTaskPages(allowableBucketHeight, pageRootElement, bucketId, n, 1, hasTaskGroupLabels, breakTaskGroups, removedTaskElements);

            // add navi element & initialize
            $("#" + bucketId).append('<div class="navi" id="pTaskNavi_' + n + '"></div>');
            $("#" + bucketId + n + '_scroller').scrollable({vertical: false, mousewheel: true}).navigator("#pTaskNavi_" + n);
        }
    });
}

/**
 * Return the height allowed for the bucket contents
 * not leaving any room for a paging control only for tasks, task group labels, etc.
 *
 * @param bucketWrapper element
 * @param bucketType -- process or application
 * @return {int}
 */
function getUnpagedBucketHeight(bucketWrapper, bucketType) {
    var wrapperParentElement = $(bucketWrapper).parent(".bucket-" + bucketType);
    var bucketHeight = $(wrapperParentElement).height();
    var bucketTop = $(bucketWrapper).css('padding-top');
    bucketTop = parseInt(bucketTop);
    var bucketBottom = $(bucketWrapper).css('padding-bottom');
    bucketBottom = parseInt(bucketBottom);

    var processTitleElem = $(bucketWrapper).siblings("." + bucketType + "-title").get(0);
    if (!processTitleElem) {
        processTitleElem = $(bucketWrapper).siblings("." + bucketType + "s-process-title").get(0);
    }
    var bucketTitleHeight = $(processTitleElem).height();
    var bucketTitleTop = $(processTitleElem).css('padding-top');
    bucketTitleTop = parseInt(bucketTitleTop);
    var bucketTitleBottom = $(processTitleElem).css('padding-bottom');
    bucketTitleBottom = parseInt(bucketTitleBottom);

    return bucketHeight - bucketTitleHeight - bucketTop - bucketBottom - bucketTitleTop - bucketTitleBottom;
}

/**
 * True when any one of the taskGroups in the process is taller than the bucket.
 *
 * @param bucketWrapper
 * @param allowableBucketHeight
 * @param taskGroupLabelElements
 * @param taskGroupTaskElements
 * @return {Boolean}
 */
function mustTaskGroupsBeDivided(bucketWrapper, allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements) {
    var breakTaskGroups = false;
    if (taskGroupTaskElements.length > 1) {
        var bucketMarginTop = $(bucketWrapper).css('padding-top');
        var taskGroupHeights = getTaskGroupHeights(parseInt(bucketMarginTop), taskGroupLabelElements, taskGroupTaskElements);
        var taskGroupCount = taskGroupHeights.length;

        for (var j = 0; j < taskGroupCount; j++) {
            if (taskGroupHeights[j] > allowableBucketHeight) {
                breakTaskGroups = true;
                break;
            }
        }
    }

    return breakTaskGroups;
}

/**
 * Return the heights of each task group within the process' tasks.
 * Task groups are divided by labels.
 *
 * @param topMargin
 * @param taskGroupLabelElements
 * @param taskGroupTaskElements
 * @return {Array}
 */
function getTaskGroupHeights(topMargin, taskGroupLabelElements,taskGroupTaskElements) {
    var groupHeights = [];
    var taskGroupLabelCount = taskGroupLabelElements.length;
    for (var i = 0; i < taskGroupLabelCount; i++) {
        // simulated wrapper of task group in paged scroller
        $('body').append('<div id="test_paging_scroller" class="page bucket-process" style="position:absolute;visibility:hidden">' +
            '<div class="scrollable-full-height">' +
            '<ol id="test_paging_insert_root" class="ptask-labels">' +
            '</ol></div></div>');
        var testPageInsert = $('#test_paging_insert_root');

        // append a clone of the task group label and the tasks in the group
        testPageInsert.append($($(taskGroupLabelElements).get(i)).clone(false));
        testPageInsert.append($($(taskGroupTaskElements).get(i)).clone(false));

        //var ht = testPageInsert.height();
        groupHeights.push(topMargin + testPageInsert.height());

        $('#test_paging_scroller').remove();
    }

    return groupHeights;
}

/**
 * Return a collection of pTask group labels and task items that do not fit in the allowable height of the bucket page.
 *
 * @param allowableBucketHeight
 * @param taskGroupLabelElements
 * @param taskGroupTaskElements
 * @param hasTaskGroupLabels
 * @param breakTaskGroups
 * @param pageHeightElement
 * @return {Array}
 */
function removePTaskElementsToCorrectHeight(allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements, hasTaskGroupLabels, breakTaskGroups, pageHeightElement) {
    var measuredBucketHeight = $(pageHeightElement).height();
    var removedTaskElements = [];
    //var elementToRemove;
    var taskElements;

    // remove & measure loop
    if (hasTaskGroupLabels && breakTaskGroups) {
        for (var i = taskGroupTaskElements.length - 1; i >= 0 && measuredBucketHeight > allowableBucketHeight; i--) {
            var taskGroupTasks = taskGroupTaskElements.get(i);
            taskElements = $(taskGroupTasks).children('li');
            for (var j = taskElements.length - 1; j >= 0 && measuredBucketHeight > allowableBucketHeight; j--) {
                measuredBucketHeight = detachElementAndRemeasure(taskElements, j, removedTaskElements, pageHeightElement);
            }
            taskElements = $(taskGroupTasks).children('li');
            if (taskElements.length === 0) {
                detachElementAndRemeasure(taskGroupTaskElements, i, removedTaskElements, pageHeightElement);
                detachElementAndRemeasure(taskGroupLabelElements, i, removedTaskElements, pageHeightElement);
            }
            measuredBucketHeight = $(pageHeightElement).height();
        }
    }
    else if (hasTaskGroupLabels) {
        for (var k = taskGroupTaskElements.length - 1; k >= 0 && measuredBucketHeight > allowableBucketHeight; k--) {
            detachElementAndRemeasure(taskGroupTaskElements, k, removedTaskElements, pageHeightElement);
            measuredBucketHeight = detachElementAndRemeasure(taskGroupLabelElements, k, removedTaskElements, pageHeightElement);
        }

        if (removedTaskElements.length > 0 && removedTaskElements[0].nodeName === 'LI' && removedTaskElements[0].innerHTML === '&nbsp;') {
            removedTaskElements = removedTaskElements.slice(1);
        }
     }
    else {
        taskElements = $(taskGroupTaskElements).children('li');
        for (var m = taskElements.length - 1; m >= 0 && measuredBucketHeight > allowableBucketHeight; m--) {
            measuredBucketHeight = detachElementAndRemeasure(taskElements, m, removedTaskElements, pageHeightElement);
        }
    }
    return removedTaskElements;
}

/**
 *
 * Core helper function for removePTaskElementsToCorrectHeight.
 *
 * @param elementGroup
 * @param index
 * @param removedTaskElements
 * @param pageHeightRoot
 * @return {*|jQuery}
 */
function detachElementAndRemeasure(elementGroup, index, removedTaskElements, pageHeightRoot) {
    var elementToRemove = elementGroup.get(index);
    if (elementToRemove) {
        removedTaskElements.unshift($(elementToRemove).detach().get(0));
    }

    return $(pageHeightRoot).height();
}

/**
 * Append a collection of pTask group labels and task items to the pages' root and then measure the height of the added elements.
 * When the height is taller than the allowable bucket height, remove the extra elements and add more pages recursively.
 *
 * @param allowableBucketHeight
 * @param pageRootElement
 * @param bucketId
 * @param n
 * @param pageIndex
 * @param hasTaskGroupLabels
 * @param breakTaskGroups
 * @param removedTaskElements
 */
function appendAdditionalTaskPages(allowableBucketHeight, pageRootElement, bucketId, n, pageIndex, hasTaskGroupLabels, breakTaskGroups, removedTaskElements) {
    var rootId = bucketId + n + '_' + pageIndex + '_insert_root';
    $(pageRootElement).after('<ol class="ptask-labels" id="' + rootId + '"></ol>');
    var insertRoot = $("#" + rootId );

    if (hasTaskGroupLabels && breakTaskGroups) {
        appendAdditionalTaskPagesBrokenTaskGroups(rootId, removedTaskElements);
    }
    else {
        if (!hasTaskGroupLabels) {
            insertRoot.append('<li></li><ol class="process-tasks"></ol>');
        }

        var removedTaskParent = hasTaskGroupLabels ? insertRoot : insertRoot.find('ol');
        var removedTaskElementCount = removedTaskElements.length;
        for (var i = 0; i < removedTaskElementCount; i++) {
            removedTaskParent.append(removedTaskElements[i]);
        }
    }

    var measuredBucketHeight = insertRoot.height();
    if (measuredBucketHeight > allowableBucketHeight) {
        var taskGroupTaskElements = insertRoot.children('ol.process-tasks');
        var taskGroupLabelElements = insertRoot.children('li');

        var nextRemovedTaskElements = removePTaskElementsToCorrectHeight(allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements,
            hasTaskGroupLabels, breakTaskGroups, insertRoot);
        appendAdditionalTaskPages(allowableBucketHeight, insertRoot, bucketId, n, pageIndex + 1, hasTaskGroupLabels, breakTaskGroups, nextRemovedTaskElements);
    }
}

/**
 * Append an additional set of tasks
 * when the bucket uses task labels but groups must be broken across pages.
 *
 * @param rootId
 * @param removedTaskElements
 */
function appendAdditionalTaskPagesBrokenTaskGroups(rootId, removedTaskElements) {
    if ($(removedTaskElements[0]).children('a').length > 0) {
        $("#" + rootId).append('<li></li><ol class="process-tasks"></ol>');
    }
    var removedTaskElementCount = removedTaskElements.length;
    for (var i = 0; i < removedTaskElementCount; i++) {
        if ($(removedTaskElements[i]).children('a').length > 0) {
            $("#" + rootId+ ' > ol:last').append(removedTaskElements[i]);
        }
        else {
            $("#" + rootId ).append(removedTaskElements[i]);
        }
    }
}

/**
 * Form additional pages of records to fit in the allowable height of the bucket
 * and append those pages to the root selector formed from pageIdPrefix + pageIndex.
 *
 * @param allowableHeight height of record display area.
 * @param alertsRecords array of records that were intended to be displayed on previous page but all cannot fit.
 * @param removeCount count of records that were removed from display of alertsRecords
 *          and need to be displayed on additional pages.
 * @param pageIdPrefix
 * @param rowIdPrefix
 * @param pageIndex 1-based index of previous page.
 */
function appendAdditionalAlertsPages(allowableHeight, pageIdPrefix, rowIdPrefix, pageIndex, alertsRecords, removeCount) {
    var additionalPageIndex = pageIndex + 1;
    var pageRootSelector = '#'+ pageIdPrefix + pageIndex;

    var additionalPageRecords = [];
    for (var j = removeCount; j > 0; j--) {
        additionalPageRecords.push(alertsRecords[alertsRecords.length - j]);
    }
    var itemsHtmlString = formAlertsItemsString(pageIdPrefix, rowIdPrefix, additionalPageIndex, additionalPageRecords);
    $(itemsHtmlString).insertAfter(pageRootSelector);

    var additionalPageSelector = "#" + pageIdPrefix + (additionalPageIndex);
    var unalteredHeight = $(additionalPageSelector).height();

    if (unalteredHeight > allowableHeight) {
        removeCount = 0;

        for (var i = additionalPageRecords.length - 1; unalteredHeight > allowableHeight; i--) {
            var findSelector = '#'+ rowIdPrefix + additionalPageIndex + '_row_' + i;
            $(findSelector).remove();
            removeCount++;
            unalteredHeight = $(additionalPageSelector).height();
        }

        appendAdditionalAlertsPages(allowableHeight, pageIdPrefix, rowIdPrefix, additionalPageIndex, additionalPageRecords, removeCount);
    }
}

/**
 * Return the number that is the height of the bucket contents minus some space for the navi control.
 * @param controlId
 * @return {*}
 */
function getBucketContentHeight(controlId) {
    var controlElement = $("#" + controlId);
    var bucketHeight = controlElement.parents('.bucket-process').height();
    var bucketTitleHeight = controlElement.parents('.bucket-process').children('.process-title').height();
    return bucketHeight - bucketTitleHeight - 55;
}

/**
 * Return the nav pages row height class string for the row containing the element with the startingSelector id.
 *
 * @param startingSelector
 * @return {String}
 */
function getPageRowHeight(startingSelector) {
    var pageRowHeight = 'half-height';
    var rowParentClassAttr = $(startingSelector).parents(".page-row").first().attr("class");
    var rowParentClasses = rowParentClassAttr.split(' ');
    var rowParentClassCount = rowParentClasses.length;

    for (var i = 0; i < rowParentClassCount; i++) {
        var testString = $.trim(rowParentClasses[i]);
        if (testString.indexOf('height') === (testString.length - 6)) {
            pageRowHeight = testString;
            break;
        }
    }

    return pageRowHeight;
}



/**
 * Iterate over the application page's process buckets
 * and modify any single page lists that are taller than the bucket height
 * into multi-page lists with the horizontal scrolling navigator.
 */
function pageTallPTaskBuckets(){
    $('#applicationsProcessView').find(".bucket-application").each( function(n) {
        //var bucketHeight = $(this).height();
        var bucketWrapper = $(this).find(".bucket-wrapper");

        var allowableUnpagedBucketHeight = getUnpagedBucketHeight(bucketWrapper, 'application');
        var allowableBucketHeight = allowableUnpagedBucketHeight - 25;
        var measuredBucketHeight = $(bucketWrapper).height();

        var taskGroupParentElements = $(bucketWrapper).children('ol.ptask-labels');

        if (measuredBucketHeight > allowableUnpagedBucketHeight && taskGroupParentElements.length > 0) {
            var taskGroupTaskElements = $(taskGroupParentElements).children('ol.process-tasks');
            var taskGroupLabelElements = $(taskGroupParentElements).children('li');

            var hasTaskGroupLabels = taskGroupTaskElements.length > 1;
            var breakTaskGroups = mustTaskGroupsBeDivided(bucketWrapper, allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements);

            var removedTaskElements = removePTaskElementsToCorrectHeight(allowableBucketHeight, taskGroupLabelElements, taskGroupTaskElements, hasTaskGroupLabels, breakTaskGroups, bucketWrapper);

            var pageRootElement = taskGroupParentElements.get(0);
            var pageRowHeight = getPageRowHeight(pageRootElement);
            var bucketId = $(bucketWrapper).attr('id');

            // add page wrappers
            $(pageRootElement).wrap('<div class="scrollable-wrapper scrollable-wrapper-' + pageRowHeight + '"></div>');
            $(pageRootElement).wrap('<div class="scrollable-root scrollable-' + pageRowHeight + '" id="' + bucketId + n + '_scroller"></div>');
            $(pageRootElement).wrap('<div class="items"></div>');

            appendAdditionalTaskPages(allowableBucketHeight, pageRootElement, bucketId, n, 1, hasTaskGroupLabels, breakTaskGroups, removedTaskElements);

            // add navi element & initialize
            $("#" + bucketId).append('<div class="navi" id="appTaskNavi_' + bucketId + n + '"></div>');
            $("#" + bucketId + n + '_scroller').scrollable({circular: false, vertical: false, mousewheel: true}).navigator("#appTaskNavi_" + bucketId + n);
        }
    });
}

/**
 * Iterate over the app buckets and modify any single page lists that are taller than the bucket height
 * into multi-page lists with the horizontal scrolling navigator.
 */
function pageTallApplicationBuckets(){
    $('#applicationsTabView').find(".bucket-application").each( function(n) {
        var bucketHeight = $(this).height();
        var productTitleElem = $(this).find(".product-title").get(0);
        var bucketWrapper = $(this).find(".bucket-wrapper");
        var bucketTitleHeight = $(productTitleElem).height();
        var allowableUnpagedBucketHeight = bucketHeight - bucketTitleHeight - 20;
        var allowableBucketHeight = bucketHeight - bucketTitleHeight - 40;
        var measuredBucketHeight = $(bucketWrapper).height();
        var productActivityElements = $(bucketWrapper).children('ol.app-processes');

        if (measuredBucketHeight > allowableUnpagedBucketHeight && productActivityElements.length > 0) {
            //alert('pTAB ' + n + ' mBH = ' + measuredBucketHeight + 'aBH = ' + allowableUnpagedBucketHeight);
            var pageRootElement = productActivityElements.get(0);
            var activityElements = $(productActivityElements).children('li');

            var removedActivityElements = removeActivityElementsToCorrectHeight(allowableBucketHeight, activityElements, bucketWrapper);

            var pageRowHeight = getPageRowHeight(pageRootElement);
            var bucketId = $(bucketWrapper).attr('id');

            // add page wrappers
            $(pageRootElement).wrap('<div class="scrollable-wrapper scrollable-wrapper-' + pageRowHeight + '"></div>');
            $(pageRootElement).wrap('<div class="scrollable-root scrollable-' + pageRowHeight + '" id="' + bucketId + n + '_scroller"></div>');
            $(pageRootElement).wrap('<div class="items"></div>');

            appendAdditionalActivityPages(allowableBucketHeight, pageRootElement, bucketId, n, 0, removedActivityElements);

            // add navi element & initialize
            $("#" + bucketId).append('<div class="navi" id="activityNavi_' + n + '"></div>');
            $("#" + bucketId + n + '_scroller').scrollable({circular: false, vertical: false, mousewheel: true}).navigator("#activityNavi_" + n);
        }
    });
}

/**
 * Return a collection of activity items that do not fit in the allowable height of the bucket page.
 *
 * @param allowableBucketHeight
 * @param activityElements
 * @param pageHeightElement
 * @return {Array}
 */
function removeActivityElementsToCorrectHeight(allowableBucketHeight, activityElements, pageHeightElement) {
    var measuredBucketHeight = $(pageHeightElement).height();
    var removedActivityElements = [];

    // remove & measure loop
    //var taskElements = $(taskGroupTaskElements).children('li');
    for (var i = activityElements.length; i > 0 && measuredBucketHeight > allowableBucketHeight; i--) {
        var elementToRemove = activityElements.get(i - 1);
        removedActivityElements.unshift($(elementToRemove).detach().get(0));
        measuredBucketHeight = $(pageHeightElement).height();
    }

    return removedActivityElements;
}

/**
 * Append a collection of activity items to the page's root and then measure the height of the added elements.
 * When the height is taller than the allowable bucket height, remove the extra elements and add more pages recursively.
 *
 * @param allowableBucketHeight
 * @param pageRootElement
 * @param bucketId
 * @param n
 * @param pageIndex
 * @param removedActivityElements
 */
function appendAdditionalActivityPages(allowableBucketHeight, pageRootElement, bucketId, n, pageIndex, removedActivityElements) {
    var rootId = bucketId + n + '_' + pageIndex + '_insert_root';

    $(pageRootElement).after('<ol class="app-processes" id="' + rootId + '"></ol>');
    var insertRoot = $("#" + rootId);
    var removedActivityCount = removedActivityElements.length;

    for (var i = 0; i < removedActivityCount; i++) {
        insertRoot.append(removedActivityElements[i]);
    }

    var measuredBucketHeight = insertRoot.height();
    if (measuredBucketHeight > allowableBucketHeight) {
        var activityElements = insertRoot.children('li');
        var nextRemovedTaskElements = removeActivityElementsToCorrectHeight(allowableBucketHeight, activityElements, insertRoot);
        appendAdditionalActivityPages(allowableBucketHeight, insertRoot, bucketId, n, pageIndex + 1, nextRemovedTaskElements);
    }
}

/**
 * Iterate over all application tab's product title displays.
 * When title width overlaps image, fade the image slightly.
 * When a title is three lines tall increase height of all that row's title backgrounds.
 */
function modifyProductTitleDisplay() {
    var bucketAppHeading = $('.bucket-application h2');
    var bucketApplicationHeight = parseInt(bucketAppHeading.css('height'));
    var bucketApplicationPaddingLeft = parseInt(bucketAppHeading.css('padding-left'));
    var imageLeft = parseInt($('.application-title-icon').css('left'));
    var bucketsPerRow = 5;
    var appBucketRows = [[],[],[]];
    var tallTitleRows = [false, false, false];

    $('h2.product-title').each( function(n) {
        var target = $(this).children('span.product-title-text');
        var title = $(target).text();
        var titleWidth = $(target).width();
        var titleHeight = $(target).height();

        // when title width overlaps image, fade the image
        if ((titleWidth + bucketApplicationPaddingLeft) >= imageLeft) {
            $(this).children('.application-title-icon').css('opacity', 0.45);
        }

        // set the row's 'title is too tall' flag when text height is moe than standard
        if (titleHeight > bucketApplicationHeight) {
            tallTitleRows[Math.floor(n / bucketsPerRow)] = true;
        }

        // hold the title elements by row in case they need to be taller
        appBucketRows[Math.floor(n / bucketsPerRow)].push(this);
    });

    // make any row with tallTitleRows[i] == true taller to allow title display and even out heights.
    var tallTitleRowCount = tallTitleRows.length;
    for (var i = 0; i < tallTitleRowCount; i++) {
        if (tallTitleRows[i]) {
            for (var j = 0; j < appBucketRows[i].length; j++) {
                var titleElem = appBucketRows[i][j];
                $(titleElem).css('height', '65px');
            }
        }
    }
}

/**
 * Iterate over all application tab's activity page process title displays.
 *
 * When a title is three lines tall increase height of all that row's title backgrounds.
 */
function modifyProcessTitleDisplay() {
    var bucketTitleHeight = parseInt($('.bucket-application h2').css('height'));
    var bucketsPerRow = 5;
    var processBucketRows = [[], [], [], [], []];
    var tallTitleRows = [false, false, false, false, false];

    $('h2.applications-process-title').each( function(n) {
        var target = $(this).children('span.process-title-text');
        ///var title = $(target).text();

        // set the row's 'title is too tall' flag when text height is moe than standard
        if ($(target).height() > bucketTitleHeight) {
            tallTitleRows[Math.floor(n / bucketsPerRow)] = true;
        }

        // hold the title elements by row in case they need to be taller
        processBucketRows[Math.floor(n / bucketsPerRow)].push(this);
    });

    // make any row with tallTitleRows[i] == true taller to allow title display and even out heights.
    var tallTitleRowCount = tallTitleRows.length;
    for (var i = 0; i < tallTitleRowCount; i++) {
        if (tallTitleRows[i]) {
            for (var j = 0; j < processBucketRows[i].length; j++) {
                var titleElem = processBucketRows[i][j];
                $(titleElem).css('height', '65px');
                ///var scrollableWrapper = $(titleElem).parent('div.bucket-application').children('div.bucket-wrapper');
                var bucketWrapper = $(titleElem).siblings('div.bucket-wrapper');
                if (bucketWrapper && bucketWrapper.length > 0) {
                    $(bucketWrapper).css('padding-top', '2px');
                }
            }
        }
    }
}
