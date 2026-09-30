import { useState } from "react";
import { adapter } from "../../contract";
import { useData } from "../hooks";
import { PageHeader, SectionHeading } from "./shared";
import { formatTimestamp } from "./helpers";

export function ActivityRoute() {
  const [filter, setFilter] = useState("All"); const data = useData(async () => { const ids = await adapter.getCaseIds(); return Promise.all(ids.map((id) => adapter.getCase(id))); }, []);
  return <div className="app-page activity-page"><PageHeader eyebrow="PROTOCOL / ACTIVITY" title="Activity" description="A canonical stream of protocol events, not an optimistic client log." /><div className="activity-toolbar">{["All", "Charters", "Evidence", "Resolutions", "Challenges"].map((item) => <button key={item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div><section className="activity-stream-v2"><SectionHeading eyebrow="CANONICAL EVENTS" title="Protocol timeline" />{data.data?.length ? data.data.map((item) => <div className="activity-event" key={item.case_id}><div className="event-time">{formatTimestamp(item.last_resolution_at)}</div><i aria-hidden="true"></i><div className="event-action"><strong>Case observed</strong><span>{item.case_id} · {item.state}</span></div><span className="event-generation">Generation {item.generation + 1}</span><code>canonical readback</code></div>) : <div className="activity-empty">{data.loading ? "Reading canonical activity…" : "No protocol activity has been recorded."}</div>}</section></div>;
}
