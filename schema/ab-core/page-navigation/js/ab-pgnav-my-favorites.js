/**
 * JavaScript initializing, loading and handling events for the My Favorites buckets.
 *
 * Utilizes the jQuery UI Drag and Drop plugins.
 * see http://jqueryui.com/draggable/ http://jqueryui.com/droppable/ and http://jqueryui.com/sortable/
 *
 * @author Steven Meyer
 * @since V 21.1
 */

/**
 * Initialize the drag and drop elements
 */
function initDandDFavorites() {
    var activeTabId = getActiveTabId();
    var pageElement = $(activeTabId).find('.nav-pages[display!= "none"]');

    var taskElement = $(activeTabId).find('.process-tasks > li > a');
    $(taskElement).draggable({cursor: 'move', helper: 'clone', containment: pageElement,
        appendTo: pageElement, revert: "invalid", revertDuration: 100});

    // create a myFavorite when dropping a task on the favorites target
    var addTargetElement = $(activeTabId).find('.favorites-add-target');
    $(addTargetElement).droppable({tolerance: "pointer", greedy: true, accept: 'a[data-isFavorites!="true"]'});
    $(addTargetElement).on("drop", handleFavoritesAddDropEvent);

    // delete a myFavorites when dragging an existing favorite and dropping it on the trashcan
    var deleteTargetElement = $(activeTabId).find('.favorites-delete-target');
    $(deleteTargetElement).droppable({tolerance: "pointer", greedy: true, accept: 'a[data-isFavorites="true"]'});
    $(deleteTargetElement).on("drop", handleFavoritesDeleteDropEvent);
}

/**
 * Localize favorites bucket's display text.
 */
function localizeFavoritesDisplayText() {
    $('span.favorites-add-target').html(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ADD_TARGET_TEXT));
    $('.favorites-add-target').attr('title', getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ADD_TARGET_TOOLTIP));
    $('span.favorites-delete-target').attr('title', getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_DELETE_TARGET_TOOLTIP));
    $('a.page-top-link').html(getLocalizedString(pageNavStrings.z_PAGENAV_BACK_TO_TOP));
}

/**
 * Fill any favorites bucket on the page.
 */
function loadFavoritesBuckets() {
    var activeTab = getActiveTabId();
    var favoritesItemsContainer = $(activeTab).find('.bucket-wrapper > .favorites').find('.favorites-items').first();
    if (favoritesItemsContainer) {
        var parameters = {
            viewName: 'ab-page-navigation-datasource.axvw',
            dataSourceId: 'pageNavigationFavorites_ds',
            groupIndex: 0,
            version: '2',
            useHierarchicalSecurityRestriction: false
        };
        var results = getDataRecords(parameters);
        drawFavoritesRecords(favoritesItemsContainer, results.records);
        pageTallFavoritesBuckets();
    }
}

/**
 * Append list items to the favorites container.
 *
 * @param favoritesItemListElement
 * @param records
 */
function drawFavoritesRecords(favoritesItemListElement, records) {
    $(favoritesItemListElement).empty();

    if (records && records.length > 0) {
        // To open in the correct  frame, Home Favorites require a rel='eTask' and Applications tab favorites require a rel='pTask'
        var activeTabAnchor = $("li.ui-tabs-active > a");
        var activeTabID = $(activeTabAnchor).attr('id');
        var taskType = activeTabID.toLowerCase().indexOf('home') >= 0 ? 'eTask' : 'pTask';

        for (var i = 0, record; record = records[i]; i++) {
            var taskId = record['afm_ptasks.task_id'];
            var taskName = removeUserNameFromTaskString(taskId);

            $(favoritesItemListElement).append('<li><a href="' + record['afm_ptasks.task_file'] + '" rel="' + taskType +
                '" data-activityId="' + record['afm_ptasks.activity_id']  +
                '" data-processId="' + record['afm_ptasks.process_id']  +
                '" data-taskId="' + taskId  +
                '" data-isFavorites="true">' +
                taskName + '</a></li>');
        }

        var activeTabId = getActiveTabId();
        var favoritesItemsAnchor = $('.favorites-items > li > a');
        favoritesItemsAnchor.draggable({helper: 'clone', containment: $(activeTabId).find('.favorites').parent('.bucket-wrapper')});
        favoritesItemsAnchor.click(function(){ return false; });
    }
}

/**
 * Return the taskId or localized taskId with the parenthesized userName removed.
 * @param taskString
 * @returns task string sans userName
 */
function removeUserNameFromTaskString(taskString) {
    var userNameUpperCase = PageNavUserInfo.loggedInUser.toUpperCase();
    if (taskString.indexOf('(' + userNameUpperCase + ')') === (taskString.length - userNameUpperCase.length - 2)) {
        taskString = $.trim(taskString.substr(0, taskString.indexOf(userNameUpperCase) - 1));
    }

    return taskString;
}

/**
 * Handle the event of a task being dropped on the favorites target.
 * Save the favorites on drop.
 *
 * @param evt
 * @param ui
 */
function handleFavoritesAddDropEvent (evt, ui) {
    var draggable = ui.draggable;
    var viewFileName = draggable.attr("href");
    var taskName = convertFromXMLValue(draggable.get(0).innerHTML);
    var userNameViewSuffix = '-' + PageNavUserInfo.loggedInUser.toLowerCase() + '.axvw';
    var abViewSuffix = '.axvw';

    // if dropped task is already a favorites, ignore
    var existingFavorites = $(getActiveTabId()).find('.bucket-wrapper > .favorites > ol.favorites-items > li > a');
    for (var i = 0, existingFav; existingFav = existingFavorites[i]; i++) {
        var existingFavoritesPath = $(existingFav).attr("href");
        existingFavoritesPath = existingFavoritesPath.substr(existingFavoritesPath.lastIndexOf('\\') + 1);
        var favoriteViewStripped = existingFavoritesPath.replace(userNameViewSuffix, abViewSuffix);

        if (viewFileName === existingFavoritesPath || viewFileName === favoriteViewStripped) {
            showModalMessageDialog(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_DUPLICATE_TITLE),
                getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_DUPLICATE_WARNING).replace('{1}', taskName));
            return;
        }
    }

    var schemaParent = $(draggable).parents('.bucket-process, .bucket-application');
    var activityId;
    var processId;
    var taskId = convertFromXMLValue($(draggable).attr('data-taskId'));
    var taskIcon = convertFromXMLValue($(draggable).attr('data-taskIcon'));

    if (schemaParent.length > 0) {
        activityId = $(schemaParent).attr('data-activityId');
        processId = $(schemaParent).attr('data-processId');

        var parameters = {
            viewName: viewFileName,
            activityId : activityId,
            processId: processId,
            taskId: taskId,
            taskIcon: taskIcon,
            taskIdLocalized: taskName,
            isWritePtask: true
        };

        var wfrResult = runWorkflowRuleAndConfirm('AbSystemAdministration-addViewToMyFavorites', parameters);
        if (wfrResult.success) {
            refreshFavorites();
        }
        else {
            showModalMessageDialog(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE_ERROR_TITLE), wfrResult.message);
        }
    }
}

/**
 * Handle the event of a task being dropped on the trash can.
 * Remove and delete the favorites on drop.
 *
 * @param evt
 * @param ui
 */
function handleFavoritesDeleteDropEvent (evt, ui) {
    var draggable = ui.draggable;
    var element = draggable.get(0);
    var body = $('body');
    body.css('cursor', 'progress');

    var removed = removeMyFavoritesTask(element);
    if (removed) {
        $(element).parent().remove();
    }
    else {
        returnElementToUndraggedPosition(element);
    }

    body.css('cursor', 'default');
}

/**
 * Delete the afm_ptask record for the favorites represented by elem.
 *
 * @param elem
 */
function removeMyFavoritesTask(elem) {
    var taskName = elem.innerHTML;
    var userNameUpperCase = PageNavUserInfo.loggedInUser.toUpperCase();
    var parameters = {
        viewName: $(elem).attr("href"),
        isWritePtask: true,
        taskId: convertFromXMLValue($(elem).attr('data-taskId')),
        taskIdLocalized: convertFromXMLValue(taskName + ' (' + userNameUpperCase + ')'),
        processId: $(elem).attr('data-processId'),
        activityId : $(elem).attr('data-activityId')
    };

    var removed = runWorkflowRuleAndConfirm('AbSystemAdministration-removeViewFromMyFavorites', parameters);
    if (!removed.success) {
        parameters.taskId = $.trim(taskName.substring(0, taskName.indexOf('(' + userNameUpperCase)));
        removed = runWorkflowRuleAndConfirm('AbSystemAdministration-removeViewFromMyFavorites', parameters);
    }

    if (!removed.success) {
        showModalMessageDialog(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_DELETE_ERROR_TITLE), wfrResult.message);
    }
    else {
        refreshFavorites();
    }

    return removed;
}

/**
 * Return the text of an element, with the <img /> element removed if it exists.
 * @param text
 * @return {*|String}
 */
function removeImgElemIfExists(text) {
    var imgIndex = text.indexOf("<img ");
    if (imgIndex >= 0) {
        var imgEndIndex = text.indexOf(">", imgIndex);
        text = text.substr(0, imgIndex) +  text.substr(imgEndIndex + 1);
    }

    return $.trim(text);
}

/**
 *
 */
function pageTallFavoritesBuckets() {
    var activeTabId = getActiveTabId();
    var bucketType = activeTabId === '#tabPageNavigationHome' ? 'process' : 'application';

    $(activeTabId).find('.bucket-wrapper > .favorites').each( function(n) {
        var allowableUnpagedBucketHeight = getUnpagedBucketHeight($(this).parent(), bucketType);
        var allowableBucketHeight = allowableUnpagedBucketHeight - 60;
        var measuredBucketHeight = $(this).parent().height();

        if (measuredBucketHeight > allowableUnpagedBucketHeight) {
            var taskListElements = $(this).find('.favorites-items').find('li');
            var pageRootElement = $(this).find('.favorites-items');
            var removedTaskElements = removeActivityElementsToCorrectHeight(allowableBucketHeight, taskListElements, this);

            // add page wrappers
            var pageRowHeight = getPageRowHeight(pageRootElement);
            var bucketId = $(this).parent().attr('id');
            $(pageRootElement).wrap('<div class="scrollable-wrapper scrollable-favorites-wrapper-' + pageRowHeight + '"></div>');
            $(pageRootElement).wrap('<div class="scrollable-root scrollable-favorites-' + pageRowHeight + '" id="' + bucketId + n + '_scroller"></div>');
            $(pageRootElement).wrap('<div class="items"></div>');

            appendAdditionalFavoritesPages(allowableBucketHeight, pageRootElement, bucketId, n, 1, removedTaskElements);

            // add navi element & initialize
            $(this).append('<div class="navi" id="favNavi_' + bucketId + n + '"></div>');
            $("#" + bucketId + n + '_scroller').scrollable({vertical: false, mousewheel: true}).navigator("#favNavi_" + bucketId + n);
        }
    });
}

/**
 *
 * @param allowableBucketHeight
 * @param pageRootElement
 * @param bucketId
 * @param n
 * @param pageIndex
 * @param removedActivityElements
 */
function appendAdditionalFavoritesPages(allowableBucketHeight, pageRootElement, bucketId, n, pageIndex, removedActivityElements) {
    var rootId = bucketId + n + '_' + pageIndex + '_insert_root';
    $(pageRootElement).after('<ol class="favorites-items" id="' + rootId + '"></ol>');
    var root = $("#" + rootId);

    var activityCount = removedActivityElements.length;
    for (var i = 0; i < activityCount; i++) {
        root.append(removedActivityElements[i])
    }

    var measuredBucketHeight = root.height();
    if (measuredBucketHeight > allowableBucketHeight) {
        var activityElements = root.children('li');
        var nextRemovedTaskElements = removeActivityElementsToCorrectHeight(allowableBucketHeight, activityElements, root);
        appendAdditionalFavoritesPages(allowableBucketHeight, root, bucketId, n, pageIndex + 1, nextRemovedTaskElements);
    }
}

/**
 * True when the task was already a favorites and is being dragged,
 * or a previously non-favorites dropped on the favorites target.
 *
 * @param elem
 * @return {Boolean}
 */
function wasFavoritesDrag(elem) {
    var wasFavoritesTaskDrag = false;

    if ($(elem).attr('data-isFavorites') && wasElementDragged(elem)) {
        wasFavoritesTaskDrag = true;
    }

    return wasFavoritesTaskDrag;
}

/**
 * Reset to zero any css left and top values from an element's style attribute.
 * Effectively return the element to its undragged position.
 *
 * @param element
 */
function returnElementToUndraggedPosition(element) {
    var cssDiffLeft = parseFloat($(element).css('left'));
    var cssDiffTop = parseFloat($(element).css('top'));

    if (isNumber(cssDiffLeft) && Math.abs(cssDiffLeft) > 0) {
        $(element).css('left', '0px');
    }

    if (isNumber(cssDiffTop) && Math.abs(cssDiffTop) > 0) {
        $(element).css('top', '0px');
    }
}


/**
 * Return an object containing
 * 1) True when running the workflow rule is successful, false otherwise;
 * 2) exception message when wfr fails.
 * Allows modifying the parameters and running rule again.
 * Use this method when running the rule returns no useful data.
 * Do not show or log the exception message when the rule fails.
 *
 * @param workflowRuleName
 * @param parameters
 * @returns {{success: boolean, message: string}}
 */
function runWorkflowRuleAndConfirm(workflowRuleName, parameters) {
    var returnValue = { success: true, message: ""};

    try {
        Ab.workflow.Workflow.call(workflowRuleName, parameters);
    }
    catch (e) {
        returnValue = { success: false, message: e.message};
    }
    return returnValue
}

/**
 * Display a modal message dialog using the given title and message parameters.
 * @param title
 * @param message
 */
function showModalMessageDialog(title, message) {
    var messageDialog = $('#messageDialog');
    messageDialog.attr('title',title);
    messageDialog.html('<p>' + message + '</p>');
    messageDialog.dialog({ modal: true });
}
/**
 * Force the active tab's favorites bucket to refresh itself.
 */
function refreshFavorites() {
    var activeTabId = getActiveTabId();
    var root = $(activeTabId).find('.favorites');
    if (root && $(root).length) {
        $(root).empty();
        $(root).append('<ol class="favorites-items"></ol>');
        loadFavoritesBuckets();

    }
}