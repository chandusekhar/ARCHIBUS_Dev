<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<xsl:template match="/">
		<html>	
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="Html-Head-Setting"/>
			<xsl:call-template name="LinkingCSS"/>

			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>

			<script language="JavaScript">
				function onPageLoad()
				{
					parent.document.forms[0].elements["showButton"].click();
				}
			</script>

			<xsl:call-template name="SetUpLocales"/>

		</head>

		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0" onload="onPageLoad();">

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
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	
</xsl:stylesheet>
