<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle select value XML data-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:text/><xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove <xsl:value-of select="$whiteSpace"/>, otherwise, Xalan will generate <script .../> instead of <script ...></script> -->
			<!-- <script .../> is not working in html -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script> 
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script> 
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>  
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/select-date-from-calendar.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- set up javascript variable for date local information(template in locale.xsl)-->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<body onload='Calendar.getDialog("{$abSchemaSystemGraphicsFolder}")' leftmargin="0" rightmargin="0" topmargin="0">
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
	
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
	<xsl:include href="locale.xsl" />
</xsl:stylesheet>