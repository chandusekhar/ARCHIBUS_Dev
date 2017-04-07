/**
 * JavaScript driving the Page Navigation file and page management
 *
 *
 * @author Steven Meyer
 * @since V 21.2
 */

/**
 * Global variable:
 *
 * HTML Fragments are generated to a locale & role-specific directory below this relative dir.
 * control setInterval - clearInterval for waiting on DWR initialization before 1st WFR call.
 */
var PageNavUserInfo = {
    locale: 'en_US',
    localeDirectory: '',
    roleDirectory: '',
    redirectIntervalId: 0,
    redirectWaitCounter: 0,
    loggedInUser: '',
    webAppContextPath: '/archibus/',
    cssDirectory: '/archibus/schema/ab-core/css/',
    cssFilePrefix: 'ab-page-navigation-',
    generationDirectory: 'schema/ab-products/common/views/page-navigation/generated/',
    userInterfaceTheme: '',
    languageExtension: '',
    homeTabFragment: null,
    applicationsTabHtmlFragment: null,
    roleSplitRegex: /[\\ /]/
};

/**
 * True when the url exist on the server domain
 *
 * @param url
 * @return {Boolean}
 */
function fileExists(url) {
    if (url) {
        var targetUrl = url.substr(url.lastIndexOf(PageNavUserInfo.webAppContextPath));

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
 * Set the values for the application's config object.
 * @param userInfo
 */
function setPageNavUserInfo(userInfo) {
    setUserLocaleDirectory(userInfo.locale, userInfo.languageExtension);
    setUserRoleDirectory(userInfo.role);
    setUserColorScheme(userInfo.colorScheme);
}
/**
 * Set the global vars for user's locale
 * and for the locale directory that is part of the generated file path.
 *
 * @param afmUsersLocale
 * @param languageExtension
 */
function setUserLocaleDirectory(afmUsersLocale, languageExtension) {
    setUserLanguage(languageExtension);
    if (afmUsersLocale) {
        var locale = afmUsersLocale;

        if (!languageExtension || languageExtension.length === 0) {
            if (locale === 'zh_CN') {
                languageExtension = 'ch'
            }
            else {
                languageExtension = locale.substr(0, 2);
            }
        }
        else if (languageExtension.length === 3) {
            languageExtension = languageExtension.substring(1);
        }

        PageNavUserInfo.locale = locale;
        PageNavUserInfo.localeDirectory = languageExtension + "/";
    }
}

/**
 * Set the user's language extension as a global.
 * @param languageExtension
 */
function setUserLanguage(languageExtension) {
    if (languageExtension) {
        PageNavUserInfo.languageExtension = languageExtension;
    }
}

/**
 * Set the value of the constant for the role directory that is part of the generated file path.
 * @param roleName
 */
function setUserRoleDirectory(roleName) {
    PageNavUserInfo.roleDirectory = getCamelCasedString(roleName) + "/";
    return PageNavUserInfo.roleDirectory;
}
function getUserRoleDirectory(roleName) {
    return getCamelCasedString(roleName) + "/";
}

/**
 * Set the user's color scheme as a global.
 * @param colorScheme
 */
function setUserColorScheme(colorScheme) {
    if (colorScheme && colorScheme.length > 0) {
        PageNavUserInfo.userInterfaceTheme = $.trim(colorScheme).toLowerCase().replace(" ", "-");

    }
}

/**
 * Return a string based on the input removing whitespace and camelCasing the words.
 * Useful for making a directory name out of the role name, or identifier out of a bucket title.
 *
 * @param inputString
 * @return {String}
 */
function getCamelCasedString(inputString) {
    var camelCasedString = "";
    if (inputString && inputString.length > 0) {
        var words = inputString.split(PageNavUserInfo.roleSplitRegex);
        var wordCount = words.length;
        for (var i = 0; i < wordCount; i++) {
            if (words[i].length === 1 &&
                (words[i].charAt(0) === '&' ||
                words[i].charAt(0) === '_')) {
                continue;
            }
            if (words[i].charAt(0) === '(') {
                words[i] = words[i].substr(1);
            }
            var length = words[i].length;
            if (words[i].charAt(length - 1) === ')') {
                words[i] = words[i].substr(0, length - 1);
            }

            if (i === 0) {
                camelCasedString = words[i].toLocaleLowerCase();
            }
            else {
                camelCasedString += words[i].charAt(0).toLocaleUpperCase();
                camelCasedString += words[i].substr(1).toLocaleLowerCase();
            }
        }
    }

    return camelCasedString;
}

/**
 * Return a string based on the role name removing whitespace and delimiting the words with hyphens.
 * @param roleName
 * @return {String}
 */
function getRoleDashed(roleName) {
    var dashedRoleName = "";
    var words = roleName.toLocaleLowerCase().split(PageNavUserInfo.roleSplitRegex);
    var wordCount = words.length;
    for (var i = 0; i < wordCount; i++) {
        if (words[i].length === 1 && (words[i].charAt(0) === '&' || words[i].charAt(0) === '-')) {
            continue;
        }
        if (words[i].charAt(0) === '(') {
            words[i] = words[i].substr(1);
        }
        var len = words[i].length;
        if (words[i].charAt(len - 1) === ')') {
            words[i] = words[i].substr(0, len - 1);
        }

            dashedRoleName +=  (i === 0) ? words[i] : "-" + words[i];
        }

    return dashedRoleName;
}

/**
 * Return the current user's name & role
 *
 * @return object containing user info or false
 */
function getUserInfo() {
    var returnValue;

    try {
        var result = Ab.workflow.Workflow.call('AbCommonResources-getUser', {});

        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
            returnValue = {'name': "timeout", 'role': "timeout"};
        }
        else if (result.data) {
            var adminPath = AdminService._path;
            var webAppContextPath = '';
            if (adminPath) {
                webAppContextPath = adminPath.substr(0, adminPath.indexOf('/', 2) + 1);
            }

            returnValue = {
                'name': result.data.user_name,
                'role': result.data.role_name,
                'groups': result.data.groups,
                'projectName': result.data.projectName,
                'serverVersion': result.data.serverVersion,
                'locale': result.data.locale,
                'languageExtension': result.data.languageExtension,
                'colorScheme': result.data.colorScheme,
                'webAppContextPath': webAppContextPath
            };
        }
    }
    catch (e) {
        Workflow.handleError(e);
    }

    return returnValue;
}

