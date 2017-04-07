Ext.define('WorkplacePortal.util.PlansHighlight', {

    alternateClassName: 'WorkplacePlansHighlight',

    singleton: true,

    /**
     * plan type codes (must match values of the active_plantypes.plan_type table field)
     */
    planTypes: {
        RESERVATIONS: '11 - RESERVATIONS',
        HOTELING: '12 - HOTELING',
        LOCATE_EM: '13 - LOCATE EM',
        LOCATE_RM: '14 - LOCATE RM',
        MY_DEPT_SPACE: '15 - MY DEPT SPACE'
    },

    updateSitePlanHighlight: function (blRecords) {
        blRecords.each(function (record) {
            var blElement = Ext.fly(record.get('bl_id')),
                currentFill;

            if(blElement) {
                currentFill = blElement.getStyle('fill');
                if (currentFill !== 'yellow') {
                    blElement.set({defaultFill: currentFill});
                }
                blElement.setStyle('fill', 'yellow');
                blElement.set({modified: true});
            }

        });
    },

    updateFloorPlanHighlight: function (rmRecords, view) {
        var eventHandlers;
        rmRecords.each(function (record) {
            var roomCode = record.getRoomId(),
                rmElement = Ext.fly(roomCode),
                currentFill;

            if (rmElement) {
                currentFill = rmElement.getStyle('fill');

                if (currentFill !== 'yellow') {
                    rmElement.set({defaultFill: currentFill});
                }
                rmElement.setStyle('fill', 'yellow');
                rmElement.set({modified: true});
                rmElement.set({highlighted: true});
            }
        });

        // add the click event handler to the highlighted room assets
        eventHandlers = Space.SpaceFloorPlan.getRoomEventHandlerConfig(view);
        view.addEventToHighlightedAssets(eventHandlers);
    }
});