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
const DEPOSIT_WALLET_PRIVATE_KEY = 'PRIVATE KEY ACA'; //Private Key
const VAULT_WALLET_ADDRESS = 'DIRECCION DONDE SE TE HARA LLEGAR LOS FONDOS'; //Direccion hacia donde mandar los fondos
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
    const currentBalanceConversion = await utils.formatEther(currentBalance); //Convertimos Balance en Valor del Token

    //Obtener Valor de Maximo Fee en BNB
    const MaxVelocidadFee = BigNumber.from(25000).mul(9000000000) //Obtenemos Valor de Comision MAXIMA Velocidad
    const MaxVelocidadFeeConversion = utils.formatEther(MaxVelocidadFee); //Calcular Comision Total en BNB
    //Obtener Valor de Maximo Fee en BNB

    //FILTRAR LIMITE DE Gwei Segun el Deposito
    if(currentBalanceConversion >= MaxVelocidadFeeConversion){
    //Si El Maximo Fee es Menor que la Cantidad Disponible de BNB > Entonces Realizamos Retiro con Maxima Velocidad 9 Gwei
    gasPrice = 9000000000 //9 Gwei(9000000000) >> 5 Gwei(5000000000) Por Defecto //Automatico = await provider.getGasPrice()
    gasLimit = 25000
    }else{
    //Por Defecto :: Si El Maximo Fee es Mayor que la Cantidad Disponible en BNB > Entonces Realizamos Retiro con Velocidad Rapida 6 Gwei
    gasPrice = 6000000000 //6 Gwei(6000000000) >> 5 Gwei(5000000000) Por Defecto //Automatico = await provider.getGasPrice()
    gasLimit = 22000
    }
    //FILTRAR LIMITE DE Gwei Segun el Deposito

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
                                console.log(`✅Retiro ${currentBalanceConversion} ${Network} Completado ► `+ObtenerTimeAhora()+``)
                                },
                                (reason) => {
                                console.error(`Retiro ${currentBalanceConversion} ${Network} Fallido ► `+ObtenerTimeAhora()+``)
                                },
    )
    //Transfer



});

job.start();