<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle view definition Form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-top-view.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body"  leftmargin="0" rightmargin="0" topmargin="0">
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<table width="100%">
				<tr><td width="25%" align="left" valign="top">
				    <xsl:variable name="alter_view_image" translatable="true">Alter View Image</xsl:variable>
					<img alt="{$alter_view_image}" src="{$abSchemaSystemGraphicsFolder}/ab-form-alterview.gif" border="0"/>
				</td>
				<td width="75%" valign="top">
					<form name="{$afmInputsForm}">
						<xsl:call-template name="AfmTableGroup">
								<xsl:with-param name="afmXmlView" select="//afmXmlView/afmTableGroup/dataSource/data/afmXmlView"/>
								<xsl:with-param name="afmTableGroup" select="//afmXmlView/afmTableGroup"/>
						</xsl:call-template>
					</form>
				</td></tr>
			</table>
			<!-- template: all-actions is in ab-actions-bar.xsl -->
			<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
			<xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction"/>
			<xsl:variable name="TYPE" select="0"/>
			<xsl:call-template name="all-actions">
				<xsl:with-param name="ACTIONS" select="$ACTIONS"/>
				<xsl:with-param name="TYPE" select="$TYPE"/>
				<xsl:with-param name="newWindowSettings" select="''"/>
			</xsl:call-template>
	
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
	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmXmlView"/>
		<xsl:param name="afmTableGroup"/>
		<table align="left">
			<tr>
				<td class="legendTitle"  translatable="true">Title:</td>
				<td class="legendContent"><xsl:value-of select="$afmXmlView/title"/></td>
			</tr>
			<tr>
				<td class="legendTitle" translatable="true">Hotlist:</td>
				<td class="legendContent"><xsl:value-of select="$afmXmlView/hotlist"/></td>
			</tr>
			<tr>
				<td class="legendTitle"  translatable="true">Access:</td>
				<td  class="legendContent"><xsl:value-of select="$afmXmlView/access"/></td>
			</tr>
			<tr>
				<td class="legendTitle"  translatable="true">Frameset:</td> 
				<td class="legendContent"><xsl:value-of select="$afmXmlView/frameset"/></td>
			</tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


