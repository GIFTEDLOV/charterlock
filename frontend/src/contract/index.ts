import { config } from "../config";
import type { ProtocolAdapter } from "../domain/types";
import { demoAdapter } from "./demoAdapter";
import { liveAdapter } from "./liveAdapter";

export const adapter: ProtocolAdapter = config.mode === "live" ? liveAdapter : demoAdapter;
