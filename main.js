var BearMaps = require("github.com/quilt/bear-maps");
// WINDOWS USERS, replace the above import with this:
// var BearMaps = require("github.com/quilt/bear-maps/bear-maps-windows.js");

var HaProxy = require("github.com/quilt/haproxy").Haproxy;

// PROJ_PATH is the path to your BearMaps code. It should be the absolute path
// to the directory that contains the file `pom.xml`.
// WINDOWS USERS, use double backslashes like this: `C:\\Users\\Luise\\proj3`)
// IMPORTANT: This *must* be an absolute path (starting with / on Linux/Mac or
// C:\\ on Windows). It will *not* work if you use a tilde like ~/cs61b/proj3.
var PROJ_PATH = "/Users/Luise/cs61b/abc/proj3";
var WORKER_COUNT = 1;

var deployment = createDeployment();
var baseMachine = new Machine({
	provider: "Amazon",
	size: "t2.micro",
	// If you want to ssh into the VMs and container, uncomment this line
	// and replace `luise` with your GitHub username before running the spec.
	// sshKeys: githubKeys("luise"),
});
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(WORKER_COUNT));

var bearMaps = BearMaps(PROJ_PATH, WORKER_COUNT);
var haproxy = new HaProxy(1, [bearMaps], 4567, "source");

bearMaps.place(new LabelRule(true, bearMaps));
haproxy.public();

deployment.deploy(bearMaps);
deployment.deploy(haproxy);
