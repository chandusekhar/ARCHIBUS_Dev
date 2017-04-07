<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-clientside-sendout-links.xsl to send a axvw url link out -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- special xslt variables for this xslt -->

	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-clientside-sendout-links.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" onload='onPageLoaded("{/*/message}")' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:variable name="TGTitle" select="/*/title"/>
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="$TGTitle"/>
			</xsl:call-template>

			<table width="100%" valign="middle">
				<Form name="{$afmInputsForm}">
					<tr><td class="inputFieldLabel" align="left">
						<label for="to"><span translatable="true">Mail To:</span></label>
					</td></tr>
					<tr><td >
						<input class="inputField" type="text" id="to" title="Enter email address of Recipient" name="to" value="" size="45"/>
					</td></tr>
					<tr><td class="inputFieldLabel" align="left">
						<label for="cc"><span translatable="true">CC To:</span></label>
					</td></tr>
					<tr><td>
						<input class="inputField" type="text" id="cc" title="Enter email address of Copy To" name="cc" value="" size="45"/>
					</td></tr>
					<tr><td class="inputFieldLabel" align="left">
						<label for="subject"><span translatable="true">Subject:</span></label>
					</td></tr>
					<tr><td>
						<input class="inputField" type="text" id="subject" title="Enter email Subject" name="subject" value="{$TGTitle}" size="45"/>
					</td></tr>
					<tr><td class="inputFieldLabel" align="left">
						<label for="body"><span translatable="true">Message:</span></label>
					</td></tr>
					<tr><td>
						<textarea class="textareaABData" cols="45" rows="5" title="Enter email message" id="body" name="body"><xsl:value-of select="$whiteSpace"/></textarea>
					</td></tr>
					<tr><td>
						<table align="center"  class="bottomActionsTable">
							<tr><td align="center" >
								<table align="center" ><tr align="center" >
									<td nowrap="1" valign="bottom" ><input type="button" class="AbActionButtonFormStdWidth" value="{//afmAction[@name='ok']/title}" title="Submit email" onclick='var bFlag=sendMail(); if(bFlag) window.top.close(); return false;' /></td>
									<td nowrap="1" valign="bottom" ><input type="button" class="AbActionButtonFormStdWidth" value="{//afmAction[@name='cancel']/title}" title="Cancel and Close window" onclick='window.top.close();' /></td>
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
			<Form name="hiddenEmailForm" method="post"><xsl:value-of select="$whiteSpace"/></Form>
		</body>
		</html>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
	<xsl:include href="ab-actions-bar.xsl" />
</xsl:stylesheet>


