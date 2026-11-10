package com.ecoroute.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum VehicleType {
    BIKE,
    CAR,
    BUS,
    TRUCK,
    EV;

    @JsonCreator
    public static VehicleType fromString(String value) {
        if (value == null) {
            return null;
        }
        return VehicleType.valueOf(value.toUpperCase());
    }
}
