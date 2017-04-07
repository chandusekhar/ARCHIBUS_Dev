/**
 * Avoid conflict between 2 definitions of $.fn.tabs()
 *
 * Rename the jQuery Tools tabs plugin in situ.
 * Load the jQuery Tools Tabs JavaScript file, then load this little patcher.
 * Allows the subsequent load of jQueryUI ( which also defines tabs() ) to be happy.
 *
 *
 *  load jQuery plugins in the following order, using the appropriate directories and file names:
 *
 *   <script src="/js/jquery.js"></script>
 *   <script src="/js/jquery.tools.min.js"></script>
 *   <script src="/js/jquery.tools.tabs-renamer.js"></script> <!-- this patcher -->
 *   <script src="/js/jquery-ui.min.js"></script>
 *
 */

(function($) {
    // Rename the tabs in-place.
    $.fn.fpTabs = $.fn.tabs;
    delete $.fn.tabs;
})(jQuery);

