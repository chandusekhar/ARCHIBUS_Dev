/**
 * @author ZY
 */

//Guo added 2009-07-23 to fix KB3023605
var abSpDefEmStd_Control = View.createController('abSpDefEmStd_Control', {

    detailsPanel_afterRefresh: function(){
        this.detailsPanel.enableField("emstd.hpattern_acad", false);
		this.detailsPanel.enableFieldActions("emstd.hpattern_acad", true);
    }
});

/**
 * event handler when click the select value button for the field emstd.hpattern_acad
 */
function selectHpattern(){
    View.hpatternPanel = View.panels.get('detailsPanel');
	View.hpatternField = 'emstd.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('emstd.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

