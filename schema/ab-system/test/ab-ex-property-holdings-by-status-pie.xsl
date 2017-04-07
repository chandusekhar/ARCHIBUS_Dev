<?xml version="1.0"?>
<!-- ab-ex-property-holdings-by-status-pie.xsl for ab-ex-property-holdings-by-status-pie.axvw-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../xsl/constants.xsl" />
  <xsl:template match="/">
	<xsl:variable name="owned_value" select="/*/afmTableGroup/dataSource/statistics/statistic[@name='owned']/@value"/>
	<xsl:variable name="leased_value" select="/*/afmTableGroup/dataSource/statistics/statistic[@name='leased']/@value"/>
	<xsl:variable name="subleased_value" select="/*/afmTableGroup/dataSource/statistics/statistic[@name='subleased']/@value"/>
	<xsl:variable name="total_value" select="round(number($owned_value)+number($leased_value)+number($subleased_value))"/>
	<xsl:variable name="status_title" select="//message[@name='status']"/>
	<xsl:variable name="area_title" select="//message[@name='area']"/>
	<svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" onload="OnLoadEvent(evt,{$total_value},{$owned_value div $total_value},{$leased_value div $total_value},{$subleased_value div $total_value})">
		<script language="javascript">
			owned_value='<xsl:value-of select="$owned_value"/>';
			leased_value='<xsl:value-of select="$leased_value"/>';
			subleased_value='<xsl:value-of select="$subleased_value"/>';
		</script>
		<title><xsl:value-of select="/*/title"/></title>
		<desc>
			Property Holdings by Status (Pie Chart)
		</desc>
		<!--text style="font-size:18; text-anchor:middle" x="120" y="15">
			<xsl:value-of select="/*/title"/>
		</text-->

		<g transform="translate(100,120) rotate(90)" >
			<g  id="owned" style="fill:blue" onmouseover='showDetail("Owned","{$status_title}","{$area_title}")' onmouseout='hideDetail()' onclick="showDetailAxvw('owned')">
				<path id="owned_path" d="" />
			</g>
			<g id="leased" style="fill:green" onmouseover='showDetail("Leased","{$status_title}","{$area_title}")' onmouseout='hideDetail()'  onclick="showDetailAxvw('leased')">
				<path id="leased_path" d="" />
			</g>
			<g id="subleased" style="fill:red" onmouseover='showDetail("Owned and Subleased","{$status_title}","{$area_title}")' onmouseout='hideDetail()'  onclick="showDetailAxvw('owned-subleased')">
				<path id="subleased_path" d="" />
			</g>
		</g>
		<g>
			<rect x="220" y="25" width="12" height="12" style="fill:blue" />
			<text x="240" y="35" style="font-size:12px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='owned']/title"/>: <xsl:value-of select="round(($owned_value div $total_value)*100)"/>%
			</text>
			<rect x="220" y="45" width="12" height="12" style="fill:green" />
			<text x="240" y="55" style="font-size:12px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='leased']/title"/>: <xsl:value-of select="round(($leased_value div $total_value)*100)"/>%
			</text>
			<rect x="220" y="65" width="12" height="12" style="fill:red" />
			<text x="240" y="75" style="font-size:12px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='subleased']/title"/>: <xsl:value-of select="round(($subleased_value div $total_value)*100)"/>%
			</text>
		</g>
		<!-- detail report -->
		<g>
			<text  id="instruction1" x="220" y="95"  style="fill:red;font-size:8px;fill-opacity:1;stroke:none;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of  select="//message[@name='instruction1']"/>
			</text>
			<text  id="instruction2" x="220" y="105"  style="fill:red;font-size:8px;fill-opacity:1;stroke:none;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of  select="//message[@name='instruction2']"/>
			</text>
			<text  id="detail_status" x="220" y="120"   display="none" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				Status:
			</text>
			<text  id="detail_area" x="220" y="130" display="none"  style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				Total Area:
			</text>
			
		</g>
	</svg>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
