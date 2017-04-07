<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-ex-load-visio-vsd.xsl for ab-ex-load-visio-vsd.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="openedFileName" select="'hq18.vsd'"/>
	<xsl:variable name="relativePath2VSDFile" select="concat($projectDrawingsFolder,'/',$openedFileName)"/>
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ex-load-visio-vsd.js"><xsl:value-of select="$whiteSpace"/></script>
			
		</head>
		<body onload='preparingLoad("{$relativePath2VSDFile}")' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="//title"/>
			</xsl:call-template>	
			<div>
				<!-- codebase="http://download.microsoft.com/download/visiostandard2002/vview10/1/w982kmexp/en-us/vviewer.exe" -->
				<!-- the SRC for VV_Viwer object must be like http://.../*.vsd or d:/.../*.vsd -->
				<!-- cannot be relative web root path like  /archibus/.../*.vsd -->
				<object classid="clsid:279D6C9A-652E-4833-BEFC-312CA8887857" 
					codebase="http://www.microsoft.com/downloads/details.aspx?familyid=8FAD9237-C0A7-4B80-A5DF-46CE54DAD2DF"
					id="VV_Viwer" width="100%" height="100%">
					<param name="BackColor" value="FAF0E6"/>
					<param name="AlertsEnabled" value="1"/>
					<param name="ContextMenuEnabled" value="1"/>
					<param name="GridVisible" value="0"/>
					<param name="HighQualityRender" value="1"/>
					<param name="PageColor" value="16777215"/>
					<param name="PageVisible" value="1"/>
					<param name="PropertyDialogEnabled" value="1"/>
					<param name="ScrollbarsVisible" value="1"/>
					<param name="ToolbarVisible" value="0"/>
					<!--param name="SRC" value="{@absoluteAppPath}/projects/hq/drawings/{$openedFileName}"/-->
					<param name="CurrentPageIndex" value="0"/>
					<param name="Zoom" value="-1"/>
				</object>
			</div>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>


