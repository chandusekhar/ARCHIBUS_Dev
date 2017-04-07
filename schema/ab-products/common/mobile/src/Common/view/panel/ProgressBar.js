Ext.define('Common.view.panel.ProgressBar', {
    extend: 'Ext.Container',
    requires: 'Common.control.ProgressBar',
    xtype: 'progressbarpanel',

    config: {
        centered: true,
        modal: true,
        progressBar: {},
        value: 0,
        maxValue: 100,
        cancelled: false,
        border: 0,
        cls: 'ab-progressbar-panel',
        progressMessage: null
    },

    applyProgressBar: function(config) {
        return Ext.factory(config, 'Common.control.ProgressBar', this.getProgressBar());
    },

    updateProgressBar: function(newBar) {
        if(newBar) {
            this.add(newBar);

            newBar.on({
                scope: this,
                cancel: this.onCancel,
                complete: this.onComplete
            });
        }
    },

    applyValue: function(config) {
        this.getProgressBar().setValue(config);
        return config;
    },

    applyMaxValue: function(config) {
        this.getProgressBar().setMaxValue(config);
        return config;
    },

    applyProgressMessage: function(config) {
        if(config) {
            this.getProgressBar().setProgressMessage(config);
        }
        return config;
    },

    getProgressMessage: function() {
        return this.getProgressBar().getProgressMessage();
    },

    increment: function() {
        var progressBar = this.getProgressBar();
        if(progressBar){
            progressBar.increment();
        }
    },

    onCancel: function() {
        this.setCancelled(true);
        this.getProgressBar().setValue(0);
        this.fireEvent('cancel', this);
    },

    onComplete: function() {
        this.getProgressBar().setValue(0);
        this.fireEvent('complete', this);
    }
});