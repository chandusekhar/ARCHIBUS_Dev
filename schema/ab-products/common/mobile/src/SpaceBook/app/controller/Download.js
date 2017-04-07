/**
 * Controller class for the Space Book Download features
 * Handles events and processes required to download floor plans
 * @author
 * @since 21.1
 */
Ext.define('SpaceBook.controller.Download', {
    extend: 'Space.controller.Download',


    /**
     * Override onDownloadFloorPlans to set the {#link Space.SpaceDownload#downloadFloorPlans}
     * applySecurityGroups function to true.
     */
    onDownloadFloorPlans: (function () {
        var isTapped = false;
        return function (level) {
            if (!isTapped) {
                isTapped = true;
                Space.SpaceDownload.downloadFloorPlans(level, this, true, true, 'spaceBookPlanTypes');
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()

});