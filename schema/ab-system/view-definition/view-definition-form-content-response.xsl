<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-ex-load-ppt.xsl for ab-ex-load-ppt.axvw-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<table align="center" valign="middle">
				<tr><td style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;color:red">
					<p><xsl:value-of select="/*/title"/></p>
				</td></tr>
			</table>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


