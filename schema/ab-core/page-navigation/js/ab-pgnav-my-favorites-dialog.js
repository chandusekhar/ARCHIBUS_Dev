/**
 * Context menu dialog for editing the titles and ordering of myFavorites
 *
 * Created by Meyer on 5/8/2014.
 */

var PageNavFavoritesDialogConfig = {
    // Confirm dialog options for use to confirm discarding unsaved order change.
    confirmDiscardReorderDialogOptions: null,
    // Confirm dialog options for use to notify of failure when saving name change to server.
    renameFailedDialogOptions: null,
    // Handle to warning confirmation dialog for opening and closing.
    confirmDialog: null,
    // For backwards compatibility with pre-21.3 servers & databases
    // Global Tri-valued flag - is the WFR for reordering myFavorites defined. undefined: false; true.
    reorderFavoritesWfrDefined: false
};

/**
 * Return the value of the reorderFavoritesWfrDefined flag,
 * determining its value for the first time if it is unknown.
 *
 * @returns {number}
 */
function getReorderFavoritesWfrDefined() {
    if (typeof PageNavFavoritesDialogConfig.reorderFavoritesWfrDefined === 'undefined') {
        // call WFR without favoritesObjects parameter to test for existence of WFR
        var parameters = {
            viewName: 'ab-page-navigation-datasource.axvw',
            dataSourceId: 'pageNavigationFavorites_ds',
            isWritePtask: true,
            favorites: toJSON([])
        };

        try {
            var testWfrExistence = runWorkflowRuleAndConfirm('AbSystemAdministration-updateOrderOfMyFavorites', parameters);
            PageNavFavoritesDialogConfig.reorderFavoritesWfrDefined = testWfrExistence.success;
        }
        catch (e) {
            PageNavFavoritesDialogConfig.reorderFavoritesWfrDefined = false;
        }
    }

    return PageNavFavoritesDialogConfig.reorderFavoritesWfrDefined;
}

/**
 * Display a modal dialog that allows reordering and renaming of myFavorites tasks.
 * @param target
 */
function showFavoritesDialog(target) {
    if (!getReorderFavoritesWfrDefined()) {
        return false;
    }

    var parentId = $(target).parent().attr('id');
    var dialogId = parentId + '_dialog';

    // localized strings
    var cancelButtonTitle = getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_CANCEL);
    var confirmDialogHtml =  getConfirmDialogHtml(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_CANCEL_REORDER),
            getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_LOSE_ORDER_MESSAGE)+ '<br>' +
            getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_LOSE_ORDER_QUESTION));

    // when dialog exists already (has been opened >= once before) don't recreate the root or there will be multiple (hidden) dialogs
    var dialogRoot = $('#' + dialogId);
    var dialogExists = (dialogRoot && dialogRoot.length > 0);
    if (!dialogExists) {
        $(target).append('<div id="' + dialogId + '" class="favorites-dialog" title="' + getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_EDIT_TITLE) + '">' +
            '<div class="favorites-dialog-status" data-status="initial"><span class="favorites-status-display"></span></div>' +
            confirmDialogHtml +
            '<ol></ol>' +
            '</div>');

        dialogRoot = $(target).find('#' + dialogId);
    }
    var dialogListRoot = $(dialogRoot).find('ol');

    var favoriteItems = $(target).siblings('.bucket-wrapper').find('a.ui-draggable');
    var favoritesCount = favoriteItems.length;
    for (var i = 0; i < favoritesCount; i++) {
        var item = favoriteItems[i];
        var displayTitle = item.innerHTML;

        var activityId = $(item).attr('data-activityid');
        var processId = $(item).attr('data-processid');
        // taskId has hot_user_name appended in parens
        var taskId = $(item).attr('data-taskid');
        var taskFile = $(item).attr('href');

        dialogListRoot.append('<li><div class="portlet" data-task-file ="' + taskFile + '"' +
            'data-activity-id="' + activityId + '" data-process-id="' + processId + '" data-task-id="' + taskId + '">' +
            '<div class="portlet-header"><span class="favorites-display-title">' + displayTitle + '</span></div>' +
            '<div class="portlet-content" style="display:none;">' + getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_RENAME) + '<br>' +
            '<input type="text" style="padding-right:0;margin:0;width:99%;" value="' + displayTitle + '"><br>' +
            '<div class="portlet-button-panel">' +
            '<button class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only rename-save" type="button" role="button">' +
            '<span class="ui-button-text">' + getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE) + '</span></button>' +
            '<button class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only rename-cancel" type="button" role="button">' +
            '<span class="ui-button-text">' + cancelButtonTitle + '</span></button>' +
            '</div>' +
            '</div>' +
            '</div></li>');
    }

    dialogListRoot.sortable({
        handle: ".portlet-header",
        cancel: ".portlet-toggle",
        placeholder: "portlet-placeholder ui-corner-all",
        change: onFavoritesSortChange
    });

    $('.favorites-dialog-status').css('display', 'none');

    $('.portlet')
        .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
        .find('.portlet-header')
        .addClass('ui-widget-header ui-corner-all')
        .prepend('<span class="ui-icon ui-icon-plusthick portlet-toggle"></span>');

    $('.portlet-toggle').click( function() {
        var icon = $(this);
        icon.toggleClass('ui-icon-minusthick ui-icon-plusthick');
        icon.closest('.portlet').find(".portlet-content").toggle();
    });

    $('.rename-cancel').click( cancelFavoriteRenaming );
    $('.rename-save').click( saveFavoriteRenaming );

    var tabHeight = parseInt( $(target).closest('.ui-tabs-panel').css('height') );
    var dialogHeight =  Math.min(tabHeight, (favoriteItems.length * 45) + 150);

    if (!dialogExists) {
        dialogRoot.dialog({
            autoOpen: false,
            modal: true,
            height: dialogHeight,
            minHeight: dialogHeight,
            maxHeight: tabHeight,
            minWidth: 350,
            beforeClose: checkFavoritesReOrderSave,
            close: onCloseFavoritesDialog,
            buttons: [
                {text: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE_ORDER), click: saveFavoritesReOrdering },
                {text: cancelButtonTitle, click: closeFavoritesDialog }
            ]
        });
    }

    PageNavFavoritesDialogConfig.confirmDialog = $('#dialog-confirm').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        height: 165,
        width: 340,
        minWidth: 340,
        buttons: [
            {text: "OK", click: acceptFavoritesReOrderingWarning },
            {text: cancelButtonTitle, click: closeFavoritesConfirmDialog }
        ]
    });

    if (!PageNavFavoritesDialogConfig.renameFailedDialogOptions) {
        initializeDialogOptions();
    }

    dialogRoot.parent().fadeTo("fast", 1.0);
    dialogRoot.dialog('open');
}

/**
 * Initialize the global objects used in switching the confirm dialog's options
 * from the confirmation of discarding an unsaved reordering
 * to the confirmation of a failed saving of a renaming to the server.
 */
function initializeDialogOptions() {
    PageNavFavoritesDialogConfig.confirmDiscardReorderDialogOptions = {
        title: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_CANCEL_REORDER),
        message: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_LOSE_ORDER_MESSAGE) +
            '<br>' + getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_LOSE_ORDER_QUESTION),
        okButtonTitle: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE_ORDER),
        okButtonClickMethod: saveFavoritesReOrdering,
        cancelButtonTitle: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_CANCEL),
        cancelButtonClickMethod: closeFavoritesConfirmDialog
    };
    PageNavFavoritesDialogConfig.renameFailedDialogOptions = {
        title: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE_FAILED),
        message: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_RENAME_FAIL_MESSAGE) +
            '<br>' + getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_RENAME_FAIL_QUESTION),
        okButtonTitle: getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_OK),
        okButtonClickMethod: closeFavoritesConfirmDialog
    };
}

/**
 * When closing the dialog, empty the root of the element list so that it can be rebuilt on next open.
 * Dialog is not destroyed on close, but rebuilt and reopened per page.
 *
 * @param event
 * @param ui
 */
function onCloseFavoritesDialog(event, ui) {
    var dialogListRoot = $(event.target).parent().find('ol');
    dialogListRoot.empty();
}

/**
 * When sorting of favorites has changed set a status flag to allow showing dialog
 * to confirm/prevent loosing changes on closing of dialog when not saved.
 *
 * @param event
 * @param ui
 */
function onFavoritesSortChange ( event, ui ) {
    //var statusElem = $(event.target).parent().find(".favorites-dialog-status");
    //setFavoritesReOrderStatus(statusElem, "changed");
    setFavoritesReOrderStatusElement($(event.target).parent(), "changed");
}

/**
 * Set the status value after finding the status element that is a child of root.
 *
 * @param root
 * @param statusValue
 */
function setFavoritesReOrderStatusElement(root, statusValue) {
    var statusElem = root.find(".favorites-dialog-status");
    statusElem.attr("data-status", statusValue);
}

/**
 * Return the status element that is a child of root.
 *
 * @param root
 * @returns {element}
 */
function getFavoritesReOrderStatusElement(root) {
    var statusElem = root.find(".favorites-dialog-status");
    if (statusElem && statusElem.length > 0) {
        statusElem = statusElem[0];
    }
    else {
        statusElem = null;
    }

    return statusElem;
}

/**
 * Return the value of the status element that is a child of root.
 *
 * @param statusElem
 * @returns {string}
 */
function getFavoritesReOrderStatus(statusElem) {
    var statusValue = 'unknown';
    if (statusElem && statusElem.length > 0) {
        statusValue = statusElem.attr("data-status");
    }
    return statusValue;
}

/**
 * True when the status is either saved or unchanged.
 * Called before closing to prevent unwanted loss of changes.
 *
 * @param event
 * @param ui
 * @returns {boolean}
 */
function checkFavoritesReOrderSave(event, ui) {
    var statusElem = $(event.target).parent().find(".favorites-dialog-status");
    var status = getFavoritesReOrderStatus(statusElem);
    var unsavedChanges = (status !== "initial" && status !== "saved");
    if (unsavedChanges) {
        // short nicknames for readability
        var theDialog = PageNavFavoritesDialogConfig.confirmDialog;
        var options = PageNavFavoritesDialogConfig.confirmDiscardReorderDialogOptions;
        if (options.title !== theDialog.dialog("option", "title")) {
            theDialog.dialog("option", "title", options.title);
            theDialog.find('p').html(
                    '<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 40px 0;"></span>' +
                    options.message);
            theDialog.dialog("option", "buttons",[
                {text: options.okButtonTitle, click: options.okButtonClickMethod},
                {text: options.cancelButtonTitle, click: options.cancelButtonClickMethod}
            ]);
        }

        theDialog.dialog("open");
    }

    return !unsavedChanges;
}

/**
 * Save the renaming of a myFavorite taskId to the server,
 * then update the dialog and base page UI.
 */
function saveFavoriteRenaming() {
    var button = $(this);
    var portlet = button.closest(".portlet");
    var portletHeader = portlet.find(".portlet-header");
    var portletContent = button.closest(".portlet-content");

    var newName = portletContent.find("input[type='text']").attr("value");
    var activityId = portlet.attr("data-activity-id");
    var processId = portlet.attr("data-process-id");
    var taskId = portlet.attr("data-task-id");
    // clean HTML characters
    taskId = convertFromXMLValue(taskId);

    var newTaskId = convertFromXMLValue(newName);
    if (taskId.indexOf('(' + PageNavUserInfo.loggedInUser + ')') > 0) {
        newTaskId = newName + ' (' + PageNavUserInfo.loggedInUser + ')';
    }

    if (taskId === newTaskId) {
        portletContent.toggle();
        portletHeader.find(".portlet-toggle").toggleClass("ui-icon-minusthick ui-icon-plusthick");
    }
    else if (saveFavoriteRenamingToServer(activityId, processId, taskId, newTaskId)) {
        portletHeader.find("span.favorites-display-title").text(newName);
        portlet.attr("data-task-id", newTaskId);
        portletContent.toggle();
        portletHeader.find(".portlet-toggle").toggleClass("ui-icon-minusthick ui-icon-plusthick");
        refreshFavorites();
    }
    else {
        var confirmDialog = $('.dialog-confirm');
        confirmDialog.dialog("option", "title", PageNavFavoritesDialogConfig.renameFailedDialogOptions.title);
        confirmDialog.find('p').html('<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 40px 0;"></span>' +
            PageNavFavoritesDialogConfig.renameFailedDialogOptions.message);
        confirmDialog.dialog("option", "buttons" , [
             {text: PageNavFavoritesDialogConfig.renameFailedDialogOptions.okButtonTitle,
                 click: PageNavFavoritesDialogConfig.renameFailedDialogOptions.okButtonClickMethod }
         ]);
        confirmDialog.dialog("open");
    }
}

/**
 * Handle the saving of the reordered myFavorites items.
 */
function saveFavoritesReOrdering() {
    // localized messages
    var savedStatusMessage = getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ORDER_SAVED);
    var noopStatusMessage = getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_SAVE_NOOP);
    var failedStatusMessage = getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ORDER_SAVE_FAILED);

    var dialogRoot = $( this );
    var favoriteObjects = [];
    var favoriteItems = dialogRoot.find("div.portlet");
    var status = getFavoritesReOrderStatus(dialogRoot.find(".favorites-dialog-status"));

    // no unsaved reordering
    if (!favoriteItems || favoriteItems.length === 0 || status === "initial" || status === "saved") {
        showStatusMessage(dialogRoot, noopStatusMessage);
        fadeDialogAndClose(dialogRoot);
        return;
    }

    var favoritesCount = favoriteItems.length;
    for (var i = 0; i < favoritesCount; i++) {
        var item = favoriteItems[i];
        favoriteObjects.push( {
            activityId: $(item).attr('data-activity-id'),
            processId: $(item).attr('data-process-id'),
            taskId: convertFromXMLValue($(item).attr('data-task-id')),
            taskFile: $(item).attr('data-task-file'),
            displayOrder: (i + 1) * 100,
            hotUserName: PageNavUserInfo.loggedInUser
        });
    }

    // call WFR with favoritesObjects to update records within ONE transaction
    var parameters = {
        viewName: 'ab-page-navigation-datasource.axvw',
        dataSourceId: 'pageNavigationFavorites_ds',
        isWritePtask: true,
        favorites: toJSON(favoriteObjects)
    };

    var reOrdered = runWorkflowRuleAndConfirm('AbSystemAdministration-updateOrderOfMyFavorites', parameters);
    if (reOrdered.success) {
        showStatusMessage(dialogRoot, savedStatusMessage);

        setFavoritesReOrderStatusElement(dialogRoot, "saved");
        refreshFavorites();

        fadeDialogAndClose(dialogRoot);
    }
    else {
        showStatusMessage(dialogRoot, failedStatusMessage);
    }
}

/**
 * Update the dB for the renamed favorite's record
 *
 * @param activityId
 * @param processId
 * @param taskId
 * @param newTaskName
 */
function saveFavoriteRenamingToServer(activityId, processId, taskId, newTaskName) {
    var status = false;

    var oldFieldValues = {
        "afm_ptasks.activity_id": activityId,
        "afm_ptasks.process_id": processId,
        "afm_ptasks.task_id": taskId,
        "afm_ptasks.hot_user_name": PageNavUserInfo.loggedInUser
    };
    var fieldValues = {
        "afm_ptasks.activity_id": activityId,
        "afm_ptasks.process_id": processId,
        "afm_ptasks.task_id": newTaskName,
        "afm_ptasks.hot_user_name": PageNavUserInfo.loggedInUser
    };

    var parameters = {
        viewName: "ab-page-navigation-datasource.axvw",
        dataSourceId: "pageNavigationFavorites_ds",
        isNewRecord: false,
        version:     "2.0",
        oldFieldValues: toJSON(oldFieldValues),
        fieldValues: toJSON(fieldValues)
    };

    var updated =  Ab.workflow.Workflow.call('AbCommonResources-saveDataRecord', parameters);
    if (updated.code === "executed") {
        status = true;
    }

    return status;
}

/**
 * Cancel the change to the myFavorite name (taskId)
 */
function cancelFavoriteRenaming() {
    var button = $(this);
    var portletHeader = button.closest(".portlet").find(".portlet-header");
    var portletContent = button.closest(".portlet-content");
    var currentTitle = portletHeader.find("span.favorites-display-title").text();

    portletContent.find("input[type='text']").attr("value", currentTitle);
    portletContent.toggle();
    portletHeader.find(".portlet-toggle").toggleClass("ui-icon-minusthick ui-icon-plusthick");
}

/**
 * Handle a dialog's Cancel button.
 */
function closeFavoritesDialog () {
    $( this ).dialog( "close" );
}

/**
 * Handle the closing of the warning confirmation dialog --
 * rejection of losing the unsaved reordering / acknowledgement of renaming failure.
 */
function closeFavoritesConfirmDialog() {
    confirmDialog.dialog( "close" );
}

/**
 * Display the given status message.
 * @param rootElement
 * @param message
 */
function showStatusMessage(rootElement, message) {
    var statusElem = getFavoritesReOrderStatusElement(rootElement);
    $(statusElem).html('<span class="status-display">' + message + '</span>');
    $(statusElem).css('display', 'block');
}

/**
 * Slowly fade the dialog and then close it.
 * @param rootElement
 */
function fadeDialogAndClose(rootElement) {
    rootElement.parent().fadeTo("slow", 0.7, function() {
        rootElement.dialog( "close" );
    });
}

/**
 * Return the HTML that is the warning dialog to prevent losing an unsaved reordering of myFavorites.
 *
 * @param confirmDialogTitle
 * @param confirmDialogMessage
 * @returns {string}
 */
function getConfirmDialogHtml(confirmDialogTitle, confirmDialogMessage) {
    return '<div id="dialog-confirm" class="dialog-confirm" title="' + confirmDialogTitle + '" style="display:none;">' +
        '<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 40px 0;"></span>' +
        confirmDialogMessage +
        '</p>' +
        '</div>';
}

/**
 * Handle the acceptance of losing the unsaved reordering.
 *
 */
function acceptFavoritesReOrderingWarning() {
    // reset the status so that the main dialog can close
    var favoritesDialog = $('.favorites-dialog');
    setFavoritesReOrderStatusElement(favoritesDialog, "initial");
    $( this ).dialog( "close" );
    // close main dialog
    favoritesDialog.dialog( "close" );

}

/**
 * Handle the rejection of losing the unsaved reordering.
 */
function cancelFavoritesReOrderingWarning() {
    confirmDialog.dialog( "close" );
}


/**
 * Return the input string with HTML special characters changed into valid XML characters
 *
 */
function convertFromXMLValue(stringValue) {
    if(typeof stringValue != "undefined" && stringValue != null){
        stringValue = stringValue.replace(/&amp;/g, '&');
        stringValue = stringValue.replace(/&gt;/g, '>');
        stringValue = stringValue.replace(/&lt;/g, '<');
        stringValue = stringValue.replace(/&apos;/g, '\'');
        stringValue = stringValue.replace(/&quot;/g, '\"');
        return stringValue;
    }
    return "";
}
