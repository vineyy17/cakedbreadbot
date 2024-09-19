# Caked Bread Deposit Monitor Bot

A Telegram bot that monitors deposits made into the Caked Bread smart contract and sends real-time alert notifications to a specified Telegram group.

## 🌟 Features

- Real-time monitoring of deposits to the Caked Bread smart contract
- Instant Telegram notifications for new deposits
- Custom bread emoji indicators based on deposit size
- Automatic BNB to USD conversion for deposit amounts
- TVL (Total Value Locked) tracking and reporting
- Minimum deposit threshold to filter out small transactions
- Persistent tracking of the last processed block to prevent missed transactions
- Robust error logging for easy debugging

## 🛠 Tech Stack

- **Node.js**
- **Web3.js** for blockchain interaction
- **Telegraf.js** for Telegram bot functionality
- **Winston** for logging
- **Dotenv** for environment variable management

## 📋 Prerequisites

- **Node.js** (v14 or later recommended)
- **npm** (comes with Node.js)
- A Telegram Bot Token (obtain from [@BotFather](https://t.me/BotFather))
- BSC Node URL (you can use a service like [QuickNode](https://www.quicknode.com/))
- Caked Bread contract address
- Telegram Chat ID where notifications will be sent

## 🚀 Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/caked-bread-deposit-monitor.git
    cd caked-bread-deposit-monitor
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following contents:

    ```env
    BOT_TOKEN=your_telegram_bot_token
    BSC_NODE_URL=your_bsc_node_url
    CONTRACT_ADDRESS=caked_bread_contract_address
    TELEGRAM_CHAT_ID=your_telegram_chat_id
    ```

4. Place your notification video (named `IMG_1786.MP4`) in the `assets` folder.

## 💻 Usage

To start the bot, run:

```bash
node index.js
