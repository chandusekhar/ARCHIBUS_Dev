<?xml version="1.0"?>
<!-- ab-su-highlt-vacant-drawing-legend.xsl -->
<!-- Templates used by Express Viewer drawing XSLT -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="drawingLegend">

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="hatchedFolder" select="concat(//preferences/@abSchemaSystemGraphicsFolder, '/hatchpatterns/')" />

     <!-- get hpattern field name -->
      <table align="center">
      <tr>
      <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record[@ls.ls_id='']) &gt; 0">
        <td class="AbHeaderLegend" width="50"> </td>
        <td class="AbHeaderLegend"><span translatable="true">Total Area</span></td>
        <td class="AbHeaderLegend"><span translatable="true">Count</span></td>
      </xsl:if>
      </tr>

      <xsl:variable name="mainTable" select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>


      <xsl:for-each  select="/*/afmTableGroup/dataSource/data/records/record[@ls.ls_id='']">
       <tr>

           <xsl:variable name="hpatternId" select="concat('hpattern', position())"/>
           <xsl:variable name="areaId" select="concat('area', position())"/>
           <xsl:variable name="countId" select="concat('count', position())"/>

           <!-- set hpattern color-->
           <td id="{$hpatternId}"> </td>
           <script language="javascript">
           var hpattern = parseColor('', 'hex');
           var hpatternId = 'hpattern' + '<xsl:value-of select="position()"/>';
           var hatched = getHatched('<xsl:value-of select="@ls.hpattern_acad"/>');
           var strDynamicHighlightd = '<xsl:value-of select="$isDynamicHighlights"/>';
           var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
           document.getElementById(hpatternId).bgColor=hpattern;
           if(hatched!='')
           {
               if(strDynamicHighlightd != 'true')
               {
                 var hatchPatternFolder = '<xsl:value-of select="$hatchedFolder"/>' + hatched.toLowerCase() + '.gif';
                 document.getElementById(hpatternId).background = hatchPatternFolder;
               }
           }
           </script>

           <!-- calculate the area and count -->
           <td class="AbDataLegend" align="right"><span id="{$areaId}"></span></td>
           <td class="AbDataLegend" align="right"><span id="{$countId}"></span></td>
           <script language="javascript">           
            var area = 0, count = 0;      
           <xsl:variable name="groupingSeparator" select="//preferences/locale/@groupingSeparator"/>
           <xsl:variable name="decimalSeparator" select="//preferences/locale/@decimalSeparator"/>    
           <xsl:variable name="lsCode" select="@ls.ls_id"/>
           <xsl:for-each  select="/*/afmTableGroup/dataSource/data/records/record[@ls.ls_id=$lsCode]">
           		<xsl:variable name="su_area_usable" select="translate(@su.area_usable, $decimalSeparator, '.')"/>            
               area = area + <xsl:value-of select="translate($su_area_usable,$groupingSeparator,'')"/>;
               count = count + 1;
            </xsl:for-each>   
             area = area.toFixed(<xsl:value-of select="/*/afmTableGroup/dataSource/data/fields/field[@name='area_usable']/@decimals" />);
             //XXX: localize area???
             var area1 = area.split(".")[0]; var area2 = area.split(".")[1];
             var rgx = /(\d+)(\d{3})/; while (rgx.test(area1)) {area1 = area1.replace(rgx, '$1' + '<xsl:value-of select="$groupingSeparator"/>' + '$2');}
             area = area1 + '<xsl:value-of select="$decimalSeparator"/>' + area2;  
             document.getElementById('<xsl:value-of select="$areaId"/>').innerHTML=area;
             while (rgx.test(count)) {count = count.replace(rgx, '$1' + '<xsl:value-of select="$groupingSeparator"/>' + '$2');}
             document.getElementById('<xsl:value-of select="$countId"/>').innerHTML=count;
           </script>

       </tr>
      </xsl:for-each>
      </table>
  </xsl:template>

</xsl:stylesheet>
