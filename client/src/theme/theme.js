import { createSystem, defaultConfig, defineSlotRecipe } from '@chakra-ui/react'

const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                primary: {
                    100: { value: "#e88a9d" },
                    200: { value: "#db5b75" },
                    300: { value: "#b03050" },
                    400: { value: "#800020" },
                    500: { value: "#6a001a" },
                    600: { value: "#580017" },
                    700: { value: "#470013" },
                    800: { value: "#36000f" },
                    900: { value: "#25000b" },
                },
                secondary: {
                    100: { value: "#f8f9fa" },
                    200: { value: "#e9ecef" },
                    300: { value: "#dee2e6" },
                    400: { value: "#ced4da" },
                    500: { value: "#adb5bd" },
                    600: { value: "#6c757d" },
                    700: { value: "#495057" },
                    800: { value: "#343a40" },
                    900: { value: "#212529" },
                },
                success: {
                    100: { value: "#d4edda" },
                    200: { value: "#b8e0c2" },
                    300: { value: "#9cd4ab" },
                    400: { value: "#7fb894" },
                    500: { value: "#28a745" },
                    600: { value: "#218838" },
                    700: { value: "#19692c" },
                    800: { value: "#155724" },
                    900: { value: "#0f3e19" },
                },
                danger: {
                    100: { value: "#f8d7da" },
                    200: { value: "#f5c2c7" },
                    300: { value: "#ea969c" },
                    400: { value: "#e35d67" },
                    500: { value: "#dc3545" },
                    600: { value: "#c82333" },
                    700: { value: "#a71d2a" },
                    800: { value: "#721c24" },
                    900: { value: "#52141b" },
                },
                warning: {
                    100: { value: "#fff3cd" },
                    200: { value: "#ffeeba" },
                    300: { value: "#ffe08a" },
                    400: { value: "#ffce56" },
                    500: { value: "#ffc107" },
                    600: { value: "#e0a800" },
                    700: { value: "#c69500" },
                    800: { value: "#856404" },
                    900: { value: "#654d03" },
                },
                info: {
                    100: { value: "#d1ecf1" },
                    200: { value: "#bee5eb" },
                    300: { value: "#a4d3df" },
                    400: { value: "#6bc6d5" },
                    500: { value: "#17a2b8" },
                    600: { value: "#138496" },
                    700: { value: "#117a8b" },
                    800: { value: "#0c5460" },
                    900: { value: "#083a4b" },
                },
                background: { value: "#343a40" },
                dark: { value: "#212529" },
                light: { value: "#3d434a" },
                text: { value: "#f8f9fa" }
            }
        },
        semanticTokens: {
            colors: {
                primary: {
                    solid: { value: "{colors.primary.500}" },
                    contrast: { value: "{colors.primary.100}" },
                    fg: { value: "{colors.primary.700}" },
                    muted: { value: "{colors.primary.200}" },
                    subtle: { value: "{colors.primary.300}" },
                    emphasized: { value: "{colors.primary.400}" },
                    focusRing: { value: "{colors.primary.500}" },
                },
                secondary: {
                    solid: { value: "{colors.secondary.500}" },
                    contrast: { value: "{colors.secondary.100}" },
                    fg: { value: "{colors.secondary.700}" },
                    muted: { value: "{colors.secondary.200}" },
                    subtle: { value: "{colors.secondary.300}" },
                    emphasized: { value: "{colors.secondary.400}" },
                    focusRing: { value: "{colors.secondary.500}" },
                },
                success: {
                    solid: { value: "{colors.success.500}" },
                    contrast: { value: "{colors.success.100}" },
                    fg: { value: "{colors.success.700}" },
                    muted: { value: "{colors.success.200}" },
                    subtle: { value: "{colors.success.300}" },
                    emphasized: { value: "{colors.success.400}" },
                    focusRing: { value: "{colors.success.500}" },
                },
                danger: {
                    solid: { value: "{colors.danger.500}" },
                    contrast: { value: "{colors.danger.100}" },
                    fg: { value: "{colors.danger.700}" },
                    muted: { value: "{colors.danger.200}" },
                    subtle: { value: "{colors.danger.300}" },
                    emphasized: { value: "{colors.danger.400}" },
                    focusRing: { value: "{colors.danger.500}" },
                },
                warning: {
                    solid: { value: "{colors.warning.500}" },
                    contrast: { value: "{colors.warning.100}" },
                    fg: { value: "{colors.warning.700}" },
                    muted: { value: "{colors.warning.200}" },
                    subtle: { value: "{colors.warning.300}" },
                    emphasized: { value: "{colors.warning.400}" },
                    focusRing: { value: "{colors.warning.500}" },
                },
                info: {
                    solid: { value: "{colors.info.500}" },
                    contrast: { value: "{colors.info.100}" },
                    fg: { value: "{colors.info.700}" },
                    muted: { value: "{colors.info.200}" },
                    subtle: { value: "{colors.info.300}" },
                    emphasized: { value: "{colors.info.400}" },
                    focusRing: { value: "{colors.info.500}" },
                },
            },
        },
        slotRecipes: {
            tabs: defineSlotRecipe({
                slots: ["list", "trigger"], // Defines which parts we are styling
                base: {
                    list: {
                        bg: "background",
                        p: 2,
                        borderRadius: "md",
                    },
                    trigger: {
                        color: "text",
                        colorPalette: "primary",
                        _hover: { bg: "primary.300" },  // Unselected tabs hover with a lighter red
                        _selected: {
                            bg: "primary.500",
                            color: "white",
                            _hover: { bg: "primary.400" }  // Selected tab hover darkens slightly
                        },
                        p: 3,
                        borderRadius: "md",
                    },
                },
                variants: {
                    custom: {
                        list: {
                            bg: "light",
                        },
                        trigger: {
                            _selected: { bg: "primary", color: "text" },
                        },
                    },
                },
            }),
        },
    },
    globalCss: {
        body: {
            bg: "background",
            color: "text",
        }
    }
});

export default system;