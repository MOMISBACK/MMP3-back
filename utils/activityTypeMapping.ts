export const frenchToEnglishActivityType = (
  type: "course" | "velo" | "natation" | "marche",
): "running" | "cycling" | "swimming" | "walking" => {
  switch (type) {
    case "course":
      return "running";
    case "velo":
      return "cycling";
    case "natation":
      return "swimming";
    case "marche":
      return "walking";
    default:
      throw new Error(`Unknown activity type: ${type}`);
  }
};
