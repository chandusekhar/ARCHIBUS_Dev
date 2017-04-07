<?xml version="1.0"?>
<!-- ab-vv-markup-drawing.xsl -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Lists of default layers -->
  <xsl:variable name="emLayers">EM$;EM$TXT;</xsl:variable>
  <xsl:variable name="rmLayers">RM$;RM$TXT;</xsl:variable>
  <xsl:variable name="grosLayers">GROS$;GROS$TXT</xsl:variable>
  <xsl:variable name="wallLayers">WA-EXT;WA;DR;WN;</xsl:variable>
  <xsl:variable name="servLayers">SERV$;SERV$TXT;</xsl:variable>
  <xsl:variable name="plLayers">PL-ELVTR;PL-MISC;PL-STAIR;PL-TOIL;</xsl:variable>
  <xsl:variable name="blLayers">BL$;BL$TXT;BL;</xsl:variable>
  <xsl:variable name="siLayers">SI-MISC;SI-TREE;SI-WALK;</xsl:variable>
  <xsl:variable name="parkingLayers">PARKING;PARKING$;PARKING$TXT;</xsl:variable>
  <xsl:variable name="parcelLayers">PARCEL;PARCEL$;PARCEL$TXT;</xsl:variable>
  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="dhlRmLayers">
     <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
     <xsl:if test="$isDynamicHighlights!='true'">
          <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record"><xsl:if test="@rm.dv_id=//preferences/@em_dv_id  and @rm.dp_id=//preferences/@em_dp_id">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:if></xsl:for-each>
     </xsl:if>
  </xsl:variable>
  <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
  <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">

    <!-- Height and width for the Express Viewer plugin -->
    <xsl:variable name="width">540</xsl:variable>
    <xsl:variable name="height">400</xsl:variable>

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />

    <xsl:variable name="layersOn">
      <xsl:value-of select="$rmLayers"/>
      <xsl:value-of select="$wallLayers"/>
      <xsl:value-of select="$servLayers"/>
      <xsl:value-of select="$plLayers"/>
      <xsl:value-of select="$dhlRmLayers"/>
    </xsl:variable>

    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />

    <xsl:variable name="varDrawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

    <html>
      <head>
        <xsl:call-template name="DWF_HTML_HEADER"/>

        <script language="javascript" src="{$abSchemaSystemJavascriptFolder}/ab-voloview-drawing.js">
          <xsl:value-of select="$whiteSpace" />
        </script>

	<xsl:variable name="emailTo" select="//message[@name='emailTo']" />
	<xsl:variable name="emailSubject" select="//message[@name='emailSubject']" />
	<xsl:variable name="emailBody" select="//message[@name='emailBody']" />


        <!-- Create variables that will be used in javascript  -->
        <script language="javascript">
	// Email settings
	var strCADEmail = '<xsl:value-of select="$emailTo" />';
	var strEmailSubject = '<xsl:value-of select="$emailSubject" />';
	var strEmailBody = '<xsl:value-of select="$emailBody" />';

        var strTargetView = '';
         var strTargetFrame = '';
        var strTargetTable = '';
        var strLayersOn = '<xsl:value-of select="$layersOn"/>';
        var strLayersOff = '';
        var strBaseDrawingName = '<xsl:value-of select="$drawing_name"/>';
        var strDrawingName = '<xsl:value-of select="concat($projectDrawingsFolder,'/',$drawing_name,$varDrawingSuffix)"/>';
        var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
        var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
        </script>
      </head>

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
                <xsl:call-template name="DWF_HTML_STRINGS" />
            </td>
          </tr>
          <tr><td align="center">
		<form name="{$afmInputsForm}">
	          	<input type="button" value="Email Redmarks" onClick="DoEmailRedmarks(); return false;"  />
		</form>
          </td></tr>
        </table>
      </body>

	<form name="hiddenEmailForm" method="get"><xsl:value-of select="$whiteSpace"/></form>

    </html>

  </xsl:template>


  <xsl:include href="../../../ab-system/xsl/common.xsl" />
   <xsl:include href="../../../ab-system/xsl/dwf-highlight/ab-dwf-highlight-common.xsl" />
</xsl:stylesheet>
