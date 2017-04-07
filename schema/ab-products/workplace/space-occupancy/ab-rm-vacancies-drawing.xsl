<?xml version="1.0"?>
<!-- ab-rm-vacancies-drawing.xsl -->
<!-- XSLT for ab-rm-vacancies-drawing.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">
    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

    <!-- drawingHltPage is defined in ab-express-viewer-drawing.xsl -->
    <xsl:call-template name="drawingHltPage">
      <!-- Height and width for the Express Viewer plugin -->
      <xsl:with-param name="width">400</xsl:with-param>
      <xsl:with-param name="height">220</xsl:with-param>
      <!-- Set target parameters -->
      <xsl:with-param name="targetView" >ab-rm-vacancies-details.axvw</xsl:with-param>
      <xsl:with-param name="targetFrame" >assetDetailsFrame</xsl:with-param>
      <xsl:with-param name="targetTable" >rm</xsl:with-param>
      <!-- Set visible layers -->
      <xsl:with-param name="layersOn">
        <xsl:value-of select="$rmLayers"/>
        <xsl:value-of select="$wallLayers"/>
        <xsl:value-of select="$servLayers"/>
        <xsl:value-of select="$plLayers"/>
        <xsl:value-of select="$dhlRmLayers"/>
      </xsl:with-param>
      <!-- No layers forced off. -->
      <xsl:with-param name="layersOff" />
      <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
    </xsl:call-template>
  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-hlt-drawing.xsl" />

</xsl:stylesheet>
