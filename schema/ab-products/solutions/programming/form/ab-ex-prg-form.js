
/**
 * Example controller class.
 */
var formController = View.createController('form', {
    
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        $('prgForm_instructions').innerHTML = getMessage('instructionStep1')
                                    + getMessage('instructionStep2')
                                    + getMessage('instructionStep3');
    }
});