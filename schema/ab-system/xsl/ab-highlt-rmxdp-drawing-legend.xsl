<?xml version="1.0"?>
<!-- ab-highlt-rmxdp-drawing-legend.xsl -->
<!-- Templates used by Express Viewer drawing XSLT -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="drawingLegend">

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="hatchedFolder" select="concat(//preferences/@abSchemaSystemGraphicsFolder, '/hatchpatterns/')" />

     <!-- get hpattern field name -->
      <table align="center">
      <tr>
      <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record[not(@dp.dp_id=preceding-sibling::record/@dp.dp_id) and @dp.dp_id!='']) &gt; 0">
        <td class="AbHeaderLegend" width="30"> </td>
        <td class="AbHeaderLegend">
          <xsl:value-of select="/*/afmTableGroup/dataSource/data/fields/field[@name='dv_id']/@singleLineHeading"/>
        </td>
        <td class="AbHeaderLegend">
          <xsl:value-of select="/*/afmTableGroup/dataSource/data/fields/field[@name='dp_id']/@singleLineHeading"/>
        </td>
        <td class="AbHeaderLegend"><span translatable="true">Total Area</span></td>
        <td class="AbHeaderLegend"><span translatable="true">Count</span></td>
      </xsl:if>
      </tr>

      <xsl:variable name="mainTable" select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
      <xsl:for-each  select="/*/afmTableGroup/dataSource/data/records/record[(not(@dp.dp_id=preceding-sibling::record/@dp.dp_id and @dp.dv_id=preceding-sibling::record/@dp.dv_id) and @dp.dp_id!='') or (not(preceding-sibling::record/@dp.dp_id='') and @dp.dp_id='')]">
       <tr>

           <xsl:variable name="hpatternId" select="concat('hpattern', position())"/>
           <xsl:variable name="areaId" select="concat('area', position())"/>
           <xsl:variable name="countId" select="concat('count', position())"/>

           <td id="{$hpatternId}"> </td>
           <td class="AbDataLegend">
             <xsl:if test="@dp.dv_id=''"><span translatable="true">No Devision</span></xsl:if>
             <xsl:if test="@dp.dv_id!=''"><xsl:value-of select="@dp.dv_id" /></xsl:if>
           </td>
           <td class="AbDataLegend">
             <xsl:if test="@dp.dp_id=''"><span translatable="true">No Department</span></xsl:if>
             <xsl:if test="@dp.dp_id!=''"><xsl:value-of select="@dp.dp_id" /></xsl:if>
           </td>
           <td class="AbDataLegend" align="right"><span id="{$areaId}"></span></td>
           <td class="AbDataLegend" align="right"><span id="{$countId}"></span></td>
           <script language="javascript">
           var hpattern = parseColor('<xsl:value-of select="@dp.hpattern_acad"/>', 'hex');
           var hpatternId = 'hpattern' + '<xsl:value-of select="position()"/>';
           var hatched = getHatched('<xsl:value-of select="@rmstd.hpattern_acad"/>');
           var strDynamicHighlightd = '<xsl:value-of select="$isDynamicHighlights"/>';
           var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';

           document.getElementById(hpatternId).bgColor=hpattern;
           if(hatched!=''){
               if(strDynamicHighlightd != 'true'){
                 var hatchPatternFolder = '<xsl:value-of select="$hatchedFolder"/>' + hatched.toLowerCase() + '.gif';
                 document.getElementById(hpatternId).background = hatchPatternFolder;
               }
           }
             var area = 0, count = 0;
           <xsl:variable name="dpCode" select="@dp.dp_id"/>
           <xsl:variable name="dvCode" select="@dp.dv_id"/>
           <xsl:for-each  select="/*/afmTableGroup/dataSource/data/records/record/keys[@dp.dp_id=$dpCode and @dp.dv_id=$dvCode]">
               area = area + parseFloat('<xsl:value-of select="@rm.area"/>');count = count + 1;
           </xsl:for-each>
           <!-- set total area and count -->
             var areaId = 'area' + '<xsl:value-of select="position()"/>';var decimals = '<xsl:value-of select="/*/afmTableGroup/dataSource/data/fields/field[@name='area']/@decimals"/>';document.getElementById(areaId).innerHTML=area.toFixed(decimals);var countId = 'count' + '<xsl:value-of select="position()"/>';document.getElementById(countId).innerHTML=count;
           </script>
       </tr>
      </xsl:for-each>
      </table>
  </xsl:template>

</xsl:stylesheet>
