<?xml version="1.0" encoding="UTF-8"?>
<!-- processing actions in edit form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="EditForm_actions">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>
		
		<xsl:variable name="callingFunctionName" select="concat('callingValidatingForm','_',$afmTableGroupID)"/>
		<table align="center" width="100%">
			<tr align="center"><td>
				<xsl:for-each select="$afmTableGroup/afmAction">
					<xsl:variable name="type" select="@type"/>
					
					<xsl:choose>
						<!-- javascript variables and functions used here are in edit-forms.js -->
						<!-- going through form inputs validation -->
						<!-- be careful here: afmAction's type="render"==> Cancel? type="addNew"==> Add New? in XML-->
						<xsl:when test="$type != 'render' and $type != 'addNew'">
							<xsl:choose>
								<xsl:when test="$type='delete'">
									<xsl:if test="not(@enabled)">
										<!--input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='return onDelete("{$afmTableGroupID}","{@serialized}","_self",true)'/-->
									</xsl:if>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="$type='executeTransaction'">
											<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='return abProcessingSQLActionToServer("{$afmTableGroupID}","{@serialized}","_self")'/>
										</xsl:when>
										<xsl:otherwise>
											<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='return onSave("{$afmTableGroupID}","{@serialized}","_self",true)'/>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<!-- cancel and addnew will not validate the form -->
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="$type='addNew'">
									<xsl:if test="not(@enabled)">
										<!--input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='return onAddNew("{$afmTableGroupID}","{@serialized}","_self",false)'/-->
									</xsl:if>
								</xsl:when>
								<xsl:otherwise>
									<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='return onCancel("{$afmTableGroupID}","{@serialized}","_self",false)'/>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
			</td></tr>
		</table>
	</xsl:template>
</xsl:stylesheet>				   