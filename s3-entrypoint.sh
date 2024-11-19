#!/bin/bash

MINIO_IP=$(getent hosts minio | awk '{ print $1 }')

echo "$MINIO_IP $MINIO_HOST" >> /etc/hosts

exec "$@"
