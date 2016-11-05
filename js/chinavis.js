var width=1280,height=720;
var svg=d3.select("body").append("svg").attr("width",width).attr("height",height).attr("class","svg").attr("id","svg");
var client_group_pos=[width/2,height/2-100],server_group_pos=[width/2-300,height/2-100];
var server_array=[];
var dataset,index=0;


//client-g
var proto_flow_side=[
		{"proto":"http","color":"yellow","flow":0},
		{"proto":"http_proxy/http_connect","color":"Orange","flow":0},
		{"proto":"ssl","color":"FireBrick","flow":0},
		{"proto":"ssh","color":"Lime","flow":50000},
		{"proto":"dec_rpc","color":"Olive","flow":30000},
		{"proto":"ftp_control/ftp_data","color":"Aqua","flow":120000},
		{"proto":"other","color":"#CCC","flow":0}
	]
var g_client=svg.append("g").attr("class","g_client").attr("transform", "translate(" + client_group_pos[0]+ "," + client_group_pos[1] + ")rotate("+(-45)+")");
//server-g
var g_server=svg.append("g").attr("class","g_server").attr("transform", "translate(" + server_group_pos[0]+ "," + server_group_pos[1] + ")rotate("+(-150)+")");
//time-g
var g_time=svg.append("g").attr("class","time").attr("transform","translate("+(server_group_pos[0])+","+(server_group_pos[1]-120)+")")
var time_tip=g_time.append("text").attr("class","time_tip").attr("fill","#3399FF").attr("font-size",20).attr("cursor","default").attr("stroke-width","1").style("font-weight","bold")
var stream_temp=[];
var client_root,server_root;
var g_down=svg.append("g").attr("class","g_down").attr("transform","translate("+100+","+(height-200)+")")
var last_point=[0,100];
var g_side=svg.append("g").attr("class","g_side").attr("transform","translate("+(width-330)+","+10+")")
loadfile();
show_side();
show_tip();
function loadfile(){
	var url="data/day30_inner";
	d3.tsv(url,function(error,data){
		if(error){
			console.log(error);
		}
		dataset=data;
		//starttime=dataset[index].time.substring(13,14);
		show_client();
		show_server();
		show_down_axis("30");
		show_proto_group();
		
		
	})
}
function show_client(){
	d3.json("data/client.json",function(error,root){
		client_root=root;
		var tree_client=d3.layout.tree()
			.size([270,height/2-200])
			.separation(function(a,b){
				return (a.parent==b.parent?1:2)/a.depth;
			})
		var diagonal=d3.svg.diagonal.radial()
			.projection(function(d){
				return [d.y,d.x/180*Math.PI];
			});
		var nodes=tree_client.nodes(client_root);
		var links=tree_client.links(nodes);
		var link=g_client.selectAll("path.client_link")
			.data(links).enter().append("path")
			.attr("class",function(d){
				return "client_"+d.target.name.split(".")[0]+"_"+d.target.name.split(".")[1]+"_X_X";
			})
			.attr("id","tree_line")
			.attr("fill","none")
			.attr("stroke","#ccc")
			.attr("stroke-width",0.2)
			.attr("d",diagonal)
		var node=g_client.selectAll(".node_client")
			.data(nodes).enter().append("g")
			.attr("class","node_client")
			.attr("transform", function(d) { return "rotate(" + (d.x -90) + ")translate(" + d.y + ")"; })
		node.append("circle").attr("r",4.5)
			.attr("class",function(d){
				if(d.depth!=0){
					return "client_"+d.name.split(".")[0]+"_"+d.name.split(".")[1]+"_X_X";
				}
				else{
					return d.name;
				}
			})
			.attr("stroke","steelblue")
			.attr("stroke-width",1.5)
			.attr("fill","white")
			.attr("id","tree_node")
			.on("mouseover",function(d){
				var tip_tool=d;
				d3.select("g.g_tip").remove();
				var position = d3.mouse(document.getElementById("svg"));
				var g_tip=svg.append("g")
					.attr("class","g_tip")
					.attr("transform","translate("+(position[0]+20)+","+(position[1]+20)+")")
					.append("text")
					.attr("fill","#3399FF")
					.attr("cursor","default")
					.attr("stroke-width","1")
					.style("font-weight","bold")
					.text(function(d){
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						return "ip:"+tip_tool.name;
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						return "pc-nums:"+tip_tool.nums;
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						for(var i=0;i<client_root.children.length;++i){
							if(tip_tool.name==client_root.children[i].name){
								return "traffic:"+client_root.children[i].flow;
							}
						}
					})
				})
				.on("mouseout",function(d){
					d3.select("g.g_tip").remove();
				})
		node.append("text")
			.attr("dy",".31em")
			.attr("fill","white")
			.attr("font-size","15px")
			.attr("text-anchor",function(d){
				return d.x<180?"start":"end";
			})
			.attr("transform", function(d) { 
				if(d.depth==0){
					return "translate("+(-50)+","+(-20)+")";
				}
				return d.x < 180? "translate(8)" : "rotate(180)translate(-8)"; 
			})
			.text(function(d){
				return d.name;
			})
	})
}
function show_server(){
      d3.json("data/server.json",function(error,root){
      	server_root=root;
      	for(var i=0;i<root.children.length;++i){
      		server_array.push(root.children[i].name);
      	}
            var tree_server=d3.layout.tree().size([120,height/2-160]).separation(function(a,b){return (a.parent==b.parent?1:2)/a.depth;})
            var diagonal=d3.svg.diagonal.radial().projection(function(d){return [d.y,d.x/180*Math.PI];});
            var nodes=tree_server.nodes(root);
            var links=tree_server.links(nodes);
            var link=g_server.selectAll("path.server_link")
                    .data(links).enter().append("path")
                    .attr("class",function(d){
                    	return "server_"+d.target.name.split(".")[0]+"_"+d.target.name.split(".")[1]+"_"+d.target.name.split(".")[2]+"_"+d.target.name.split(".")[3];
                    })
                    .attr("fill","none")
                    .attr("id","tree_line")
                    .attr("stroke","#ccc")
                    .attr("stroke-width",0.2)
                    .attr("d",diagonal)
            var node=g_server.selectAll(".node_server")
                    .data(nodes).enter().append("g")
                    .attr("class","node_server")
                    .attr("transform", function(d) { return "rotate(" + (d.x -90) + ")translate(" + d.y + ")"; })
            node.append("circle").attr("r",4.5).attr("class",function(d){
            		if(d.depth!=0){
    		return "server_"+d.name.split(".")[0]+"_"+d.name.split(".")[1]+"_"+d.name.split(".")[2]+"_"+d.name.split(".")[3];
	    	}
	    	else{
	    		return d.name;
	    	}
            }).attr("fill","white")
            .attr("stroke","steelblue")
            .attr("stroke-width",1.5)
            .attr("id","tree_node")
            .on("mouseover",function(d){
				var tip_tool=d;
				d3.select("g.g_tip").remove();
				var position = d3.mouse(document.getElementById("svg"));
				var g_tip=svg.append("g")
					.attr("class","g_tip")
					.attr("transform","translate("+(position[0]+20)+","+(position[1]+20)+")")
					.append("text")
					.attr("fill","#3399FF")
					.attr("cursor","default")
					.attr("stroke-width","1")
					.style("font-weight","bold")
					.text(function(d){
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						return "ip:"+tip_tool.name;
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						return "type:"+tip_tool.type;
					})
				g_tip.append("tspan")
					.attr("x",0)
					.attr("dy","1em")
					.text(function(d){
						for(var i=0;i<server_root.children.length;++i){
							if(tip_tool.name==server_root.children[i].name){
								return "traffic:"+server_root.children[i].flow;
							}
						}
					})
				})
				.on("mouseout",function(d){
					d3.select("g.g_tip").remove();
				})
            node.append("text").attr("font-size","15px").attr("dy",".31em").attr("fill","white").attr("text-anchor",function(d){return d.x<180?"end":"start";})
                    .attr("transform", function(d) { 
                            if(d.depth==0){
                              return "translate("+(-20)+","+(-20)+")rotate("+180+")";
                            }
                            return "rotate("+180+")translate("+(-8)+")";
                    })
                   // .attr("transform","rotate("+180+")translate("+(-8)+")")
                    .text(function(d){
                            return d.name;
                    })
           	setInterval("getdata()",500);
           	/*for(var i=0;i<50;++i){
				getdata();
			}*/
       })
}
function getdata(){
	d3.selectAll("path#tree_line").attr("stroke-width",0.2).attr("stroke","#ccc")
	d3.selectAll("circle#tree_node").attr("fill","white").attr("r",4.5).attr("opacity","0.5")
	data_ss=[];
	var ss_time=dataset[index].time.substring(0,14);
	for(index;index<dataset.length;++index){
		if(dataset[index].time.substring(0,14)!=ss_time){
			break;
		}
		else{
			data_ss.push(dataset[index]);
		}
	}
	if(index>=dataset.length){index=0;};
	show_time(ss_time);
	//console.log(data_ss);
	//console.log(ss_time);
	draw_line(data_ss);
}
function draw_line(data){
	show_stream(data);
	//console.log(data);
	var ss_flow_temp=0
	for(var i=0;i<data.length;++i){
		sip=data[i].sip;
		dip=data[i].dip;
		dport=data[i].dport;
		proto=data[i].proto;
		flow=parseInt(data[i].uplen)+parseInt(data[i].downlen);
		ss_flow_temp+=flow;
		show_side_bar(proto,flow);
		show_lines(sip,dip,dport,proto,flow);
	}
	show_down_line(data[0].time,ss_flow_temp);
}
function show_lines(sip,dip,dport,proto,flow){
	if(isserver(sip)){
		for(var i=0;i<server_root.children.length;++i){
			if(server_root.children[i].name==sip){
				server_root.children[i].flow+=flow;
				break;
			}
		}
		sip_circle="circle.server_"+sip.split(".")[0]+"_"+sip.split(".")[1]+"_"+sip.split(".")[2]+"_"+sip.split(".")[3];
		sip_path="path.server_"+sip.split(".")[0]+"_"+sip.split(".")[1]+"_"+sip.split(".")[2]+"_"+sip.split(".")[3];
		d3.select(sip_path)
			.attr("stroke",function(d){
				if(proto=='http'){
					return "yellow";
				}
				else if(proto.substring(0,5)=='http_'){
					return "Orange";
				}
				else if(proto=='ssl'){
					return "FireBrick";
				}
				else if(proto=="ssh"){
					return "Lime";
				}
				else if(proto=="dec_rpc"){
					return "Olive";
				}
				else if(proto.substring(0,4)=='ftp_'){
					return "Aqua";
				}
				else{
					return "#ccc";
				}
			})
			.attr("stroke-width",2)
		d3.select(sip_circle)
			.attr("r",8)
			.attr("opacity",1)
			.attr("fill",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
	}
	else{
		for(var i=0;i<client_root.children.length;++i){
			if(client_root.children[i].name==(sip.split(".")[0]+"."+sip.split(".")[1]+".X.X")){
				client_root.children[i].flow+=flow;
				break;
			}
		}
		sip_circle="circle.client_"+sip.split(".")[0]+"_"+sip.split(".")[1]+"_X_X";
		sip_path="path.client_"+sip.split(".")[0]+"_"+sip.split(".")[1]+"_X_X";
		d3.select(sip_path)
		.attr("stroke",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
		.attr("stroke-width",2)
		d3.select(sip_circle)
			.attr("r",8)
			.attr("opacity",1)
			.attr("fill",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
	}
	if(isserver(dip)){
		for(var i=0;i<server_root.children.length;++i){
			if(server_root.children[i].name==dip){
				server_root.children[i].flow+=flow;
				break;
			}
		}
		dip_circle="circle.server_"+dip.split(".")[0]+"_"+dip.split(".")[1]+"_"+dip.split(".")[2]+"_"+dip.split(".")[3];
		dip_path="path.server_"+dip.split(".")[0]+"_"+dip.split(".")[1]+"_"+dip.split(".")[2]+"_"+dip.split(".")[3];
		d3.select(dip_path)
		.attr("stroke",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
		.attr("stroke-width",2)
		d3.select(dip_circle)
			.attr("r",8)
			.attr("opacity",1)
			.attr("fill",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
	}
	else{
		for(var i=0;i<client_root.children.length;++i){
			if(client_root.children[i].name==(dip.split(".")[0]+"."+dip.split(".")[1]+".X.X")){
				client_root.children[i].flow+=flow;
				break;
			}
		}
		dip_circle="circle.client_"+dip.split(".")[0]+"_"+dip.split(".")[1]+"_X_X";
		dip_path="path.client_"+dip.split(".")[0]+"_"+dip.split(".")[1]+"_X_X";
		d3.select(dip_path)
		.attr("stroke",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
		.attr("stroke-width",2)
		d3.select(dip_circle)
			.attr("r",8)
			.attr("opacity",1)
			.attr("fill",function(d){
			if(proto=='http'){
				return "yellow";
			}
			else if(proto.substring(0,5)=='http_'){
				return "Orange";
			}
			else if(proto=='ssl'){
				return "FireBrick";
			}
			else if(proto=="ssh"){
				return "Lime";
			}
			else if(proto=="dec_rpc"){
				return "Olive";
			}
			else if(proto.substring(0,4)=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
	}
}
function isserver(ip){
	for(var i=0;i<server_array.length;++i){
		if(ip==server_array[i]){
			return true;
		}
	}
	return false;
}
function isspecial_proto(proto){
	if(proto=="http"){return 0;}
	else if(proto =="ssl"){return 2;}
	else if(proto.substring(0,5)=="http_"){return 1;}
	else if(proto=="ssh"){return 3;}
	else if(proto=="dec_rpc"){return 4;}
	else if(proto.substring(0,4)=="ftp_"){return 5;}
	else return 6;
}
function show_stream(data){
	var data_stream=[
		{
			"name":"http",
			"values":[
			]
		},
		{
			"name":"http_",
			"values":[
			]
		},
		{
			"name":"ssl",
			"values":[
			]
		},
		{
			"name":"ssh",
			"values":[
			]
		},
		{
			"name":"dec_rpc",
			"values":[
			]
		},
		{
			"name":"ftp_",
			"values":[
			]
		},
		{
			"name":"other",
			"values":[
			]
		},
	];
	var data_stream_2=[
		{
			"name":"http",
			"values":[
			]
		},
		{
			"name":"http_",
			"values":[
			]
		},
		{
			"name":"ssl",
			"values":[
			]
		},
		{
			"name":"ssh",
			"values":[
			]
		},
		{
			"name":"dec_rpc",
			"values":[
			]
		},
		{
			"name":"ftp_",
			"values":[
			]
		},
		{
			"name":"other",
			"values":[
			]
		},
	];
	var stream_length=11;
	var time_stream=[];
	var time_stream_2=[];
	stream_temp.push(data);
	//console.log(stream_temp);
	if(stream_temp.length>=stream_length){
		stream_temp.shift();
	}
	for(var i=0;i<data_stream.length;++i){
		for(var j=0;j<stream_temp.length;++j){
			//console.log(stream_temp.length);
			data_stream[i].values.push(
				{"x":stream_temp[j][0].time.substring(10,12)+":"+stream_temp[j][0].time.substring(12,14),"y":0}
			)
		}
	}
	for(var i=0;i<stream_temp.length;++i){
		//console.log(i);
		time_stream.push(stream_temp[i][0].time.substring(10,12)+":"+stream_temp[i][0].time.substring(12,14));
		for(var j=0;j<stream_temp[i].length;++j){
			for(var k=0;k<data_stream[isspecial_proto(stream_temp[i][j].proto)].values.length;++k){
				
				if(data_stream[isspecial_proto(stream_temp[i][j].proto)].values[k].x==stream_temp[i][0].time.substring(10,12)+":"+stream_temp[i][0].time.substring(12,14)){
					data_stream[isspecial_proto(stream_temp[i][j].proto)].values[k].y+=parseInt(stream_temp[i][j].uplen);
					break;
				}
			}
		}
	}
	for(var i=0;i<data_stream_2.length;++i){
		for(var j=0;j<stream_temp.length;++j){
			//console.log(stream_temp.length);
			data_stream_2[i].values.push(
				{"x":stream_temp[j][0].time.substring(10,12)+":"+stream_temp[j][0].time.substring(12,14),"y":0}
			)
		}
	}
	for(var i=0;i<stream_temp.length;++i){
		//console.log(i);
		time_stream_2.push(stream_temp[i][0].time.substring(10,12)+":"+stream_temp[i][0].time.substring(12,14));
		for(var j=0;j<stream_temp[i].length;++j){
			for(var k=0;k<data_stream_2[isspecial_proto(stream_temp[i][j].proto)].values.length;++k){
				
				if(data_stream_2[isspecial_proto(stream_temp[i][j].proto)].values[k].x==stream_temp[i][0].time.substring(10,12)+":"+stream_temp[i][0].time.substring(12,14)){
					data_stream_2[isspecial_proto(stream_temp[i][j].proto)].values[k].y+=parseInt(stream_temp[i][j].downlen);
					break;
				}
			}
		}
	}
	
	d3.select("g.g_stream").remove();
	var g_stream=svg.append("g")
		.attr("class","g_stream")
		.attr("transform", "translate(" + server_group_pos[0]+ "," + server_group_pos[1] + ")")
	g_stream.append("line")
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",client_group_pos[0]-server_group_pos[0])
		.attr("y2",0)
		.attr("stroke","white")
		.attr("stroke-width",1)
	show_stream_1(time_stream,data_stream_2,g_stream);
	show_stream_2(time_stream_2,data_stream,g_stream);
}
function show_stream_2(time_stream,data_stream,g_stream){
	var max_flow=0;
	for(var i=0;i<data_stream[0].values.length;++i){

		var flow_temp=0;
		for(var j=0;j<data_stream.length;++j){
			flow_temp+=parseInt(data_stream[j].values[i].y);
		}
		if(flow_temp>max_flow){
			max_flow=flow_temp;
		}
	}
	var x_scale=d3.scale.ordinal()
		.domain(time_stream)
		.rangeRoundBands([0,300]);
	var y_scale=d3.scale.linear()
		.domain([0,max_flow])
		.range([0,-50])
	var x_scale_axis=d3.svg.axis()
		.scale(x_scale)
		.orient("top")
		.ticks(10)
	var y_scale_axis=d3.svg.axis()
		.scale(y_scale)
		.ticks(3)
		.orient("left")
	var x_axis=g_stream.append("g")
		.attr("class","stream_x_axis")
		.attr("transform","translate("+0+","+(-50)+")")
		.call(x_scale_axis)
	var y_axis=g_stream.append("g")
		.attr("class","stream_y_axis_up")
		.attr("transform","translate("+((client_group_pos[0]-server_group_pos[0]))/2+","+0+")")
		.call(y_scale_axis)
	var y_lines_down=d3.selectAll("g.stream_y_axis_up g.tick")
		.selectAll("line.grid_line_down").remove()
	y_lines_down=d3.selectAll("g.stream_y_axis_up g.tick")
		.append("line")
	y_lines_down.attr("stroke","#3399FF")
		.attr("stroke-width",0.3)
		.attr("x1",-(client_group_pos[0]-server_group_pos[0])/2+x_scale.rangeBand()/2)
		.attr("y1",0)
		.attr("x2",(client_group_pos[0]-server_group_pos[0])/2-x_scale.rangeBand()/2)
		.attr("y2",0)
	var stack=d3.layout.stack()
		.offset('zero')
		.values(function(d){return d.values;})
	var stackdata=stack(data_stream);
	var area=d3.svg.area()
		//.interpolate('cardinal')
		.x(function(d){
			return x_scale(d.x)+x_scale.rangeBand()/2;
		})
		.y0(function(d){
			return y_scale(d.y0);
		})
		.y1(function(d){
			return y_scale(d.y+d.y0);
		})
	g_stream.selectAll("path.stream")
		.data(stackdata)
		.enter()
		.append("path")
		.attr("fill",function(d,i){
			//console.log(d);
			if(d.name=='http'){
				return "yellow";
			}
			else if(d.name=='http_'){
				return "Orange";
			}
			else if(d.name=='ssl'){
				return "FireBrick";
			}
			else if(d.name=="ssh"){
				return "Lime";
			}
			else if(d.name=="dec_rpc"){
				return "Olive";
			}
			else if(d.name=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
		.attr("opacity","0.4")
		.attr("class","stream")
		//.attr("transform","translate("+0+","+50+")")
		.attr("d",function(d){return area(d.values);})
}
function show_stream_1 (time_stream,data_stream,g_stream) {
	var max_flow=0;
	for(var i=0;i<data_stream[0].values.length;++i){
		var flow_temp=0;
		for(var j=0;j<data_stream.length;++j){
			flow_temp+=parseInt(data_stream[j].values[i].y);
		}
		if(flow_temp>max_flow){
			max_flow=flow_temp;
		}
	}
	var x_scale=d3.scale.ordinal()
		.domain(time_stream)
		.rangeRoundBands([300,0]);
	var y_scale=d3.scale.linear()
		.domain([0,max_flow])
		.range([0,50])
	var x_scale_axis=d3.svg.axis()
		.scale(x_scale)
		.orient("bottom")
	var y_scale_axis=d3.svg.axis()
		.scale(y_scale)
		.ticks(3)
		.orient("right")
	var x_axis=g_stream.append("g")
		.attr("class","stream_x_axis")
		.attr("transform","translate("+0+","+50+")")
		.call(x_scale_axis)
	var y_axis=g_stream.append("g")
		.attr("class","stream_y_axis_down")
		.attr("transform","translate("+((client_group_pos[0]-server_group_pos[0]))/2+","+0+")")
		.call(y_scale_axis)
	var y_lines_down=d3.selectAll("g.stream_y_axis_down g.tick")
		.selectAll("line.grid_line_down").remove()
	y_lines_down=d3.selectAll("g.stream_y_axis_down g.tick")
		.append("line")
	y_lines_down.attr("stroke","white")
		.attr("stroke-width",0.3)
		.attr("x1",(client_group_pos[0]-server_group_pos[0])/2-x_scale.rangeBand()/2)
		.attr("y1",0)
		.attr("x2",-(client_group_pos[0]-server_group_pos[0])/2+x_scale.rangeBand()/2)
		.attr("y2",0)

	var stack=d3.layout.stack()
		.offset('zero')
		.values(function(d){return d.values;})
	var stackdata=stack(data_stream);
	var area=d3.svg.area()
		//.interpolate('cardinal')
		.x(function(d){
			return x_scale(d.x)+x_scale.rangeBand()/2;
		})
		.y0(function(d){
			return y_scale(d.y0);
		})
		.y1(function(d){
			return y_scale(d.y+d.y0);
		})
	g_stream.selectAll("path.stream_2")
		.data(stackdata)
		.enter()
		.append("path")
		.attr("fill",function(d,i){
			//console.log(d);
			if(d.name=='http'){
				return "yellow";
			}
			else if(d.name=='http_'){
				return "Orange";
			}
			else if(d.name=='ssl'){
				return "FireBrick";
			}
			else if(d.name=="ssh"){
				return "Lime";
			}
			else if(d.name=="dec_rpc"){
				return "Olive";
			}
			else if(d.name=='ftp_'){
				return "Aqua";
			}
			else{
				return "#ccc";
			}
		})
		.attr("opacity","0.4")
		.attr("class","stream_2")
		.attr("d",function(d){return area(d.values);})
}
function show_time(time){
	d3.select("text.time_tip").text(function(d){
		return "Time:"+time.substring(8,10)+":"+time.substring(10,12)+":"+time.substring(12,14);
	});
}
function show_proto_group(){
	var proto_color=[
		{"proto":"http","color":"yellow"},
		{"proto":"http_proxy/http_connect","color":"Orange"},
		{"proto":"ssl","color":"FireBrick"},
		{"proto":"ssh","color":"Lime"},
		{"proto":"dec_rpc","color":"Olive"},
		{"proto":"ftp_control/ftp_data","color":"Aqua"},
		{"proto":"other","color":"#CCC"}
	]
	var g_proto_group=svg.append("g")
		.attr("class","g_proto_group")
		.attr("transform","translate("+(server_group_pos[0]+580)+","+(server_group_pos[1]+250)+")")
	g_proto_group.selectAll("rect")
		.data(proto_color)
		.enter()
		.append("rect")
		.attr("x",function(d,i){
			return 0;
		})
		.attr("y",function(d,i){
			return 200/proto_color.length*(i);
		})
		.attr("width",40)
		.attr("height",2)
		.attr("fill",function(d){
			return d.color;
		})
	g_proto_group.selectAll("text")
		.data(proto_color)
		.enter()
		.append("text")
		.attr("fill","white")
		.attr("x",60)
		.attr("y",function(d,i){
			return 200/proto_color.length*(i)+3;
		})
		.text(function(d){
			return d.proto;
		})
}
function show_down_axis(day_num){
	console.log(day_num);
	x_down_scale=d3.time.scale()
		/*.domain([
			format.parse("2015-04-23T00:00:00"),
			format.parse("2015-04-23T23:59:59")
		])*/
		.domain([
			new Date(2015,04,day_num,0,0,0),
			new Date(2015,04,day_num,0,10,59)
		])
		.range([0,width-500])
	x_down_axis=d3.svg.axis()
		.scale(x_down_scale)
		.ticks(11)
		.orient("bottom")


	y_down_scale=d3.scale.linear()
		.domain([0,1000000])
		.range([150,0])
	y_down_axis=d3.svg.axis()
		.scale(y_down_scale)
		.ticks(10)
		.orient("left")
	g_down.append("g")
		.attr("class","down_axis")
		.attr("transform","translate("+0+","+150+")")
		.call(x_down_axis)
		.selectAll("text")
		.text(function(d){
			var temp_h,temp_m;
			if(parseInt(d.getHours())<10){
				temp_h="0"+d.getHours();
			}
			else{
				temp_h=d.getHours();
			}
			if(parseInt(d.getMinutes())<10){
				temp_m="0"+d.getMinutes();
			}
			else{
				temp_m=d.getMinutes();
			}
			return temp_h+":"+temp_m;
		})
	g_down.append("g")
		.attr("class","down_axis")
		.attr("transform","translate("+0+","+0+")")
		.call(y_down_axis)

	g_down.append("circle")
		.attr("cx",function(d){
			return x_down_scale(new Date(2015,04,23,10,10,10));
		})
		.attr("cy",function(d){
			return y_down_scale(8000);
		})
		.attr("r",10)
		.attr("fill","red")
	g_down.append("line")
		.attr("class","down_line_tip_x")
		.attr("stroke","#ccc")
		.attr("stroke-width",0.3)
	//	.attr("opacity","0.5")
		.attr("x1",0)
		.attr("y1",last_point[1])
		.attr("x2",width-500)
		.attr("y2",last_point[1])
	g_down.append("line")
		.attr("class","down_line_tip_y")
		.attr("stroke","#ccc")
		.attr("stroke-width",0.3)
	//	.attr("opacity","0.5")
		.attr("x1",last_point[0])
		.attr("y1",0)
		.attr("x2",last_point[0])
		.attr("y2",150)
	g_down.append("circle")
		.attr("class","down_line_tip_circle")
		.attr("cx",last_point[0])
		.attr("cy",last_point[1])
		.attr("r",2)
		.attr("stroke","#3399ff")
		.attr("fill","none")
	g_down.append("text")
		.attr("class","down_line_tip_text")
		.attr("x",last_point[0])
		.attr("fill","white")
		.attr("y",last_point[1])

}
function show_down_line(time,flow){
	if(parseInt(flow)>=1000000){flow=1000000;}
	var yy=parseInt(time.substring(0,4));
	var m=parseInt(time.substring(4,6));
	var dd=parseInt(time.substring(6,8));
	var hh=parseInt(time.substring(8,10));
	var mm=parseInt(time.substring(10,12));
	var ss=parseInt(time.substring(12,14));
	g_down.append("path")
		.attr("stroke","#3399ff")
		.attr("stroke-width",1)
		.attr("fill","none")
		.attr("d",function(d){
			return "M"+last_point[0]+" "+last_point[1]+"L"+x_down_scale(new Date(yy,m,dd,hh,mm,ss))+" "+y_down_scale(flow);
		})

	last_point=[x_down_scale(new Date(yy,m,dd,hh,mm,ss)),y_down_scale(flow)];
	g_down.select("line.down_line_tip_x")
		.attr("y1",last_point[1])
		.attr("y2",last_point[1])
	g_down.select("line.down_line_tip_y")
		.attr("x1",last_point[0])
		.attr("x2",last_point[0])
	g_down.select("circle.down_line_tip_circle")
		.attr("cx",last_point[0])
		.attr("cy",last_point[1])
	g_down.select("text.down_line_tip_text")
		.attr("x",last_point[0]+8)
		.attr("y",last_point[1])
		.text(function(d){
			return time.substring(8,10)+":"+time.substring(10,12)+":"+time.substring(12,14)+","+flow;
			//return time+":"+flow;
		})
	//console.log(last_point);
}
function show_side(){
	var side_proto=[
			"http","http_proxy/http_connect","ssl","ssh","dec_rpc","ftp_control/ftp_data","other"
	]
	x_scale_side=d3.scale.ordinal()
		.domain(side_proto)
		.rangeRoundBands([0,300],0.1)
	y_scale_side=d3.scale.linear()
		.domain([0,5000000])
		.range([400,30])
	x_side_axis=d3.svg.axis()
		.scale(x_scale_side)
		.orient("bottom")
	y_side_axis=d3.svg.axis()
		.scale(y_scale_side)
		.orient("left")

	g_side.append("g")
		.attr("transform","translate("+0+","+400+")")
		.attr("class","down_axis")
		.call(x_side_axis)
		.selectAll("text").style("text-anchor","start").attr("transform","translate("+15+","+8+")rotate("+45+")");

	g_side.append("g")
		.attr("class","down_axis")
		.call(y_side_axis)
	g_side.selectAll("rect")
		.data(proto_flow_side)
		.enter().append("rect")
		.attr("x",function(d){
			return x_scale_side(d.proto);
		})
		.attr("y",function(d){
			return -(400-y_scale_side(parseInt(d.flow)));
		})
		.attr("width",x_scale_side.rangeBand())
		.attr("height",function(d){
			return 400-y_scale_side(d.flow);
		})
		.attr("class",function(d){
			if(d.proto=="http_proxy/http_connect"){
				return "side_http_proxy";
			}
			if(d.proto=="ftp_control/ftp_data"){
				return "side_ftp";
			}
			return "side_"+d.proto;
		})
		.attr("fill",function(d){
			return d.color;
		})
		.attr("transform","translate("+0+","+400+")")
	g_side.selectAll("line#side_tip_line")
		.data(proto_flow_side)
		.enter().append("line")
		.attr("class",function(d){
			if(d.proto=="http_proxy/http_connect"){
				return "side_http_proxy";
			}
			if(d.proto=="ftp_control/ftp_data"){
				return "side_ftp";
			}
			return "side_"+d.proto;
		})
		.attr("id","side_tip_line")
		.attr("stroke","#3399ff")
		.attr("stroke-width",1)
		.attr("opacity",0.6)
		.attr("x1",0)
		.attr("y1",function(d){
			return y_scale_side(parseInt(d.flow));
		})
		.attr("x2",function(d){
			return x_scale_side(d.proto);
		})
		.attr("y2",function(d){
			return y_scale_side(parseInt(d.flow));
		})
		.attr("transform","translate("+0+","+400+")")
}
function show_side_bar(proto,flow){
	if(proto=="http"){
		proto_flow_side[0].flow+=parseInt(flow)/5;
		//console.log(y_scale_side(parseInt(proto_flow_side[0].flow)))
		g_side.select("rect.side_http")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[0].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[0].flow))
		g_side.select("line.side_http")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[0].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[0].flow))))
	}
	if(proto=="http_proxy" || proto=="http_connect"){
		proto_flow_side[1].flow+=parseInt(flow)/5;
		g_side.select("rect.side_http_proxy")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[1].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[1].flow))
		g_side.select("line.side_http_proxy")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[1].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[1].flow))))
	}
	if(proto=="ssl"){
		proto_flow_side[2].flow+=parseInt(flow);
		g_side.select("rect.side_ssl")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[2].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[2].flow))
		g_side.select("line.side_ssl")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[2].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[2].flow))))
	}
	if(proto=="ssh"){
		proto_flow_side[3].flow+=parseInt(flow);
		g_side.select("rect.side_ssh")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[3].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[3].flow))
		g_side.select("line.side_ssh")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[3].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[3].flow))))
	}
	if(proto=="dec_rpc"){
		proto_flow_side[4].flow+=parseInt(flow);
		g_side.select("rect.side_dec_rpc")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[4].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[4].flow))
		g_side.select("line.side_dec_rpc")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[4].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[4].flow))))
	}
	if(proto=="ftp_control" || proto=="ftp_data"){
		proto_flow_side[5].flow+=parseInt(flow);
		g_side.select("rect.side_ftp")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[5].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[5].flow))
		g_side.select("line.side_ftp")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[5].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[5].flow))))
	}
	else{
		proto_flow_side[6].flow+=parseInt(flow)/5;
		g_side.select("rect.side_other")
			.attr("y",-(400-y_scale_side(parseInt(proto_flow_side[6].flow))))
			.attr("height",400-y_scale_side(proto_flow_side[6].flow))
		g_side.select("line.side_other")
			.attr("y1",-(400-y_scale_side(parseInt(proto_flow_side[6].flow))))
			.attr("y2",-(400-y_scale_side(parseInt(proto_flow_side[6].flow))))
	}
}
function show_tip(){
	var g_tip_side=svg.append("g")
		.attr("transform","translate("+(width-330)+","+20+")")
		.append("text")
		.attr("fill","#3399ff")
		.attr("font-size","20px")
		.text("各协议累计流量")

	var g_tip_down=svg.append("g")
		.attr("transform","translate("+100+","+(height-190)+")")
		.append("text")
		.attr("font-size","20px")
		.attr("fill","#3399ff")
		.text("实时流量")
}