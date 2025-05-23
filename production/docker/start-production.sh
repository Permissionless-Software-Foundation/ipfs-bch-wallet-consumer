#!/bin/bash

# BEGIN: Optional configuration settings

# This mnemonic is used to set up persistent public key for e2ee
# Replace this with your own 12-word mnemonic.
# You can get one at https://wallet.fullstack.cash.
export MNEMONIC="olive two muscle bottom coral ancient wait legend bronze useful process session"

# The human readable name this IPFS node identifies as.
export COORD_NAME=bch-consumer-generic

# Allow this node to function as a circuit relay. It must not be behind a firewall.
#export ENABLE_CIRCUIT_RELAY=true
# For browsers to use your circuit realy, you must set up a domain, SSL certificate,
# and you must forward that subdomain to the IPFS_WS_PORT.
#export CR_DOMAIN=subdomain.yourdomain.com

# END: Optional configuration settings


# Production database connection string.
export DBURL=mongodb://172.17.0.1:5558/ipfs-bch-consumer-prod

# Configure REST API port
export PORT=5015

# Production settings using external go-ipfs node.
export SVC_ENV=prod
export IPFS_HOST=172.17.0.1
export IPFS_API_PORT=5001
export IPFS_TCP_PORT=4101
export IPFS_WS_PORT=4103
export IPFS_WEB_RTC_PORT=4105

# Set the debug level for helia-coord. 0-3.
# 0 = no debug logs. 3 = maximum debug logs.
export DEBUG_LEVEL=0

# Use this if the IPFS node has a publically accessible IP address.
#export CONNECT_PREF=direct
# Use this if the IPFS node is behind a NAT or Firewall and cannot be accessed directly.
export CONNECT_PREF=cr

npm start
