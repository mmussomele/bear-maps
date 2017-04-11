var dirs = ["src/main", "src/static"];
var dstDir = "/usr/src/app";
var port = 4567;

function BearMaps(projRoot) {
	var files = getFiles(projRoot);

	// The `cp` command is a hack. Maven should make this copy, but for some
	// reason doesn't.
	var container = new Container("luise/bear-maps-base",
		["/bin/sh", "-c",
		"mvn -X install && " +
		"cp -r src/static/page target/classes && " +
		"mvn -X exec:java -Dexec.mainClass=\"MapServer\""]
	).withFiles(files);

	var service = new Service("bear-maps", [container]);
	publicInternet.connect(port, service);
	service.connect(80, publicInternet);
	service.connect(443, publicInternet);
	service.connect(53, publicInternet);
	return service;
}

var getFiles = function(rootPath) {
	var files = {};
	for (var i = 0; i < dirs.length; i++) {
		filesFromDir(rootPath,  dirs[i], files);
	};
	return files;
}

// Recursively read files from `rootPath/srcDir` into the `target` object,
// mapping destination filenames to file contents (strings).
var filesFromDir = function(rootPath, srcDir, target) {
	var src = rootPath + "/" + srcDir;
	if (!dirExists(src)) {
		return;
	}
	var files = readDir(src);
	for (var i = 0; i < files.length; i++) {
		if (files[i].isDir) {
			var newSrcDir = srcDir+"/"+files[i].name;
			filesFromDir(rootPath, newSrcDir, target);
		} else {
			var srcPath = src+"/"+files[i].name;
			var dstPath = dstDir+"/"+srcDir+"/"+files[i].name;
			target[dstPath] = read(srcPath);
		}
	};
}

module.exports = BearMaps;
