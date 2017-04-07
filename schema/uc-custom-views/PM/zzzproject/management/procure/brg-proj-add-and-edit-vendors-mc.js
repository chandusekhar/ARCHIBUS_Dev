var currentUser = null;

function user_form_onload()
{

	if (currentUser == null) {
		currentUser = getUserInfo();
	}

	var form = AFM.view.View.getControl('treeFrame','treePanel');

	if (currentUser.role_name != "UC-PMOADMIN") {
			form.buttons[0].style.display = 'none';
			form.buttons[0].previousSibling.style.display = 'none';
	}
	
}

function getUserInfo() {
	var user = null;
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getUser', {});
    if (result.code == 'executed') {
        user = result.data;
    } else {
        handleError('Could not obtain UserInfo', result);
    }
	
	return user;
}

function isMemberOfGroup(user, group)
{
	var numOfGroups = user.groups.length;
	
	var isMember = false;
	for (var i=0; i < numOfGroups; i++) {
		var groupName = user.groups[i];
		
		if (groupName == '%') {
			isMember = true;
			break;
		} else if (groupName == group) {
			isMember = true;
			break;
		} else if (groupName.substring(groupName.length-1) == '%' && groupName.substring(0, groupName.length-2) == group.substring(0, groupName.length-2)) {
			isMember = true;
			break;
		}
	}
	
	return isMember;
}