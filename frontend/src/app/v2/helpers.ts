export const short = (value: string, length = 18) => value.length > length ? `${value.slice(0, Math.ceil(length / 2))}…${value.slice(-Math.floor(length / 2))}` : value;
export const display = (value: unknown) => typeof value === "string" ? value.replaceAll("_", " ") : String(value ?? "—");
export const formatTimestamp = (value?: number) => value ? new Date(value * 1000).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
