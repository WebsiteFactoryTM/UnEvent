const theme = {
  paragraph: "mb-2 text-sm text-foreground/90",
  text: {
    bold: "font-bold text-foreground",
    italic: "italic",
    underline: "underline", // Included in theme but not in restricted toolbar
    strikethrough: "line-through", // Included in theme but not in restricted toolbar
    underlineStrikethrough: "underline line-through",
  },
  heading: {
    h3: "text-lg font-bold mt-4 mb-2 text-foreground",
    h4: "text-base font-bold mt-3 mb-1 text-foreground",
  },
  link: "text-primary underline hover:text-primary/80 cursor-pointer",
};

export default theme;
