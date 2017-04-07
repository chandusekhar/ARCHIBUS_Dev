<?xml version="1.0"?>
<!-- ab-express-viewer-drawing-common.xsl -->
<!-- Templates used by Express Viewer drawing XSLT -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- Lists of default layers -->
  <xsl:variable name="blLayers">BL$;BL$TXT;</xsl:variable>
  <xsl:variable name="flLayers">FL$;FL$TXT;</xsl:variable>
  <xsl:variable name="rmLayers">RM$;RM$TXT;</xsl:variable>
  <xsl:variable name="altRmLayers">RM$;HL-TMP;</xsl:variable><!-- If room txt is published via dwg pub -->
  <xsl:variable name="grosLayers">GROS$;GROS$TXT</xsl:variable>
  <xsl:variable name="wallLayers">WA-EXT;WA;DR;WN;</xsl:variable>
  <xsl:variable name="servLayers">SERV$;SERV$TXT;</xsl:variable>
  <xsl:variable name="plLayers">PL-ELVTR;PL-MISC;PL-STAIR;PL-TOIL;</xsl:variable>
  <xsl:variable name="siLayers">SI-MISC;SI-TREE;SI-WALK;</xsl:variable>
  <xsl:variable name="parkingLayers">PARKING;PARKING$;PARKING$TXT;</xsl:variable>
  <xsl:variable name="parcelLayers">PARCEL;PARCEL$;PARCEL$TXT;</xsl:variable>
  <xsl:variable name="emLayers">EM$;EM$TXT;</xsl:variable>
  <xsl:variable name="hlRmLayers">HL-TMP;</xsl:variable>
  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
  <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>

  <!-- drawingPageHeader template
      Adds the page title, javascript events for Express Viewer, and javascript variables. -->
  <xsl:template name="drawingPageHeader">
    <xsl:param name="drawing_name" />
    <xsl:param name="targetView" />
    <xsl:param name="targetFrame" />
    <xsl:param name="targetTable" />
    <xsl:param name="layersOn" />
    <xsl:param name="layersOff" />
    <xsl:param name="drawingSuffix" />

   <!-- If drawing suffix wasn't supplied, assume '.dwf' -->
    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />

    <xsl:variable name="varDrawingSuffix">
    	<xsl:choose>
    		<xsl:when test="string-length($drawingSuffix) &gt; 0">
                  <xsl:value-of select="$drawingSuffix" />
                </xsl:when>
    		<xsl:otherwise>-abspacerminventoryb.dwf</xsl:otherwise>
        </xsl:choose>
    </xsl:variable>


        <title>
          <!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
          <!-- to generate <title /> if there is no title in source XML -->
          <xsl:value-of select="/*/title" /><xsl:value-of select="$whiteSpace" />
        </title>

        <!-- css and javascript files  -->
        <!-- These two styles are used to first hide the Express Viewer object
              before it loads the DWF, then show the object once the sheet is
              finished loading.  These styles are referenced in the javascript below.  -->
        <STYLE> .visShow { visibility:visible } .visHide { visibility:hidden } </STYLE>

        <!-- linking path must be related to the folder in which xml is being processed -->
        <!-- calling template LinkingCSS in common.xsl -->
        <xsl:call-template name="LinkingCSS" />
        <script language="JScript" type="text/jscript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/activateActiveX_onload.js"><xsl:value-of select="$whiteSpace" /></script>
        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>

       <xsl:call-template name="HighlightEvents"/>

       <script language="javascript" src="#Attribute%//@relativeFileDirectory%/ab-rm-change-dp-vacant-drawing-common.js"><xsl:value-of select="$whiteSpace" /></script>

        <!-- Create variables that will be used in javascript  -->
        <script language="javascript">
	  <xsl:call-template name="HighlightHandler_dv_dp">
                <xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
          </xsl:call-template>
          strTargetView = '<xsl:value-of select="$targetView"/>';
          strTargetFrame = '<xsl:value-of select="$targetFrame"/>';
          strTargetTable = '<xsl:value-of select="$targetTable"/>';
          strLayersOn = '<xsl:value-of select="$layersOn"/>';
          strLayersOff = '<xsl:value-of select="$layersOff"/>';
          strBaseDrawingName = '<xsl:value-of select="$drawing_name"/>';
          strDrawingName = '<xsl:value-of select="concat($projectDrawingsFolder,'/',$drawing_name,$varDrawingSuffix)"/>';
          strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
          strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
          var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';

       </script>
  </xsl:template>

  <!-- drawingBody template
        This template produces the HTML for the Express Viewer object.  The parameters are
        plugin height and width, and the source drawing name. -->
  <xsl:template name="drawingBody">
    <xsl:param name="drawing_name" />
    <xsl:param name="width" />
    <xsl:param name="height" />

      <body onload="loadDwfViewer('{$width}', '{$height}', '{$absoluteAppPath_expressViewer5}', '{$isDwfViewer7}');loadDrawing()" class="body" leftmargin="0" rightmargin="0" topmargin="0">
        <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
        <xsl:call-template name="table-group-title">
          <xsl:with-param name="title" select="/*/afmTableGroup/title" />
        </xsl:call-template>

        <table align="center" width="100%" valign="top" cellpadding="0">
          <tr>
            <td align="center">
              <!-- This loading text gives user feedback while the DWF loads
                   Its visibility is controled by the javascript. -->
              <div id="loadingMessage" class="visHide"><span translatable="true">Loading...</span></div>
              <!-- The Express Viewer ActiveX object is here -->
              <div id="dwfViewerControl"></div>
            </td>
          </tr>
          <tr>
            <!-- Help text -->
            <td id="instructionText" class="instruction" align="center">
              <!--  A message element with the name 'instructionText' should
                be present in the AXVW file.  -->
              <xsl:value-of select="//message[@name='instructionText']" />
              <span translatable="true" id="ab_express_viewer_drawing_strWarningMessage" name="ab_express_viewer_drawing_strWarningMessage" style="display:none">DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later.  If you are using a supported browser, contact your system administrator to install the Autodesk DWF Viewer.</span>
            </td>
          </tr>
          <tr>
            <xsl:call-template name="drawingLegend" />
          </tr>
        </table>
      </body>

  </xsl:template>

  <xsl:include href="../../../ab-system/xsl/ab-highlt-rmxdp-drawing-legend.xsl" />
  <xsl:include href="../../../ab-system/xsl/dwf-highlight/ab-dwf-highlight-common.xsl" />
</xsl:stylesheet>
