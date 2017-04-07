/**
 * Page Navigation Project
 *
 * Controller for the loading, hiding and showing of afm_process lists in divs, afm_ptasks in iframes, etc.
 *
 * @author Steven Meyer
 * @since V 21.1
 */


// TODO modularize the preamble to open[p]Task()
/**
 * Open a selected task (or favorites),
 * loading the appropriate .axvw into the #taskFrame iframe
 * @param elem
 * @param event
 */
function openTask(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }
    if (event && (event.button === 2 || event.which === 3 ||
        signOutOnTimeOut() || wasFavoritesDrag(elem))) {
        return false;
    }

    var eTaskFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    if (eTaskFile && taskType) {
        // KB 3042652: store the activity and process ID for the task view; will be read in ab-view.js constructor
        window.taskInfo = getTaskInfo(elem);
        setBreadCrumbs(elem, taskType);

        if ('http' === eTaskFile.substr(0, 4) && eTaskFile.indexOf('_help/archibus_help/archibus.htm#') > 0) {
            eTaskFile = context.archibusHelpLink.substring(0, context.archibusHelpLink.indexOf('archibus_help/user') + 18) +
                context.userHelpExtension + '/archibus.htm#' +
                eTaskFile.substring(eTaskFile.indexOf('archibus.htm#') + 13);

            eTaskFile = eTaskFile.replace(/\\/g, "/");
        }
        else if ('http' !== eTaskFile.substr(0, 4)) {
            eTaskFile = eTaskFile.replace('(user.helpExtension)', context.userHelpExtension);
            setDisplayContainers('#taskFrame', eTaskFile);
        }

        pushState(taskType, eTaskFile);
        setPageDimensions();
    }

    return false;
}

/**
 * Open the selected process task,
 * loading the appropriate .axvw into the #pTaskFrame iframe
 * @param elem
 * @param event
 */
function openPtask(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }
    if (event && (event.button === 2 || event.which === 3 || signOutOnTimeOut())) {
        return false;
    }

    if (wasElementDragged(elem) && $(elem).is('a')) {
        returnElementToUndraggedPosition(elem);
        return false;
    }

    var pTaskFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    if (pTaskFile && taskType) {
        // KB 3042652: store the activity and process ID for the task view; will be read in ab-view.js constructor
        window.taskInfo = getTaskInfo(elem);
        setBreadCrumbs(elem, taskType);
        pTaskFile = standardizeTaskFile(pTaskFile);
        pushState(taskType, pTaskFile);
        setDisplayContainers('#pTaskFrame', pTaskFile);

        var applicationsProcessView = $('#applicationsProcessView');
        applicationsProcessView.hide();
        applicationsProcessView.css('display', 'none');
        $('#applicationsTabView').hide();

        // set applications tab to blue

        setPageDimensions();
    }

    return false;
}

/**
 * Open the selected process,
 * loading the appropriate .html page into the #applicationsProcessView div
 * @param elem
 * @param event
 */
function openProcess(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }
    if (event.button === 2 || event.which === 3) {
        return false;
    }

    if (signOutOnTimeOut()) {
        return false;
    }

    var processFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    if (processFile && taskType) {
        pushState('process', processFile);
        setDisplayContainers('#applicationsProcessView', processFile);
        $('#applicationsTabView').hide();
    }

    return false;
}

/**
 * True when the element has a left and/or top style greater than a nominal amount.
 *
 * @param elem
 * @returns {boolean}
 */
function wasElementDragged(elem) {
    var wasDragged = false;
    var cssLeft = parseFloat($(elem).css('left'));
    var cssTop = parseFloat($(elem).css('top'));

    if (isNumber(cssLeft) && (Math.abs(cssLeft) > 2.0 || isNumber(cssTop)) && Math.abs(cssTop) > 2.0) {
        wasDragged = true;
    }

    return wasDragged;
}

/**
 * True when n is a number.
 * @param n
 * @returns {boolean}
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Load the div being used like a frame to hold an HTML snippet -- typically a display page.
 * Test that the container does not already hold the page.
 *
 * @param displayElementId
 * @param displaySourceFile
 * @param urlPrefix
 */
function loadQuasiFrameAndDisplay(displayElementId, displaySourceFile, urlPrefix) {
    var frameSrc = $(displayElementId).attr('rel');
    if (!frameSrc ||
        (frameSrc && frameSrc !== displaySourceFile) ||
        (frameSrc && $(displayElementId).children().length === 0)) {
        var targetSrc = urlPrefix  + displaySourceFile;
        $(displayElementId).empty();
        $(displayElementId).attr('rel', displaySourceFile);
        $(displayElementId).load(targetSrc);
    }

    $(displayElementId).show();
}

/**
 * Display the axvw or html file of parameter_2 in the display container element of parameter_1,
 * show() the display element of parameter_1 and hide() all other display container elements
 *
 * @param displayElementId
 * @param displaySourceFile
 */
function setDisplayContainers(displayElementId, displaySourceFile) {
    var url = window.location.href;
    var urlPrefix = url.substring(0,  url.lastIndexOf(PageNavUserInfo.webAppContextPath) + PageNavUserInfo.webAppContextPath.length);
    var targetUrl = displaySourceFile.indexOf('http') === 0 ? displaySourceFile  : urlPrefix  + displaySourceFile;

    $('ul.ui-tabs-nav > li').removeClass('ui-task-tab-active').addClass('ui-state-default');

    if (displayElementId === '#applicationsProcessView') {
        loadQuasiFrameAndDisplay(displayElementId, PageNavUserInfo.generationDirectory + PageNavUserInfo.localeDirectory +
            PageNavUserInfo.roleDirectory + displaySourceFile, urlPrefix);
        /// loadFavoritesBuckets();
        $('.nav-pages').show();
        $('#navPagesApps').hide();
        hideTaskFrame();
        hidePTaskFrame();
        $('li.ui-tabs-active').removeClass('ui-task-tab-active').addClass('ui-state-active').addClass('ui-state-default');
    }
    else if ((displayElementId === '#taskFrame' || displayElementId === '#pTaskFrame') && $(displayElementId).length) {
        var frameSrc = $(displayElementId).attr('src');
        if (!frameSrc ||
            (frameSrc && frameSrc.lastIndexOf('/') > 0 && frameSrc.substr(frameSrc.lastIndexOf('/') + 1) !== displaySourceFile)) {
            $(displayElementId).attr('src', targetUrl);
            $('.nav-pages').hide();
            $(displayElementId).show();
            $('#homeTabView').hide();
            $('li.ui-tabs-active').removeClass('ui-task-tab-active').addClass('ui-state-active').addClass('ui-state-default');
        }
    }
    else if (displayElementId === '#taskFrame') {
        showTaskFrame(displayElementId, $('#tabPageNavigationHome'), $('#homeTabView'), targetUrl);
    }
    else if (displayElementId === '#pTaskFrame') {
        showTaskFrame(displayElementId, $('#applicationsViewParent'), null, targetUrl);
    }
    setPageDimensions();
}

/**
 * Append or Display the home or applications task frame,
 * setting the tab and temporaryViewToolbar to the real viewToolbar's expected color.
 */
function showTaskFrame(displayElementId, frameParent, tabViewToHide, targetUrl) {
    $('li.ui-tabs-active').removeClass('ui-state-active').removeClass('ui-state-default').addClass('ui-task-tab-active');
    if ($(displayElementId).length === 0) {
        $(frameParent).prepend('<iframe class="task-view" id="' + displayElementId.substr(1) + '"></iframe>');
    }
    else {
        $(displayElementId).show();
    }

    // quick 'viewToolbar' before view actually loads
    ///$(taskFrameBody).append('<div class="quick-view-toolbar">&nbsp;</div>')
    var taskFrameBody = $(displayElementId).contents().find('body');
    var selectedTab = $('#navigationTabs').find('ul.ui-widget-header').find('li.ui-task-tab-active[aria-selected="true"]:first');
    var tabColor = $(selectedTab).css('background-color');
    $(taskFrameBody).append('<div style="position:relative;top:-8px;left:-10px;height:28px;width:100%;margin:0;background:' + tabColor + ';">&nbsp;</div>');

    $(displayElementId).show();
    if (tabViewToHide) {
        $(tabViewToHide).hide();
    }
    $('.nav-pages').hide();
    setPageDimensions();
    $(displayElementId).attr('src', targetUrl);
}

/**
 *
 * @param elem
 * @param event
 */
function openSoloTask(elem, event) {
    // if home tab exists open task in tab(0) else open it in tab(1)
    restoreTab(0);
    if ( $('#tabPageNavigationHome').length) {
        openTask(elem, event);
    }
    else {
        $(elem).attr('rel', 'pTask');
        openPtask(elem, event);
    }
}

/**
 * Open the Home Page Editor as a view in the tab's frame.
 *
 * @param elem
 * @param event
 */
function openPageEditorTask(elem, event) {
    var taskFile = $(elem).attr('href');
    var paramIndex = taskFile.indexOf('?');
    taskFile = paramIndex > 0 ? taskFile.substr(0, paramIndex) : taskFile;
    var descriptorPath = PageNavUserInfo.homeTabHtmlFragment;
    descriptorPath = descriptorPath.substr(descriptorPath.lastIndexOf('/') + 1);
    descriptorPath = descriptorPath.replace('.html', '.xml');
    var processId = $('#tabLabelHome').html();

    var url = taskFile + '?descriptorfile=' + descriptorPath + '&processid=' + processId;
    $(elem).attr('href', url);
    openSoloTask(elem, event);
}


/**
 * Return the ID of the currently focused tab.
 * @returns {string}
 */
function getActiveTabId() {
    var activeTabId;

    if ($('#tabHome').parent('li').hasClass('ui-state-active')) {
        activeTabId = '#tabPageNavigationHome';
    }
    else if ($('#tabApplications').parent('li').hasClass('ui-state-active')) {
        activeTabId = '#tabPageApplications';
    }
    else {
        activeTabId = 'unknown';
    }

    return activeTabId;
}

/**
 *
 * @param filePath
 * @returns {*}
 */
function standardizeTaskFile(filePath) {
    var standardizedPath = filePath;

    if (standardizedPath.indexOf('ab-products') === 0) {
        standardizedPath = 'schema/' + standardizedPath;
    }

    return standardizedPath;
}

/**
 * Return the activity, process and task ID of the given a task element.
 *
 * @param elem The task element from the DOM.
 * @returns object - An object with three data members: activity ID, process ID and task ID.
 */
function getTaskInfo(elem) {
    var taskInfo = {
        activityId: '',
        processId: '',
        taskId: $(elem).attr('data-taskId')
    };

    // a favorite has its activity and process as data attributes directly on the <a/>.
    // an ordinary task has them on the bucket's top-level <div/>.
    var elementAttrActivity = $(elem).attr('data-activityId');
    if (elementAttrActivity) {
        taskInfo.activityId = elementAttrActivity;
        taskInfo.processId = $(elem).attr('data-processId');
    }
    else {
        var bucketElem = $(elem).parents('.bucket-application,.bucket-process');
        if (bucketElem.length > 0) {
            bucketElem = $(bucketElem)[0];
            taskInfo.activityId = $(bucketElem).attr('data-activityId');
            taskInfo.processId = $(bucketElem).attr('data-processId');
        }
    }
    return taskInfo;
}
