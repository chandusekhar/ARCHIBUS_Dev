<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="addtionalLayers">
    <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
    <xsl:if test="$isDynamicHighlights!='true'">
      <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:for-each>
    </xsl:if>
  </xsl:variable>

  <xsl:template match="/">
    <xsl:call-template name="drawingPage">
      <xsl:with-param name="width">400</xsl:with-param>
      <xsl:with-param name="height">220</xsl:with-param>
      <xsl:with-param name="targetView">ab-occup-plans-details.axvw</xsl:with-param>
      <xsl:with-param name="targetFrame">assetDetailsFrame</xsl:with-param>
      <xsl:with-param name="targetTable">em</xsl:with-param>
      <xsl:with-param name="layersOn">EM;EM$;EM$TXT;RM;RM$;RM$TXT;WA;WA-CEN;WA-COL;WA-EXT;PL;PL-DSG;PL-ELVTR;PL-FIXT;PL-FURN;PL-HVAC;PL-MISC;PL-SITE;PL-STAIR;PL-TOIL;GROS$;<xsl:value-of select="$addtionalLayers"/></xsl:with-param>
      <xsl:with-param name="layersOff" />
    </xsl:call-template>
  </xsl:template>

  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-rmhlt.xsl" />

</xsl:stylesheet>
