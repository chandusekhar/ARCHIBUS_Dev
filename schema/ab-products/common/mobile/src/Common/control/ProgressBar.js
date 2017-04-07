/**
 * @author Jeff Martin
 * @since 21.1
 *
 *  Progress Bar component that displays the progress of an operation.
 *
 *  Displaying a Progress Bar
 *
 *      if (!this.progressView) {
 *			this.progressView = Ext.create('Common.view.panel.ProgressBar', {
 *               value: 0,
 *               maxValue: 100,
 *           });
 *           Ext.Viewport.add(this.progressView);
 *      }
 *        this.progressView.show();
 *
 */

Ext.define('Common.control.ProgressBar', {
    extend: 'Ext.Component',
    xtype: 'progressbar',

    /**
     * @event complete
     * Fires when the process is complete.
     * @param {Common.control.ProgressBar} this The ProgressBar control
     */

    /**
     * @event cancel
     * Fires when Cancel button is tapped.
     * @param {Common.control.ProgressBar} this The ProgressBar control
     */

    config: {
        baseCls: 'x-progressbar',

        /**
         * @cfg {Number} value The current value of the progress bar indicator
         */
        value: 0,

        /**
         * @cfg {Number} maxValue The maximum value for the progress bar indicator
         */
        maxValue: 100,

        /**
         * @cfg {Boolean} cancelled. Set to true when the process using the progress bar is cancelled.
         */
        cancelled: false,

        /**
         * @cfg {String} progressMessage The message displayed on the progress bar. The first placeholder displays the
         *      value property. The second placeholder field displays the maxValue property. The value property
         *      is updated when the progress bar is incremented.
         */
        progressMessage: LocaleManager.getLocalizedString('Loading Item {0} of {1}', 'Common.control.ProgressBar')
    },

    template: [
        {
            tag: 'div',
            reference: 'label',
            cls: 'x-progressbar-label'
        },
        {
            tag: 'div',
            reference: 'progress',
            cls: 'x-progressbar-progress',
            children: [
                {
                    tag: 'span',
                    reference: 'indicator'
                }
            ]
        },
        {
            tag: 'div',
            cls: 'x-progress-button-container',
            children: [
                {
                    tag: 'div',
                    reference: 'cancelBtn',
                    cls: 'x-progress-button'
                }
            ]
        }
    ],

    initialize: function () {
        var me = this,
            cancelMessage = LocaleManager.getLocalizedString('Cancel', 'Common.control.ProgressBar');

        me.setCancelled(false);
        me.doMessage();

        me.cancelBtn.setHtml(cancelMessage);
        me.cancelBtn.on({
            scope: this,
            tap: 'onCancel'
        });
    },

    updateMaxValue: function (newMaxValue) {
        if (newMaxValue) {
            this.doMessage();
        }
    },

    /**
     * Increments the progress indicator value. Updates the status label.
     */
    increment: function () {
        var me = this,
            value = me.getValue(),
            max = me.getMaxValue(),
            indicatorValue;

        me.setValue(value += 1);

        indicatorValue = Math.ceil((value / max) * 100);

        this.indicator.setStyle('width', indicatorValue + '%');
        me.doMessage();

        if (value === max) {
            me.onComplete();
        }
    },

    onCancel: function () {
        this.setCancelled(true);
        this.fireEvent('cancel', this);
    },

    onComplete: function () {
        this.setValue(0);
        this.indicator.setStyle('width', '0%');
        this.fireEvent('complete', this);
    },

    doMessage: function () {
        var maxValue = this.getMaxValue(),
            value = this.getValue(),
            progressMessage = this.getProgressMessage();

        this.label.setHtml(Ext.String.format(progressMessage, value, maxValue));
    }
});
