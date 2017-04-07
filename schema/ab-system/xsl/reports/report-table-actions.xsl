<?xml version="1.0" encoding="UTF-8"?>
<!-- processing actions in report tables -->
<!-- javascript variables and functions used here are in reports.js -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ReportTable_actions">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="hasRowsSelectionAction" select="$afmTableGroup/rows/selection/afmAction"/>
		<xsl:variable name="hasTableAction" select="$afmTableGroup/afmAction[@eventName!='renderShowPrintablePdf']"/>
		<table width="100%" cellspacing="0" cellpadding="0">
		<xsl:if test="count($hasRowsSelectionAction) &gt; 0">
			<tr><td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Selection Actions</LEGEND>
					<table cellspacing="0" cellpadding="0" align="left">
						<tr align="left">
							<!-- showing actions by using html form buttons  -->
							<!-- javascript function sendingRequestToServer() will set up proper url for each action button -->
							<xsl:for-each select="$hasRowsSelectionAction">
								<xsl:variable name="selectionActionButtonID" select="generate-id()"/>
								<!-- arrSelectionActionButtonNames in reports.js -->
								<script language="javascript">
									var temp_array = new Array();
									temp_array[<xsl:value-of select="position()-1"/>]='<xsl:value-of select="$selectionActionButtonID"/>';
									arrSelectionActionButtonNames['<xsl:value-of select="$afmTableGroupID"/>']=temp_array;
								</script>
								<td align="left">
									<!-- sendingRequestToServer() in reports.js -->
									<input class="AbActionButtonFormStdWidth" type="button" disabled="true" name="{$selectionActionButtonID}" value="{title}" title="{title}" onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}",true);return true;'/>
								</td>
							</xsl:for-each>
						</tr>
					</table>
				</FIELDSET>
			</td></tr>
		</xsl:if>
		<xsl:if test="count($hasTableAction) &gt; 0">
			<tr align="center"><td align="center">
				<table cellspacing="0" cellpadding="0" align="center">
					<tr align="center">
						<!-- showing actions by using html form buttons  -->
						<!-- javascript function sendingRequestToServer() will set up proper url for each action button -->
						<xsl:for-each select="$hasTableAction">
							<td align="center">
                                                           <xsl:if test="@eventName!='AbProjectManagement-exportToMsProject' and @eventName!='AbProjectManagement-importClearTransactions' and @eventName!='AbProjectManagement-importPostTransactions'">
								<!-- sendingRequestToServer() in reports.js -->
								<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='sendingDataFromHiddenForm("", "{@serialized}", "{@frame}", "", false,"");return true;'/>
                                                          </xsl:if>
							</td>
						</xsl:for-each>
					</tr>
				</table>
			</td></tr>
		</xsl:if>
		</table>
	</xsl:template>
</xsl:stylesheet>
