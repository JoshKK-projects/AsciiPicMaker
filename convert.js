var jimp= require('jimp');
var fs = require('fs');
process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util');

var ascii_table = ['#','$','8','0','o','*','=','_'];
var line_table =  ['=','||','+','*','_'];

var ascii_pic = '';

console.log("what fileto ascii-fy: file#<large/small/edge>");
process.stdin.on('data',function(text){
	console.log(text);
	var text = text.replace(/\s/g,'');
	text = text.split('#');
	console.log(text);
	jimp.read(text[0],function(err,pic){
		if(err) throw err;
		pic.greyscale().write('greyscaled.png', function(grey){
			jimp.read('greyscaled.png',function(err,grey){
				if(err) throw err;
				if(text[1]=='large'){
					oneToOne(grey);
				}
				if(text[1]=='small'){
					oneToMany(grey);
				}
				if(text[1]=='edge'){
					oneToManyEdge(grey);
				}
				fs.open(text[0]+'_ascii.html','w+',function(err,fd){
					fs.write(fd,ascii_pic,'start',function(err,written,buffer){
						console.log('done');
					});
				});
			//	console.log(ascii_pic);
			});
		});
		
	});
});

function oneToManyEdge(grey){
	var width = grey.bitmap.width;
	var height = grey.bitmap.height;

	var new_width = width - (width%5);
	var new_height = height - (height%10);

	var pic_map = [];
	var n = 0;

	for(var i=0;i<new_height;i+=10){
		pic_map_2 = [];
		var m = 0;
		for(var j=0;j<new_width;j+=5){
			var curr_block = getBlockAverage(grey,j,i);
			pic_map_2[m] = curr_block;
			m++;
		}
		pic_map[n] = pic_map_2;
		n++;
		//ascii_pic+="<br/>";
	}
	
	for(var i=1;i<pic_map.length-1;i++){
		for(var j=1;j<pic_map[0].length-1;j++){
			var curr_block = pic_map[i][j];
			var up_block = pic_map[i-1][j];
			var down_block = pic_map[i+1][j];
			var right_block = pic_map[i][j+1];
			var left_block = pic_map[i][j-1];
			if(curr_block<=up_block-4194303.75/2 || curr_block>=up_block+4194303.75/2)
				ascii_pic+=line_table[0];
			else if (curr_block<=down_block-4194303.75/2 || curr_block>=down_block+4194303.75/2)
				ascii_pic+=line_table[0];
			else if (curr_block<=left_block-4194303.75/2 || curr_block>=left_block+4194303.75/2)
				ascii_pic+=line_table[1];
			else if (curr_block<=right_block-4194303.75/2 || curr_block>=right_block+4194303.75/2)
				ascii_pic+=line_table[1];
			else
				ascii_pic+=line_table[4];
		}
		ascii_pic+="<br/>";
	}
}

function oneToMany(grey){
	var width = grey.bitmap.width;
	var height = grey.bitmap.height;

	var new_width = width - (width%5);
	var new_height = height - (height%10);

	for(var i=0;i<new_height;i+=10){
		for(var j=0;j<new_width;j+=5){
			var color = getBlockAverage(grey,j,i);
			picFiller(color);
		}
		ascii_pic+="<br/>";
	}
}

function oneToOne(grey){
	var width = grey.bitmap.width;
	var height = grey.bitmap.height;
	for(var i=0;i<height;i++){
		for(var j=0;j<width;j++){
			var color = grey.getPixelColor(j,i)/255;
			picFiller(color);
		}
		ascii_pic+="<br/>";
	}
}

function getBlockAverage(grey,j,i){
	var average=0;
	for(var n=0;n<10;n++){
		for(var m=0;m<5;m++){
			average+= grey.getPixelColor(j+m,i+n)/255;
		}
	}
	var color = average/50;//average by diff ratios for darkness /sameness?
	return color;
}

function picFiller(color){
	if(color<2097151.875){
		ascii_pic+=ascii_table[0];
	}
	else if(color<4194303.75){
		ascii_pic+=ascii_table[1];
	}
	else if(color<6291455.625){
		ascii_pic+=ascii_table[2];
	}
	else if(color<8388607.5){
		ascii_pic+=ascii_table[3];
	}
	else if(color<10485759.375){
		ascii_pic+=ascii_table[4];
	}
	else if(color<12582911.25){
		ascii_pic+=ascii_table[5];
	}
	else if(color<14680063.125){
		ascii_pic+=ascii_table[6];
	}
	else{
		ascii_pic+=ascii_table[7];
	}
}