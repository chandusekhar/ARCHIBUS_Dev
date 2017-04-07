<?xml version="1.0"?>
<!-- Yong Shao -->
<!-- 12-13-2004 -->
<!-- handling the XML of View Analysis: 1D???? -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
			<!-- to generate <title /> if there is no title in source XML -->
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- template: Html-Head-Setting in common.xsl -->
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!--link rel="stylesheet" type="text/css" href="../style/abcascadingstylesheet-slate.css"/-->
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<xsl:for-each select="//afmTableGroup/dataSource/data/charts/chart">
				<xsl:copy-of select="map"/>
			</xsl:for-each>
		</head>

		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>

			<xsl:call-template name="top_table">
				<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>


	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
	<xsl:include href="ab-view-analysis-template.xsl"/>
</xsl:stylesheet>


