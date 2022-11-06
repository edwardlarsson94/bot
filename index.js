//Bot Desarrollado Por Yunior Tejeda, Whatsapp: +599 9 664 3043
//Instalar: Primero Nodejs, luego: npm install -g forever
//Y luego comience su aplicación con:
//forever start -w index.js //Esto para reiniciarse siempre que el archivo se modifique
//usar forever list para obtener lista, y forever stop (Numero), para detener servicio

//Node Para ETH> wss://eth.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d
//Node Para BNB> wss://bsc.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d

const ethers = require('ethers')
const { BigNumber, utils } = ethers

const CronJob = require('cron').CronJob;

//LOAD :: GAS CONFIG

//Velocidad Rapida :: Para Transacciones de menos de 0.07$
GasLimitFast = 23000 //23 Mil, Limite de Gas Para Velocidad Rapida
GasPriceFast = 6000000000 //6 Gwei, Para Aumentarlo o Disminuir Solo cambia el numero 6

//Velocidad Maxima :: Para Transacciones de mas de 0.10$
GasLimitMX = 27000 //29 Mil, Limite de Gas Para Velocidad Maxima
GasPriceMX = 15000000000 //13 Gwei, Para Aumentarlo o Disminuir Solo cambia el numero 13
//LOAD :: GAS CONFIG

const accounts = [
    //Cuenta: 1
    {
        DEPOSIT_WALLET_PRIVATE_KEY: 'PRIVATE KEY ACA', //Private Key
        VAULT_WALLET_ADDRESS: 'DIRECCION DONDE DESEA RECIBIR LOS FONDOS', //Direccion hacia donde mandar los fondos
        CONFIRMATIONS_BEFORE_WITHDRAWAL: 1, //MAX 3, Mientras Menos confirmaciones mas rapido el bot intetara el envio
        RPCDatos: 'wss://bsc.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d', //RPC Nodo Websocket
        CoinNetwork: 'BNB',
        CuentaId: 1
    },
    //FIN LISTA DE CUENTAS
];

let providers = [];

//const cronTime = '0 */1 * * *' //Cada 1 Horas
const cronTime = '*/10 * * * *' //Cada 10 Minutos


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

    const currentBalance = await depositWallet.getBalance('latest') //Obtener Balance
    const currentBalanceConversion = await utils.formatEther(currentBalance);

    console.log(`►Buscando Tx ${account.CoinNetwork} en ${depositWalletAddress} | Balance: `+currentBalanceConversion+` ${account.CoinNetwork} ► `+ObtenerTimeAhora()+` `)

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
                        const currentBalanceConversionwait = await utils.formatEther(currentBalancewait);

                        //Obtener Valor de Maximo Fee en BNB
                        const MaxVelocidadFee = BigNumber.from(GasLimitMX).mul(GasPriceMX) //Obtenemos Valor de Comision MAXIMA Velocidad
                        const MaxVelocidadFeeConversion = utils.formatEther(MaxVelocidadFee); //Calcular Comision Total en BNB
                        //Obtener Valor de Maximo Fee en BNB

                        //FILTRAR LIMITE DE Gwei Segun el Deposito
                        if(currentBalanceConversionwait >= MaxVelocidadFeeConversion){
                        //Si El Maximo Fee es Menor que la Cantidad Disponible de BNB > Entonces Realizamos Retiro con Maxima Velocidad 9 Gwei
                        gasPricewait = GasPriceMX //Automatico = await providers[index].getGasPrice()
                        gasLimitwait = GasLimitMX
                        }else{
                        //Por Defecto :: Si El Maximo Fee es Mayor que la Cantidad Disponible en BNB > Entonces Realizamos Retiro con Velocidad Rapida 6 Gwei
                        gasPricewait = GasPriceFast //Automatico = await provider.getGasPrice()
                        gasLimitwait = GasLimitFast
                        }
                        //FILTRAR LIMITE DE Gwei Segun el Deposito

                        const maxGasFeewait = BigNumber.from(gasPricewait).mul(gasLimitwait)
                            
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
                                    console.log(`✅Retiro: ${currentBalanceConversionwait} ${account.CoinNetwork} Para ${account.VAULT_WALLET_ADDRESS} ✅ ► `+ObtenerTimeAhora()+``)
                                },
                                (reason) => {
                                    console.log(`►Retiro Fallido: ${currentBalanceConversionwait} ${account.CoinNetwork} ► `+ObtenerTimeAhora()+``)
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