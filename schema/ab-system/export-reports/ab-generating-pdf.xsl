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

				<table align="center" style="width: 90%; margin-top: 15px; margin-left: 50px;">
				<tr><td style="width: 60%; font-family: arial,geneva,helvetica,sans-serif; color: red;">
						<div style="font-weight: bold;"><xsl:value-of select="/*/title"/></div>
						<div style="font-size: 13px; margin-top: 10px; color: black;">
							You may return to your original browser window while this window is working.
							If no file appears, please <B>Cancel</B> the dialog box and install the Adobe PDF Reader using the following link.
						</div>
					</td>
					<td style="width: 40%; vertical-align: middle; align: center">
						<a style="font-size: 14px; font-weight: bold; color: blue" href="http://get.adobe.com/reader/">Download Adobe PDF Reader</a>
					</td>	
				</tr>
				</table>
			
			<script language="javascript">
			    if(opener!=null)
			     {
				  //only load once due to loading errors!!!
				  if(opener.loadingPdfGeneratingView)
				  {
					  sendingDataFromHiddenForm(opener.strPdfGeneratingViewUrl,opener.strPdfAfmActionSerialized,"","",false,"");
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


