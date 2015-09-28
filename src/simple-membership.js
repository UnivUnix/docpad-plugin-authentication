/*global require, JSON, module, process*/
var fs = require('fs');
var path = require('path');

var users = [];
var membershipFile = "";
var makeAdminURL = new RegExp(/\/makeAdmin/);
var createAccountURL = '/createAccount';
var signUpURL = '/sign-up';
var afterAuthenticateURL = '/';
var adminURL = '/admin';


function writeMembershipFile() {
    if (membershipFile) {
        var jsonString = JSON.stringify(users, null, 2);
        fs.writeFileSync(membershipFile, jsonString, 'utf-8');
    }
}

function loadMembershipFile() {
    if (membershipFile) {

        var jsonString = "[]";
        // Check the membership file exists
        // If not, create it
        try {
            jsonString = fs.readFileSync(membershipFile, 'utf-8');
        } catch (err) {
            fs.writeFileSync(membershipFile, jsonString, 'utf-8');
        }

        users = JSON.parse(jsonString);
    }
}

function findOne(id, service) {
    for (var i = 0; i < users.length; i++) {
        var item = users[i];
        if (item.service_id == id && item.service == service) {
            return item;
        }
    }
    return false;
}


function saveNewUser(user) {
    if (user.isNew && !findOne(user.service_id, user.service)) {
        user.our_id = users.length + 1;
        user.isNew = false;
        users.push(user);
        writeMembershipFile();
    }
}

function findOrCreateUser(opts, callback) {
    var user = findOne(opts.profile[opts.property], opts.type);
    if (!user) {
        user = {
            our_id: null,
            service_id: opts.profile[opts.property],
            service: opts.type,
            name: opts.profile.name || opts.profile.username || opts.profile.screen_name,
            email: opts.profile.email,
            adminUser: false,
            linked_ids: [],
            isNew: true
        };
    }

    callback(user);
}

function makeAdmin(id, service) {
    var user = findOne(id, service);
    user.adminUser = true;
    writeMembershipFile();
    return findOne(id, service);
}

function serverMakeAdmin(req, res, next) {
    var user = req.user;
    try {
        user = makeAdmin(user.service_id, user.service);
        req.login(user, function (err) {
            if (err) {
                console.log(err);
                next(err);
            }
            res.redirect(adminURL);

        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

function serverCreateAccount(req, res, next) {
    var name = req.body.NickName;
    if (name && req.user && req.user.isNew) {
        req.user.name = name;
        saveNewUser(req.user);
        res.redirect(afterAuthenticateURL);
    } else {
        next();
    }
}

//when a new user authenticates when have
//to redirect them to a sign-up page
function serverSignUpNewUser(req, res, next) {
    try {
        if (req.user && req.user.isNew) {
            res.redirect(signUpURL);
        } else {
            next();
        }
    } catch (err) {
        console.log(err);
        next(err);
    }

}

function init(userList, server, dataPath) {
    users = userList || [];
    dataPath = dataPath || process.cwd();
    if (dataPath) {
        membershipFile = path.join(dataPath, 'membership', 'membership.json');
        loadMembershipFile();
    }

    server.post(createAccountURL, serverCreateAccount);
    server.get(afterAuthenticateURL, serverSignUpNewUser);
}

function getUsers(){
    return users;
}

module.exports.init = init;
module.exports.saveNewUser = saveNewUser;
module.exports.findOrCreateUser = findOrCreateUser;
module.exports.makeAdmin = makeAdmin;
module.exports.getUsers = getUsers;