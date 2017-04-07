<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle view definition Form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:variable name="alter_view_image" translatable="true">Alter View Image</xsl:variable>
				    
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-tree.js"><xsl:value-of select="$whiteSpace"/></script>	
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottommargin="0">
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	

			<table valign="top" width="100%">
				<tr><td valign="top">
					<Form name="{$afmInputsForm}">
						<!-- passing root element(afmXmlView) to process -->
						<xsl:call-template name="AfmXmlView">
							<xsl:with-param name="afmView" select="afmXmlView/afmTableGroup/dataSource/data/afmXmlView"/>
							<xsl:with-param name="margin-left" select="0"/>
							<xsl:with-param name="parentViewName" select="''"/>
							<xsl:with-param name="parentViewNameNoSpaces" select="''"/>
						</xsl:call-template>
					</Form>
				</td></tr>
			</table>
			<div>
				<!-- instruction  -->
				<table valign="bottom" width="100%" height="50%">
					<tr valign="bottom"><td valign="bottom"  class="instruction">
						<UL>
							<LI>
								<xsl:value-of select="/*/afmTableGroup/message[@name='instruction1']"/>
							</LI>
							<LI>
								<xsl:value-of select="/*/afmTableGroup/message[@name='instruction1a']"/>
							</LI>
							<LI>
								<xsl:value-of select="/*/afmTableGroup/message[@name='instruction2']"/>	
							</LI>
							<LI>
								<xsl:value-of select="/*/afmTableGroup/message[@name='instruction3']"/>		
							</LI>
						</UL>
					</td></tr>
				</table>
			</div>
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

	<!-- xsl template: AfmXmlView -->
	<xsl:template name="AfmXmlView">
		<xsl:param name="afmView"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="parentViewName"/>
		<xsl:param name="parentViewNameNoSpaces"/>

		<xsl:variable name="afmViewNameNoSpaces" select="translate($afmView/@name,' /\*%+-.','')"/>
		<xsl:variable name="ID_parentViews">
			<xsl:if test="$parentViewName!=''">
				<xsl:value-of select="concat($parentViewName,'_')"/>
			</xsl:if>
			<xsl:value-of select="$afmView/@name"/>
		</xsl:variable>
	
		<div ID="{$ID_parentViews}">
			<!-- processing the view information of current afmXmlView  -->
			<table valign="top" style="margin-left:{$margin-left}pt;" nowrap="1">
			<tr nowrap="1" valign="top">
				<td valign="top" >
					<A href="#" style="cursor:hand" onclick='sendingDataFromHiddenForm("","{$afmView/afmAction/@serialized}","{$afmView/afmAction/@frame}","{$afmView/afmAction/subFrame/@name}",false,""); return false;' title="{$afmView/afmAction/title}" ><img alt="{$alter_view_image}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-alterview-view.gif" border="0"/></A>
				</td>
				<td nowrap="1" valign="top" class="alterViewTreeNodeTitles">
					<A href="#" onclick='sendingDataFromHiddenForm("","{$afmView/afmAction/@serialized}","{$afmView/afmAction/@frame}","{$afmView/afmAction/subFrame/@name}",false,""); return false;' title="{$afmView/afmAction/title}" ><xsl:value-of select="$afmView/title"/></A>
				</td>
			</tr>
			</table>
			
			<!-- processing all afmTableGroups of current afmXmlView  -->
			<xsl:for-each select="$afmView/afmTableGroup">
				<xsl:call-template name="AfmTableGroup">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+25"/>
					<xsl:with-param name="parentName" select="$ID_parentViews"/>
					<xsl:with-param name="parentNameNoSpaces" select="$afmViewNameNoSpaces"/>
				</xsl:call-template>
			</xsl:for-each>
		
			<!-- recursively to process all sub afmXmlViews -->
			<!--xsl:for-each select="$afmView/afmXmlView">
				<xsl:call-template name="AfmXmlView">
					<xsl:with-param name="afmView" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+25"/>
					<xsl:with-param name="parentViewName" select="$ID_parentViews"/>
					<xsl:with-param name="parentViewNameNoSpaces" select="$afmViewNameNoSpaces"/>
				</xsl:call-template>
			</xsl:for-each-->
		</div>
	</xsl:template>

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="parentName"/>
		<xsl:param name="parentNameNoSpaces"/>

		<xsl:variable name="tgrpNameNoSpaces" select="translate($afmTableGroup/@name,' /\*%+-.','')"/>
		<xsl:variable name="visibleFields">
			<xsl:for-each select="$afmTableGroup/dataSource/database/fields/field">
				<xsl:value-of select="concat(@table,'.',@name)"/><xsl:text>;</xsl:text>
			</xsl:for-each>
		</xsl:variable>
		<!-- processing afmTableGroup -->
		<table valign="top" id="{$parentName}_{$afmTableGroup/@name}" style="margin-left:{$margin-left}pt;" nowrap="1">
			<tr nowrap="1" valign="top">
				<td  valign="top" >
					<A href="#" style="cursor:hand" onclick='sendingDataFromHiddenForm("","{$afmTableGroup/afmAction/@serialized}","{$afmTableGroup/afmAction/@frame}","{$afmTableGroup/afmAction/subFrame/@name}",false,""); if(window.top.frames[0].currentTgrpFormat!=null)window.top.frames[0].currentTgrpFormat="{$afmTableGroup/@format}"; return false;' title="{$afmTableGroup/afmAction/title}" ><img alt="{$alter_view_image}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-alterview-tgrp.gif" border="0"/></A>
				</td>
				<td nowrap="1" valign="top" class="alterViewTreeNodeTitles">
					<A href="#"  onclick='sendingDataFromHiddenForm("","{$afmTableGroup/afmAction/@serialized}","{$afmTableGroup/afmAction/@frame}","{$afmTableGroup/afmAction/subFrame/@name}",false,"");  if(window.top.frames[0].currentTgrpFormat!=null)window.top.frames[0].currentTgrpFormat="{$afmTableGroup/@format}"; return false;' title="{$afmTableGroup/afmAction/title}" ><xsl:value-of select="$afmTableGroup/title"/></A>
				</td>
			</tr>
		</table>
		
		<!-- processing all afmTableGroups of current tgrp  -->
		<xsl:for-each select="$afmTableGroup/afmTableGroup">
			<xsl:call-template name="AfmTableGroup">
				<xsl:with-param name="afmTableGroup" select="."/>
				<xsl:with-param name="margin-left" select="$margin-left+25"/>
				<xsl:with-param name="parentName" select="@name"/>
				<xsl:with-param name="parentNameNoSpaces" select="$tgrpNameNoSpaces"/>
			</xsl:call-template>
		</xsl:for-each>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


