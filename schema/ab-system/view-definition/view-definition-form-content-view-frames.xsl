<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to set up frames for tgrps -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
    <xsl:variable name="tableGroup" translatable="true">Tablegroup</xsl:variable>
	<!-- special xslt variables used in this xslt -->
		
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-frames.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body  class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:variable name="varFrameRecords" select="/afmXmlView/afmTableGroup/dataSource/data/records"/>
							<xsl:for-each select="/afmXmlView/afmTableGroup/dataSource/data/afmXmlView/afmTableGroup">
								<xsl:call-template name="AfmTableGroup">
									<xsl:with-param name="afmTableGroup" select="."/>
									<xsl:with-param name="margin-left" select="'0'"/>
									<xsl:with-param name="frameRecords" select="$varFrameRecords"/>							
								</xsl:call-template>
						</xsl:for-each>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='selectFrame']"/>
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
		<xsl:param name="margin-left"/>
		<xsl:param name="frameRecords"/>
		<xsl:if test="count($afmTableGroup) &gt; 0">
			<xsl:call-template name="ContentWriter">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="margin-left" select="$margin-left"/>
				<xsl:with-param name="frameRecords" select="$frameRecords"/>	
			</xsl:call-template>

			<xsl:if test="count($afmTableGroup/afmTableGroup) &gt; 0">	
				<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
				<xsl:for-each select="$afmTableGroup/afmTableGroup">
					<xsl:call-template name="AfmTableGroup">
						<xsl:with-param name="afmTableGroup" select="."/>
						<xsl:with-param name="margin-left" select="$margin-left+1"/>
						<xsl:with-param name="frameRecords" select="$frameRecords"/>	
					</xsl:call-template>
				</xsl:for-each>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template name="ContentWriter">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="frameRecords"/>
		<table style='margin-left:{$margin-left*20}pt;'>
			<tr>
				<td><img alt="{$tableGroup}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-alterview-tgrp.gif"/></td>
				<td nowrap="1" class="legendContent"><xsl:value-of select="$afmTableGroup/title"/><span translatable="true" style="padding-left:4">inside the frame:</span></td>
				<td>
					<select  class="inputField">
						<xsl:for-each select="$frameRecords/record">
							<xsl:choose>
								<xsl:when test="$afmTableGroup/@frame=@name">
									<option value="{@name}" selected="1"><xsl:value-of select="@name"/></option>
								</xsl:when>
								<xsl:otherwise>
									<option value="{@name}"><xsl:value-of select="@name"/></option>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</select>
				</td>
			</tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />	
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


