<?xml version="1.0"?>
<!-- ab-ex-property-holdings-by-status-chart.xsl for ab-ex-property-holdings-by-status-chart.axvw-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="svg-common">
	<xsl:param name="chart_view_name" /> 
		<!-- Variable to keep track of user's SVG support -->
		<script language="JavaScript">
			var hasSVGSupport = false;
		</script>
		<!-- VBScript to detect SVG plugin -->
		<script language="VBScript">
			On Error Resume Next
			hasSVGSupport = IsObject(CreateObject("Adobe.SVGCtl"))
		</script>
		<script language="JavaScript">
			function detectSVG()
			{
				var SVG_Area_object = document.getElementById("SVG");
				var SVG_Area_download_object = document.getElementById("SVG_download");
				//hasSVGSupport
				if(hasSVGSupport)
				{	
					SVG_Area_object.style.display="";
					SVG_Area_download_object.style.display="none";
				}
				else
				{
					SVG_Area_object.style.display="none";
					SVG_Area_download_object.style.display="";
				}
			}
			function downLoadSVG()
			{
				var AdobeSVGURL = "http://www.adobe.com/svg/viewer/install/";
				var newTargetWindowSettings = "titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=600,height=600";
				var newWindowObj= window.open(AdobeSVGURL, "SVG",newTargetWindowSettings); 
			}
		</script>
		<body  onload="detectSVG()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="//title"/>
			</xsl:call-template>	
			<div align="center" valign="top" id="SVG" style="display:none">
				<embed id="svgembed" height="90%" width="90%" pluginspage="http://www.adobe.com/svg/viewer/install/" type="image/svg+xml" src="{$schemaPath}/{$chart_view_name}"/> 
			</div>	
			<div align="center" valign="top" id="SVG_download" style="display:none">
				<a href="#" onclick="downLoadSVG(); return false;"><span  translatable="true">Adobe SVG Viewer Plugin is required, please click here to download it!</span></a>
			</div>	
		</body>	 
	</xsl:template>
</xsl:stylesheet>
