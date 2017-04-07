<?xml version="1.0" encoding="UTF-8"?>
<!-- processing edit forms -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="EditForm">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>

		<xsl:variable name="afmTableGroupID" select="generate-id()"/>
		<!-- each tgrp will have a unqiue html form to handle its data inputs  -->
		<!-- javascript variables and functions used here are in edit-forms.js-->
		<script language="javascript">
			setupArrAllUsersInputFormNames('<xsl:value-of select="$afmTableGroupID"/>');
		</script>
		<!-- calling template SetUpFieldsInformArray in inputs-validation.xsl to use its template SetUpFieldsInformArray -->
		<xsl:call-template name="SetUpFieldsInformArray">
			<xsl:with-param name="fieldNodes" select="$afmTableGroup/dataSource/data/fields"/>
		</xsl:call-template>
		<!-- main edit form -->
		<!-- enctype="application/x-www-form-urlencoded; charset=utf-8" doesn't encode form's input values as UTF8 font at IE6 ??? -->
		<form name='{$afmTableGroupID}'><!-- enctype="application/x-www-form-urlencoded; charset=utf-8"-->			
			<table  width="100%"   border="0" cellspacing="0" cellpadding="0" align="center" valign="top">
				<!-- holding all fields in the form -->
				<tr valign="top"><td valign="top">
					<!-- calling template EditForm_data in edit-form-data.xsl-->
					<xsl:call-template name="EditForm_data">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
				</td></tr>
			</table>	
			<table class="bottomActionsTable">
				<!-- holding all action buttons on the form -->
				 <tr><td>
					<!-- calling template EditForm_actions in edit-form-actions.xsl-->
					<xsl:call-template name="EditForm_actions">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
				</td></tr>
			</table>
			<!--xsl:variable name="strCurrentRecordValues">
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=1]/@*">
					<xsl:value-of select="name(.)"/>="<xsl:value-of select="."/>"<xsl:value-of select="$whiteSpace"/>
				</xsl:for-each>
			</xsl:variable>
			<input name="Delete_CurrentRecord" id="Delete_CurrentRecord" type="hidden" value="{$strCurrentRecordValues}"/-->
		</form>
	</xsl:template>
	<!-- including xsl template files called this xsl -->
	<xsl:include href="edit-form-actions.xsl" />
	<xsl:include href="edit-form-data.xsl" />
</xsl:stylesheet>				   