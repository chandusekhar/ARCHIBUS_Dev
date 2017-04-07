/**
 * Controller for the HTML example view.
 */
View.createController('exHtml', {

    /**
     * Maps DOM events to event listeners. Each event is defined using the following format:
     *
     * 'eventName elementSelector': eventListenerFunction
     *
     * eventName is a valid DOM event name (see http://en.wikipedia.org/wiki/DOM_events for complete list).
     * elementSelector is a jQuery selector that specifies which DOM element or elements trigger the event (see http://api.jquery.com/category/selectors/).
     * eventListenerFunction is a function that will be called when the event is triggered.
     */
    events: {
        /**
         * When the user clicks on any <a> element that is inside an element with class 'workflowStep'.
         */
        'click .exWorkflowStep a': function(event) {
            View.alert('You clicked on step ' + event.target.id);
        },
        /**
         * When the user clicks on any <a> element that is inside an element with class 'workflowActions'.
         */
        'click .exWorkflowActions a': function(event) {
            View.alert('You clicked on action ' + event.target.id);
        }
    },

    /**
     * Sets additional UI state after all panels have finished initial data fetch.
     */
    afterInitialDataFetch: function() {
        // The HTML template for each workflow form title/arrow is defined in in ab-ex-html-templates.axvw.
        var template = View.templates.get('workflowSummaryTemplate');

            // Render the template and prepend the rendered HTML before the content of the form.
        template.render(testContext, this.workflowPanel.parentElement);
    }
});