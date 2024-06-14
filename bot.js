import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Telegraf } from 'telegraf';
import Web3 from 'web3';
import fs from 'fs';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.BSC_NODE_URL),
);
const contractAddress = process.env.CONTRACT_ADDRESS;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

let lastBlock = null;
if (fs.existsSync('lastBlock.txt')) {
  lastBlock = BigInt(fs.readFileSync('lastBlock.txt', 'utf8'));
}

const saveLastBlock = (blockNumber) => {
  fs.writeFileSync('lastBlock.txt', blockNumber.toString(), 'utf8');
};

const formatBNB = (amount) => web3.utils.fromWei(amount, 'ether');

const getBNBPrice = async () => {
  const response = await fetch(
    'https://api.coinpaprika.com/v1/tickers/bnb-binance-coin',
  );
  const data = await response.json();
  return parseFloat(data.quotes.USD.price);
};

const getContractBalance = async () => {
  const balance = await web3.eth.getBalance(contractAddress);
  return formatBNB(balance);
};

const getBreadEmojis = (amount) => {
  if (amount >= 6 && amount < 20) {
    return '🍞🍞';
  } else if (amount >= 20 && amount < 80) {
    return '🍞🍞🍞🍞';
  } else if (amount >= 80 && amount < 100) {
    return '🍞🍞🍞🍞🍞🍞';
  } else if (amount >= 100 && amount < 500) {
    return '🍞🍞🍞🍞🍞🍞🍞🍞';
  } else if (amount >= 500) {
    return '🍞🍞🍞🍞🍞🍞🍞🍞🍞🍞';
  }
  return '';
};

const sendNotification = async (transaction) => {
  const bnbPrice = await getBNBPrice();
  const valueBNB = parseFloat(formatBNB(transaction.value)).toFixed(3);
  const valueUSD = (valueBNB * bnbPrice).toFixed(2);
  const contractBalanceBNB = parseFloat(await getContractBalance()).toFixed(2);
  const contractBalanceUSD = (contractBalanceBNB * bnbPrice).toFixed(2);

  if (parseFloat(valueBNB) < 0.01) {
    return;
  }

  const breadEmojis = getBreadEmojis(parseFloat(valueBNB) * bnbPrice);

  const message = `
  *NEW DEPOSIT* in [Caked Bread](https://cakedbread.app/)!
  
*💵 BUY*: ${valueBNB} BNB ( ~ ${valueUSD} $)

${breadEmojis}

*🏦 TVL*: ${contractBalanceBNB} BNB ( ~ ${contractBalanceUSD} $)
  
[Tx](https://bscscan.com/tx/${transaction.hash}) | [Buyer](https://bscscan.com/address/${transaction.from}) | [Deposit here](https://cakedbread.app/)
  `;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const videoPath = path.join(__dirname, 'assets', 'IMG_1786.MP4');
  await bot.telegram.sendVideo(
    chatId,
    { source: videoPath },
    {
      caption: message,
      parse_mode: 'Markdown',
    },
  );
};

const trackDeposits = async () => {
  try {
    const latestBlock = BigInt(await web3.eth.getBlockNumber());

    if (lastBlock === null) {
      lastBlock = latestBlock;
      return;
    }

    for (let i = lastBlock + 1n; i <= latestBlock; i++) {
      const block = await web3.eth.getBlock(i, true);
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (tx.to && tx.to.toLowerCase() === contractAddress.toLowerCase()) {
            await sendNotification(tx);
          }
        }
      }
    }

    lastBlock = latestBlock;
    saveLastBlock(lastBlock);
  } catch (error) {
    logger.error('Error tracking deposits:', error);
  }
};

// Periodically check for new transactions every 10 seconds
setInterval(trackDeposits, 10000);

console.log('Bot is running and monitoring blockchain transactions...');
