#!/usr/bin/env node

const yargs = require('yargs');

yargs.usage('Usage: -p')
    .option('o', { alias: 'org', describe: 'Organization', demandOption: true })
    .option('e', { alias: 'env', describe: 'Environment', demandOption: true })
    .option('a', { alias: 'app', describe: 'App name', demandOption: true })
    .option('u', { alias: 'user', describe: 'User e-mail', demandOption: true })
    .option('p', { alias: 'password', describe: 'User password', demandOption: true })
    .command('publish', 'Publish your current folder as a Carol App', (yargs) => { }, (args) => {
        require('./publish')(args.org, args.env, args.user, args.password, args.app);
    })
    .argv;

