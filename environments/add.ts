import { boolean } from 'yargs'
import yargs from 'yargs/yargs'

(async () => {
    var argv = yargs(process.argv.slice(2)).command(
        'base',
        'Adds a base to the protocol',
        (yargs) => {
            return yargs.demandOption('asset').demandOption('sources')
        },
        (argv) => {

        }
    ).command(
        'ilk',
        'Adds an ilk to the protocol',
        (yargs) => {
            return yargs.demandOption('asset').demandOption('sources')
        },
        (argv) => {

        }
    ).argv
})()