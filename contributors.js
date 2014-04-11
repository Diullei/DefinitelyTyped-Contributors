var exec = require('child_process').exec,
    child,
	parseRE = /^(.*)<(.*)>$/,
	fs = require('fs'),
	util = require('util'),
	dir = null,//'../DefinitelyTyped',
	MD5 = require('./md5').MD5,
	Iterator = require('./iterator').Iterator;

exports.setTDRepoLocation = function(location){
	dir = location;
}

var walk = function(dirr, done) {
  var results = [];
  fs.readdir(dirr, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dirr + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if(!(file.indexOf(dir + '/.git') == 0) && !(file.indexOf(dir + '/_infrastructure') == 0)){
          	if(file.match(/\.ts$/)) {
          		results.push(file);
          	}
          }
          next();
        }
      });
    })();
  });
};

function getContributors(file, callback) {
	var c = 'git log --diff-filter=AM "--format=%aN <%aE>" "' + file + '"';
	//console.log(c)
	child = exec(c,
	  { cwd: dir + '/' },
	  function (error, stdout, stderr) {
	  	uniqueContribs = {};
	  	contribs = [];
	  	stdout.split( /\r?\n/g ).forEach(function(contributor) {
	  		if(!(contributor in uniqueContribs) && contributor) {
	  			uniqueContribs[contributor] = true;

				var m = parseRE.exec(contributor);
				if ( m ) {
					contribs.push({ 
						name: m[1].trim(), 
						email: m[2],
						gravatar: "http://www.gravatar.com/avatar/" + MD5(m[2]) + "?s=30"
					});
				} else {
					contribs.push({ name: str });
				}
	  		}
	  	});

	    callback(contribs);
	    if (error !== null) {
	      //console.log('exec error: ' + error);
	    }
	});
}

function getTypingContributors(callback) {
	walk(dir, function(err, results) {
	  if (err) throw err;
	  var files = {};
	  
	  var iter = new Iterator(results);

	  item = iter.first();

	  (function recur(item){
		  getContributors(item, function(contribs){
		  	if(item) {
		  		var typing = item.split('/')[0];
		  		if(!files[typing]){
	  				files[typing] = contribs;
		  		} else {
		  			contribs.forEach(function(contributor) {
		  				var add = true;
		  				for(var i = 0; i < files[typing].length; i++) {
		  					if(files[typing][i].name == contributor.name) {
		  						add = false;
		  					}
		  				}

		  				if(add){
		  					files[typing].push(contributor);
		  				}
		  			});
		  		}
		  	}
	  		if(iter.hasNext()){
		  		item = iter.next();
		  		recur((item||'').substring(dir.length + 1));
	  		} else {
	  			callback(files);
	  		}
		  });
	  })(item.substring(dir.length + 1));

	});
}

exports.getTypingContributors = getTypingContributors;
