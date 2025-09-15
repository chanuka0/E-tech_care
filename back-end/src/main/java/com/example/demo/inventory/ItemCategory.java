package com.example.demo.inventory;

public enum ItemCategory {
    RAM("RAM"),
    STORAGE("Storage (HDD/SSD)"),
    DISPLAY("Display/Screen"),
    KEYBOARD("Keyboard"),
    MOUSE("Mouse"),
    ADAPTER("Power Adapter/Charger"),
    BATTERY("Battery"),
    MOTHERBOARD("Motherboard"),
    COOLING("Cooling System"),
    CABLE("Cables"),
    ACCESSORY("Accessories"),
    TOOL("Tools"),
    OTHER("Other");

    private final String displayName;

    ItemCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}