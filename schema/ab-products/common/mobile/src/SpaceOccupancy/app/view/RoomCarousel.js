Ext.define('SpaceOccupancy.view.RoomCarousel', {
    extend: 'Common.view.navigation.Carousel',

    xtype: 'roomcarousel',

    config: {
        view: 'SpaceOccupancy.view.RoomSurvey',
        store: 'occupancyRoomSurveyStore'
    }
});