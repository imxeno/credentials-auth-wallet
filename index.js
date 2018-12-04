const prompt = require("prompt");
const randomSeed = require('random-seed');
const { sha512 } = require('js-sha512');
const ethers = require('ethers');

prompt.start();

const schema = {
    properties: {
      username: {
        pattern: /^\S{8,}$/,
        message: 'Username must contain more than 8 non-whitespace characters',
        required: true
      },
      password: {
        pattern: /^(?=.*[A-Z])(?=.*[!@#$&*-_])(?=.*[0-9])(?=.*[a-z]).{12,}$/,
        message: 'Password must be at least 12 characters long, must contain one digit, one uppercase letter, one lowercase letter and one special char',
        required: true,
        hidden: true
      },
    }
  };

prompt.get(schema, (err, result) => {
    const hash = sha512(result.username + result.password);
    const rand = randomSeed.create(hash);
    const privateKeyBuffer = Buffer.alloc(32, 0);
    for(let i = 0; i < privateKeyBuffer.length; i++) {
        privateKeyBuffer[i] = rand.range(256);
    }
    const privateKey = "0x" + privateKeyBuffer.toString("hex");
    const wallet = new ethers.Wallet(privateKey);
    console.log("Unlocked wallet: ");
    console.log({ address: wallet.address, privateKey: wallet.privateKey});
});