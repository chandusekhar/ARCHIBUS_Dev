/**
 * A private utility class used by Common.view.navigation.Carousel to create custom indicators.
 * @private
 */
Ext.define('Common.view.navigation.CarouselIndicator', {
    extend: 'Ext.Container',
    xtype: 'commoncarouselindicator',

    config: {
        direction: 'horizontal',
        docked: 'bottom',
        cls: 'ab-carousel-navigation',

        layout: {
            type: 'hbox',
            align: 'center',
            pack: 'center'
        },

        // tap on these buttons is handled in Common.view.navigation.Carousel
        items: [
            {
                xtype: 'button',
                iconCls: 'arrow_left',
                itemId: 'previousButton',
                style: 'margin-right:10px'
            },
            {
                xtype: 'container',
                itemId: 'currentRecord',
                html: LocaleManager.getLocalizedString('1 of x', 'Common.view.navigation.CarouselIndicator')
            },
            {
                xtype: 'button',
                iconCls: 'arrow_right',
                itemId: 'nextButton',
                style: 'margin-left:10px'
            }
        ]
    },

    // @overwrite to not maintain the array of indicators that it is not useful for this custom carousel indicator
    addIndicator: function () {
    },

    // @overwrite to not maintain the array of indicators that it is not useful for this custom carousel indicator
    removeIndicator: function () {
    },

    setActiveIndex: function (index) {
        this.activeIndex = index;

        return this;
    }
});
