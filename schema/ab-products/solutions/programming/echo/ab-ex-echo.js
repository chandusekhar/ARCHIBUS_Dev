
var echoController = View.createController('echo', {
    
    afterViewLoad: function() {
        $('exEcho_instructions').innerHTML = getMessage('instructionText');
    },
    
    exEcho_testPanel_onEcho: function() {
        try {
            var result = Workflow.callMethod('AbSolutionsViewExamples-WSClientExamples-echo', 
                'http://www.mssoapinterop.org/asmx/simple.asmx', 'Hello World!');
            View.showMessage(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});