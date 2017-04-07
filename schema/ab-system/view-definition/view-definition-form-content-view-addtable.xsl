<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle add table to view -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="tables" select="'tables'"/>
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-addtable.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body" onload='setSelectedTableName("{$afmInputsForm}","{$tables}",null)' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td aligh="center">
						<!-- instruction -->
						<table valign="bottom" aligh="center" width="100%">
							<tr valign="bottom"><td valign="bottom"  class="instruction">
							<p><xsl:value-of select="/*/afmTableGroup/message[@name='instruction']"/></p>				
							</td></tr>
						</table>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='addTableGroup']"/>
						<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
						<xsl:variable name="TYPE" select="1"/>
						<xsl:call-template name="ok-and-cancel">
							<xsl:with-param name="OK" select="$OK"/>
							<xsl:with-param name="CANCEL" select="$CANCEL"/>
							<xsl:with-param name="TYPE" select="$TYPE"/>
							<xsl:with-param name="newWindowSettings" select="''"/>
						</xsl:call-template>
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

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<table align="left">
			<tr><td align="left" style="color:navy; size:-1;">
				<span  translatable="true">Select one:</span>
			</td></tr>
			<tr><td align="left">
				<select  class="inputField_box"  id="{$tables}" name="{$tables}" onchange='setSelectedTableName("","",this)'>
					<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
						<option value="{@table}"><xsl:value-of select="@title"/></option>
					</xsl:for-each>
				</select>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


