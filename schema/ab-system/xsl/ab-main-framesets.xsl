<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	
	<xsl:template match="/">
		<html lang="EN">	
			<!-- linking necessary javascript files  -->
			<xsl:variable name="abSchemaSystemJavascriptFolder" select="//*/@abSchemaSystemJavascriptFolder"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- since XML(XSLT) is case-sensitive, handle two possiblities: element's name: FRAMESET or frameset is used in axvw -->
			<xsl:copy-of select="//FRAMESET"/>
			<xsl:copy-of select="//frameset"/>
		</html>
	</xsl:template>
</xsl:stylesheet>


