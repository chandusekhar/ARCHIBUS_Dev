<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-01-23 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:import href="../xsl/constants.xsl"/>
	<xsl:template match="/">
		<html>
			<head>
				<title>
					<xsl:value-of select="/*/title"/>
					<xsl:value-of select="$whiteSpace"/>
				</title>				
				<xsl:call-template name="helper_htmlHeader"/>
			</head>
			<body style="margin: 0px" onselectstart="return false;" oncontextmenu="return false;">
				<xsl:call-template name="common">
					<xsl:with-param name="title" select="/*/title"/>
					<xsl:with-param name="debug" select="//@debug"/>
					<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
					<xsl:with-param name="xml" select="$xml"/>
				</xsl:call-template>
				<xsl:apply-templates select="/*/afmTableGroup[@format='tabs']/tabs"/>
			</body>
		</html>
	</xsl:template>
	<!-- XXX: helper template for html header css and js content -->
	<xsl:template name="helper_htmlHeader">		
		<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/{$abCascadingStyleSheetFile}"/>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemFolder}/tabs/common-tabs.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/base/base.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/json/jsonrpc.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="/archibus/dwr/engine.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="/archibus/dwr/util.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="/archibus/dwr/interface/workflow.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-namespace.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-workflow.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-view.js"><xsl:value-of select="$whiteSpace"/></script>
        <script language="JavaScript" src="{$abSchemaSystemFolder}/../ab-core/views/ab-secure.js"><xsl:value-of select="$whiteSpace"/></script>
		<xsl:for-each select="//formatting/js">
			<xsl:variable name="customized_js" select="@file"/>
			<xsl:if test="$customized_js">
				<script language="JavaScript" src="{$customized_js}"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="//style[@type='text/css']">
			<xsl:copy-of select="."/>
		</xsl:for-each>
	</xsl:template>

	<xsl:include href="../xsl/common.xsl"/>
	<xsl:include href="ab-tabs-render-templates.xsl"/>
</xsl:stylesheet>
