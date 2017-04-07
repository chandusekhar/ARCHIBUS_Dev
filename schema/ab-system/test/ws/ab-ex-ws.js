var call = new WS.Call('/archibus/axis/BookingService');
function deleteBooking(){
   var ms_date1 = new Date();
   var qn_op = new WS.QName('deleteBooking');
   call.invoke_rpc( qn_op, [{name : 'aBookingId', value : '205'}], null,
   function(call, envelope){
      var result = getWSResponseResult(envelope);
      var d = (new Date()).getTime() - ms_date1.getTime();
      $('time1').innerHTML = d;  
      ms_date1 = new Date();  
      $('msContainer').innerHTML = result;
      d = (new Date()).getTime() - ms_date1.getTime();
      $('time2').innerHTML = d;
   }
   );
}
function getRooms(){
   var ms_date1 = new Date();
   var qn_op = new WS.QName('getRooms');
   call.invoke_rpc(qn_op, [], null,
   function(call, envelope){
      var result = getWSResponseResult(envelope);
      var d = (new Date()).getTime() - ms_date1.getTime();
      $('time1').innerHTML = d;
      ms_date1 = new Date();

      result = eval('(' + result + ')');
      var rooms = result.rooms;
      var table = "";
      for(var i = 0; i < rooms.length; i ++ ){
         table = table + "<tr><td>" + rooms[i].rm_id + "</td><td>" +rooms[i].rm_std +"</td><td>" + rooms[i].bl_id + "</td><td>" + rooms[i].fl_id + "</td><td>" + rooms[i].dv_id + "</td><td>" + rooms[i].dp_id +  "</td><td>"+rooms[i].rm_type+"</td></tr>"
      }
      $('msContainer').innerHTML = "<table align='center' width='100%'><tr><td>Room:</td><td>Room Standard:</td><td>Building:</td><td>Floor:</td><td>Division:</td><td>Department:</td><td>Room Type:</td></tr>" + table + "</table>";
      d = (new Date()).getTime() - ms_date1.getTime();
      $('time2').innerHTML = d;
   }
   );
}
function getWSResponseResult(envelope){
   return envelope.get_body().get_all_children()[0].get_all_children()[0].get_value();
}
