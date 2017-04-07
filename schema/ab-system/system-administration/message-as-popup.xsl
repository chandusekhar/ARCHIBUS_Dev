<?xml version="1.0"?>
<!---
 Yong Shao
  3-30-2005
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/message-as-popup.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		 <xsl:variable name="message" select="//actionIn/result/@message"/>
		 <body onload='openPopupMessageWindow("{$message}")' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
	
		</body>
		</html>
	</xsl:template>

	
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


