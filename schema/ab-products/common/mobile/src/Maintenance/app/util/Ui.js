/**
 * Holds common UI functions
 *
 * @author Cristina Moldovan
 * @since 21.3
 */
Ext.define('Maintenance.util.Ui', {
    alternateClassName: ['UiUtil'],

    singleton: true,

    formatHours: function (hours_straight, hours_over, hours_double) {
        var totalHours = hours_straight + hours_over + hours_double;
        return this.formatHour(totalHours);
    },

    formatHour: function (hour) {
        return Common.util.Format.formatNumber(hour, 2);
    }
});