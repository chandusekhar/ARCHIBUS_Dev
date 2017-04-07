/**
 * @author jll
 */

function selectHpattern(panelId, field){
	View.hpatternPanel = View.panels.get(panelId);
	View.hpatternField = field;
    View.patternString = View.hpatternPanel.getFieldValue(field);
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}