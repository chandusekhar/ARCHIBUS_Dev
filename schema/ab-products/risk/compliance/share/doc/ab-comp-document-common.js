/**
* Added for Compliance Document Grid and Form configuration.
*
* @author Zhang Yi
*/
var abCompDocCommonController = View.createController('abCompDocCommonController',{


	/**
	 * Set the grid cell content of doc field to be rewritten after being filled;
	 * @inherit
	 */
	customAfterCreateCellContentForDoc: function(row, column, cellElement) {

		var value = row[column.id];
		//for doc cell that with value
		if (column.id == 'docs_assigned.doc' && value != '')	{
			// keep or remove link from doc cell depending on whether doc's review group and current user's group is match
			var securityGrup = row["docs_assigned.doc_review_grp"];
			if(securityGrup && !View.user.isMemberOfGroup(securityGrup)){
				var contentElement = cellElement.childNodes[0];
				cellElement.innerHTML = value;
			}
		}
	}
});