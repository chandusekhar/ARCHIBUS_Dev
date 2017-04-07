<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-ex-cfm-emerge-prep.xsl for ab-ex-cfm-emerge-prep.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script-->
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ex-cfm-emerge-prep.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body onload='openNoneAXVWFile()' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:value-of select="$whiteSpace"/>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>


