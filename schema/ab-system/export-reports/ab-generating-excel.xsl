<?xml version="1.0" encoding="UTF-8"?>
<!---
 Yong Shao
  4-13-2005
-->
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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
			<table align="center" valign="middle" width="100%">
		                <tr  align="center">
					<td align="center" height="5%"><br /></td>
				</tr>
				<tr  align="center">
					<td align="center" style="padding-left:10;padding-right:10;font-size:16;font-family:arial,geneva,helvetica,sans-serif;color:red">
						<p><xsl:value-of select="/*/title"/></p>
					</td>	
				</tr>
			</table>
			<script language="javascript">
			    if(opener!=null)
			     {
				  //only load once due to loading errors!!!
				  if(opener.loadingExcelGeneratingView)
				  {
					  sendingDataFromHiddenForm("",opener.strExcelAfmActionSerialized,"","",false,"");
				  }else{
					  self.close();
				  }
			     }
			</script>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


