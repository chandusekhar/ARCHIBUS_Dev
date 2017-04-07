/**
 * JavaScript driving the Bali 1 Navigation skeleton page
 *
 * Functionality specific to the included home tab is moved to homeTab.js
 *
 * @author Steven Meyer
 * @since V 21.1
 */
/**
 * Initialize the Navigation page once the document is ready
 */
$(document).ready(function() {
    // execute timing event to test whether DWR has been initialized.
    // Set user name in header when it is ready.
    // Ensure that the user locale == the site default locale, else redirect.
    //
    // Trigger completion of setup only after initial WFR completes
    PageNavUserInfo.redirectIntervalId = setInterval(initialWfrCall, 100);
});

/**
 * Function to call at intervals while waiting for DWR to make server available.
 * DWR has its own initialization cycle where it obtains the script session ID from the server.
 * No calls can be made until this is complete.
 * We have code in ab-view.js to wait for this, implement similar process here.
 *
 * When this first call gets the user info, set locale\role variables.
 */
function initialWfrCall() {
    dwr.engine.setErrorHandler(Workflow.handleDwrError.createDelegate(Workflow));
    dwr.engine.setWarningHandler(Workflow.handleDwrWarning.createDelegate(Workflow));
    if ( valueExists(dwr.engine._scriptSessionId)) {
        var isRedirected = false;
        var userInfo = getUserInfo();
        if (userInfo) {
            setUserLocaleDirectory(userInfo.locale, userInfo.languageExtension);
            setUserRoleDirectory(userInfo.role);
            isRedirected = redirectToLocaleAndRole();
        }
        clearInterval(PageNavUserInfo.redirectIntervalId);
    }
    // else wait and do nothing but increment counter
    else {
        console.log('DWR script session ID is null: ' + PageNavUserInfo.redirectWaitCounter);
        PageNavUserInfo.redirectWaitCounter++;
    }

    return isRedirected;
}

/**
 * Redirect the location to the correct skeleton according to the user's locale and role.
 * Load the user's theme.
 *
 */
function redirectToLocaleAndRole() {
    var currentLocation = location.href;
    var currentDir = currentLocation.substring(0, currentLocation.indexOf("schema"));
    if (currentDir === "") {
        currentDir = currentLocation.substring(0, currentLocation.lastIndexOf("/") + 1);
    }

    // when session is over LOCALE is undefined
    if (!PageNavUserInfo.locale) {
        window.location = currentDir + PageNavUserInfo.generationDirectory + context.logoutView;
        return;
    }

    var redirectLocation = currentDir + PageNavUserInfo.generationDirectory + PageNavUserInfo.localeDirectory + PageNavUserInfo.roleDirectory + "page-navigator-" +
        PageNavUserInfo.localeDirectory.replace('/', '') + ".html";
    if (Ab.workflow.Workflow.sessionTimeoutDetected) {
        signOutOfSession();
    }
    else if (fileExists(redirectLocation)) {
        window.location = redirectLocation;
    }
    else {
        var messageDialog = $('#messageDialog');
        messageDialog.dialog({
            modal: true,
            autoOpen: false,
            title: getLocalizedString(pageNavStrings.z_PAGENAV_PUBLISH),
            draggable: false,
            close: function( event, ui ) {
                signOutOfSession();
            }
        });
        messageDialog.html('<p>' + getLocalizedString(pageNavStrings.z_PAGENAV_PUBLISH_LOCALE_BEFORE_LOGIN).replace('{1}', PageNavUserInfo.locale) +  '</p>');

        setTimeout(function () {
            "use strict";
            messageDialog.dialog('open');
        }, 100);
    }
}

/**
 * Log out of the session and redirect to the login page after a small time out.
 */
function signOutOfSession() {
    doLogout();
    setTimeout(function() {
        window.location = context.logoutView;
    }, 1000);
}
