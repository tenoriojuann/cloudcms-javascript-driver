import * as CloudCMS from "../..";
var assert = require('chai').assert;

describe('branch_2', function() {
    it('should test branch methods in a repository without error using object bound functions', async function() {

        var session = await CloudCMS.connect();
        var repository = await session.createRepository();

        // list branches
        var branches = await repository.listBranches();

        for (var i = 0; i < branches.rows.length; i++)
        {
            var branch = branches.rows[i];
            console.log("Repository: " + repository._doc + ", Branch: " + branch._doc + ", Title: " + branch.title);
        }

        // read master branch
        var master = await repository.readBranch("master");

        // create branch
        var newBranch = await repository.createBranch(master, master.tip, {title: "new branch 1"});
        console.log("Repository: " + repository._doc + ", Branch: " + newBranch._doc + ", Title: " + newBranch.title);

        // read non master branch
        newBranch = await repository.readBranch(newBranch);
        console.log("Repository: " + repository._doc + ", Branch: " + newBranch._doc + ", Title: " + newBranch.title);

    });
});