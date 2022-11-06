//forever start -w index_cron.js //Esto para reiniciarse siempre que el archivo se modifique
//usar forever list para obtener lista, y forever top (Numero), para detener servicio

//Node Para ETH> wss://eth.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d
//Node Para BNB> wss://bsc.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d
//RPC JSON BNB> https://bsc-dataseed1.binance.org

const ethers = require('ethers')
const { BigNumber, utils } = ethers

const CronJob = require('cron').CronJob;

const cronTime = '*/1 * * * * *'; //Cada 1 Segundo Intentar

const ObtenerTimeAhora = () => {
    const today = new Date();
    //const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;

    return dateTime;
}

RPCSelect = 0; //1 es Websocket, 0 es RPC JSON Metamask
//LOAD :: GAS CONFIG

//Velocidad Rapida :: Para Transacciones de menos de 0.07$
GasLimitFast = 23000 //23 Mil, Limite de Gas Para Velocidad Rapida
GasPriceFast = 6000000000 //6 Gwei, Para Aumentarlo o Disminuir Solo cambia el numero 6

//Velocidad Maxima :: Para Transacciones de mas de 0.10$
GasLimitMX = 27000 //29 Mil, Limite de Gas Para Velocidad Maxima
GasPriceMX = 15000000000 //13 Gwei, Para Aumentarlo o Disminuir Solo cambia el numero 13
//LOAD :: GAS CONFIG

//Account :: Token :: :: :: :: :: :: ::
const DEPOSIT_WALLET_PRIVATE_KEY = 'PRIVATE KEY ACA'; //Private Key
const VAULT_WALLET_ADDRESS = 'DIRECCION DONDE DESEA RECIBIR LOS FONDOS'; //Direccion hacia donde mandar los fondos
const CuentaId = 1;
//Network
const CONFIRMATIONS_BEFORE_WITHDRAWAL = 1;
const RPCUrl = 'wss://bsc.getblock.io/mainnet/?api_key=db2839bb-179e-47e7-9d2f-16aedbb2f74d'; //RPC Websocket
const RPCUrlJson = 'https://bsc-dataseed1.binance.org'; //RPC JSON :: Metamask
const Network = 'BNB'; //Network Name
//Account :: Token :: :: :: :: :: :: ::


//Ejecutar Siempre lo que este adentro
const job = new CronJob(cronTime, async () => {

    //ETHERS.JS :: Datos
    //Select RPC Tipo
    if(RPCSelect == 1){
    //Valor 1 = Websocket
    provider = new ethers.providers.WebSocketProvider(RPCUrl) //RPC WebSocket
    }else{
    //Valor 0 = RPC JSON Metamask
    provider = new ethers.providers.JsonRpcProvider(RPCUrlJson); //RPC JSON :: Metamask
    }
    //Select RPC Tipo

    const depositWallet = new ethers.Wallet(DEPOSIT_WALLET_PRIVATE_KEY, provider)
    const depositWalletAddress = await depositWallet.getAddress()

    //TX :: DATOS
    const currentBalance = await depositWallet.getBalance('latest') //Obtener Balance
    const currentBalanceConversion = await utils.formatEther(currentBalance); //Convertimos Balance en Valor del Token

    //Obtener Valor de Maximo Fee en BNB
    const MaxVelocidadFee = BigNumber.from(GasLimitMX).mul(GasPriceMX) //Obtenemos Valor de Comision MAXIMA Velocidad
    const MaxVelocidadFeeConversion = utils.formatEther(MaxVelocidadFee); //Calcular Comision Total en BNB
    //Obtener Valor de Maximo Fee en BNB

    //FILTRAR LIMITE DE Gwei Segun el Deposito
    if(currentBalanceConversion >= MaxVelocidadFeeConversion){
    //Si El Maximo Fee es Menor que la Cantidad Disponible de BNB > Entonces Realizamos Retiro con Maxima Velocidad 9 Gwei
    gasPrice = GasPriceMX //Automatico = await providers[index].getGasPrice()
    gasLimit = GasLimitMX
    }else{
    //Por Defecto :: Si El Maximo Fee es Mayor que la Cantidad Disponible en BNB > Entonces Realizamos Retiro con Velocidad Rapida 6 Gwei
    gasPrice = GasPriceFast //Automatico = await provider.getGasPrice()
    gasLimit = GasLimitFast
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
                                console.log(`Retiro ${currentBalanceConversion} ${Network} Fallido ► `+ObtenerTimeAhora()+``)
                                },
    )
    //Transfer



});

job.start();