Ext.define('SpaceOccupancy.controller.Download', {
    extend: 'Space.controller.Download',


    /**
     * Override onDownloadFloorPlans to set the {#link Space.SpaceDownload#downloadFloorPlans}
     * appPlanTypeStoreId store name to 'spaceOccupancyPlanTypes'.
     */
    onDownloadFloorPlans: (function () {
        var isTapped = false;
        return function (level) {
            if (!isTapped) {
                isTapped = true;
                Space.SpaceDownload.downloadFloorPlans(level, this, true, false, 'spaceOccupancyPlanTypes');
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()

});