<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle top table group form in view definition Forms -->
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
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-top-table.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<xsl:variable name="mdxAction" select="//afmTableGroup/afmAction[@type='getMdxPreferences']"/>
		<body onload='setUpType("{//afmTableGroup/@isRegularView}", "{$mdxAction/@serialized}", "{$mdxAction/@frame}", "{//afmTableGroup/@isAllowedEditViewAnalysis}")' class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			
			<table  width="100%">
				<form name="{$afmInputsForm}">
				<tr>
					<td align="left" valign="top">
                        <xsl:variable name="alter_view_image" translatable="true">Alter View Image</xsl:variable>
						<img alt="{$alter_view_image}" src="{$abSchemaSystemGraphicsFolder}/ab-form-alterview.gif" border="0"/>
						<script language="javascript">
							warningMessage="<xsl:value-of select="//message[@name='warningMessage']"/>";
						</script>
					</td>
					<td valign="top" align="left">
						<table align="left">
							<tr><td align="left">
								<form name="{$afmInputsForm}">
									<xsl:call-template name="AfmTableGroup">
										<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
									</xsl:call-template>
								</form>
							</td></tr>
						</table>
					</td>
					
				</tr>
				
				</form>
			</table>
			
			
			<xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction[@type!='selectType']"/>
			<table   align="center" class="bottomActionsTable">
				<tr  align="center"><td  align="center">
					<table  align="center" ><tr  align="center">
						<xsl:choose>
							<xsl:when test="count($ACTIONS) &gt; 0">
								<xsl:for-each select="$ACTIONS">
									<td nowrap="1" valign="bottom" class="AbActionButtonForm"><A style="cursor:hand" title="{title}" href="#" onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",false,""); return false;'><xsl:value-of select="title"/></A></td>
								</xsl:for-each>
							</xsl:when>
							<xsl:otherwise><td><br /></td></xsl:otherwise>
						</xsl:choose>
					</tr></table>
				</td></tr>
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
		<table align="left" border="0">
			<tr>
				<td class="legendTitle" translatable="true">Title:</td> 
				<td class="legendContent"><xsl:value-of select="$afmTableGroup/dataSource/data//afmTableGroup/title"/></td>
			</tr>
			<tr>
				<td class="legendTitle" translatable="true">Type:</td>
				<td class="legendContent">
					<xsl:variable name="tgrp_type" select="$afmTableGroup/dataSource/data//afmTableGroup/@type"/>
					<xsl:value-of select="//types/type[@name=$tgrp_type]/title"/>
				</td>
			</tr>
			<tr>
				<td class="legendTitle" translatable="true">Frame:</td> 
				<td class="legendContent"><xsl:value-of select="$afmTableGroup/dataSource/data//afmTableGroup//@frame"/></td>
			</tr>
			
			<tr id="RV_VA_AREA">
				<xsl:variable name="selectTypeAction" select="//afmTableGroup/afmAction[@type='selectType']"/>
				<td class="legendTitle">
					<input type="radio" name="selectType" id="RV" onclick="onSelectRV(this,'{$selectTypeAction/@serialized}')"/>
					<span translatable="true">View</span>
				</td>
				<td class="legendTitle">
					<input type="radio" name="selectType" id="VA" onclick="onSelectVA(this,'{$selectTypeAction/@serialized}')"/>
					<span translatable="true">View Analysis</span>
				</td> 
			</tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


