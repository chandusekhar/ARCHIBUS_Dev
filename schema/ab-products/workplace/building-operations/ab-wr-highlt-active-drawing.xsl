<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">
    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

    <xsl:call-template name="drawingHltPage">
      <xsl:with-param name="width">450</xsl:with-param>
      <xsl:with-param name="height">350</xsl:with-param>
      <xsl:with-param name="targetView">ab-wr-highlt-active-details.axvw</xsl:with-param>
      <xsl:with-param name="targetFrame" />
      <xsl:with-param name="targetTable">wr</xsl:with-param>
      <xsl:with-param name="layersOn">GROS$;GROS$TXT;RM$;RM$TXT;Z-RM-DHL</xsl:with-param>
      <xsl:with-param name="layersOff" />
      <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-hlt-drawing-byowner.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-wr-highlt-active-drawing-legend.xsl" />

</xsl:stylesheet>
