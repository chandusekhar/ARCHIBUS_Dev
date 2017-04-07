
/**
 * Called by the <command type="callFunction"/> from the view.
 * The standard "context" parameter may contain following properties:
 * - message: the text message returned by the workflow rule;
 * - data: the JSON object returned by the workflow rule;
 * - any other values set by other commands in the chain.
 */
function afterApproveProject(context) {
    alert(context.message + ": " + context.data['project.project_id']);
}