<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../xsl/constants.xsl" />
    <xsl:template match="/">
    <html>
      <title>
        <xsl:value-of select="/*/title" />
        <xsl:value-of select="$whiteSpace" />
      </title>
      <head>
		<xsl:call-template name="LinkingCSS" />
      </head>
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
	<table align="center" valign="middle" width="100%">
		   <tr  align="center">
			<td align="center" height="5%"><br /></td>
		    </tr>
		    <tr  align="center">
			<td align="center" style="padding-left:10;padding-right:10;font-size:16;font-family:arial,geneva,helvetica,sans-serif;color:red">
				<span translatable="true">You don't have permission to edit this table group!</span>
			</td>	
		    </tr>
	</table>
      </body>
    </html>
  </xsl:template>
  
  <!-- include XSL files that contain templates used above -->
  <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
