const readline = require('readline');
const lumi = require('lumi-control');
const colors = require('colors');
const clear = require('clear');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function displayOptions(monitors) {
    console.log('Choose a monitor:\n'.gray);

    await Promise.all(monitors.map(async (monitor, index) => {
        const brightness = await lumi.get(monitor.id);
        console.log(`🖥️ ${index + 1}. ${monitor.name} [${(isNaN(brightness.brightness) ? 'Unknown' : brightness.brightness)}% 🔆] [${monitor.size.width}x${monitor.size.height} 📏]`.gray.dim);
    }));

    console.log(`💻 ${monitors.length + 1}. All Monitors\n`.gray.dim);
}

async function invalidChoice() {
    console.log('Invalid choice..'.red);
    await new Promise(resolve => setTimeout(resolve, 1250));
    clear();
    return main();
}

async function main() {
    const monitors = lumi.monitors();

    await displayOptions(monitors);

    rl.question(`Enter your choice (1 to ${monitors.length + 1}): `.gray, async (choice) => {
        const choiceNumber = Number(choice);

        if(isNaN(choiceNumber) || choiceNumber > monitors.length + 1) return invalidChoice();

        clear();

        await Promise.all(monitors.map(async (monitor, index) => {
            const brightness = await lumi.get(monitor.id);
            const description = `🖥️ ${monitor.name} [${(isNaN(brightness.brightness) ? 'Unknown' : brightness.brightness)}% 🔆] [${monitor.size.width}x${monitor.size.height} 📏]`;
            console.log((index + 1 === choiceNumber) ? description.gray : description.gray.dim);
        }));

        console.log((choiceNumber === monitors.length + 1) ? `💻 All Monitors\n`.gray : `💻 All Monitors\n`.gray.dim);

        rl.question(`What percentage would you like to set for ${choice === String(Number(monitors.length + 1)) ? 'all monitors:' : 'your monitor:'} `, async (choiceTwo) => {
            const choiceTwoNumber = Number(choiceTwo);

            if(isNaN(choiceTwoNumber) || choiceTwoNumber > 100 || choiceTwoNumber < 0) return invalidChoice();

            if(choiceNumber === monitors.length + 1) {
                const obj = monitors.reduce((acc, monitor) => ({...acc, [monitor.id]: choiceTwoNumber }), {});

                const { success, message } = await lumi.set(obj);

                messageHandler(success, `${monitors.length} monitors set to ${choiceTwoNumber}% 🔆`);
            } else {
                const { success, message } = await lumi.set(monitors[choiceNumber - 1].id, choiceTwoNumber);

                messageHandler(success, `Successfully set 1 monitor to ${choiceTwoNumber}% 🔆`);
            }
        });
    });
}

async function messageHandler(success, message) {
    console.log((success ? message.green.dim : message.red.dim));
    await new Promise(resolve => setTimeout(resolve, 1250));
    success ? process.exit(0) : rl.close();
}

main().catch((error) => {
    console.error('An error occurred:', error);
});