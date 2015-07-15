#!/usr/bin/env babel-node

import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import Clubnet from '../lib/clubnet'
import Badge from '../lib/badge'

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

clubnet.wearBadge()
  .then(key => console.log(key))
