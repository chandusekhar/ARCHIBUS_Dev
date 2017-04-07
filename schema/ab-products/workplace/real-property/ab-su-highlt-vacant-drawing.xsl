<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">

    <xsl:variable name="additionalLayers">GROS$;GROS$TXT;SU$;SU$TXT;</xsl:variable>

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="highlightLayers">
      <xsl:if test="$isDynamicHighlights!='true'">
        <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-SU-HL-<xsl:value-of select="@su.bl_id" />-<xsl:value-of select="@su.fl_id" />-<xsl:value-of select="@su.su_id" />;</xsl:for-each>
      </xsl:if>
      <xsl:if test="$isDynamicHighlights='true'">Z-SU-DHL;</xsl:if>
    </xsl:variable>

    <xsl:variable name="width">400</xsl:variable>
    <xsl:variable name="height">350</xsl:variable>
    <xsl:variable name="targetView">ab-su-highlt-vacant-details.axvw</xsl:variable>
    <xsl:variable name="targetFrame"/>
    <xsl:variable name="targetTable">su</xsl:variable>
    <xsl:variable name="layersOn">
    	<xsl:value-of select="$wallLayers" />
    	<xsl:value-of select="$servLayers" />
    	<xsl:value-of select="$plLayers" />
    	<xsl:value-of select="$additionalLayers" />
    	<xsl:value-of select="$highlightLayers" />
    </xsl:variable>
    <xsl:variable name="layersOff"/>
    <xsl:variable name="drawingSuffix">-abrplmleasesuites.dwf</xsl:variable>

    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@su.dwgname" />
    <html>
      <head>

        <!-- Generate header info and javascript handlers -->
        <xsl:call-template name="drawingPageHeader">
          <xsl:with-param name="drawing_name" select="$drawing_name"/>
          <xsl:with-param name="targetView" select="$targetView"/>
          <xsl:with-param name="targetFrame" select="$targetFrame"/>
          <xsl:with-param name="targetTable" select="$targetTable"/>
          <xsl:with-param name="layersOn" select="$layersOn"/>
          <xsl:with-param name="layersOff" select="$layersOff"/>
          <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
        </xsl:call-template>
      </head>

      <!-- Generate the plugin HTML -->
      <xsl:call-template name="drawingBody">
          <xsl:with-param name="drawing_name" select="$drawing_name"/>
          <xsl:with-param name="width" select="$width"/>
          <xsl:with-param name="height" select="$height"/>
      </xsl:call-template>

    </html>

  </xsl:template>

  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-common-byowner.xsl" />
  <xsl:include href="ab-su-highlt-vacant-drawing-legend.xsl" />
</xsl:stylesheet>
