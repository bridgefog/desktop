import { assert } from 'chai'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'

import DiscoveryService from '../../../lib/discovery/index'

var ipfsClient = new IPFSClient(ipfsUtil.ipfsEndpoint())

// describe('DiscoveryService', () => {})
