/**
 * ab-pgnav-context-menu.js
 * Bind event handler to task links for right-click context menu support
 *
 * http://medialize.github.io/jQuery-contextMenu/
 */

function bindTaskContextMenu() {
    // bucket and divider right-click context menus
    $.contextMenu({
        selector: 'a.ui-tabs-anchor,a[rel$="Task"],h2.product-title,h2.application-title,h3.application-title,a.application-title,h2.process-title,h2.applications-process-title',
        // this callback is executed every time the menu is shown
        // its results are destroyed every time the menu is hidden
        // e is the original contextmenu event, containing e.currentTarget, e.pageX, e.pageY etc.
        build: function($trigger, e) {
            var contextMenu;
            var rel = $(e.currentTarget).attr('rel');
            var cssClass = e.currentTarget.className;
            //var targetId = $(e.currentTarget).attr('id');

            if (rel === 'eTask' || rel === 'pTask') {
                var taskName = e.currentTarget.innerHTML;
                if (taskName.indexOf('<img') > 0) {
                    taskName = $.trim(taskName.substring(0, taskName.indexOf('<img')));
                }
                contextMenu = returnTaskMenu(e, taskName, e.currentTarget.href);
            }
            else if (isFavoritesProcessHeader(e.currentTarget)) {
                showFavoritesDialog(e.currentTarget);
                contextMenu = false;
            }
            // is app-specific bucket
            else if ($(e.currentTarget).siblings('.app-specific-bucket').length > 0) {
                contextMenu = returnAppSpecificMenu();
            }
            else if (cssClass === 'process-title' || cssClass === 'applications-process-title'){
                contextMenu = returnProcessMenu(e);
            }
            else if (cssClass === 'application-title') {
                contextMenu = returnActivityOrProductMenu(e);
            }
            else if (cssClass === 'product-title') {
                contextMenu = returnActivityOrProductMenu(e);
            }

            return contextMenu;
        }
    });
}

/**
 * True when the click target is a header of a myFavorites bucket.
 *
 * @param target
 * @returns {boolean}
 */
function isFavoritesProcessHeader(target) {
    var isFavorites = false;
    var wrapper = $(target).siblings('.bucket-wrapper');
    if (wrapper && wrapper.length > 0) {
        var fav = $(wrapper).find('.favorites');
        if (fav && fav.length > 0) {
            isFavorites = true;
        }
    }

    return isFavorites
}

/**
 * Return the items of the Task context menu
 *
 * @param event the oncontextmenu event triggering the process.
 * @param taskName
 * @param hRef
 * @return {Object}
 */
function returnTaskMenu(event, taskName, hRef) {
    var taskFile = $(event.currentTarget).attr('href'); //.substring(hRef.lastIndexOf('/') + 1);
    var pathPrefix = hRef.substring(0, hRef.indexOf('schema/'));

    var bucketElem = $(event.currentTarget).parents('div.bucket-application, div.bucket-process');
    if (bucketElem.length > 0) {
        var processTaskPath = getProcessPath(bucketElem, event.currentTarget);
        processTaskPath = processTaskPath ? processTaskPath + taskName : "";

        var activityFolder = $(bucketElem).attr('data-subfolder');
        if (!activityFolder) {
            activityFolder = "";
        }

        return {
            callback: function(key, options) {
                var copyText = options.commands[key].name;
                copyText = copyText.substr(copyText.lastIndexOf('>') + 1);
                copyToClipboard(copyText);
            },
            items: {
                "fold1": {
                    "name": getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_DETAILS),
                    "items": {
                        "fold1key1": {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_TASK) + ":</strong> " + taskName},
                        "fold2key2": {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_TASK_FILE) + ":</strong> " + taskFile},
                        "fold1key3": {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_ACTIVITY_FOLDER) + ":</strong> " + activityFolder}
                    }
                },
                "fold2": {
                    "name": getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_SHOW_URL),
                    "items": {
                        "fold2key1": {name: "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_PATH) + ":</strong> " + processTaskPath},
                        "fold2key2": {name: "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_URL) + ":</strong> " + pathPrefix + taskFile}
                    }
                }
            }
        };
    }
}

/**
 * Return the items of the Process context menu
 *
 * @param event the oncontextmenu event triggering the process.
 * @return {Object}
 */
function returnProcessMenu(event) {
    var contextMenu;
    var targetElem = event.currentTarget;
    var bucketElem = $(targetElem).parents('div.bucket-application, div.bucket-process');
    if (bucketElem.length > 0) {
        contextMenu = getBasisMenuProductActivityProcess(event);
        if (context.keyValue && context.keyValue.length > 0) {
            var dashboardLayout = $(bucketElem).attr('data-dashboardLayout');
            var dashboardView = $(bucketElem).attr('data-dashboardView');

            contextMenu.items.fold2.items.fold2key3 = {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_DASHBOARDLAYOUT) + ":</strong> " + dashboardLayout ? dashboardLayout : ""};
            contextMenu.items.fold2.items.fold2key4 = {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_DASHBOARDVIEW) + ":</strong> " + dashboardView ? dashboardView : ""};
        }

        if (contextMenu.showHelp) {
            addHelpToContextMenu(contextMenu, event);
        }
    }

    return contextMenu;
}

/**
 * Return the items of the Activity or Product context menu
 *
 * @param event the oncontextmenu event triggering the process.
 * @return {Object}
 */
function returnActivityOrProductMenu(event) {
    var contextMenu = getBasisMenuProductActivityProcess(event);

    if (contextMenu && contextMenu.showHelp) {
        addHelpToContextMenu(contextMenu, event);
    }

    return contextMenu;
}

/**
 * Return the items of the basic 'foundational' context menu used product, activity, and process context menus.
 *
 * @param event the oncontextmenu event triggering the process.
 * @return {Object}
 */
function getBasisMenuProductActivityProcess(event) {
    var contextMenu;
    var targetElem = event.currentTarget;
    var bucketElem = $(targetElem).parents('div.bucket-application, div.bucket-process');
    if (bucketElem.length > 0) {
        var keyValue = getKeyValue(bucketElem, targetElem);
        var summaryText = getSummaryText(bucketElem, targetElem);
        var helpLink = getHelpLink(bucketElem, targetElem);

        var summaryLabel = getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_SUMMARY);
        var showHelpButton = true;
        if (!helpLink) {
            helpLink = "";
            showHelpButton = false;
        }

        contextMenu = {
            items: {
                "fold1": {
                    "name": summaryLabel,
                    "items": {
                        "fold1key1": {"name": "<strong>" + summaryLabel + ":</strong> " + summaryText}
                    }
                },
                "fold2": {
                    "name": getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_DETAILS),
                    "items": {
                        "fold2key1": {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_KEY) + ":</strong> " + keyValue},
                        "fold2key2": {"name": "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENU_HELPLINK) + ":</strong> " + helpLink}
                    }
                }
            }
        };
        contextMenu.keyValue = keyValue;
        contextMenu.showHelp = showHelpButton;
        contextMenu.helpLink = helpLink;
    }

    return contextMenu;
}

/**
 * Return the process path for the task.
 *
 * @param bucketElem
 * @param targetElem
 * @returns {string}
 */
function getProcessPath(bucketElem, targetElem) {
    var productTitle = $(bucketElem).attr('data-productTitle');
    if (!productTitle) {
        productTitle = $(targetElem).attr('data-productTitle');
    }

    var activityTitle = $(bucketElem).attr('data-activityTitle');
    if (!activityTitle) {
        activityTitle = $(targetElem).attr('data-activityTitle');
    }

    var processTitle = $(bucketElem).attr('data-processTitle');
    if (!processTitle) {
        processTitle = $(targetElem).attr('data-processTitle');
    }

    return productTitle ? productTitle + '/' + activityTitle + '/' + processTitle + '/' : false;
}

/**
 * return the lowest level schema ID as the key value.
 *
 * @param bucketElem
 * @param targetElem
 * @returns {*|Z.attr|jQuery}
 */
function getKeyValue(bucketElem, targetElem) {
    var productId = $(bucketElem).attr('data-productId');

    var activityId = $(bucketElem).attr('data-activityId');
    if (!activityId) {
        activityId = $(targetElem).attr('data-activityId');
    }

    var processId = $(bucketElem).attr('data-processId');

    var keyValue = "";
    if (processId) {
        keyValue = processId;
    }
    else if (activityId) {
        keyValue = activityId;
    }
    else if (productId) {
        keyValue = productId;
    }

    return keyValue;
}

/**
 * Return the text used to summarize the schema object.
 *
 * @param bucketElem
 * @param targetElem
 * @returns {*|Z.attr|jQuery}
 */
function getSummaryText(bucketElem, targetElem) {
    var summaryText = $(targetElem).attr('title');
    if (!summaryText) {
        summaryText = $(bucketElem).children('h2').attr('title');
    }
    if (!summaryText) {
        summaryText = '';
    }

    return summaryText;
}

/**
 * Return the link used to access help for the schema object.
 *
 * @param bucketElem
 * @param targetElem
 * @returns {*|Z.attr|jQuery}
 */
function getHelpLink(bucketElem, targetElem) {
    var helpLink = $(targetElem).attr('data-helpLink');
    if (!helpLink) {
        helpLink = $(bucketElem).attr('data-helpLink');
    }

    return helpLink;
}

/**
 * Augment the contextMenu with an additional top-level item
 * that is a link to show the help file in a new window.
 *
 * @param contextMenu
 * @param event
 * @returns {*}
 */
function addHelpToContextMenu(contextMenu, event) {
    var helpSystem = $(event.currentTarget).attr('data-helpSystem');
    if (!helpSystem) {
        var bucketElem = $(event.currentTarget).parents('div.bucket-application, div.bucket-process');
        helpSystem = $(bucketElem).attr('data-helpSystem');
    }

    contextMenu.items.help = {
        name: "<strong>" + getLocalizedString(pageNavStrings.z_NAVIGATOR_MENUITEM_HELP) + "</strong>",
        // supersedes any "global" callback
        callback: function(key, options) {
            if (contextMenu.helpLink && $.trim(contextMenu.helpLink).length > 0) {
                var helpWindowSettings = 'toolbar=yes,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600,left=10,top=10';
                var baseHelpUrl = context.archibusHelpLink.replace('(user.helpExtension)', context.userHelpExtension);
                if (helpSystem && helpSystem === 'SYSTEM') {
                    baseHelpUrl = context.systemMgmtHelpLink;
                }
                var helpUrl = baseHelpUrl + "#.." + contextMenu.helpLink.replace(/\\/g, "/");
                return window.open(helpUrl, getLocalizedString(pageNavStrings.z_PAGENAV_ARCHIBUS_HELP), helpWindowSettings);
            }
            else {
                contextMenu.helpLink = "an undefined help link.";
                var m = "help was clicked for " + contextMenu.helpLink;
                window.console && console.log(m) || alert(m);
            }
        }
    };

    return contextMenu;
}

/**
 * Show a dialog that prompts the user to copy the displayed text to their clipboard.
 *
 * @param text
 */
function copyToClipboard (text) {
    window.prompt(getLocalizedString(pageNavStrings.z_PAGENAV_COPY_TO_CLIPBOARD), text);
}

/**
 *  Return a context menu appropriate for app-specific buckets.
 *
 * @returns {{items: {notice: {name: (pageNavStrings.z_PAGENAV_RUNTIME_CONTEXT_MENU|*)}}}}
 */
function returnAppSpecificMenu() {
    return {
        callback: function(key, options) {
            if (key === 'report') {
                //var bucketWrapper = $(this).siblings('.app-specific-bucket');
                //var wrapperId = $(bucketWrapper).attr('id');

                var bucketElement = $(this).parent('.bucket-process');
                var bucketId = $(bucketElement).attr('id');
                //var bucketTitle = $(bucketElement).children('h2').text();
                //var mapElement = $(bucketWrapper).children('.pgnav-map');
                //var isMapControl = mapElement.length > 0;

                html2canvas($('#' + bucketId), {
                    proxy: '/html2canvasproxy',
                    allowTaint: true,
                    useCORS: true,
                    onrendered: function(canvas) {
                        // canvas is the final rendered <canvas> element
                        var myImage = canvas.toDataURL("image/png");

                        saveToDisk(myImage, 'testMeNow.png', bucketElement[0]);
                        //window.open(myImage);
                    }
                });
            }
        },
        items: {
            "notice": {name: getLocalizedString(pageNavStrings.z_PAGENAV_RUNTIME_CONTEXT_MENU)}
            //"report": {name: getLocalizedString(pageNavStrings.z_NAVIGATOR_USERMENU_PRESENTATIONS)}
        }
    };
}

/**
 * Save context menu initiated image download.
 *
 * @param imageUrl
 * @param fileName
 * @param el
 */
function saveToDisk(imageUrl, fileName, el) {
    // for non-IE
    if (!window.ActiveXObject) {
        var save = document.createElement('a');
        save.href = imageUrl;
        save.target = '_blank';
        save.download = fileName || imageUrl;

        var event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        save.dispatchEvent(event);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
    // for IE
    else if ( !! window.ActiveXObject && document.execCommand)     {
        var e = jQuery.Event( "SaveAs" );
        jQuery( el ).trigger( e );

        var html = "<p>Right-click on image below and Save-Picture-As</p>";
        html += "<img src='" + imageUrl + "' alt='from canvas'/>";
        var tab = window.open();
        tab.document.write(html);
        tab.execCommand('SaveAs', true, fileName);
        tab.close();
    }
}

