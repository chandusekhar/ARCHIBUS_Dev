<?xml version="1.0"?>
<!-- ab-express-viewer-hlt-drawing.xsl -->
<!-- Template to generate a highlighted DWF view.  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- drawingHltPage template
      Take the passed parameters and construct the HTML for a highlighted
      Express Viewer drawing page. -->
  <xsl:template name="drawingHltPage">
    <xsl:param name="width" />
    <xsl:param name="height" />
    <xsl:param name="targetView" />
    <xsl:param name="targetFrame" />
    <xsl:param name="targetTable" />
    <xsl:param name="layersOn" />
    <xsl:param name="layersOff" />
    <xsl:param name="drawingSuffix"/>

    <xsl:variable name="drawing_node" select="/*/afmTableGroup/afmTableGroup/dataSource/data/records/drawing[position()=1]" />
    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />
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

  <!-- This XSL defines the templates above -->
  <xsl:include href="ab-express-viewer-drawing-common.xsl" />
</xsl:stylesheet>
