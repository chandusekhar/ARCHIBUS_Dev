/**
 * JavaScript driving the Page Navigation History functionality
 *
 * based on Ben Alman's BBQ jQuery plugin, 
 * see http://benalman.com/projects/jquery-bbq-plugin/
 *
 * @author Steven Meyer
 * @since V 21.1
 */

// function finishSetup(userInfo) {
// ...    
//    setUpHistory(tabsWidget, 'ul.ui-tabs-nav a');
// ...
// }


/**
 * Set up the handling of browser back, forward & handling bookmark loading
 *
 * @param tabs
 * @param tabsLinkSelector
 */
function setUpHistory(tabs, tabsLinkSelector) {

    // Define our own click handler for the tabs, overriding the default.
    tabs.find( tabsLinkSelector ).click(function(){
        // Get the id of this tab widget.
        var id = $(this).closest( '.ui-tabs' ).attr( 'id' );

        // Get the index of the clicked tab.
        var index = $(this).parent().prevAll().length;
        pushState(id, index);
    });

    // Define our own click handler for the anchor elements to
    // prevent the default click behavior from directly opening the href.
    $('#navigationTabs').find('a').click(function(){return false;});

    // Bind an event to window.onhashchange so that when the history state changes:
    // 1) selects the appropriate tab, changing the current tab as necessary.
    // 2) loads the home tab task OR loads the process view and/or loads the process task
    $(window).bind( 'hashchange', function(e) {
        if (signOutOnTimeOut()) { return; }

        tabs.each(function(){
            // Get the index for this tab widget from the hash, based on the appropriate id property.
            var selectedTabIndex = $.bbq.getState( this.id, true ) || 0;
            $('#navigationTabs').tabs("option", "active", selectedTabIndex);
        });

        // Get the hash (fragment), with any leading # removed, converted to an object
        var urlParams = $.deparam.fragment();
        if ((!urlParams.eTask && !urlParams.process  && !urlParams.pTask )) {
            var selectedTab = urlParams.navigationTabs || 0;
            restoreTab(selectedTab);
        }

        if (urlParams.eTask) {
            //var taskElem = $('a[href="' + urlParams.eTask + '"]');
            //if (taskElem.length > 0) {
            //    taskElem = taskElem[0];
            //}
            if (!isTaskAlreadyShown('#taskFrame', urlParams.eTask)) {
                setDisplayContainers('#taskFrame', urlParams.eTask);
            }
        }
        else if (urlParams.pTask) {
            //var pTaskElem = $('a[href="' + urlParams.pTask + '"]');
            //if (pTaskElem.length > 0) {
            //    pTaskElem = pTaskElem[0];
            //}
            if (!isTaskAlreadyShown('#pTaskFrame', urlParams.pTask)) {
                setDisplayContainers('#pTaskFrame', urlParams.pTask);
            }
        }
        else  if (urlParams.process) {
            if (!isProcessAlreadyShown('#applicationsProcessView', urlParams.process)) {
                setDisplayContainers('#applicationsProcessView', urlParams.process);
            }
            $('#breadCrumbContainer').hide();
        }
    });

    // Since the event is only triggered when the hash changes, we need to trigger
    // the event now, to handle the hash the page may have loaded with.
    $(window).trigger( 'hashchange' );
}


/**
 * Return the current hashChange state (peek at the hashChange stack)
 *
 * @return {Object}
 */
function getStateCopy() {
    // Set the state!
    var state = {};
    var currentState = $.bbq.getState();
    if (currentState.navigationTabs) {
        state.navigationTabs = currentState.navigationTabs;
    }
    if (currentState.role) {
        state.role = currentState.role;
    }
    if (currentState.process) {
        state.process = currentState.process;
    }
    if (currentState.taskFile) {
        state.taskFile = currentState.taskFile;
    }
    if (currentState.pTask) {
        state.pTask = currentState.pTask;
    }

    return state;
}

/**
 * Push a new state onto the history stack.
 * The new state is the old state with the single attribute added or modified.
 *
 * @param attribute
 * @param value
 */
function pushState(attribute, value) {
    var state = getStateCopy();
    state[ attribute ] = value;
    $.bbq.pushState( state );
}

/**
 * True when the axvw displaySourceFile is the src attribute of the frame displayElementId
 *
 * @param displayElementId
 * @param displaySourceFile
 * @return {Boolean}
 */
function isTaskAlreadyShown(displayElementId, displaySourceFile) {
    var showing = false;
    var frameSrc = $(displayElementId).attr('src');
    if (frameSrc && frameSrc.lastIndexOf('/') > 0) {
        frameSrc = frameSrc.substr(frameSrc.lastIndexOf('/') + 1);
        if (frameSrc === displaySourceFile) {
			showing = true;
		}
    }

    return showing;
}

/**
 * True when the html displaySourceFile is the title attribute of the div displayElementId.
 * The div should then hold the html contained in the file.
 *
 * @param displayElementId
 * @param displaySourceFile
 * @return {Boolean}
 */
function isProcessAlreadyShown(displayElementId, displaySourceFile) {
    var showing = false;
    var frameSrc = $(displayElementId).attr('rel');
    if (frameSrc && frameSrc.lastIndexOf('/') > 0) {
        frameSrc = frameSrc.substr(frameSrc.lastIndexOf('/') + 1);
        if (frameSrc === displaySourceFile) {
			showing = true;
		}
    }

    return showing;
}
