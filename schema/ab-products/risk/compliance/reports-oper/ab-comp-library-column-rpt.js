/**
* Added for Compliance Document Lib report: second tab.
*
* @author Zhang Yi
*/
var abCompDocLibColumnRptController = View.createController('abCompDocLibColumnRptController',{

	/**
	 * Events Handler after column report is refreshed.
	 * For the document link in the columnReport,if the user or his role does not have security group, then remove the link (leave as static text). 
	 */
	abCompDocColumnReport_afterRefresh: function(){

		var securityGrup = this.abCompDocColumnReport.getFieldValue("docs_assigned.doc_review_grp");
		var docName = this.abCompDocColumnReport.getFieldValue("docs_assigned.doc");
		if(securityGrup && !View.user.isMemberOfGroup(securityGrup)){
			//remove link
			$('abCompDocColumnReport_docs_assigned.doc').innerHTML=docName;
		} 

	}
});