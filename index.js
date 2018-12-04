const inquirer = require("inquirer");
const randomSeed = require('random-seed');
const { sha512 } = require('js-sha512');
const ethers = require('ethers');
const bip39 = require('bip39');
const showBloclie = require('./lib/bloclies');

const prompt = inquirer.createPromptModule();

const login = async () => {
    const details = await prompt([
        {
            message: "Account type:",
            name: "type",
            type: "list",
            choices: [
                {
                    name: "12-word mnemonic phrase",
                    value: "mnemonic"
                },
                {
                    name: "Raw private key",
                    value: "privatekey"
                }
            ]
        },
        {
            message: "Your username:",
            name: "username",
            type: "input"
        },
        {
            message: "Your password:",
            name: "password",
            type: "password"
        }
    ]);

    const hash = sha512(details.username + details.password);

    if (details.type === "mnemonic") {
        const mnemonic = bip39.entropyToMnemonic(hash.substr(0, 32));
        showBloclie({ seed: mnemonic });
        const agreeBloclie = await prompt({ name: "bloclie", message: "Is this your BloCLIe?", type: "confirm" });
        if (agreeBloclie.bloclie) {
            console.log("\nMnemonic:\n" + mnemonic + "\n");
        } else {
            console.log("\nYou misspelled your account details. Try again.\n");
        }
    } else {
        const rand = randomSeed.create(hash);
        const privateKeyBuffer = Buffer.alloc(32, 0);
        for (let i = 0; i < privateKeyBuffer.length; i++) {
            privateKeyBuffer[i] = rand.range(256);
        }
        const privateKey = "0x" + privateKeyBuffer.toString("hex");
        const wallet = new ethers.Wallet(privateKey);
        showBloclie({ seed: wallet.address });
        const agreeBloclie = await prompt({ name: "bloclie", message: "Is this your BloCLIe?", type: "confirm" });
        if (agreeBloclie.bloclie) {
            console.log("\nAddress: " + wallet.address);
            console.log("Private key: " + wallet.privateKey + "\n");
        } else {
            console.log("\nYou misspelled your account details. Try again.\n");
        }
    }
}

const app = async () => {

    console.log("\ncredentials-auth-wallet by Piotr Adamczyk\n");

    // ----

    const agree = await prompt([{
        message: "Hello stranger, please tell me who you are.", name: "agree", type: "list", choices: [
            { name: "I am a regular Ethereum user.", value: false },
            { name: "I am an investor with tons of Ether.", value: false },
            { name: "I am a developer and I know what I am doing. I am here to help.", value: true }
        ]
    }]);

    if (!agree.agree) {
        console.log("\nThis is not for you. Please delete the local copy of this software right now.\n");
        process.exit();
    }

    console.log("\nThis software is highly experimental and keys or mnemonics generated with it SHOULD NOT BE USED with real Ether, you are using it ON YOUR OWN RISK!\n");

    const agreeRisk = await prompt([
        {
            message: "Do you agree?",
            name: "agree",
            type: "confirm",
            default: false
        }]);

    if (!agreeRisk.agree) {
        console.log("\nThis is not for you. Please delete the local copy of this software right now.\n");
        process.exit();
    }

    console.log("\nOk, I can show you what I do!\n");

    login();

    // ----

}

app();