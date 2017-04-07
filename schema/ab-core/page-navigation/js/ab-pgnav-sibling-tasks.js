/**
 * Page Navigation Project
 *
 * Controller for loading and handling events on the sibling tasks dropdown menu.
 *
 * @author Steven Meyer
 * @since V 21.1
 */

/**
 * Construct and attach the bread crumb select element to the banner task element & show it
 *
 * @param taskElement
 * @param taskType
 */
function setBreadCrumbs(taskElement, taskType) {
    if (!taskElement || taskElement.length === 0) {
        return;
    }
    // test whether breadcrumbs already exist, as when using history back/forward
    var breadCrumbContent = $('#breadCrumbContent');
    var breadCrumbList = breadCrumbContent.find('ol');
    var breadCrumbsExist = breadCrumbList.length > 0;
    var createdBreadCrumbList = false;

    // when breadcrumbs don't already exist, create and append a select element with tasks' siblings
    if (!breadCrumbsExist) {
        // get taskFileName for link's id e.g., id="taskFile_ab-ex-rpt-grid.axvw" or id="favoritesFile_ab-ex-rpt-grid.axvw"
        /// var taskName = removeImgElemIfExists(taskElement.innerHTML);
        // div to which tip html is appended
        var target = breadCrumbContent.find('.hovertip_wrap3');

        var appTitleElems = $(taskElement).parents('.bucket-process').siblings('.application-process-title').filter(":first");
        if (appTitleElems && appTitleElems.length > 0) {
            target.append('<div class="bread-crumb-application-title">' + toCapitalized(appTitleElems.text()) + '</div>');
        }

        var procTitleElems = $(taskElement).parents('.bucket-wrapper').siblings('.process-title').filter(":first");
        if (procTitleElems && procTitleElems.length > 0) {
            target.append('<div class="bread-crumb-process-title">' + procTitleElems.text() + '</div>');
        }

        var taskTree = $(taskElement).parents('.bucket-wrapper').find('ol.ptask-labels');
        if (taskTree.length > 0) {
            // TODO append divs for multi-page navi
            var taskCount = taskTree.length;
            for (var j = 0; j < taskCount; j++) {
                var pTaskGroup = $(taskTree[j]).clone();
                $(pTaskGroup).removeClass('ptask-labels').addClass('bread-crumb-ptask-label');
                $(pTaskGroup).find('.process-tasks').removeClass('process-tasks').addClass('bread-crumb-process-tasks');
                target.append($(pTaskGroup).first());
                createdBreadCrumbList = true;
            }
        }
        else {
            // get link's sibling links' innerHTML text & link id for breadCrumbs
            var taskLabels = [];
            var taskViewFileNames = [];
            getSiblingTaskLabelsAndLinkIds(taskElement, taskLabels, taskViewFileNames);
            // form select element with options for each sibling task as breadCrumbs
            if (taskLabels.length > 1) {
                target.append(createListElementFromTaskSiblings(taskLabels, taskViewFileNames, taskType));
                createdBreadCrumbList = true;
            }
        }

        breadCrumbContent.find('a').click(function(){return false;});
    }

    if (createdBreadCrumbList) {
        $('#breadCrumbContainer').show();
    }
}


/**
 * Set the location of the breadCrumb dropdown according to the dimensions of the tabs
 */
function positionBreadCrumbs() {
    var tabsStart = 285;
    var padding = 30;
    var tabAnchor = $('.ui-tabs-nav li a');
    var paddingLeft = parseFloat(tabAnchor.first().css('padding-left'));
    var paddingRight = parseFloat(tabAnchor.first().css('padding-right'));
    var tabsWidth = $('#tabLabelHome').width() + $('#tabLabelApplication').width() + (2 * paddingLeft) + (2 * paddingRight);

    $('#breadCrumbContainer').css('left', tabsStart + tabsWidth + padding);
}

/**
 * Modify the two last parameters to hold the first paramenter's
 * 1) sibling innerHTML task labels
 * 2) sibling link ids
 * @param element -- selected link element
 * @param taskLabels -- Array, targeted for sibling task labels
 * @param linkIds -- Array, targeted for siblink link ids
 */
function getSiblingTaskLabelsAndLinkIds(element, taskLabels, linkIds) {
    var taskListItem = $(element).parent();
    // list of all <ul> nodes' child <a> nodes
    var taskSiblingLinkItems = $(taskListItem).parent().parent().children('ol').children().children();

    // iterate over possibly longer list
    var siblingCount = taskSiblingLinkItems.length;
    for (var i = 0; i < siblingCount; i++) {
        if ($(taskSiblingLinkItems[i]).hasClass('favorites-target')) {
            continue;
        }
        var itemLabel = removeImgElemIfExists(taskSiblingLinkItems[i].innerHTML);
        if (taskLabels && taskLabels.length > 0 && taskLabels.indexOf(itemLabel) < 0) {
            taskLabels.push(itemLabel);
            linkIds.push($(taskSiblingLinkItems[i]).attr('href'));
        }
    }
}

/**
 * return a <ul /> element with its <li /> elements for displaying the sibling tasks
 *
 * @param taskLabels - list of item labels, possibly longer than taskViewFileNames
 * @param taskViewFileNames -- list of item links (items with a label of <hr> get no link
 * @param taskType
 * @return {String}
 */
function createListElementFromTaskSiblings(taskLabels, taskViewFileNames, taskType) {
    var listElem = '<ul class="bread-crumb-list">';
    var labelCount = taskLabels.length;
    for (var j = 0; j < labelCount; j++) {
        listElem += '<li class="bread-crumb-link"><a href="' + taskViewFileNames[j] + '" rel="' + taskType + '">' + taskLabels[j] + '</a></li>';
    }
    listElem += '</ul>';

    return listElem;
}

/**
 * Handle the onChange event for the home tab's breadcrumb dropdown
 * Open the selected task in the task view
 * @param elem
 * @param event
 */
function breadCrumbSelectChanged(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }

    $('#breadCrumbContent').hide();

    var taskType = elem.rel;
    var url = window.location.href;
    var locationIndex = url.lastIndexOf(PageNavUserInfo.webAppContextPath);
    var href = $(elem).attr('href');
    if (href.substr(0, 7) !== 'http://' && href.lastIndexOf('/') > 0) {
        href = href.substr(href.lastIndexOf('/') + 1);
    }

    if ((taskType === 'eTask' || taskType === 'pTask') && locationIndex > 0) {
        var parentSelector = (taskType === 'eTask') ? '#tabPageNavigationHome' : '#applicationsViewParent';
        var frameId = (taskType === 'eTask') ? 'taskFrame' : 'pTaskFrame';
        var selector = '#' + frameId;
        $(selector).remove();
        $(parentSelector).prepend('<iframe class="task-view" id="' + frameId + '"></iframe>');

        var targetUrl = href.substr(0, 7) === 'http://' ? href  : url.substring(0,  locationIndex + PageNavUserInfo.webAppContextPath.length)  + href;
        $(selector).attr('src', targetUrl);
        pushState(taskType, href);
    }
    else if (taskType === 'process' && locationIndex > 0) {
        var targetSrc = window.location.href.substring(0, locationIndex + 9)  + PageNavUserInfo.generationDirectory + href;
        var applicationsProcessView = $('#applicationsProcessView');
        applicationsProcessView.empty();
        applicationsProcessView.load(targetSrc);
        applicationsProcessView.show();
        hideTaskFrame();
        hidePTaskFrame();
    }
    setPageDimensions();
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
 * Return the input phrase as a capitalized text phrase
 *
 * @param phrase
 * @return {String}
 */
function toCapitalized(phrase) {
    var phraseWords = phrase.toLowerCase().split(' ');
    var capPhrase = '';
    for (var i = 0, word; word = phraseWords[i]; i++) {
        if ($.trim(word).length > 0) {
            capPhrase += word.charAt(0).toUpperCase() + word.substr(1) + ' ';
        }
    }

    return $.trim(capPhrase);
}

