/**
 * Functions and variables used in localizing page navigation.
 *
 * User: meyer
 * Date: 7/14/13
 *
 */

/**
 * Load the locale-appropriate lang file int the document's head element and execute.
 * When the lang file does not exist 'localize' the display text anyway.
 * The timing of the localization depends on whether the file exists or not.
 *
 * @param languageCode a language and country ISO code
 */
function loadLocalization(languageCode) {
    if (languageCode && languageCode.length > 1 ) {
        var langFile = PageNavUserInfo.webAppContextPath + "schema/ab-core/controls/lang/ui-controls-lang-" + languageCode + ".js";
        if (langFileExists(langFile)) {
            $.getScript(langFile, function(data, textStatus, jqxhr) {
                console.log(textStatus);
                console.log('Load of locale strings was performed.');
                localizeDisplayText();
                localizeFavoritesDisplayText();
            });
        }
        else {
            localizeDisplayText();
            localizeFavoritesDisplayText();
        }
    }
}

/**
 * True when the url exist on the server domain
 *
 * @param url
 * @return {Boolean}
 */
function langFileExists(url) {
    if (url) {
        var targetUrl = window.location.href;// url.substr(url.lastIndexOf('/') + 1);
        var prefix = targetUrl.substr(0, targetUrl.indexOf('/', 10));
        targetUrl = prefix + url;

        var req = new XMLHttpRequest();
        req.open('GET', targetUrl, false);
        req.send();
        return req.status === 200;
    }
    else {
        return false;
    }
}

/**
 * Localize control display strings that are read from Ab.localization.Localization object's localizedString array.
 *
 * @param key the key used to search the localization table tuples
 */
function getLocalizedString(key) {
    var localString = key;
    if (Ab.localization) {
        var localStrings = Ab.localization.Localization.localizedStrings;
        for (var i = 0, msg; msg = localStrings[i]; i++) {
            if (msg.key3 === key) {
                (msg.value === '') ? localString = '*' + msg.key3 : localString = msg.value;
                return localString;
            }
        }
    }

    if (valueExistsNotEmpty(localString)) {
        localString = convertFromXMLValue(localString);
    }

    return localString;
}

/**
 * Return a string that has any XML code converted back to simple ASCII characters.
 * Performs the conversion opposite to convert2validXMLValue()
 * @param fieldValue
 * @returns {string}
 */
function convertFromXMLValue(fieldValue){
    var returnValue = "";
    if (fieldValue && jQuery.isNumeric(fieldValue)) {
        returnValue = fieldValue;
    }
    else if (fieldValue && typeof fieldValue == "string") {
        returnValue = fieldValue.replace(/&amp;/g, '&');
        returnValue = returnValue.replace(/&gt;/g, '>');
        returnValue = returnValue.replace(/&lt;/g, '<');
        returnValue = returnValue.replace(/&apos;/g, '\'');
        returnValue = returnValue.replace(/&quot;/g, '\"');
    }

    return returnValue;
}

function convertToXMLValue(fieldValue){
    var returnValue = "";
    if (fieldValue && jQuery.isNumeric(fieldValue)) {
        returnValue = fieldValue;
    }
    else if (fieldValue && typeof fieldValue === "string") {
        returnValue = fieldValue.replace(/&/g, '&amp;');
        returnValue = returnValue.replace(/>/g, '&gt;');
        returnValue = returnValue.replace(/</g, '&lt;');
        returnValue = returnValue.replace(/\'/g, '&apos;');
        returnValue = returnValue.replace(/\"/g, '&quot;');
    }
    else if (typeof fieldValue === "boolean") {
        returnValue = fieldValue ? "true" : "false";
    }

    return returnValue;
}

/**
 * Keys for localizing right-click context menu labels.
 *
 */
// TODO unify the syntax with z_PAGENAV_
// TODO transform this from a global to a data member
var pageNavStrings = {
// @begin_translatable
    z_NAVIGATOR_MENU_KEY: 'Key',
    z_NAVIGATOR_MENU_HELPLINK: 'Help Link',
    z_NAVIGATOR_MENU_TASK: 'Task',
    z_NAVIGATOR_MENU_TASK_FILE: 'Task File',
    z_NAVIGATOR_MENU_ACTIVITY_FOLDER: 'Activity Folder',
    z_NAVIGATOR_MENU_PATH: 'Path',
    z_NAVIGATOR_MENU_URL: 'URL',
    z_NAVIGATOR_MENUITEM_SUMMARY: 'Summary',
    z_NAVIGATOR_MENUITEM_DETAILS: 'Details',
    z_NAVIGATOR_MENUITEM_HELP: 'Help',
    z_NAVIGATOR_MENUITEM_SHOW_URL: 'Show Task Information',
    z_NAVIGATOR_USERMENU_PROJECT: 'Project:',
    z_NAVIGATOR_USERMENU_ROLE: 'Role:',
    z_NAVIGATOR_USERMENU_VERSION: 'Version:',
    z_NAVIGATOR_USERMENU_PROFILE: 'My Profile',
    z_NAVIGATOR_USERMENU_JOBS: 'My Jobs',
    z_NAVIGATOR_USERMENU_PRESENTATIONS: 'Create Presentation',
    z_NAVIGATOR_USERMENU_EDITOR: 'Edit Home Page',
    z_NAVIGATOR_MENUITEM_DASHBOARDLAYOUT: 'Dashboard Layout',
    z_NAVIGATOR_MENUITEM_DASHBOARDVIEW: 'Dashboard View',
    z_NAVIGATOR_MENUITEM_DESCRIPTORFILE: 'Descriptor File',
    z_NAVIGATOR_MENUITEM_DESCRIPTORPROCESS: 'Descriptor Process',
    z_PAGENAV_SESSION_TIME_OUT: 'Session has timed out. Please sign in again.',
    z_PAGENAV_BUCKET_NODATA: 'No data found',
    z_PAGENAV_SEARCH_NODATA: 'No search results found',
    z_PAGENAV_GETRECORDS_MORE: 'More values exist',
    z_PAGENAV_FAVORITES_DUPLICATE_WARNING: 'The task <b>{1}</b> is already one of your Favorites!',
    z_PAGENAV_FAVORITES_DUPLICATE_TITLE: 'No Duplicating Favorites',
    z_PAGENAV_FAVORITES_SAVE_ERROR_TITLE: 'Error saving Favorites',
    z_PAGENAV_FAVORITES_DELETE_ERROR_TITLE: 'Error removing Favorites',
    z_PAGENAV_PUBLISH: 'Publish',
    z_PAGENAV_PUBLISH_LOCALE_BEFORE_LOGIN: 'HTML files for the locale {1} do not exist. Please publish before logging in.',
    z_PAGENAV_COPY_TO_CLIPBOARD: 'Copy to clipboard: Ctrl+C, Enter',
    z_PAGENAV_RUNTIME_CONTEXT_MENU: 'No additional information is available for this panel.',
    z_PAGENAV_RUNTIME_BUCKET_REPORT: 'Save as a Powerpoint .ppt file.',
    z_PAGENAV_RUNTIME_PAGE_REPORT: 'Print Home Page to a .ppt file.',

    z_PAGENAV_WINDOW_TITLE: 'ARCHIBUS Web Central',
    z_PAGENAV_BREADCRUMB_LABEL: 'Tasks',
    z_PAGENAV_SEARCHBOX_INITIAL_TEXT: 'Find a form or report',
    z_PAGENAV_SEARCHRESULT_TITLE: 'Search',
    z_PAGENAV_SEARCHRESULT_DOMAIN: 'Domain',
    z_PAGENAV_SEARCHRESULT_APPLICATION: 'Application',
    z_PAGENAV_SEARCHRESULT_PROCESS: 'Process',
    z_PAGENAV_SIGNOUT_BUTTON_LABEL: 'Sign Out',
    z_PAGENAV_HELP_BUTTON_LABEL: 'Help',
    z_PAGENAV_FAVORITES_ADD_TARGET_TEXT: 'Drag a task here to add.',
    z_PAGENAV_FAVORITES_ADD_TARGET_TOOLTIP:  'Drag any task or report into the box to add it.',
    z_PAGENAV_FAVORITES_DELETE_TARGET_TOOLTIP: 'Drag a favorite into the trashcan to remove it.',
    z_PAGENAV_BACK_TO_TOP: 'Back to Top',
    z_PAGENAV_ARCHIBUS_HELP: 'Archibus Help',

    z_PAGENAV_METRICS_METRIC: 'Metric',
    z_PAGENAV_METRICS_CURRENT: 'Current',
    z_PAGENAV_METRICS_CHANGE: 'Change',
    z_PAGENAV_METRICS_PER_YEAR: 'Per Year',
    z_PAGENAV_METRICS_TARGET_PERCENT: '% of Target',
    z_PAGENAV_METRICS_TREND: 'Trend',
    Z_PAGENAV_METRICS_ASSUMPTIONS_DESCRIPTION: "Description",
    Z_PAGENAV_METRICS_ASSUMPTIONS: "Assumptions",
    Z_PAGENAV_METRICS_ASSUMPTIONS_BSN_IMPL: "Business Implications",
    Z_PAGENAV_METRICS_ASSUMPTIONS_RECURRENCE: "Recurrence",
    z_PAGENAV_METRICS_ALL: "All",

    z_PAGENAV_FAVORITES_OK: "OK",
    z_PAGENAV_FAVORITES_SAVE: "Save",
    z_PAGENAV_FAVORITES_CANCEL: "Cancel",
    z_PAGENAV_FAVORITES_RENAME: "Rename",
    z_PAGENAV_FAVORITES_EDIT_TITLE: "Edit Favorites Titles and Ordering",
    z_PAGENAV_FAVORITES_SAVE_ORDER: "Save Order",
    z_PAGENAV_FAVORITES_CANCEL_REORDER: "Discard Changed Order",
    z_PAGENAV_FAVORITES_LOSE_ORDER_MESSAGE: "Closing the dialog now will lose the changed ordering of the favorites.",
    z_PAGENAV_FAVORITES_LOSE_ORDER_QUESTION: "Do you want to close now?",
    z_PAGENAV_FAVORITES_SAVE_FAILED: "Saving new name failed",
    z_PAGENAV_FAVORITES_RENAME_FAIL_MESSAGE: "The renaming was not saved to the server.",
    z_PAGENAV_FAVORITES_RENAME_FAIL_QUESTION: "Ensure that name is unique.",
    z_PAGENAV_FAVORITES_ORDER_SAVED: "Order saved.",
    z_PAGENAV_FAVORITES_SAVE_NOOP: "No need to save.",
    z_PAGENAV_FAVORITES_ORDER_SAVE_FAILED: "Order save failed!",
    z_PAGENAV_BUCKET_DEF_ERROR: 'Bucket Definition Error',
    z_PAGENAV_NO_DATA_AVAILABLE: 'No Data Available',

    z_PAGENAV_MAP_WORLD_IMAGERY: 'World Imagery', 
    z_PAGENAV_MAP_WORLD_IMAGERY_WITH_LABELS: 'World Imagery with Labels',
    z_PAGENAV_MAP_WORLD_LIGHT_GRAY_BASE: 'World Light Gray Canvas',
    z_PAGENAV_MAP_WORLD_DARK_GRAY_BASE: 'World Dark Gray Canvas',
    z_PAGENAV_MAP_WORLD_STREET_MAP: 'World Street Map',  
    z_PAGENAV_MAP_WORLD_SHADED_RELIEF: 'World Shaded Relief',       
    z_PAGENAV_MAP_WORLD_TOPOGRAPHIC_MAP: 'World Topographic',
    z_PAGENAV_MAP_NATGEO_WORLD_MAP: 'National Geographic World Map',
    z_PAGENAV_MAP_OCEAN_BASEMAP: 'Oceans Basemap', 

    z_PAGENAV_MAP_ROADMAP: 'Road Map',
    z_PAGENAV_MAP_SATELLITE: 'Satellite',  
    z_PAGENAV_MAP_HYBRID: 'Satellite with Labels', 
    z_PAGENAV_MAP_TERRAIN: 'Terrain'

// @end_translatable
};
