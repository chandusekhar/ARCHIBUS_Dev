Ext.define('Common.util.Instrumentation', {
    singleton: true,

    alternateClassName: ['Instrumentation'],

    config: {
        previousEventTime: 0,

        startTime: null,

        outputContainer: null
    },

    constructor: function (config) {
        this.initConfig(config);
    },


    displayOutput: function (output) {
        var me = this,
            container = me.getOutputContainer(),
            html, // = container.getHtml(),
            timestamp = Date.now(),
            startTime = me.getStartTime(),
            elapsedTime = me.calculateElapsedTime(startTime, timestamp),
            intervalTime = me.calculateIntervalTime(me.getPreviousEventTime(), timestamp);

        if(Ext.isEmpty(container)) {
            return;
        }
        html = container.getHtml();

        me.setPreviousEventTime(timestamp);

        html += '<div><strong>Elapsed(s): ' + elapsedTime + ' Interval(s) ' + intervalTime + '</strong> ' + output + '</div>';

        container.setHtml(html);

    },

    toConsole: function(output) {
        var me = this,
            timestamp = Date.now(),
            startTime = me.getStartTime(),
            elapsedTime = me.calculateElapsedTime(startTime, timestamp),
            intervalTime = me.calculateIntervalTime(me.getPreviousEventTime(), timestamp);

        me.setPreviousEventTime(timestamp);

        console.log('Elapsed(s): ' + elapsedTime + ' Interval(s) ' + intervalTime + ' ' + output);


    },

    calculateElapsedTime: function (startTime, currentTime) {
        return (currentTime - startTime) / 1000;

    },

    calculateIntervalTime: function(previousTime, currentTime) {
        if(previousTime === 0) {
            return 0;
        } else {
            return (currentTime - previousTime)/1000;
        }
    },


    resetEventTime: function () {
        this.setPreviousEventTime(0);
    },

    start: function (displayOutputWindow) {
        var me = this,
            outputPanel;

        me.setStartTime(Date.now());

        if(displayOutputWindow) {
            outputPanel = me.getOutputWindow();
            if (!outputPanel.getParent()) {
                Ext.Viewport.add(outputPanel);
            }
            me.setOutputContainer(outputPanel.down('#outputWindow'));
        }

    },

    end: function() {
        var startTime = this.getStartTime();
        // Display elapsed time
        this.displayOutput('Total Time(s): ' + (Date.now() - startTime)/1000);
        this.setPreviousEventTime(0);
        this.setStartTime(0);

    },

    getOutputWindow: function() {
        var panel = Ext.create('Ext.Panel', {
            width: '80%',
            height: '60%',
            modal: true,
            scrollable: true,
            hideOnMaskTap: true,
            left: '10%',
            top: '10%',
            float: true,
            items: [
                {
                    xtype: 'titlebar',
                    docked: 'top',
                    title: 'Output'
                },
                {
                    xtype: 'container',
                    html: '',
                    itemId: 'outputWindow',
                    styleHtmlContent: true
                }
            ]
        });

        return panel;

    }


});