/**
 * Controller for the Occurrence Chart example.
 */
View.createController('exOccurrenceChart', {

    /**
     * Maps DOM events to event listeners.
     */
    events: {
        'click .exWorkflowStep a': function(event) {
            View.alert('You clicked on step ' + event.target.id);
        }
    },

    /**
     * Displays the chart.
     */
    afterInitialDataFetch: function() {
        var template = View.templates.get('occurrenceTemplate');
        template.render(this.getData(), this.chart.parentElement);

        this.highlightTimelineCells(1, 0, 24, '#6588F0');

        this.highlightTimelineCells(2, 19, 19.75, '#E24161');
        this.highlightTimelineCells(2, 20, 20.25, '#E24161');
        this.highlightTimelineCells(2, 21.25, 22, '#E24161');

        this.highlightTimelineCells(3, 0, 0.25, '#1AE57F');
        this.highlightTimelineCells(3, 8, 8.25, '#1AE57F');
        this.highlightTimelineCells(3, 9, 9.5, '#1AE57F');
        this.highlightTimelineCells(3, 14.25, 14.5, '#1AE57F');
        this.highlightTimelineCells(3, 16.25, 16.5, '#1AE57F');
        this.highlightTimelineCells(3, 22, 22.25, '#1AE57F');

        this.highlightTimelineCells(4, 9, 9.25, '#537AC0');

        this.highlightTimelineCells(5, 19, 20, '#A261DF');
        this.highlightTimelineCells(5, 20.25, 20.5, '#A261DF');

        this.highlightTimelineCells(6, 10.25, 14, '#FFA500');
        this.highlightTimelineCells(6, 19, 19.5, '#FFA500');
        this.highlightTimelineCells(6, 20.25, 20.5, '#FFA500');
        this.highlightTimelineCells(6, 21.25, 21.5, '#FFA500');

        this.highlightTimelineCells(7, 0, 10, '#C686D5');

        this.showCurrentHour(12.25);
    },

    /**
     * Highlights timeline cells.
     * @param ruleId
     * @param hourStart
     * @param hourEnd
     * @param color
     */
    highlightTimelineCells: function(ruleId, hourStart, hourEnd, color) {
        var timelineCells = jQuery('#' + ruleId).children('.timeline');
        var highlightCells = timelineCells.slice(hourStart * 4, hourEnd * 4);
        highlightCells.css('background-color', color);
    },

    showCurrentHour: function(hour) {
        _.each(jQuery('.occurrenceChart').find('tr'), function(row) {
            var timelineCells = jQuery(row).children('.timeline');
            var highlightCell = timelineCells.slice(hour * 4, hour * 4 + 1);
            highlightCell.append('<div class="currentTime"></div>');
        });
    },

    /**
     * Retrieves data used to build the chart HTML.
     */
    getData: function() {
        var data = {
            sites: [
                {
                    name: 'Atlanta',
                    rules: [
                        {id: '1', name: 'Temp Sensor Failure', duration: '24hr', target: 'RTU-1 Discharge Temp'}
                    ]
                },
                {
                    name: 'Boston',
                    rules: [
                        {id: '2', name: 'AHU Cool/Heat Mode Cycling', duration: '1.75hr', target: 'RTU-1'},
                        {id: '3', name: 'AHU Fan Short Cycling', duration: '1.75hr', target: '(2)'},
                        {id: '4', name: 'AHU On and Fan Off', duration: '0.25hr', target: 'RTU-2'},
                        {id: '5', name: 'AHU Outside Damper Stuck Open', duration: '1hr', target: 'RTU-1'}
                    ]
                },
                {
                    name: 'Los Angeles',
                    rules: [
                        {id: '6', name: 'KW Exceeds Target', duration: '4.5hr', target: 'ElecMeter-Main'},
                        {id: '7', name: 'Lights On and Unoccupied', cost: '$24.00', duration: '10hr', target: 'Main Lights Zone-B'}
                    ]
                }
            ],
            hours: []
        };

        var formatHours = function(h) {
            var ampm = h >= 12 ? 'p' : 'a';
            h = h % 12;
            h = h ? h : 12; // the hour '0' should be '12'
            return h + ampm;
        }

        for (var h = 0; h < 24; h++) {
            data.hours.push({
                time: formatHours(h),
                class: h % 2 == 0 ? 'even' : 'odd'
            });
        }

        return data;
    }
});