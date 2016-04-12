#!/bin/bash
curl -s -X PUT http://172.17.0.1:8500/v1/agent/service/deregister/typeracer-${HOSTNAME}
