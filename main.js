var contrib = require('./contributors');
var fs = require('fs');

function saveFile(name, content){
	fs.writeFile(name, content, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file '"+name+"'' was saved!");
	    }
	}); 
}

contrib.setTDRepoLocation('../DefinitelyTyped');

var html = '';
var json = '';

contrib.getTypingContributors(function(files) {
	json = JSON.stringify(files);

	for(var file in files) {
		html += '<div><div><h2>' + file + '</h2><a href="https://www.nuget.org/packages/' + file + '.TypeScript.DefinitelyTyped/">NuGet</a> - <a href="https://github.com/borisyankov/DefinitelyTyped/tree/master/' + file + '">Github</a></div><br/>';
		var c = {};
		for(var i = 0; i < files[file].length; i++){
			var contributor = files[file][i];
			if(c[contributor.email]) continue;
			c[contributor.email] = true;
			html += '<img src="'+contributor.gravatar+'" alt="'+contributor.name+'" title="'+contributor.name+'" height="20" width="20"/>';
		}
		html += '</div><br/>';
	}

	saveFile('index.html', html);
	saveFile('dt-contrib.json', json);
});
