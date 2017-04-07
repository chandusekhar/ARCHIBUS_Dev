/**
 * JavaScript driving the Page Navigation skeleton and home page structure.
 *
 * @author Steven Meyer
 * @since V 21.1
 */

// TODO namespace these global vars

/**
 * Scroller for the home tab content.
 */
var homeTabScroller = null;

/**
 * Scroller for the applications tab content.
 */
var applicationsTabScroller = null;

/**
 * View.getOpenerView uses this variable to detect that the child view was loaded from the home page.
 * If renaming or removing this variable, update View.getOpenerView as well.
 */
var applicationsTabHtmlFragment = '3053784';

/**
 * Reference to the tabs widget for use in history.
 */
var tabsWidget;


/**
 * Initialize the Navigation page once the document is ready.
 * Called from the skeleton page, page-navigator-en.html.
 */
function startInitialization() {
    $('.task-view').hide();
    tabsWidget = setUpTabs();

    // execute timing event to test whether DWR has been initialized.
    // Set user values when it is ready.
    //
    // Trigger completion of setup only after initial WFR completes
    PageNavUserInfo.redirectIntervalId = setInterval(initialWfrCall, 100);
}

/**
 * Function to call at intervals while waiting for DWR to make server available.
 * DWR has its own initialization cycle where it obtains the script session ID from the server.
 * No calls can be made until this is complete.
 * We have code in ab-view.js to wait for this, implement similar process here.
 *
 * When this first call gets the user info, set locale\role variables.
 */
function initialWfrCall() {
    if ( valueExists(dwr.engine._scriptSessionId)) {
        var userInfo = getUserInfo();

        if (userInfo && "timeout" !== userInfo.name) {
            setPageNavUserInfo(userInfo);

            if (typeof loadLocalization === 'function') {
                loadLocalization(PageNavUserInfo.localeDirectory.replace('/', ''));
            }

            if (typeof finishSetup === 'function') {
                finishSetup(userInfo);
            }

        }
        clearInterval(PageNavUserInfo.redirectIntervalId);
    }
    // else wait and do nothing but increment counter
    else {
        PageNavUserInfo.redirectWaitCounter++;
    }
}

/**
 * Set up the home & application tabs
 */
function setUpTabs() {
    // Enable tabs. The `event` property must be overridden so that the tabs aren't changed on click,
    // and any custom event name can be specified.
    return $('#navigationTabs').tabs({ event: 'change' });
}

/**
 *
 */
function loadColorScheme() {
    if (PageNavUserInfo.userInterfaceTheme && PageNavUserInfo.userInterfaceTheme.length > 0) {
        loadCSS(PageNavUserInfo.cssDirectory + PageNavUserInfo.cssFilePrefix + PageNavUserInfo.userInterfaceTheme + ".css");
    }
}

/**
 * Complete the page setup is done after ensuring that the page is for the correct locale.
 * @param userInfo
 */
function finishSetup(userInfo) {
    setUpSearchDialog();
    setUserHeader(userInfo);
    setFragmentFileNamesFromRole(userInfo.role);
    loadColorScheme();
    setUpHistory(tabsWidget, 'ul.ui-tabs-nav a');
    positionBreadCrumbs();

    // hide the search input if on Android or iPad
    if (!useScroller()) {
        $('#searchText').hide();
    }

    $(window).resize(function() {setPageDimensions();});

    // initialize the hovertips for static elements in the DOM
    window.setTimeout(hovertipInit, 100);

    if (context.includeHomeTab) {
        goHome();
    }
    else if (context.includeAppTab) {
        goApps();
    }
}

/**
 * Add a JavaScript or CSS file to the document.
 * @param fileName
 */
function dynamicallyLoadCodeFile(fileName) {
    if (fileName.substr(fileName.length - 3) === '.js' || fileName.indexOf('/js?') > 0) {
        var customCodeFile = fileName;
        $.ajax({
                type: "GET",
                url: customCodeFile,
                dataType: "script",
                crossDomain: true,
                statusCode: { 404: function() { alert("page not found"); }}
            })
            .done(function() {console.log('Load of ' + fileName + ' was successful.');})
            .fail(function() {console.log( "Error loading " + fileName);});
    }
    else if (fileName.substr(fileName.length - 4) === '.css') {
        var cssLink = $("<link rel='stylesheet' type='text/css' href='" + fileName +"'>");
        $("head").append(cssLink);
        console.log('Load of ' + fileName + ' was successful.');
    }
    else {
        console.log( "Error loading " + fileName + ". It must be a js or css file.");
    }
}


/**
 * Localize banner display text -- menu and button labels, etc.
 */
function localizeDisplayText() {
    window.document.title = getLocalizedString(pageNavStrings.z_PAGENAV_WINDOW_TITLE);
    $('#breadCrumbs').html(getLocalizedString(pageNavStrings.z_PAGENAV_BREADCRUMB_LABEL) + '<b class="caret"></b>');
    var searchTip = getLocalizedString(pageNavStrings.z_PAGENAV_SEARCHBOX_INITIAL_TEXT);
    $('#searchText').attr('value', searchTip).attr('title', searchTip);
    $('#signOutLink').html(getLocalizedString(pageNavStrings.z_PAGENAV_SIGNOUT_BUTTON_LABEL));
    $('#helpLink').html(getLocalizedString(pageNavStrings.z_PAGENAV_HELP_BUTTON_LABEL));
    $('a.page-top-link').html(getLocalizedString(pageNavStrings.z_PAGENAV_BACK_TO_TOP));

    $('#userMenuProject').html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PROJECT));
    $('#userMenuRole').html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_ROLE));
    $('#userMenuVersion').html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_VERSION));
    $('#myProfileMenuLink').html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PROFILE));
    $("#myJobsMenuLink").html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_JOBS));
    $("#myPresentationsMenuLink").html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PRESENTATIONS));
    $("#myEditorMenuLink").html(getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_EDITOR));
}

/**
 * Localize favorites bucket's display text.
 */
//function localizeFavoritesDisplayText() {
//    $('span.favorites-add-target').html(getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ADD_TARGET_TEXT));
//    $('.favorites-add-target').attr('title', getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_ADD_TARGET_TOOLTIP));
//    $('span.favorites-delete-target').attr('title', getLocalizedString(pageNavStrings.z_PAGENAV_FAVORITES_DELETE_TARGET_TOOLTIP));
//    $('a.page-top-link').html(getLocalizedString(pageNavStrings.z_PAGENAV_BACK_TO_TOP));
//}

/**
 * Set the page elements' css width and height.
 *
 */
function setPageDimensions() {
    var headBannerHome = $('#headBannerHome');
    var windowElement = $(window);
    var bannerHeight = headBannerHome.height() + parseInt(headBannerHome.css('padding-top'));
    var windowHeight = windowElement.height();
    var windowWidth = windowElement.width();
    var scrollDimension = 16;

    var navigationTabs = $('#navigationTabs');
    navigationTabs.css('width', windowWidth - 2 + "px");

    var visiblePageHeight = 0;
    var homeTabView = $('#homeTabView');
    var applicationsTabView = $('#applicationsTabView');
    var applicationsProcessView = $('#applicationsProcessView');
    if (homeTabView.find('.page-row').is(":visible")) {
        homeTabView.find('.page-row').each(function() {
            visiblePageHeight += $(this).outerHeight();
        });
        visiblePageHeight += homeTabView.find('.page-break-banner').outerHeight();
    }
    else if (applicationsTabView.find('.page-row').is(":visible")) {
        applicationsTabView.find('.page-row').each(function() {
            visiblePageHeight += $(this).outerHeight();
            visiblePageHeight += parseInt($(this).css('margin-top'));
            visiblePageHeight += parseInt($(this).css('margin-bottom'));
        });
    }
    else if (applicationsProcessView.find('.page-row').is(":visible")) {
        applicationsProcessView.find('.page-row').each(function() {
            visiblePageHeight += $(this).outerHeight();
        });
    }
    var pageHeight = Math.max(visiblePageHeight + bannerHeight, windowHeight - bannerHeight - scrollDimension);
    $('.page').css("height",  pageHeight + "px");

    if (homeTabView.is(":visible")) {
        $('.task-view').css("height",  (windowHeight - bannerHeight) + "px");
    } else {
        // suppress unnecessary browser scroll bars when a task view is loaded
        $('.task-view').not(applicationsProcessView).css("height",  (windowHeight - bannerHeight - scrollDimension) + "px");

        // 3043607, applications tab 1st & 2nd page are not exactly task views but they use the class. size them differently.
        applicationsProcessView.css("height",  (pageHeight - bannerHeight + 25) + "px");
    }

    if (useScroller()) {
        // configure the home tab scroller
        ///homeTabView.css("width", (windowWidth - 22) + "px");
        ///homeTabView.parent().css("width", (windowWidth - 20) + "px");
        homeTabView.css("height",  (windowHeight - bannerHeight - 2) + "px");
        homeTabView.parent().css("height",  (windowHeight - bannerHeight) + "px");
        homeTabView.css("overflow", "hidden");
        navigationTabs.css("min-width", "0px");
        headBannerHome.css({"position":"inherit","min-width":"0px"});
        $('#bannerMenu').css("right","10px");
        if (homeTabScroller) {
            homeTabScroller.update();
        } else {
            homeTabScroller = new Ab.view.Scroller(homeTabView);
        }

        // configure the applications tab scroller
        var applicationsViewParent = $('#applicationsViewParent');

        ///applicationsViewParent.css("width", (windowWidth - 20) + "px");
        ///applicationsViewParent.parent().css("width", (windowWidth - 22) + "px");
        applicationsViewParent.parent().css("height",  (windowHeight - bannerHeight) + "px");
        applicationsViewParent.css("overflow", "hidden");
        if (applicationsTabScroller) {
            applicationsTabScroller.update();
        } else {
            applicationsTabScroller = new Ab.view.Scroller(applicationsViewParent);
        }

        var appTaskFrame = $('#pTaskFrame');
        var homeTaskFrame = $('#taskFrame');
        if (homeTaskFrame.is(":visible")) {
            homeTaskFrame.css("height",  (windowHeight - bannerHeight - 5) + "px");
            homeTaskFrame.css("width",  (windowWidth - 2) + "px");
        }
        else if (appTaskFrame.is(":visible")) {
            appTaskFrame.css("height",  (windowHeight - bannerHeight - 5) + "px");
            appTaskFrame.css("width",  (windowWidth - 18) + "px");
        }
        else {
            $('.task-view').css("width", (windowWidth - 20) + "px");
        }
    }
    else {
        $('.task-view').css("width", windowWidth + "px");
    }

    var searchDialog = $('#searchDialog');
    if (searchDialog.dialog( 'instance') && searchDialog.dialog('isOpen')) {
        searchDialog.dialog( 'option', 'position', {my:"right top", at:"right-15 top"});
    }
}

/**
 * Returns true if the page should use a custom scroller defined in ab-scroller.js.
 * Android and IOS devices have native scrollers, and the customer scroller does not work well on these devices:
 * users cannot tap-drag-release to scroll, or press-drag-release on the scroll thumb to scroll.
 */
function useScroller() {
    return navigator.userAgent.match(/Android/i) === null && navigator.userAgent.match(/iPhone|iPad/i) === null;
}

/**
 * Return the navigation state to the navigation view of the first tab
 */
function goHome() {
    if (signOutOnTimeOut()) { return; }

    var url = window.location.href;
    restoreTab(0);
    if (PageNavUserInfo.homeTabHtmlFragment) {
        loadQuasiFrameAndDisplay("#homeTabView", PageNavUserInfo.homeTabHtmlFragment, url.substring(0,  url.lastIndexOf(PageNavUserInfo.webAppContextPath) +
            PageNavUserInfo.webAppContextPath.length));
    }
    refreshFavorites();
}

/**
 * Return the navigation state to the navigation view of the second tab.
 * When we're already on the second tab and in the task view, just go up one level to the application-process view.
 * When we're already on the second tab and in the process view, go up one level to the product-application view.
 */
function goApps() {
    if (signOutOnTimeOut()) { return; }

    var pTaskFrame = $('#pTaskFrame');
    if (pTaskFrame.length > 0 && $(pTaskFrame).css('display') !== 'none') {
        var currentState = $.bbq.getState();
        var newState = {};
        if (currentState.navigationTabs) {
            newState.navigationTabs = currentState.navigationTabs;
        }

        if (currentState.process) {
            newState.process = currentState.process;
        }

        $('#tabApplications').parent('li').removeClass('ui-task-tab-active').addClass('ui-state-active');
        $('#breadCrumbContent').find('.hovertip_wrap3').empty();
        $('#breadCrumbContainer').hide();

        $.bbq.pushState( newState );

        hidePTaskFrame();
        var applicationsProcessView = $('#applicationsProcessView');
        applicationsProcessView.show();
        applicationsProcessView.find('.nav-pages').show();
        setPageDimensions();
    }
    else if (PageNavUserInfo.applicationsTabHtmlFragment) {
        var url = window.location.href;
        var urlPrefix = url.substring(0,  url.lastIndexOf(PageNavUserInfo.webAppContextPath) + PageNavUserInfo.webAppContextPath.length);
        loadQuasiFrameAndDisplay("#applicationsTabView", PageNavUserInfo.applicationsTabHtmlFragment, urlPrefix);
        restoreTab(1);
    }
}

/**
 * Set the browser to the base page of a particular tab, saving the new state.
 * @param index
 */
function restoreTab(index) {
    $('.nav-pages').show();
    $('#applicationsProcessView').hide();
    hideTaskFrame();
    hidePTaskFrame();
    $('#breadCrumbContainer').hide();
    $('#breadCrumbContent').find('.hovertip_wrap3').empty();

    var state = $.bbq.removeState('eTask', 'pTask', 'process');
    if (!state) {
        state = {};
    }
    state.navigationTabs = index;
    $.bbq.pushState(state);

    showTab(index);
}

/**
 *
 * @param index
 */
function showTab(index) {
    $('#navigationTabs').tabs("option", "active", index);

    // set active tab to white
    $('ul.ui-tabs-nav > li').removeClass('ui-task-tab-active').addClass('ui-state-default');

    if (index === 0) {
        $('#homeTabView').show();
        $('#tabHome').parent('li').removeClass('ui-task-tab-active').addClass('ui-state-active');
    }
    else if (index === 1) {
        $('#applicationsTabView').show();
        $('#tabApplications').parent('li').removeClass('ui-task-tab-active').addClass('ui-state-active');
    }
    setPageDimensions();
}

/**
 * Hide the task iframe in the home tab
 */
function hideTaskFrame() {
    hideFrameElement('taskFrame');
}

/**
 * Hide the task iframe in the applications tab
 */
function hidePTaskFrame() {
    hideFrameElement('pTaskFrame');
}

/**
 * Hide the task iframe in the specified tab
 * @param frameId
 */
function hideFrameElement(frameId) {
    var frameElement = $('#' + frameId);
    if (frameElement.length > 0) {
        try {
            var frameBody = $(frameElement).contents().find('body');
            var drawingControlContainer = $(frameBody).find('div.drawing');
            if (drawingControlContainer.length > 0) {
                $(drawingControlContainer).remove();
            }
        }
        catch (e) {
            // Permissions denied error when frame contents not in server domain, such as when showing Help.
            console.log("Frame contents not in server domain.");
        }

        $(frameElement).hide();
        $(frameElement).attr('src', null);
    }
}

/**
 * Set the browser to the base page of the first tab without saving state
 *
 * no state saved
 */
function resetViewsToHome() {
    $('.bread-crumb-list').remove();
    $('.nav-pages').show();
    $('.task-view').hide();
    hideTaskFrame();
    hidePTaskFrame();

    $('#navigationTabs').tabs("option", "active", 0);
}

/**
 * Load the provided CSS file
 * @param href
 */
function loadCSS(href) {
    var cssLink = $("<link>");
    cssLink.attr({
        rel: "stylesheet",
        type: "text/css",
        href: href
    });
    $("head").append(cssLink);
}

/**
 * Set the tab fragment file paths from the given role name
 * @param roleName
 */
function setFragmentFileNamesFromRole(roleName) {
    var roleSuffix = getRoleDashed(roleName);
    PageNavUserInfo.applicationsTabHtmlFragment = PageNavUserInfo.generationDirectory + PageNavUserInfo.localeDirectory +
        PageNavUserInfo.roleDirectory + "applications-home-" + roleSuffix +  ".html";
}

/**
 * Scroll gently to the top of the page
 * @return {Boolean}
 */
function goToTop() {
    if (useScroller()) {
        if (homeTabScroller) {
            homeTabScroller.scrollbars.tweenTo(0,0);
        }
        if (applicationsTabScroller) {
            applicationsTabScroller.scrollbars.tweenTo(0,0);
        }
    } else {
        // this no longer works now that we use ab-scroller.js
        $("html, body").animate({ scrollTop: 0 }, 600);
    }

    return false;
}

function scrollToCorner(left, top) {
    if (useScroller()) {
        if (homeTabScroller) {
            homeTabScroller.scrollbars.scrollTo(left, top);
        }
        if (applicationsTabScroller) {
            applicationsTabScroller.scrollbars.scrollTo(left, top);
        }
    }
    else {
        // this no longer works now that we use ab-scroller.js
        $("html, body").animate({ scrollTop: top}, 600);
    }

    return false;
}

/**
 * True when the record was retrieved from the WFR call.
 * @param parameters
 * @return {Boolean}
 */
function getRecord(parameters) {
	var result = false;

	var response = getDataRecords(parameters);
	if (response && response.records.length === 1) {
		result = response.records[0];
    }

	return result;
}

/**
 * Return the set of records found by the getDataRecords WFR for the given view, dataSource and restriction.
 * Return false if the session has timed out or the WFR does not succeed.
 *
 * @param parameters
 * @return {{}} Array of DataRecords.
 */
function getDataRecords(parameters) {
    var returnValue = false;
    try {
        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (!Ab.workflow.Workflow.sessionTimeoutDetected && result.data && result.data.records) {
            returnValue = result.data;
        }
    }
    catch (e) {
        Workflow.handleError(e);
    }

    return returnValue;
}


/**
 * Configure the search dialog
 */
function setUpSearchDialog() {
    $('#searchDialog').dialog({ modal: true, autoOpen: false, draggable: false, width: 500 });
    $('.ui-dialog-title').after('<input type="text" id="searchDialogTitleInput" class="search-text" onkeypress="onSearchBoxKeyPress(event);" ' +
        'style="float:right;margin-right:30px;width:240px;">');
    $('#searchDialogTitleInput').prev('.ui-dialog-title').css('width','20%');
}

/**
 * The first time the search box is selected, remove the instruction text
 * and change the text color to the user's search text color rather than the instruction text color
 * @param elem
 */
function onSearchBoxSelect(elem) {
    // clear the text & reset the color
    var val = elem.value;
    if (val === getLocalizedString(pageNavStrings.z_PAGENAV_SEARCHBOX_INITIAL_TEXT)) {
        elem.value = "";
    }

    // TODO change this hard-coded color to a css variable
    $('#searchText').css("color", "black")
}

/**
 * Handle the key press event on the banner's or search dialog's search input element.
 * When the CRLF key is pressed while the input is focused begin the search process.
 * @param evt
 */
function onSearchBoxKeyPress(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    if (charCode === 13) {
        var  searchText = $('#searchDialog').dialog('isOpen') ? $.trim($('#searchDialogTitleInput').val()) : $.trim($('#searchText').val());
        if (searchText.length > 0) {
            closeSearchDialog();
            displaySearchDialog(searchText);
        }
     }
/*
    else {
        alert("Key " + charCode + " was pressed down");
    }
*/
}

/**
 * Display the view search results after getting the views through a WFR and formatting the results.
 *
 * @param searchText
 */
function displaySearchDialog(searchText) {
    var dialogHeight = 500;
    var dialogWidth = 800;
    var searchDialogElement = $('#searchDialog');

    if (Ab.workflow.Workflow.sessionTimeoutDetected) {
        searchDialogElement.on( "dialogbeforeclose", function( event, ui ) {window.location = context.logoutView;} );
        searchDialogElement.html(getLocalizedString(pageNavStrings.z_PAGENAV_SESSION_TIME_OUT));
    }
    else {
        var drilldownSource = PageNavUserInfo.webAppContextPath + 'ab-page-navigation-view-search.axvw?searchText=' + searchText;
        searchDialogElement.html('<iframe id="alert-drilldown-frame" src="' + drilldownSource + '" width="99%" height="99%"></iframe>');

            /// var results = formatSearchResults(getViewsByName(searchText));
            /// dialogHeight = Math.max(300 , 50 * Math.min(results.count, 10));
            /// searchDialogElement.html(results.formattedSearchResults);
    }

    searchDialogElement.dialog( 'option', "position", {my:"right top", at:"right-10 top"} );
    searchDialogElement.dialog( 'option', "height", dialogHeight );
    searchDialogElement.dialog( 'option', "width", dialogWidth );

    var searchDialogTitleInput = $('#searchDialogTitleInput');
    $(searchDialogTitleInput).attr('value', searchText );

    // Localize the title and tooltip of the search dialog
    var dialogTitleElem = $(searchDialogTitleInput).siblings('.ui-dialog-title');
    var localizedSearchTitle = getLocalizedString(pageNavStrings.z_PAGENAV_SEARCHRESULT_TITLE);
    dialogTitleElem.attr('title', localizedSearchTitle);
    dialogTitleElem.html(localizedSearchTitle);

    setTimeout(function() {"use strict"; searchDialogElement.dialog('open');}, 100);

    // reinitialize the hovertips now that new targets are added to the DOM
    setTimeout(hovertipInit, 100);
}

/**
 * Close the search dialog.
 * Independent function to allow inclusion in building html text
 */
function closeSearchDialog() {
    var searchDialogElement = $('#searchDialog');

    if (searchDialogElement.dialog('isOpen')) {
        searchDialogElement.dialog('close');
    }
}

/**
 * Return a set of ptask records holding info for the views LIKE '%[finderText]%'
 * @param filterText
 * @return {*}
 */
function getViewsByName(filterText) {
    var parameters = {
        viewName: 'ab-page-navigation-view-search.axvw',
        dataSourceId: 'taskTitleSearch_pg_ds',
        groupIndex: 0,
        version: '2',
        searchString: filterText,
        useHierarchicalSecurityRestriction: true
    };

    // task view search dataSource is parameterized for localized title columns as well as the search string.
    if (PageNavUserInfo.locale.substr(0, 2) !== 'en') {
        var languageExtension = PageNavUserInfo.localeDirectory.replace('/', '');
        parameters.taskTitleColumn = 'afm_ptasks.task_' + languageExtension;
        parameters.processesTitleColumn = 'afm_processes.title_' + languageExtension;
        parameters.activitiesTitleColumn = 'afm_activities.title_' + languageExtension;
        parameters.productsTitleColumn = 'afm_products.title_' + languageExtension;
    }

    return getDataRecords(parameters);
}

/**
 * Set the home tab label to the selected element's inner html.
 * Set the tab's content to the element's href
 *
 * @param elem
 * @param event
 */
function changeHomeTab(elem, event) {
    var newNav = elem.innerHTML;
    $('#tabLabelHome').html(newNav);

    // reposition tasks dropdown for new tab label
    positionBreadCrumbs();

    // TODO Set the tab's content to the element's href
    var newHomePageFile = elem.href;
    newHomePageFile = newHomePageFile.substring(newHomePageFile.lastIndexOf('/') + 1);

    PageNavUserInfo.homeTabHtmlFragment = PageNavUserInfo.generationDirectory + PageNavUserInfo.localeDirectory +
        PageNavUserInfo.roleDirectory + newHomePageFile;
    goHome();
}

/**
 * Return an array of individual strings split from the input which is a string composed of a list of strings.
 *
 * @param contextString
 * @return {Array}
 */
function getArrayFromContextString(contextString) {
    var returnStrings = [];
    if (contextString) {
        var rawTokens = contextString.split(',');
        var tokenCount = rawTokens.length;

        for (var i = 0; i < tokenCount; i++) {
            var token = $.trim(rawTokens[i]);

            if (token.indexOf("[") === 0) {
                token = token.substr(1);
            }
            if (token.indexOf("]") === token.length - 1) {
                token = token.substr(0, token.length - 1);
            }

            returnStrings.push(token);
        }
    }

    return returnStrings;
}

/**
 * Show the base help window.
 */
function showHelp() {
    var helpWindowSettings = 'toolbar=yes,menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=800,height=600,left=10,top=10';
    var helpUrl = context.archibusHelpLink.replace('(user.helpExtension)', context.userHelpExtension);

    return window.open(helpUrl, "Archibus_Help", helpWindowSettings);
}

/**
 * Handler for the signout banner menu item
 */
function doSignOut() {
    // check if there are any running jobs for this user
    // ensures that Ab.workflow.Workflow.sessionTimeoutDetected is updated
    var jobs = Workflow.getJobStatusesForUser();
    // if session timeout has been detected
    if (Workflow.sessionTimeoutDetected) {
        // go directly to the signout view and do not call the service
        var currentLocation = location.href;
        var currentDir = currentLocation.substring(0, currentLocation.indexOf("schema"));
        window.location = currentDir + context.logoutView;
        return;
    }

    var running = false;
    for (var i in jobs) {
        if (jobs[i].jobFinished === false && jobs[i].jobStatusCode !== 8) {
            running = true;
        }
    }

    if (running) {
/*
        // warn the user and allow to cancel the sign out
        var message = getLocalizedString(context.z_SIGNOUT_JOBS_MESSAGE);
        var controller = this;
        View.confirm(message, function(button) {
            if (button === 'yes') {
                controller.doLogout();
            }
        });
*/
    }
    else {
        this.doLogout();
    }
}

/**
 * When the session has timed out go directly to the signout view and do not call the security service.
 */
function signOutOnTimeOut() {
    var returnValue = false;
    // ensures that Ab.workflow.Workflow.sessionTimeoutDetected is updated
    //var jobs = Workflow.getJobStatusesForUser();
    if (Ab.workflow.Workflow.sessionTimeoutDetected) {
        doLogout();
        returnValue = true;
    }

    return returnValue;
}

/**
 * Performs the sign out action.
 */
function doLogout() {
    SecurityService.logout({
        callback: function(x, y, z) {
            PageNavUserInfo.loggedInUser = '';
            var currentLocation = location.href;
            var currentDir = currentLocation.substring(0, currentLocation.indexOf("schema"));
            window.location = currentDir + context.logoutView;
        },
        errorHandler: function(message, e) {
            // DWR has its own session timeout check which may bypass our server-side timeout check
            if (message === 'Attempt to fix script session' || message.indexOf('expired') !== -1) {
                window.location = context.logoutView;
            }
            ///else {
            //View.showException(e);
            ///}
        }
    });
}

/**
 * Called from SmartClient when document loaded into SC's Browser control.
 */
function configureForSmartClient() {
    $('#signOutLink').css('display', 'none');
}