<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle add table to view -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="tables" select="'tables'"/>
	
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-password-send-out.js"><xsl:value-of select="$whiteSpace"/></script-->		
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/title"/>
			</xsl:call-template>
			<xsl:variable name="message" select="//afmTableGroup/dataSource/data/records/record/@message"/>
			<xsl:variable name="flag" select="substring-after($message,'success=')"/>
			<xsl:variable name="messageOut" select="//message[@success=$flag]"/>
				
			<table width="100%" height="100%" valign="middle">
				<Form name="{$afmInputsForm}">
					<tr><td class="inputFieldLabel">
						<xsl:value-of select="$messageOut"/>
					</td></tr>
					<tr><td height="10"></td></tr>
					<tr><td>
						<table  class="bottomActionsTable">
							<tr><td>
								<table><tr>
									<td nowrap="1" valign="bottom" ><input type="button" class="AbActionButtonFormStdWidth" value="{//afmAction[@name='close']/title}" onclick='window.top.close(); return false;' /></td>
								</tr></table>
							</td></tr>
						</table>
					</td></tr>
				</Form>
			</table>
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
	<xsl:include href="ab-actions-bar.xsl" />
</xsl:stylesheet>


