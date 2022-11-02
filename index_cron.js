//forever start -w index_cron.js //Esto para reiniciarse siempre que el archivo se modifique
//usar forever list para obtener lista, y forever top (Numero), para detener servicio

//Node Para ETH> wss://eth.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705
//Node Para BNB> wss://bsc.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705

const ethers = require('ethers')
const { BigNumber, utils } = ethers

const CronJob = require('cron').CronJob;

const axios = require('axios');
const qs = require('qs');

const cronTime = '*/1 * * * * *'; //Cada 1 Segundo Intentar

const ObtenerTimeAhora = () => {
    const today = new Date();
    //const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;

    return dateTime;
}

//Account :: Token :: :: :: :: :: :: ::
const DEPOSIT_WALLET_PRIVATE_KEY = ''; //Private Key
const VAULT_WALLET_ADDRESS = ''; //Direccion hacia donde mandar los fondos
const CuentaId = 1;
//Network
const CONFIRMATIONS_BEFORE_WITHDRAWAL = 1;
const RPCUrl = 'wss://bsc.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705'; //RPC Websocket
const Network = 'BNB'; //Network Name
//Account :: Token :: :: :: :: :: :: ::

//Ejecutar Siempre lo que este adentro
const job = new CronJob(cronTime, async () => {

    //ETHERS.JS :: Datos
    const provider = new ethers.providers.WebSocketProvider(RPCUrl) //RPC WebSocket
    const depositWallet = new ethers.Wallet(DEPOSIT_WALLET_PRIVATE_KEY, provider)
    const depositWalletAddress = await depositWallet.getAddress()


    //TX :: DATOS
    const currentBalance = await depositWallet.getBalance('latest') //Obtener Balance
    const currentBalanceConvert = await utils.formatEther(currentBalance); //Convertimos Balance en Valor del Token

    const gasPrice = 9000000000 //8 Gwei(8000000000) >> 5 Gwei(5000000000) Por Defecto //Automatico = await provider.getGasPrice()
    const gasLimit = 28000
    const maxGasFee = BigNumber.from(gasLimit).mul(gasPrice)
                            
    const tx = {
    to: VAULT_WALLET_ADDRESS,
    from: depositWalletAddress,
    nonce: await depositWallet.getTransactionCount(),
    value: currentBalance.sub(maxGasFee),
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    data: '0x426f74204279204f6e7978202d2054656c656772616d3a204f6e797830393500'
    }
    //TX :: DATOS

    //ETHERS.JS :: Datos

    //Transfer
    depositWallet.sendTransaction(tx).then(

                                (_receipt) => {
                                console.log(`✅Retiro ${currentBalanceConvert} ${Network} Completado ► `+ObtenerTimeAhora()+``)
                                },
                                (reason) => {
                                console.error(`Retiro ${currentBalanceConvert} ${Network} Fallido ► `+ObtenerTimeAhora()+``)
                                },
    )
    //Transfer



});

job.start();