<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- importing xsl files -->
  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">
    <html>
      <head>
        <title>
          <!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
          <!-- to generate <title /> if there is no title in source XML -->
          <xsl:value-of select="/*/title" />
          <xsl:value-of select="$whiteSpace" />
        </title>
        <!-- css and javascript files  -->
        <!-- linking path must be related to the folder in which xml is being processed -->
        <!-- calling template LinkingCSS in common.xsl -->
        <xsl:call-template name="LinkingCSS" />
        <!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
        <!-- <script .../> is not working in html -->
        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
          <xsl:value-of select="$whiteSpace" />
        </script>
	<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-available-rms-list.js">
          <xsl:value-of select="$whiteSpace" />
        </script>
      
      </head>
      <body  class="body" leftmargin="0" rightmargin="0" topmargin="0">
	 <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
	<xsl:call-template name="table-group-title">
	  <xsl:with-param name="title" select="/*/title" />
	</xsl:call-template>
	<table align="left" width="100%">
		<script language="javascript">
			loadingAvailableRoomsList();
		</script>
	</table>
      </body>
    </html>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
