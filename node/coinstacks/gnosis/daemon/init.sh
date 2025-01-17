#!/bin/sh

set -e

start() {
  ./Nethermind.Runner --config gnosis --datadir /data/gnosis --JsonRpc.Host=0.0.0.0 --JsonRpc.Port=8545 --JsonRpc.JwtSecretFile=/jwt.hex --JsonRpc.EnabledModules=eth,net,web3,debug,subscribe,trace,txpool,health,rpc --Init.WebSocketsEnabled=true --JsonRpc.WebSocketsPort=8546  --HealthChecks.Enabled=true --Metrics.CountersEnabled=true 
  PID="$!"
}

stop() {
  echo "Catching signal and sending to PID: $PID"
  kill $PID
  while $(kill -0 $PID 2>/dev/null); do
    sleep 1
  done
}

start

trap 'stop_coin' SIGTERM SIGINT
wait $PID