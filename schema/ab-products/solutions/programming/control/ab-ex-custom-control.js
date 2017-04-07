
var exampleController = View.createController('example', {

    customControl: null,

    /**
     * Creates 2nd custom control instance.
     * 1st control instance is created automatically based on AXVW definition.
     */
    afterViewLoad: function() {
        var configObject = new Ab.view.ConfigObject();
        configObject['onShowDetails'] = this.displayUserEmail.createDelegate(this);
        
        this.customControl = new Ab.examples.UserInfo('customControl_userInfoJs', configObject);
    },
    
    /**
     * Event handler for the Display User Email button in both control instances.
     */
    displayUserEmail: function(event) {
        alert('User email: ' + this.customControl.userInfo.email);
    }
    
});