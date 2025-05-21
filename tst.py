#!/usr/bin/env python3
"""
Printer Information Retrieval Tool using SNMP
This script gathers information from network printers using SNMP protocol.
"""

import sys
from pysnmp.proto.rfc1902 import Integer
from pysnmp.hlapi import nextCmd
from pysnmp.hlapi import getCmd, SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity
import textwrap

# Dictionary of common printer SNMP OIDs (Object Identifiers)
PRINTER_OIDS = {
    "sysDescr": "1.3.6.1.2.1.1.1.0",           # System description
    "sysName": "1.3.6.1.2.1.1.5.0",            # System name
    "sysLocation": "1.3.6.1.2.1.1.6.0",        # System location
    "sysContact": "1.3.6.1.2.1.1.4.0",         # System contact
    "sysUpTime": "1.3.6.1.2.1.1.3.0",          # System uptime

    # Printer specific OIDs
    "prtGeneralPrinterName": "1.3.6.1.2.1.43.5.1.1.16.1",  # Printer name
    "prtGeneralSerialNumber": "1.3.6.1.2.1.43.5.1.1.17.1", # Serial number
    "hrDeviceDescr": "1.3.6.1.2.1.25.3.2.1.3.1",           # Device description

    # Counter and status OIDs
    "prtMarkerLifeCount": "1.3.6.1.2.1.43.10.2.1.4.1.1",   # Total page count
    "hrPrinterStatus": "1.3.6.1.2.1.25.3.5.1.1.1",         # Printer status
    "hrPrinterDetectedErrorState": "1.3.6.1.2.1.25.3.5.1.2.1",  # Error state

    # Supply levels
    "prtMarkerSuppliesLevel": "1.3.6.1.2.1.43.11.1.1.9.1",  # Supply level (base OID)
    "prtMarkerSuppliesMaxCapacity": "1.3.6.1.2.1.43.11.1.1.8.1",  # Max capacity (base OID)
    "prtMarkerSuppliesDescription": "1.3.6.1.2.1.43.11.1.1.6.1",  # Supply description (base OID)

    # Paper trays
    "prtInputDescription": "1.3.6.1.2.1.43.8.2.1.18.1",     # Input tray description (base OID)
    "prtInputLevel": "1.3.6.1.2.1.43.8.2.1.10.1",          # Input tray level (base OID)
    "prtInputMaxCapacity": "1.3.6.1.2.1.43.8.2.1.9.1"      # Input tray max capacity (base OID)
}

# Dictionary to interpret printer status values
PRINTER_STATUS = {
    1: "other",
    2: "unknown",
    3: "idle",
    4: "printing",
    5: "warmup"
}

def get_snmp_value(ip, oid, community="public"):
    """Query a specific OID via SNMP and return the value."""
    error_indication, error_status, error_index, var_binds = next(
        getCmd(
            SnmpEngine(),
            CommunityData(community),
            UdpTransportTarget((ip, 161), timeout=2.0, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(oid))
        )
    )

    if error_indication:
        return f"Error: {error_indication}"
    elif error_status:
        return f"Error: {error_status.prettyPrint()} at {var_binds[int(error_index)-1] if error_index else '?'}"
    else:
        for var_bind in var_binds:
            return var_bind[1]

    return "No response"

def snmp_walk(ip, base_oid, community="public"):
    """Walk through SNMP OIDs starting with the base OID."""
    results = []
    for (error_indication, error_status, error_index, var_binds) in nextCmd(
            SnmpEngine(),
            CommunityData(community),
            UdpTransportTarget((ip, 161), timeout=2.0, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(base_oid)),
            lexicographicMode=False
    ):

        if error_indication:
            return [f"Error: {error_indication}"]
        elif error_status:
            return [f"Error: {error_status.prettyPrint()} at {var_binds[int(error_index)-1] if error_index else '?'}"]
        else:
            for var_bind in var_binds:
                results.append((str(var_bind[0]), var_bind[1]))

    return results

def get_basic_info(ip, community="public"):
    """Get basic printer information."""
    results = {}

    for name, oid in PRINTER_OIDS.items():
        if not name.startswith("prtMarkerSupplies") and not name.startswith("prtInput"):
            results[name] = get_snmp_value(ip, oid, community)

    return results

def get_supplies_info(ip, community="public"):
    """Get information about printer supplies (toners, etc.)."""
    supplies = []

    # Get descriptions first
    descriptions = snmp_walk(ip, "1.3.6.1.2.1.43.11.1.1.6", community)

    # Check if descriptions is a list and not empty
    if isinstance(descriptions, list) and descriptions:
        # Check if the first element is a string and starts with "Error"
        if isinstance(descriptions[0], str) and descriptions[0].startswith("Error"):
            return supplies

        for i, (oid, desc) in enumerate(descriptions):
            # Extract the supply index from the OID
            idx = oid.split('.')[-1]

            # Get level and max capacity for this supply
            level_oid = f"1.3.6.1.2.1.43.11.1.1.9.1.{idx}"
            max_oid = f"1.3.6.1.2.1.43.11.1.1.8.1.{idx}"

            level = get_snmp_value(ip, level_oid, community)
            max_capacity = get_snmp_value(ip, max_oid, community)

            # Calculate percentage if possible
            percentage = "Unknown"
            if isinstance(level, Integer) and isinstance(max_capacity, Integer):
                if max_capacity > 0:
                    percentage = f"{(int(level) / int(max_capacity)) * 100:.1f}%"
                elif int(level) == -1:  # Some printers use -1 to indicate unknown level
                    percentage = "Unknown"
                elif int(level) == -2:  # Some printers use -2 to indicate empty
                    percentage = "Empty (0%)"
                elif int(level) == -3:  # Some printers use -3 to indicate full
                    percentage = "Full (100%)"

            supplies.append({
                'index': idx,
                'description': str(desc),
                'level': str(level),
                'max_capacity': str(max_capacity),
                'percentage': percentage
            })

    return supplies

def get_input_trays_info(ip, community="public"):
    """Get information about input trays."""
    trays = []

    # Get descriptions first
    descriptions = snmp_walk(ip, "1.3.6.1.2.1.43.8.2.1.18", community)

    # Check if descriptions is a list and not empty
    if isinstance(descriptions, list) and descriptions:
        # Check if the first element is a string and starts with "Error"
        if isinstance(descriptions[0], str) and descriptions[0].startswith("Error"):
            return trays

        for i, (oid, desc) in enumerate(descriptions):
            # Extract the tray index from the OID
            idx = oid.split('.')[-1]

            # Get level and max capacity for this tray
            level_oid = f"1.3.6.1.2.1.43.8.2.1.10.1.{idx}"
            max_oid = f"1.3.6.1.2.1.43.8.2.1.9.1.{idx}"

            level = get_snmp_value(ip, level_oid, community)
            max_capacity = get_snmp_value(ip, max_oid, community)

            # Calculate percentage if possible
            percentage = "Unknown"
            if isinstance(level, Integer) and isinstance(max_capacity, Integer):
                if int(max_capacity) > 0:
                    percentage = f"{(int(level) / int(max_capacity)) * 100:.1f}%"
                elif int(level) == -1:  # -1 often means unknown
                    percentage = "Unknown"

            trays.append({
                'index': idx,
                'description': str(desc),
                'level': str(level),
                'max_capacity': str(max_capacity),
                'percentage': percentage
            })

    return trays

def format_output(title, data, indent=0):
    """Format output data with proper indentation."""
    if isinstance(data, dict):
        print(" " * indent + f"{title}:")
        for key, value in data.items():
            if isinstance(value, dict):
                format_output(key, value, indent + 2)
            else:
                print(" " * (indent + 2) + f"{key}: {value}")
    elif isinstance(data, list):
        print(" " * indent + f"{title}:")
        for item in data:
            if isinstance(item, dict):
                print(" " * (indent + 2) + f"Item {item.get('index', '')}:")
                for key, value in item.items():
                    if key != 'index':
                        print(" " * (indent + 4) + f"{key}: {value}")
                print()
            else:
                print(" " * (indent + 2) + f"- {item}")
    else:
        print(" " * indent + f"{title}: {data}")

def main():
    print(textwrap.dedent("""
    ╔════════════════════════════════════════════════════╗
    ║            Printer SNMP Information Tool           ║
    ╚════════════════════════════════════════════════════╝
    """))

    # Get IP address from user
    ip_address = input("Enter the printer IP address: ").strip()
    community = input("Enter the SNMP community string [default: public]: ").strip() or "public"

    print(f"\nConnecting to {ip_address} using SNMP...\n")

    try:
        # Get basic information
        basic_info = get_basic_info(ip_address, community)

        if isinstance(basic_info.get("sysDescr"), str) and basic_info["sysDescr"].startswith("Error"):
            print(f"Failed to connect: {basic_info['sysDescr']}")
            print("\nPossible issues:")
            print("  - The IP address might be incorrect")
            print("  - The device might not have SNMP enabled")
            print("  - The SNMP community string might be incorrect")
            print("  - A firewall might be blocking SNMP traffic (UDP port 161)")
            sys.exit(1)

        # If we got here, we've successfully connected
        print("=" * 60)
        print("PRINTER INFORMATION")
        print("=" * 60)

        # Basic device information
        device_info = {
            "System Name": basic_info.get("sysName", "Unknown"),
            "Description": basic_info.get("sysDescr", "Unknown"),
            "Location": basic_info.get("sysLocation", "Unknown"),
            "Contact": basic_info.get("sysContact", "Unknown"),
            "Uptime": basic_info.get("sysUpTime", "Unknown"),
            "Serial Number": basic_info.get("prtGeneralSerialNumber", "Unknown")
        }
        format_output("Device Information", device_info)

        # Status information
        status_code = basic_info.get("hrPrinterStatus")
        status_text = PRINTER_STATUS.get(int(status_code), "Unknown") if isinstance(status_code, Integer) else "Unknown"

        status_info = {
            "Status Code": status_code,
            "Status Text": status_text,
            "Error State": basic_info.get("hrPrinterDetectedErrorState", "Unknown"),
            "Total Page Count": basic_info.get("prtMarkerLifeCount", "Unknown")
        }
        format_output("Printer Status", status_info)

        # Supplies info
        try:
            supplies_info = get_supplies_info(ip_address, community)
            format_output("Supplies Information", supplies_info)
        except Exception as e:
            print(f"\nError retrieving supplies information: {e}")

        # Input trays info
        try:
            input_trays_info = get_input_trays_info(ip_address, community)
            format_output("Input Trays", input_trays_info)
        except Exception as e:
            print(f"\nError retrieving input trays information: {e}")

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()