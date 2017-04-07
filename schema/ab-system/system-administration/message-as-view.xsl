<?xml version="1.0"?>
<!-- Yong Shao
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
		</head>
		 <xsl:variable name="message" select="//actionIn/result/@message"/>
		 <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<table align="center" valign="middle" width="100%">
		                <tr  align="center">
					<td align="center" height="5%"><br /></td>
				</tr>
				<tr  align="center">
					<td align="center" style="padding-left:10;padding-right:10;font-size:16;font-family:arial,geneva,helvetica,sans-serif;color:red">
						<p><xsl:value-of select="$message"/></p>
					</td>	
				</tr>
			</table>
		</body>
		</html>
	</xsl:template>

	
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


