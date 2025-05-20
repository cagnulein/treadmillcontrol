#!/usr/bin/env bash

# This script will try to find the adb remote debugging port on the specified
# IP address using rustscan and then tell adb to try to connect to it.
# It is useful for connecting to an android device without opening the
# "Wireless debugging" screen to get the IP and the random port, which is
# cumbersome.

TARGET_IP="192.168.1.6"
PORT_RANGE="30000-50000"
ULIMIT_VAL="50000"
BATCH_SIZE="100"

echo "INFO: Scanning for ADB port on $TARGET_IP in range $PORT_RANGE using rustscan..."
# Using rustscan with specified arguments.
# --scripts none: Don't run Nmap scripts
# --greppable: Makes output more script-friendly
# awk is used to extract the port number from the brackets on the first matching line.
# Delimiters for awk are '[' or ']'.
ADB_PORT=$(rustscan -a $TARGET_IP --range $PORT_RANGE --scripts none --ulimit $ULIMIT_VAL -b $BATCH_SIZE --greppable | awk -F'[][]' '/->/ {print $2; exit}')

# Note: --accessible might have been unintentionally omitted in the last user query for rustscan args.
# If --accessible was intended to be combined with --greppable for a different format,
# the awk command might need adjustment. Current awk is for "IP -> [PORT]" format.

if [ -z "$ADB_PORT" ]; then
	echo "ERROR: No open ADB port found on $TARGET_IP in range $PORT_RANGE using rustscan (or output parsing failed)."
	echo "INFO: Make sure 'Wireless debugging' is enabled on the Android device,"
	echo "INFO: that the device is on the same network, and rustscan is installed."
	echo "INFO: Expected rustscan output format for parsing: 'IP -> [PORT]'"
	exit 1
fi

# Validate if ADB_PORT is a number (basic check)
if ! [[ "$ADB_PORT" =~ ^[0-9]+$ ]]; then
	echo "ERROR: rustscan output parsing failed, did not get a valid port number. Got: '$ADB_PORT'"
	exit 1
fi

uri="${TARGET_IP}:${ADB_PORT}"

echo "INFO: Attempting to connect on $uri"
adb_result=$(adb connect $uri)
echo "$adb_result"

# Note: adb exits with 0 even if the connection fails,
# so I'm checking its output
if [[ $adb_result == *"connected to ${uri}"* || $adb_result == *"already connected to ${uri}"* ]]; then
	adb forward tcp:54321 tcp:54321
	echo "INFO: Successfully connected to $uri"
	exit 0
elif [[ $adb_result == *"failed to connect to ${uri}"* ]]; then
	echo "ERROR: Failed to connect to $uri"
	exit 1
else
	echo "ERROR: Unknown ADB connection result for $uri: $adb_result"
	exit 1
fi
