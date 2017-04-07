/**
 * Floor Plan controller. This controller should be used along with the {@link Floorplan.view.FloorPlan} view
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.controller.FloorPlan', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            floorplanView: 'floorplanpanel',
            svgComponent: 'svgcomponent'
        },

        control: {
            svgComponent: {
                beforesvgload: 'onBeforeSvgLoad',
                aftersvgload: 'onAfterSvgLoad'
            }
        }
    },


    onBeforeSvgLoad: Ext.emptyFn,

    onAfterSvgLoad: Ext.emptyFn
});
