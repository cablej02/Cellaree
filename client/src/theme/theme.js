import { background, border, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    colors: {
        background: "#1a1d1e",
        medium: "#343a40",
        text: "#f8f9fa",
        light: "#3d434a",
        dark: "#303436",
        darker: "#202326",
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
        tertiary: "#62666c",
    },
    components: {
        Tabs: {
            variants: {
                login: {
                    tablist: {
                        borderColor: "primary",
                        borderRadius: "md",
                        backgroundColor: "darker",
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
                            borderColor: "primary.300", // Fade in border instead of adding it dynamically
                        },
                    },
                },
            },
        },
        Button: {
            variants: {
                primary: {
                    bg: "primary.500",
                    color: "white",
                    _hover: {
                        bg: "primary.400",
                    },
                    _active: {
                        bg: "primary.700",
                    },
                },
                navbar: {
                    border: "1px solid",
                    borderColor: "primary.500",
                    color: "text",
                    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                    _hover: {
                        backgroundColor: "darker",
                    },
                }
            },
        },
        Menu: {
            variants: {
                navbar: {
                    list: {
                        backgroundColor: "darker",
                        borderColor: "primary.500",
                        color: "text",
                    },
                    item: {
                        backgroundColor: "transparent",
                        _hover: {
                            backgroundColor: "medium",
                        },
                    },
                },
            },
        },
    },
    styles: {
        global: {
            "html, body": {
                backgroundColor: "background",
                color: "text",
                minHeight: "100vh",
            },
        },
    },
});

export default theme;