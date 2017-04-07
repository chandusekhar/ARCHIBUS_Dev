/**
 * Controller for the Operation Console.
 */
var opsExpressConsoleCtrl =  View.createController('opsExpressConsoleCtrl', {

	/**
	 * Role name, possible values: client|approver|step completer|supervisor|craftsperson.
	 */
	roleName : null,

	/**
	 * Initialize the controller state.
	 */
	afterViewLoad : function() {
		this.roleName = getConsoleRoleName();
	}
	
});