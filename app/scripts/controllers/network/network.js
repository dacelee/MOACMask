const assert = require('assert')
const EventEmitter = require('events')
const createMetamaskProvider = require('moac-provider-engine/zero.js')
const SubproviderFromProvider = require('moac-provider-engine/subproviders/provider.js')
const createInfuraProvider = require('eth-json-rpc-infura/src/createProvider')
const ObservableStore = require('obs-store')
const ComposedStore = require('obs-store/lib/composed')
const extend = require('xtend')
const EthQuery = require('eth-query')
const createEventEmitterProxy = require('../../lib/events-proxy.js')
const log = require('loglevel')
const {
  ROPSTEN,
  RINKEBY,
  KOVAN,
  MAINNET,
  MOACMAIN,
  MOACTEST,
  LOCALHOST,
} = require('./enums');
const MOAC_MAIN_URL = "https://www.moacwalletonline.com/main";
const MOAC_TEST_URL = "https://www.moacwalletonline.com/test";
const LOCALHOST_RPC_URL = 'http://localhost:8545'
const INFURA_PROVIDER_TYPES = [ROPSTEN, RINKEBY, KOVAN, MAINNET]
const MOAC_PROVIDER_TYPES = [MOACMAIN, MOACTEST]

const env = process.env.METAMASK_ENV
const METAMASK_DEBUG = process.env.METAMASK_DEBUG
const testMode = (METAMASK_DEBUG || env === 'test')

const defaultProviderConfig = {
  type: testMode ? RINKEBY : MAINNET,
}

module.exports = class NetworkController extends EventEmitter {

  constructor (opts = {}) {
    super()

    // parse options
    const providerConfig = opts.provider || defaultProviderConfig
    // create stores
    this.providerStore = new ObservableStore(providerConfig)
    this.networkStore = new ObservableStore('loading')
    this.store = new ComposedStore({ provider: this.providerStore, network: this.networkStore })
    // create event emitter proxy
    this._proxy = createEventEmitterProxy()

    this.on('networkDidChange', this.lookupNetwork)
  }

  initializeProvider (_providerParams) {
    this._baseProviderParams = _providerParams
    const { type, rpcTarget } = this.providerStore.getState()
    this._configureProvider({ type, rpcTarget })
    this._proxy.on('block', this._logBlock.bind(this))
    this._proxy.on('error', this.verifyNetwork.bind(this))
    this.ethQuery = new EthQuery(this._proxy)
    this.lookupNetwork()
    return this._proxy
  }

  verifyNetwork () {
    // Check network when restoring connectivity:
    if (this.isNetworkLoading()) this.lookupNetwork()
  }

  getNetworkState () {
    return this.networkStore.getState()
  }

  setNetworkState (network) {
    return this.networkStore.putState(network)
  }

  isNetworkLoading () {
    return this.getNetworkState() === 'loading'
  }

  lookupNetwork () {
    // Prevent firing when provider is not defined.
    if (!this.ethQuery || !this.ethQuery.sendAsync) {
      return log.warn('NetworkController - lookupNetwork aborted due to missing ethQuery')
    }
    this.ethQuery.sendAsync({ method: 'net_version' }, (err, network) => {
      if (err) return this.setNetworkState('loading')
      log.info('web3.getNetwork returned ' + network)
      this.setNetworkState(network)
    })
  }

  setRpcTarget (rpcTarget) {
    const providerConfig = {
      type: 'rpc',
      rpcTarget,
    }
    log.info("setRpcTarget:"+rpcTarget)
    this.providerConfig = providerConfig
  }

//Add MOAC provider
  async setProviderType (type) {
    assert.notEqual(type, 'rpc', `NetworkController - cannot call "setProviderType" with type 'rpc'. use "setRpcTarget"`)
    // assert(INFURA_PROVIDER_TYPES.includes(type) || type === LOCALHOST, `NetworkController - Unknown rpc type "${type}"`)
    
    assert(INFURA_PROVIDER_TYPES.includes(type) || MOAC_PROVIDER_TYPES.includes(type) || type === LOCALHOST, `NetworkController - Unknown rpc type "${type}"`)
    const providerConfig = { type }
    // console.log
    this.providerConfig = providerConfig
  }

  resetConnection () {
    this.providerConfig = this.getProviderConfig()
  }

  set providerConfig (providerConfig) {
    this.providerStore.updateState(providerConfig)
    this._switchNetwork(providerConfig)
  }

  getProviderConfig () {
    return this.providerStore.getState()
  }

  //
  // Private
  //

  _switchNetwork (opts) {
    this.setNetworkState('loading')
    this._configureProvider(opts)
    this.emit('networkDidChange')
  }

  _configureProvider (opts) {
    const { type, rpcTarget } = opts
    // infura type-based endpoints
    const isInfura = INFURA_PROVIDER_TYPES.includes(type)
    // const isMoac = MOAC_PROVIDER_TYPES.includes(type)
    if (isInfura) {

      this._configureInfuraProvider(opts)
    // other type-based rpc endpoints
    }else if( type === MOACMAIN){
      this._configureMoacProvider({rpcUrl: MOAC_MAIN_URL})  
    } else if( type === MOACTEST){
    // other type-based rpc endpoints	      
    this._configureMoacProvider({rpcUrl: MOAC_TEST_URL})
    } else if (type === LOCALHOST) {
      this._configureStandardProvider({ rpcUrl: LOCALHOST_RPC_URL })
    // url-based rpc endpoints
    } else if (type === 'rpc'){
      this._configureStandardProvider({ rpcUrl: rpcTarget })
    } else {
      throw new Error(`NetworkController - _configureProvider - unknown type "${type}"`)
    }
  }

//Modify to use only MOAC, set to hard code, not using 
  // _configureMoacProvider ({ type }) {
  //   log.info('_configureInfuraProvider', type)
    // const infuraProvider = createInfuraProvider({ network: type })
    // const infuraSubprovider = new SubproviderFromProvider(infuraProvider)
  _configureMoacProvider ({ rpcUrl }) {
    const providerParams = extend(this._baseProviderParams, {
      rpcUrl,
      engineParams: {
        pollingInterval: 8000,
        // blockTrackerProvider: infuraProvider,
      },
      // dataSubprovider: infuraSubprovider,
    })
    const provider = createMetamaskProvider(providerParams)
    this._setProvider(provider)
  }

  _configureInfuraProvider ({ type }) {
    log.info('_configureInfuraProvider', type)
    const infuraProvider = createInfuraProvider({ network: type })
    const infuraSubprovider = new SubproviderFromProvider(infuraProvider)
    const providerParams = extend(this._baseProviderParams, {
      engineParams: {
        pollingInterval: 8000,
        blockTrackerProvider: infuraProvider,
      },
      dataSubprovider: infuraSubprovider,
    })
    const provider = createMetamaskProvider(providerParams)
    this._setProvider(provider)
  }

  _configureStandardProvider ({ rpcUrl }) {
    const providerParams = extend(this._baseProviderParams, {
      rpcUrl,
      engineParams: {
        pollingInterval: 8000,
      },
    })
    const provider = createMetamaskProvider(providerParams)
    this._setProvider(provider)
  }

  _setProvider (provider) {
    // collect old block tracker events
    const oldProvider = this._provider
    let blockTrackerHandlers
    if (oldProvider) {
      // capture old block handlers
      blockTrackerHandlers = oldProvider._blockTracker.proxyEventHandlers
      // tear down
      oldProvider.removeAllListeners()
      oldProvider.stop()
    }
    // override block tracler
    provider._blockTracker = createEventEmitterProxy(provider._blockTracker, blockTrackerHandlers)
    // set as new provider
    this._provider = provider
    this._proxy.setTarget(provider)
  }

  _logBlock (block) {
    log.info(`BLOCK CHANGED: #${block.number.toString('hex')} 0x${block.hash.toString('hex')}`)
    this.verifyNetwork()
  }
}
