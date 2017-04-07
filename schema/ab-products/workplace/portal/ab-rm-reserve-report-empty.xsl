<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
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
	<xsl:value-of select="$whiteSpace" />
      </body>
    </html>
  </xsl:template>
  
  <!-- include XSL files that contain templates used above -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
