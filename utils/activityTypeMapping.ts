export const frenchToEnglishActivityType = (
  type: "course" | "velo" | "natation" | "marche" | "musculation",
): "running" | "cycling" | "swimming" | "walking" | "workout" => {
  switch (type) {
    case "course":
      return "running";
    case "velo":
      return "cycling";
    case "natation":
      return "swimming";
    case "marche":
      return "walking";
    case "musculation":
      return "workout";
    default:
      throw new Error(`Unknown activity type: ${type}`);
  }
};
