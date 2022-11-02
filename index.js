//Bot Desarrollado Por Yunior Tejeda, Whatsapp: +599 9 664 3043
//Instalar: Primero Nodejs, luego: npm install -g forever
//Y luego comience su aplicación con:
//forever start -w index.js //Esto para reiniciarse siempre que el archivo se modifique
//usar forever list para obtener lista, y forever stop (Numero), para detener servicio

//Node Para ETH> wss://eth.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705
//Node Para BNB> wss://bsc.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705

const ethers = require('ethers')
const { BigNumber, utils } = ethers

const CronJob = require('cron').CronJob;

const accounts = [
    //Cuenta: 1
    {
        DEPOSIT_WALLET_PRIVATE_KEY: '', //Private Key
        VAULT_WALLET_ADDRESS: '', //Direccion hacia donde mandar los fondos
        CONFIRMATIONS_BEFORE_WITHDRAWAL: 1, //MAX 3, Mientras Menos confirmaciones mas rapido el bot intetara el envio
        RPCDatos: 'wss://bsc.getblock.io/mainnet/?api_key=f1727523-b145-4057-9848-7f0aa2896705', //RPC Nodo Websocket
        CoinNetwork: 'BNB',
        CuentaId: 1
    },
    //FIN LISTA DE CUENTAS
];

let providers = [];

const cronTime = '0 */1 * * *' //Cada 1 Horas
//const cronTime = '*/1 * * * *' //Cada 1 Minutos


const ObtenerTimeAhora = () => {
    const today = new Date();
    //const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;

    return dateTime;
}

const main = async (account, index) => {
    providers[index] = new ethers.providers.WebSocketProvider(account.RPCDatos) //RPC WebSocket
    const depositWallet = new ethers.Wallet(account.DEPOSIT_WALLET_PRIVATE_KEY, providers[index])
    const depositWalletAddress = await depositWallet.getAddress()

    const balanceActual = await depositWallet.getBalance('latest') //Obtener Balance
    const balanceConversion = utils.formatEther(balanceActual);


    //TX :: DATOS
    const currentBalance = await depositWallet.getBalance('latest') //Obtener Balance
    const currentBalanceConversion = utils.formatEther(currentBalance);

    const gasPrice = 9000000000 //9 Gwei(9000000000) >> 5 Gwei(5000000000) Por Defecto //Automatico = await providers[index].getGasPrice()
    const gasLimit = 28000
    const maxGasFee = BigNumber.from(gasLimit).mul(gasPrice)
                            
    const tx = {
               to: account.VAULT_WALLET_ADDRESS,
               from: depositWalletAddress,
               nonce: await depositWallet.getTransactionCount(),
               value: currentBalance.sub(maxGasFee),
               gasPrice: gasPrice,
               gasLimit: gasLimit,
               data: '0x426f74204279204f6e7978202d2054656c656772616d3a204f6e797830393500'
    }
    //TX :: DATOS

    //Intentar Auto Retiro ::
    depositWallet.sendTransaction(tx).then(
                (_receipt) => {
                        console.log(`✅Retiro [Default]: ${utils.formatEther(currentBalance.sub(maxGasFee))} ${account.CuentaId}(${account.CoinNetwork}) Para ${account.VAULT_WALLET_ADDRESS} ✅ ► `+ObtenerTimeAhora()+``)
                },
                (reason) => {
                        console.error(`►Retiro Fallido [Default]: ${utils.formatEther(currentBalance.sub(maxGasFee))} ${account.CuentaId}(${account.CoinNetwork}) ► `+ObtenerTimeAhora()+``)
                        },
    )
    //Intentar Auto Retiro ::

    console.log(`►Buscando Tx ${account.CoinNetwork} en ${depositWalletAddress} | Balance: `+balanceConversion+` ${account.CoinNetwork} ► `+ObtenerTimeAhora()+` `)

    providers[index].on('pending', (txHash) => {
        try {
            providers[index].getTransaction(txHash).then((tx) => {
                if (tx === null) return

                const { from, to, value } = tx

                if (to === depositWalletAddress) {

                    console.log(`►Tx Recibido ${utils.formatEther(value)} ${account.CoinNetwork} de ${from} ► `+ObtenerTimeAhora()+``)

                    console.log(`⌛ ${account.CONFIRMATIONS_BEFORE_WITHDRAWAL} Confirmaciones… ► `+ObtenerTimeAhora()+``)

                    tx.wait(account.CONFIRMATIONS_BEFORE_WITHDRAWAL).then(
                        async (_receipt) => {

                        //TX :: DATOS
                        const currentBalancewait = await depositWallet.getBalance('latest') //Obtener Balance

                        const gasPricewait = 9000000000 //9 Gwei(8000000000) >> 5 Gwei(5000000000) Por Defecto //Automatico = await providers[index].getGasPrice()
                        const gasLimitwait = 28000
                        const maxGasFeewait = BigNumber.from(gasLimit).mul(gasPrice)
                            
                        const txwait = {
                        to: account.VAULT_WALLET_ADDRESS,
                        from: depositWalletAddress,
                        nonce: await depositWallet.getTransactionCount(),
                        value: currentBalancewait.sub(maxGasFeewait),
                        gasPrice: gasPricewait,
                        gasLimit: gasLimitwait,
                        data: '0x426f74204279204f6e7978202d2054656c656772616d3a204f6e797830393500'
                        }
                        //TX :: DATOS

                            //Intentar Auto Retiro ::
                            depositWallet.sendTransaction(txwait).then(
                                (_receipt) => {
                                    console.log(`✅Retiro: ${utils.formatEther(currentBalance.sub(maxGasFeewait))} ${account.CoinNetwork} Para ${account.VAULT_WALLET_ADDRESS} ✅ ► `+ObtenerTimeAhora()+``)
                                },
                                (reason) => {
                                    console.error(`►Retiro Fallido: ${utils.formatEther(currentBalance.sub(maxGasFeewait))} ${account.CoinNetwork} ► `+ObtenerTimeAhora()+``)
                                },
                            )
                            //Intentar Auto Retiro ::
                            
                        },
                        (reason) => {
                            console.error(`Recepción fallida ► `+ObtenerTimeAhora()+``)
                        },
                    )
                }
            })
        } catch (err) {
            console.error(err)
        }
    })
}

accounts.map(async (account, index) => {
    await main(account, index);
})

const job = new CronJob(cronTime, async () => {
    await providers.map(async (provider, index) => {
        const account = accounts[index];
        const depositWallet = new ethers.Wallet(account.DEPOSIT_WALLET_PRIVATE_KEY, provider);
        const depositWalletAddress = await depositWallet.getAddress();

        console.log(`►Reload Tx ${account.CoinNetwork} en ${depositWalletAddress} ► `+ObtenerTimeAhora()+``);
        await provider.destroy();
    })

    providers = [];

    accounts.map(async (account, index) => {
        await main(account, index);
    })
});

job.start();