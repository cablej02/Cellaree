import { background, border, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    colors: {
        background: "#343a40",
        text: "#f8f9fa",
        light: "#3d434a",
        dark: "#212529",
        error: "#e53e3e",
        primary: {
            50: "#f15778",
            100: "#e88a9d",
            200: "#db5b75",
            300: "#b03050",
            400: "#800020",
            500: "#6a001a",
            600: "#580017",
            700: "#470013",
            800: "#36000f",
            900: "#25000b",
        },
        secondary: "#adb5bd",
    },
    components: {
        Tabs: {
            variants: {
                login: {
                    tablist: {
                        borderColor: "primary",
                        borderRadius: "md",
                        backgroundColor: "background",
                        padding: "4px",
                        gap: "4px",
                    },
                    tab: {
                        fontWeight: "bold",
                        color: "text",
                        borderRadius: "md",
                        paddingX: 4,
                        paddingY: 2,
                        border: "2px solid transparent", // Border exists but is invisible
                        transition: "border-color 0.2s ease-in-out, color 0.2s ease-in-out",
                        _selected: {
                            backgroundColor: "primary.500",
                        },
                        _hover: {
                            borderColor: "primary.200", // Fade in border instead of adding it dynamically
                        },
                    },
                },
            },
        },
        Button: {
            variants: {
                solid: {
                    bg: "primary.500",
                    color: "white",
                    _hover: {
                        bg: "primary.300",
                    },
                    _active: {
                        bg: "primary.700",
                    },
                },
            },
        },
    },
});

export default theme;