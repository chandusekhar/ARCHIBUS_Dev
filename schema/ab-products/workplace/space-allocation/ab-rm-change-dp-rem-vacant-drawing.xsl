<?xml version="1.0"?>
<!-- ab-rm-change-dp-rem-vacant-drawing.xsl -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">

    <!-- Height and width for the Express Viewer plugin -->
    <xsl:variable name="width">400</xsl:variable>
    <xsl:variable name="height">210</xsl:variable>
    <!-- Specify the view file that will be loaded when a DWF URL is clicked -->
    <xsl:variable name="targetView">ab-rm-change-dp-rem-edit.axvw</xsl:variable>
    <!-- Specify the target frame for DWF URLs to load into.
          An empty targetFrame will cause a new window to be opened. -->
    <xsl:variable name="targetFrame">assetDetailsFrame</xsl:variable>
    <!-- The DWF URLs are a list of bl_id, fl_id and rm_id primary keys.
        This parameter specifies the table that those keys restrict for this view. -->
    <xsl:variable name="targetTable">rm</xsl:variable>
    <!-- This is a list of layers, separated by semi-colons, that should be ON.
          Other layers may be turned on or off by the XML afmTableGroup results,
          but the layers specified here will always be on. -->

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="dhlLayer" select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
    <xsl:variable name="dhlLayerUpper" select="translate($dhlLayer, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    <xsl:variable name="dhlRmLayers">
      <xsl:if test="$isDynamicHighlights='true'">Z-<xsl:value-of select="$dhlLayerUpper"/>-DHL;</xsl:if>
      <xsl:if test="$isDynamicHighlights!='true'">
        <!-- Highlight rooms with no assigned dv or dp -->
        <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record"><xsl:if test="string-length(@rm.dv_id)=0 or string-length(@rm.dp_id) = 0">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:if></xsl:for-each>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="layersOn">
      <xsl:value-of select="$rmLayers"/>
      <xsl:value-of select="$wallLayers"/>
      <xsl:value-of select="$servLayers"/>
      <xsl:value-of select="$plLayers"/>
      <xsl:value-of select="$dhlRmLayers"/>
    </xsl:variable>
    <xsl:variable name="layersOff"/>

    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

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

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="ab-rm-change-dp-vacant-drawing-common.xsl" />

</xsl:stylesheet>
