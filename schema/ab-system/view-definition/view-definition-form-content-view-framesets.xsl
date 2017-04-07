<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle the setup of view's frameset form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:variable name="framesets" select="'framesets'"/>
    <xsl:variable name="frameset_thumbnail" translatable="true">Frameset Thumbnail</xsl:variable>
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- css and javascript files  -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-framesets.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body" onload='setUpFramesetImage("{$afmInputsForm}","{$framesets}", null)' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<table valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='selectFrameset']"/>
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
			<table width="100%" valign="top">
				<tr valign="top"><td width="40%" valign="top">
					<!-- selecting frameset file from a list -->
					<FIELDSET>
						<LEGEND class="legendTitle" translatable="true">Framesets</LEGEND>
						<table align="center" height="275" valign="top">
							<tr valign="top"><td valign="top">
								<table valign="top">
									<tr valign="top"><td valign="top"  class="legendTitle">
										<span  translatable="true">Select one:</span>
									</td></tr>
									<tr valign="top"><td align="center" valign="top">
										<select  class="inputField_box"  id="{$framesets}" name="{$framesets}" onchange='setUpFramesetImage("","",this)'>
											<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
												<xsl:choose>
												<xsl:when test="@name=$afmTableGroup/dataSource/data/afmXmlView/fileCategory/@fileName">
													<option value="{@name}" selected="1"><xsl:value-of select="@name"/></option>
												</xsl:when>
												<xsl:otherwise>
													<option value="{@name}"><xsl:value-of select="@name"/></option>
												</xsl:otherwise>
												</xsl:choose>
											</xsl:for-each>
										</select>
									</td></tr>
								</table>
							</td></tr>
						</table>
					</FIELDSET>
				</td>
				<td  width="60%" height="250" valign="top">
					<!-- showing thumbnail image of selected frameset -->
					<FIELDSET>
						<LEGEND class="legendTitle" translatable="true">Thumbnail of Frameset</LEGEND>
						<table align="center" height="275" valign="top">
							<tr valign="top"><td class="legendContent" align="center" valign="top">
								<p translatable="true">Select a frameset that has as many frames as your view has table-groups.  Then press OK to go to the second step, where you assign a specific table-groups to each frame.</p>
							</td></tr>
							<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
								<tr valign="top" id="div_{@name}" style="display:none"><td align="center" valign="top">
									<!--div id="div_{@name}"-->
										<img alt="{$frameset_thumbnail}" height="124" width="164" src="{$abSchemaSystemFolder}/{./frameset/@thumbnail}"/>
									<!--/div-->
								</td></tr>
							</xsl:for-each>
						</table>
					</FIELDSET>
				</td>
			</tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


