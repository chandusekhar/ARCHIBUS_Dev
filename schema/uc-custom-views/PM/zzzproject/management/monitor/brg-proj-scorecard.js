//Displays remaining project/work_pkgs for the selected cell
function MoreProjects(ActivityType, strSerialized, form_id, sIndex, cIndex, ActivityName)
{

	ActivityName = ActivityName.replace(/ABBCCCZBKABBCCCZBK/g,"','");
	ActivityName = ActivityName.replace(/ABBCCCZBK/g,"'");

	if (ActivityType =='project') {
		sTablename = "brg_project_view"
	}
	else 
	{		
		sTablename = "work_pkgs"
	}
	
	var sFieldname;
	if (sTablename == 'work_pkgs' )	
	{sFieldname='work_pkg_id'} else {sFieldname=sTablename + '_id'}

	
	var strXMLData = "";
	strXMLData += '<restrictions>';
	strXMLData += '<restriction type="sql" sql="' + sFieldname + ' IN (' + ActivityName + ')">';
	strXMLData += '<field table="' + sTablename + '"/>';
	strXMLData += '</restriction>';
	strXMLData += '</restrictions>';


	//strSerialized = insertRenderedAXVWFile2AfmAction(strSerialized, "ab-proj-" + sTablename + ".axvw");

	//alert(sTablename);
	var ActivityWindowName		= sTablename;
	// The Activity form fits in approx 660x675 box
	var ActivityWindowSettings	= "toolbar=no,menubar=no,resizable=no,scrollbars=yes,status=yes,width=600,height=500";
	var ActivityWindow			= window.open("", ActivityWindowName,ActivityWindowSettings);
	sendingAfmActionRequestWithClientDataXMLString2Server(ActivityWindowName, strSerialized, strXMLData);

}


//Displays an individual project/work_pkg
function DisplaySelected(reportName, pkey, ActivityType, projectId)
{  	
		var ActivityWindowSettings	= "toolbar=no,menubar=no,resizable=no,scrollbars=yes,status=yes,width=600,height=500";
		var ActivityWindow			= window.open("", "DetailWindow",ActivityWindowSettings);

		pkey = escape(pkey);
		pkey = pkey.replace(/\+/g, '%2B');
		projectId = escape(projectId);
		projectId = projectId.replace(/\+/g, '%2B');
		if (ActivityType == 'project') 
		{
			ActivityWindow.location.href=reportName+"?handler=com.archibus.config.Find&brg_project_view.project_id="+pkey;
		}
		else
		{
				ActivityWindow.location.href=reportName+"?handler=com.archibus.config.Find&brg_project_view.project_id="+projectId+"&work_pkgs.work_pkg_id="+pkey;
		}	
}

function filterValuesWorkPkgs()
{
	if (trim($('brg_project_View.project_id').value) == "") 
	{
		var messageElement = $('general_warning_message_empty_required_fields');
		if (messageElement) alert(messageElement.innerHTML);			
		return;	
	}
	renderView('brg-proj-work-packages-scorecard-mdx.axvw','detailsFrame');
}
